/**
 * Canvas renderer for the HOBA knowledge graph.
 *
 * One <canvas> draws the whole network — no DOM node per vertex — so panning,
 * zooming and dragging stay smooth and the picture is crisp on HiDPI screens.
 * Layout is a deterministic force simulation (seeded PRNG: the same registry
 * always produces the same map), run to convergence synchronously on load so
 * the first paint is already settled instead of a wobbling hairball.
 *
 * Hit-testing, hover and selection live here; the surrounding page renders the
 * tooltip and the details panel as real DOM through the callbacks below.
 */

export type GraphNodeType = 'observation' | 'barrier' | 'mechanism' | 'pattern' | 'loop' | 'intervention';

export type GraphRelationType =
  | 'operates_at'
  | 'emits'
  | 'amplifies'
  | 'masks'
  | 'precedes'
  | 'instantiates'
  | 'targets'
  | 'mitigates';

export interface GraphFact {
  label: string;
  value: string;
}

/** A node as the page serialises it (already localized at build time). */
export interface GraphNodeInput {
  id: string;
  type: GraphNodeType;
  title: string;
  summary: string;
  href: string;
  removability?: string;
  facts: GraphFact[];
  /** Funnel position (fractional index into `GraphData.lanes`), if the node has one. */
  lane?: number;
}

/** The x axis: funnel stages, in canonical order. */
export interface GraphLane {
  label: string;
}

export interface GraphEdgeInput {
  source: string;
  target: string;
  relation: GraphRelationType;
}

export interface GraphSwimlane {
  id: string;
  types: GraphNodeType[];
  label: string;
  icon: string;
  targetY: number;
  topY: number;
  bottomY: number;
}

export interface IdealStepInput {
  index: number;
  id: string;
  title: string;
  owner: string;
  description: string;
  entities: string[];
}

export interface GraphData {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
  lanes?: GraphLane[];
  idealSteps?: IdealStepInput[];
  lang?: 'uk' | 'en';
}

export interface SimNode extends GraphNodeInput {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Designated grid slot coordinates for clean vertical and horizontal alignment */
  slotX: number;
  slotY: number;
  /** Layout radius in world units; screen radius is this scaled and clamped. */
  radius: number;
  degree: number;
  hidden: boolean;
  /** Screen-space position and radius of the last frame — used for hit-testing. */
  sx: number;
  sy: number;
  sr: number;
}

export interface SimEdge {
  source: SimNode;
  target: SimNode;
  relation: GraphRelationType;
  /** Perpendicular bow, so parallel edges between the same pair stay distinct. */
  bow: number;
  hidden: boolean;
}

export interface HoverPayload {
  node: SimNode;
  /** Canvas-relative centre of the node, for anchoring the tooltip. */
  x: number;
  y: number;
  radius: number;
}

export interface GraphViewOptions {
  onHover?: (payload: HoverPayload | null) => void;
  onSelect?: (node: SimNode | null) => void;
  onViewChange?: (state: { zoom: number; visible: number }) => void;
}

const TYPE_VAR: Record<GraphNodeType, string> = {
  observation: '--g-artifact',
  barrier: '--g-barrier',
  mechanism: '--g-mechanism',
  pattern: '--g-pattern',
  loop: '--g-loop',
  intervention: '--g-intervention',
};

/** Each relation borrows the hue of the layer it explains. */
const RELATION_TYPE: Record<GraphRelationType, GraphNodeType | 'muted'> = {
  precedes: 'barrier',
  operates_at: 'mechanism',
  emits: 'observation',
  amplifies: 'loop',
  masks: 'muted',
  instantiates: 'pattern',
  targets: 'intervention',
  mitigates: 'intervention',
};

type RGB = [number, number, number];

interface Palette {
  type: Record<GraphNodeType, RGB>;
  text: RGB;
  muted: RGB;
  border: RGB;
  card: RGB;
  bg: RGB;
  accent: RGB;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
/** World-space width of one funnel stage column. */
const LANE_WIDTH = 210;
/** Room reserved at the top of the viewport for the sticky stage axis. */
const AXIS_HEIGHT = 26;

function parseRGB(value: string, fallback: RGB): RGB {
  const parts = value.trim().split(/[\s,/]+/).slice(0, 3).map(Number);
  return parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? (parts as RGB) : fallback;
}

function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Deterministic PRNG so the layout is identical on every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TYPE_TIER_Y: Record<GraphNodeType, number> = {
  observation: -120,
  barrier: -50,
  mechanism: 20,
  pattern: 90,
  loop: 90,
  intervention: 160,
};

export const TYPE_LABELS_EN: Record<GraphNodeType, string> = {
  observation: 'Observations',
  barrier: 'Funnel Barriers (B)',
  mechanism: 'Mechanisms (M)',
  pattern: 'Patterns & Loops (P/L)',
  loop: 'Patterns & Loops (P/L)',
  intervention: 'Interventions (I)',
};

export class GraphView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: GraphViewOptions;
  private nodes: SimNode[] = [];
  private edges: SimEdge[] = [];
  private lanes: GraphLane[] = [];
  private swimlanes: GraphSwimlane[] = [];
  private idealSteps: IdealStepInput[] = [];
  private idealPathActive = false;
  private idealCurrentStep = -1;
  private byId = new Map<string, SimNode>();
  private neighbors = new Map<string, Set<string>>();

  private palette!: Palette;
  private width = 0;
  private height = 0;
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private hovered: SimNode | null = null;
  private selected: SimNode | null = null;
  private dragging: SimNode | null = null;
  private panning = false;
  private pointerMoved = false;
  private pointerStart: { x: number; y: number } | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private alpha = 0;
  private frame = 0;
  private destroyed = false;
  private observer: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, data: GraphData, options: GraphViewOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('GraphView: 2D context not available');
    this.ctx = ctx;
    this.options = options;
    this.lanes = data.lanes ?? [];
    this.idealSteps = data.idealSteps ?? [];
    const isUk = data.lang !== 'en';

    this.swimlanes = [
      {
        id: 'observations',
        types: ['observation'],
        label: isUk ? 'Спостереження та документи (A)' : 'Observations & Artifacts (A)',
        icon: '📋',
        targetY: -210,
        topY: -290,
        bottomY: -130,
      },
      {
        id: 'barriers',
        types: ['barrier'],
        label: isUk ? 'Структурні барʼєри та блокери (B)' : 'Structural Barriers (B)',
        icon: '🚧',
        targetY: -65,
        topY: -130,
        bottomY: 0,
      },
      {
        id: 'mechanisms',
        types: ['mechanism'],
        label: isUk ? 'Приховані механізми (M)' : 'Hidden Mechanisms (M)',
        icon: '⚙️',
        targetY: 70,
        topY: 0,
        bottomY: 140,
      },
      {
        id: 'solutions',
        types: ['pattern', 'loop', 'intervention'],
        label: isUk ? 'Інтервенції, патерни та цикли (I / P / L)' : 'Interventions, Patterns & Loops (I/P/L)',
        icon: '🛡️',
        targetY: 215,
        topY: 140,
        bottomY: 295,
      },
    ];

    this.palette = this.readPalette();
    this.measure();
    this.initialisePositions(data);
    this.settle(320);
    this.fit(false);
    this.bind();
    this.draw();
  }

  // ---- layout & simulation -----------------------------------------------

  // ---- layout & simulation -----------------------------------------------

  private getSwimlaneFor(type: GraphNodeType): GraphSwimlane {
    return this.swimlanes.find((s) => s.types.includes(type)) ?? this.swimlanes[0]!;
  }

  /**
   * Deterministic placement aligned strictly on vertical stage columns and horizontal swimlanes.
   * Multi-node clusters within the same cell are stacked in neat vertical columns or crisp micro-grids.
   */
  private initialisePositions(data: GraphData) {
    const degree = new Map<string, number>();
    for (const edge of data.edges) {
      degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
      degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
    }

    // Bucket nodes by (stage column, swimlane) to compute aligned slots
    const buckets = new Map<string, SimNode[]>();
    for (const input of data.nodes) {
      const col = Math.max(0, Math.min(this.lanes.length - 1, Math.round(input.lane ?? this.lanes.length / 2)));
      const swimlane = this.getSwimlaneFor(input.type);
      const bucketKey = `${col}|${swimlane.id}`;
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);

      const deg = degree.get(input.id) ?? 0;
      const node: SimNode = {
        ...input,
        x: this.laneX(input.lane ?? col),
        y: swimlane.targetY,
        slotX: this.laneX(input.lane ?? col),
        slotY: swimlane.targetY,
        vx: 0,
        vy: 0,
        radius: 8 + Math.min(10, Math.sqrt(deg) * 2.4),
        degree: deg,
        hidden: false,
        sx: 0,
        sy: 0,
        sr: 0,
      };
      this.nodes.push(node);
      this.byId.set(node.id, node);
      this.neighbors.set(node.id, new Set());
      buckets.get(bucketKey)!.push(node);
    }

    // Align slots within each (column, swimlane) cell
    buckets.forEach((bucketNodes, key) => {
      const [colStr, swimlaneId] = key.split('|');
      const col = Number(colStr);
      const swimlane = this.swimlanes.find((s) => s.id === swimlaneId)!;
      const total = bucketNodes.length;

      if (total === 1) {
        bucketNodes[0]!.slotX = this.laneX(col);
        bucketNodes[0]!.slotY = swimlane.targetY;
      } else if (total <= 3) {
        // Vertical column alignment with crisp, equal spacing
        bucketNodes.forEach((node, idx) => {
          node.slotX = this.laneX(col);
          node.slotY = swimlane.targetY + (idx - (total - 1) / 2) * 32;
        });
      } else {
        // 2-column micro-grid alignment
        bucketNodes.forEach((node, idx) => {
          const subCol = idx % 2 === 0 ? -20 : 20;
          const subRow = (Math.floor(idx / 2) - Math.floor((total - 1) / 4)) * 30;
          node.slotX = this.laneX(col) + subCol;
          node.slotY = swimlane.targetY + subRow;
        });
      }

      // Initialize positions to their slots
      bucketNodes.forEach((node) => {
        node.x = node.slotX;
        node.y = node.slotY;
      });
    });

    const seen = new Map<string, number>();
    for (const edge of data.edges) {
      const source = this.byId.get(edge.source);
      const target = this.byId.get(edge.target);
      if (!source || !target || source === target) continue;
      const key = source.id < target.id ? `${source.id}|${target.id}` : `${target.id}|${source.id}`;
      const index = seen.get(key) ?? 0;
      seen.set(key, index + 1);
      this.edges.push({
        source,
        target,
        relation: edge.relation,
        bow: index === 0 ? 0.12 : 0.12 + index * 0.22 * (index % 2 === 0 ? 1 : -1),
        hidden: false,
      });
      this.neighbors.get(source.id)!.add(target.id);
      this.neighbors.get(target.id)!.add(source.id);
    }
  }

  /** World-space centre of a (possibly fractional) funnel column. */
  private laneX(lane: number) {
    return (lane - (this.lanes.length - 1) / 2) * LANE_WIDTH;
  }

  // ---- force simulation --------------------------------------------------

  /** Velocity-Verlet-ish relaxation: snap firmly to grid slots with gentle repulsion. */
  private tick(strength: number) {
    const active = this.nodes.filter((n) => !n.hidden);

    for (let i = 0; i < active.length; i++) {
      const a = active[i]!;
      for (let j = i + 1; j < active.length; j++) {
        const b = active[j]!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = (i - j) * 0.5 + 0.1;
          dy = (j - i) * 0.5 - 0.1;
          d2 = dx * dx + dy * dy;
        }
        const distance = Math.sqrt(d2);
        const minimum = a.radius + b.radius + 32;
        let force = (6400 * strength) / d2;
        if (distance < minimum) force += ((minimum - distance) * 1.1 * strength) / distance;
        const fx = (dx / distance) * force * 0.25;
        const fy = (dy / distance) * force * 0.15;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    for (const edge of this.edges) {
      if (edge.hidden) continue;
      const { source, target } = edge;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const rest = 96 + source.radius + target.radius;
      const force = ((distance - rest) * 0.03 * strength) / distance;
      const fx = dx * force * 0.5;
      const fy = dy * force * 0.2;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    for (const node of active) {
      if (node === this.dragging) {
        node.vx = 0;
        node.vy = 0;
        continue;
      }

      // Snap firmly to designated slot coordinates
      node.vx += (node.slotX - node.x) * 0.18 * strength;
      node.vy += (node.slotY - node.y) * 0.24 * strength;

      node.vx *= 0.78;
      node.vy *= 0.78;
      const speed = Math.hypot(node.vx, node.vy);
      if (speed > 25) {
        node.vx = (node.vx / speed) * 25;
        node.vy = (node.vy / speed) * 25;
      }
      node.x += node.vx;
      node.y += node.vy;

      // Soft clamp within swimlane boundaries
      const lane = this.getSwimlaneFor(node.type);
      const pad = node.radius + 6;
      if (node.y < lane.topY + pad) {
        node.y = lane.topY + pad;
        node.vy = Math.max(0, node.vy * -0.2);
      } else if (node.y > lane.bottomY - pad) {
        node.y = lane.bottomY - pad;
        node.vy = Math.min(0, node.vy * -0.2);
      }
    }
  }

  /** Run the simulation to a resting state without painting intermediate frames. */
  private settle(iterations: number) {
    for (let i = 0; i < iterations; i++) this.tick(1 - i / (iterations * 1.3));
  }

  private reheat(value = 0.55) {
    this.alpha = Math.max(this.alpha, value);
    this.animate();
  }

  private animate() {
    if (this.frame || this.destroyed) return;
    const step = () => {
      this.frame = 0;
      if (this.destroyed) return;
      if (this.alpha > 0.02 || this.dragging) {
        this.tick(Math.max(0.15, this.alpha));
        this.alpha *= this.dragging ? 0.995 : 0.94;
        this.draw();
        this.frame = requestAnimationFrame(step);
      } else {
        this.alpha = 0;
        this.draw();
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  // ---- camera ------------------------------------------------------------

  private measure() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Frame every visible node with padding. */
  fit(redraw = true) {
    const visible = this.nodes.filter((n) => !n.hidden);
    if (!visible.length) {
      this.zoom = 1;
      this.panX = this.width / 2;
      this.panY = this.height / 2;
      if (redraw) this.draw();
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of visible) {
      minX = Math.min(minX, n.x - n.radius);
      minY = Math.min(minY, n.y - n.radius);
      maxX = Math.max(maxX, n.x + n.radius);
      maxY = Math.max(maxY, n.y + n.radius);
    }
    const padding = 44;
    const top = this.lanes.length ? AXIS_HEIGHT + 12 : padding;
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const floor = this.width < 640 ? 0.45 : MIN_ZOOM;
    this.zoom = Math.min(
      MAX_ZOOM,
      Math.max(floor, Math.min((this.width - padding * 2) / spanX, (this.height - top - padding) / spanY))
    );
    this.panX = this.width / 2 - ((minX + maxX) / 2) * this.zoom;
    this.panY = (top + this.height - padding) / 2 - ((minY + maxY) / 2) * this.zoom;
    if (redraw) this.draw();
  }

  zoomBy(factor: number, cx = this.width / 2, cy = this.height / 2) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * factor));
    if (next === this.zoom) return;
    this.panX = cx - ((cx - this.panX) * next) / this.zoom;
    this.panY = cy - ((cy - this.panY) * next) / this.zoom;
    this.zoom = next;
    this.draw();
  }

  private toScreenX(x: number) {
    return x * this.zoom + this.panX;
  }

  private toScreenY(y: number) {
    return y * this.zoom + this.panY;
  }

  private toWorld(x: number, y: number) {
    return { x: (x - this.panX) / this.zoom, y: (y - this.panY) / this.zoom };
  }

  // ---- palette -----------------------------------------------------------

  private readPalette(): Palette {
    const cs = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: RGB) => parseRGB(cs.getPropertyValue(name), fallback);
    return {
      type: {
        observation: read(TYPE_VAR.observation, [163, 113, 247]),
        barrier: read(TYPE_VAR.barrier, [63, 185, 80]),
        mechanism: read(TYPE_VAR.mechanism, [88, 166, 255]),
        pattern: read(TYPE_VAR.pattern, [240, 136, 62]),
        loop: read(TYPE_VAR.loop, [219, 97, 162]),
        intervention: read(TYPE_VAR.intervention, [34, 211, 238]),
      },
      text: read('--c-text', [230, 237, 243]),
      muted: read('--c-muted', [139, 148, 158]),
      border: read('--c-border', [31, 38, 51]),
      card: read('--c-card', [18, 22, 31]),
      bg: read('--c-bg', [10, 12, 16]),
      accent: read('--c-accent', [88, 166, 255]),
    };
  }

  /** Re-read the CSS custom properties after a theme switch. */
  refreshTheme() {
    this.palette = this.readPalette();
    this.draw();
  }

  private relationColor(relation: GraphRelationType): RGB {
    const key = RELATION_TYPE[relation];
    return key === 'muted' ? this.palette.muted : this.palette.type[key];
  }

  // ---- drawing -----------------------------------------------------------

  private screenRadius(node: SimNode) {
    return Math.max(4.5, Math.min(30, node.radius * this.zoom));
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const focus = this.hovered ?? this.selected;
    const related = focus ? this.neighbors.get(focus.id)! : null;

    // Ideal Path Context
    const isIdealActive = this.idealPathActive;
    const allIdealNodeIds = new Set(this.idealSteps.flatMap((s) => s.entities));
    const activeStepNodeIds =
      this.idealCurrentStep >= 0 && this.idealSteps[this.idealCurrentStep]
        ? new Set(this.idealSteps[this.idealCurrentStep]!.entities)
        : allIdealNodeIds;

    const isLit = (node: SimNode) => {
      if (isIdealActive) {
        return activeStepNodeIds.has(node.id) || (this.idealCurrentStep === -1 && allIdealNodeIds.has(node.id));
      }
      return !focus || node === focus || related!.has(node.id);
    };

    for (const node of this.nodes) {
      node.sx = this.toScreenX(node.x);
      node.sy = this.toScreenY(node.y);
      node.sr = this.screenRadius(node);
    }

    // 1. Hover/Selection Grid Highlight (Crosshairs on Column & Row)
    this.drawCrosshairHighlight(focus);

    // 2. Swimlane horizontal bands & labels
    this.drawSwimlanes(focus);

    // 3. Funnel stage vertical columns & axis
    this.drawAxis(focus);

    // 4. Edges
    ctx.lineCap = 'round';
    for (const edge of this.edges) {
      if (edge.hidden) continue;
      if (isIdealActive) {
        const isIdealEdge = allIdealNodeIds.has(edge.source.id) && allIdealNodeIds.has(edge.target.id);
        this.drawEdge(edge, isIdealEdge ? 0.75 : 0.05, isIdealEdge);
      } else {
        const lit = !focus || edge.source === focus || edge.target === focus;
        this.drawEdge(edge, lit ? (focus ? 0.95 : 0.38) : 0.1, lit && !!focus);
      }
    }

    // 5. Sequential Ideal Route Edges (Between Steps 1 -> 2 -> 3...)
    if (isIdealActive) {
      this.drawIdealPathEdges();
    }

    // 6. Nodes
    const drawn = this.nodes.filter((n) => !n.hidden);
    for (const node of drawn) {
      let idealStepNum: number | undefined;
      if (isIdealActive) {
        const stepIdx = this.idealSteps.findIndex((s) => s.entities.includes(node.id));
        if (stepIdx >= 0) idealStepNum = stepIdx + 1;
      }
      const lit = isLit(node);
      const alpha = isIdealActive ? (lit ? 1 : 0.12) : lit ? 1 : 0.22;
      this.drawNode(node, alpha, idealStepNum);
    }

    // 7. Labels last, greedily de-collided, most-connected first.
    const boxes: number[][] = [];
    const ordered = [...drawn].sort((a, b) => b.degree - a.degree);
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const node of ordered) {
      const lit = isLit(node);
      const important = node === focus || (focus !== null && lit) || (isIdealActive && lit);
      if (!important && this.zoom < 0.35) continue;
      if (node.sx < -60 || node.sx > this.width + 60 || node.sy < -40 || node.sy > this.height + 40) continue;
      const width = ctx.measureText(node.id).width;
      const left = node.sx - width / 2 - 3;
      const top = node.sy + node.sr + 4;
      const box = [left, top, left + width + 6, top + 13];
      if (!important && boxes.some((b) => box[0]! < b[2]! && b[0]! < box[2]! && box[1]! < b[3]! && b[1]! < box[3]!)) continue;
      boxes.push(box);
      ctx.lineWidth = 3;
      ctx.strokeStyle = rgba(this.palette.bg, lit ? 0.85 : 0.2);
      ctx.strokeText(node.id, node.sx, top);
      ctx.fillStyle = rgba(node === focus || (isIdealActive && lit) ? this.palette.text : this.palette.muted, lit ? 1 : 0.15);
      ctx.fillText(node.id, node.sx, top);
    }
  }

  /**
   * Hover/Selection Crosshair: Highlights the vertical stage column and
   * horizontal swimlane row intersecting at the active node.
   */
  private drawCrosshairHighlight(focus: SimNode | null) {
    if (!focus) return;
    const ctx = this.ctx;
    ctx.save();

    // 1. Column bounds
    const colIndex = focus.lane !== undefined ? Math.round(focus.lane) : -1;
    let colLeft = 0;
    let colRight = 0;
    let hasCol = false;

    if (colIndex >= 0 && colIndex < this.lanes.length) {
      hasCol = true;
      const colCenterX = this.laneX(colIndex);
      colLeft = this.toScreenX(colCenterX - LANE_WIDTH / 2);
      colRight = this.toScreenX(colCenterX + LANE_WIDTH / 2);
      const colWidth = colRight - colLeft;

      // Vertical column highlight band
      ctx.fillStyle = rgba(this.palette.accent, 0.08);
      ctx.fillRect(colLeft, AXIS_HEIGHT, colWidth, this.height - AXIS_HEIGHT);

      // Vertical column boundary borders
      ctx.strokeStyle = rgba(this.palette.accent, 0.35);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(colLeft, AXIS_HEIGHT);
      ctx.lineTo(colLeft, this.height);
      ctx.moveTo(colRight, AXIS_HEIGHT);
      ctx.lineTo(colRight, this.height);
      ctx.stroke();
    }

    // 2. Swimlane (Row) bounds
    const swimlane = this.getSwimlaneFor(focus.type);
    const rowTop = this.toScreenY(swimlane.topY);
    const rowBottom = this.toScreenY(swimlane.bottomY);
    const rowHeight = rowBottom - rowTop;

    // Horizontal row highlight band
    ctx.fillStyle = rgba(this.palette.accent, 0.08);
    ctx.fillRect(0, rowTop, this.width, rowHeight);

    // Horizontal row boundary borders
    ctx.strokeStyle = rgba(this.palette.accent, 0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, rowTop);
    ctx.lineTo(this.width, rowTop);
    ctx.moveTo(0, rowBottom);
    ctx.lineTo(this.width, rowBottom);
    ctx.stroke();

    // 3. Intersection Cell Highlight
    if (hasCol) {
      const colWidth = colRight - colLeft;
      ctx.fillStyle = rgba(this.palette.accent, 0.12);
      ctx.fillRect(colLeft, rowTop, colWidth, rowHeight);

      // Corner brackets on intersection cell
      ctx.strokeStyle = rgba(this.palette.accent, 0.7);
      ctx.lineWidth = 2;
      const b = 14;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(colLeft, rowTop + b);
      ctx.lineTo(colLeft, rowTop);
      ctx.lineTo(colLeft + b, rowTop);
      // Top-right
      ctx.moveTo(colRight - b, rowTop);
      ctx.lineTo(colRight, rowTop);
      ctx.lineTo(colRight, rowTop + b);
      // Bottom-left
      ctx.moveTo(colLeft, rowBottom - b);
      ctx.lineTo(colLeft, rowBottom);
      ctx.lineTo(colLeft + b, rowBottom);
      // Bottom-right
      ctx.moveTo(colRight - b, rowBottom);
      ctx.lineTo(colRight, rowBottom);
      ctx.lineTo(colRight, rowBottom - b);
      ctx.stroke();
    }

    ctx.restore();
  }

  /** Background horizontal swimlanes with sticky labels and hover highlights. */
  private drawSwimlanes(focus: SimNode | null = null) {
    const ctx = this.ctx;
    ctx.save();

    const focusLane = focus ? this.getSwimlaneFor(focus.type) : null;

    for (let i = 0; i < this.swimlanes.length; i++) {
      const lane = this.swimlanes[i]!;
      const screenTop = this.toScreenY(lane.topY);
      const screenBottom = this.toScreenY(lane.bottomY);
      const height = screenBottom - screenTop;
      const isFocused = focusLane === lane;

      // Alternating band background fill
      if (i % 2 === 0) {
        ctx.fillStyle = rgba(this.palette.card, 0.3);
        ctx.fillRect(0, screenTop, this.width, height);
      }

      // Horizontal divider line
      ctx.strokeStyle = rgba(isFocused ? this.palette.accent : this.palette.border, isFocused ? 0.6 : 0.4);
      ctx.lineWidth = isFocused ? 1.5 : 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, screenTop);
      ctx.lineTo(this.width, screenTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sticky Left Swimlane Pill
      const centerScreenY = (screenTop + screenBottom) / 2;
      if (centerScreenY > AXIS_HEIGHT + 14 && centerScreenY < this.height - 14) {
        const count = this.nodes.filter((n) => !n.hidden && lane.types.includes(n.type)).length;
        const text = `${lane.icon} ${lane.label} · ${count}`;
        ctx.font = isFocused ? '700 11px Inter, system-ui, sans-serif' : '600 11px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(text).width;
        const pillW = textWidth + 18;
        const pillH = 22;
        const pillX = 14;
        const pillY = centerScreenY - pillH / 2;

        ctx.fillStyle = rgba(this.palette.card, 0.92);
        ctx.strokeStyle = rgba(isFocused ? this.palette.accent : this.palette.border, isFocused ? 0.95 : 0.8);
        ctx.lineWidth = isFocused ? 1.5 : 1;
        if (isFocused) {
          ctx.shadowColor = rgba(this.palette.accent, 0.5);
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(pillX, pillY, pillW, pillH, 6);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = rgba(isFocused ? this.palette.accent : this.palette.text, 0.95);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, pillX + 9, centerScreenY);
      }
    }

    ctx.restore();
  }

  /** Faint stage columns with a sticky label row — the funnel read left to right with hover highlights. */
  private drawAxis(focus: SimNode | null = null) {
    if (!this.lanes.length) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '500 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxLabel = LANE_WIDTH * this.zoom - 10;
    const focusCol = focus && focus.lane !== undefined ? Math.round(focus.lane) : -1;

    for (let i = 0; i < this.lanes.length; i++) {
      const x = this.toScreenX(this.laneX(i));
      if (x < -LANE_WIDTH || x > this.width + LANE_WIDTH) continue;
      const isFocused = i === focusCol;

      ctx.strokeStyle = rgba(isFocused ? this.palette.accent : this.palette.border, isFocused ? 0.6 : 0.55);
      ctx.lineWidth = isFocused ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x, AXIS_HEIGHT);
      ctx.lineTo(x, this.height);
      ctx.stroke();
      if (maxLabel < 34) continue;
      const label = this.lanes[i]!.label;
      const width = ctx.measureText(label).width;
      const text = width > maxLabel ? `${label.slice(0, Math.max(1, Math.floor((maxLabel / width) * label.length) - 1))}…` : label;
      const painted = Math.min(width, maxLabel);
      if (x - painted / 2 < 4 || x + painted / 2 > this.width - 4) continue;

      if (isFocused) {
        // Highlight pill background behind axis label
        const bw = painted + 14;
        const bh = 18;
        ctx.fillStyle = rgba(this.palette.card, 0.95);
        ctx.strokeStyle = rgba(this.palette.accent, 0.85);
        ctx.lineWidth = 1;
        ctx.shadowColor = rgba(this.palette.accent, 0.4);
        ctx.shadowBlur = 6;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x - bw / 2, AXIS_HEIGHT / 2 - bh / 2, bw, bh, 4);
        } else {
          ctx.rect(x - bw / 2, AXIS_HEIGHT / 2 - bh / 2, bw, bh);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.font = '700 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = rgba(this.palette.accent, 1);
      } else {
        ctx.font = '500 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = rgba(this.palette.muted, 0.95);
      }
      ctx.fillText(text, x, AXIS_HEIGHT / 2);
    }
    ctx.strokeStyle = rgba(this.palette.border, 0.8);
    ctx.beginPath();
    ctx.moveTo(0, AXIS_HEIGHT);
    ctx.lineTo(this.width, AXIS_HEIGHT);
    ctx.stroke();
    ctx.restore();
  }

  /** Explicit sequential workflow edges connecting Ideal Route Step 1 -> 2 -> 3 -> ... -> 9. */
  private drawIdealPathEdges() {
    if (!this.idealPathActive || !this.idealSteps.length) return;
    const ctx = this.ctx;
    ctx.save();

    for (let i = 0; i < this.idealSteps.length - 1; i++) {
      const stepA = this.idealSteps[i]!;
      const stepB = this.idealSteps[i + 1]!;
      const nodesA = stepA.entities.map((id) => this.byId.get(id)).filter((n): n is SimNode => Boolean(n && !n.hidden));
      const nodesB = stepB.entities.map((id) => this.byId.get(id)).filter((n): n is SimNode => Boolean(n && !n.hidden));
      if (!nodesA.length || !nodesB.length) continue;

      const isCurrentTransition = this.idealCurrentStep === i;
      const isPastOrNext = this.idealCurrentStep === -1 || this.idealCurrentStep === i || this.idealCurrentStep === i + 1;
      const alpha = this.idealCurrentStep === -1 ? 0.92 : isCurrentTransition ? 1.0 : isPastOrNext ? 0.6 : 0.2;
      const lineWidth = isCurrentTransition ? 3.5 : 2.5;

      for (const src of nodesA) {
        for (const dst of nodesB) {
          const x1 = src.sx;
          const y1 = src.sy;
          const x2 = dst.sx;
          const y2 = dst.sy;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distance = Math.hypot(dx, dy) || 1;

          // Subtle curve connecting sequential stages
          const mx = (x1 + x2) / 2 - dy * 0.08;
          const my = (y1 + y2) / 2 + dx * 0.08;

          ctx.strokeStyle = rgba(this.palette.accent, alpha);
          ctx.lineWidth = lineWidth;
          ctx.setLineDash([7, 5]);
          if (isCurrentTransition) {
            ctx.shadowColor = rgba(this.palette.accent, 0.7);
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(mx, my, x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          // Arrowhead
          if (distance > dst.sr + 10) {
            const angle = Math.atan2(y2 - my, x2 - mx);
            const tipX = x2 - Math.cos(angle) * (dst.sr + 3);
            const tipY = y2 - Math.sin(angle) * (dst.sr + 3);
            const size = isCurrentTransition ? 9 : 7;
            ctx.fillStyle = rgba(this.palette.accent, alpha);
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - Math.cos(angle - 0.38) * size, tipY - Math.sin(angle - 0.38) * size);
            ctx.lineTo(tipX - Math.cos(angle + 0.38) * size, tipY - Math.sin(angle + 0.38) * size);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
  }

  private drawEdge(edge: SimEdge, alpha: number, emphasised: boolean) {
    const ctx = this.ctx;
    const { source, target } = edge;
    const x1 = source.sx;
    const y1 = source.sy;
    const x2 = target.sx;
    const y2 = target.sy;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy) || 1;
    const mx = (x1 + x2) / 2 - dy * edge.bow * 0.35;
    const my = (y1 + y2) / 2 + dx * edge.bow * 0.35;
    const color = this.relationColor(edge.relation);

    ctx.save();
    ctx.strokeStyle = rgba(color, alpha);
    ctx.lineWidth = emphasised ? 2 : 1.2;
    ctx.setLineDash(edge.relation === 'masks' ? [5, 4] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead, pulled back to the rim of the target node.
    if (distance > target.sr + 10) {
      const angle = Math.atan2(y2 - my, x2 - mx);
      const tipX = x2 - Math.cos(angle) * (target.sr + 2);
      const tipY = y2 - Math.sin(angle) * (target.sr + 2);
      const size = emphasised ? 8 : 6;
      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - Math.cos(angle - 0.38) * size, tipY - Math.sin(angle - 0.38) * size);
      ctx.lineTo(tipX - Math.cos(angle + 0.38) * size, tipY - Math.sin(angle + 0.38) * size);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawNode(node: SimNode, alpha: number, idealStepNum?: number) {
    const ctx = this.ctx;
    const color = this.palette.type[node.type];
    const focused = node === this.hovered || node === this.selected;

    ctx.save();

    // If Ideal Path is active and node is part of the path, draw an aura and step badge
    if (this.idealPathActive && idealStepNum !== undefined) {
      ctx.fillStyle = rgba(this.palette.accent, 0.25);
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, node.sr + 7, 0, Math.PI * 2);
      ctx.fill();

      // Step Number Badge above node
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const badgeY = node.sy - node.sr - 9;
      const badgeText = `${idealStepNum}`;
      const bw = ctx.measureText(badgeText).width + 8;
      ctx.fillStyle = rgba(this.palette.accent, 0.95);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(node.sx - bw / 2, badgeY - 6, bw, 13, 3);
      } else {
        ctx.rect(node.sx - bw / 2, badgeY - 6, bw, 13);
      }
      ctx.fill();
      ctx.fillStyle = rgba(this.palette.bg, 1);
      ctx.fillText(badgeText, node.sx, badgeY);
    }

    if (focused) {
      ctx.shadowColor = rgba(color, 0.55);
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.arc(node.sx, node.sy, node.sr, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, alpha * (focused ? 0.45 : 0.22));
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = focused ? 2.75 : 1.75;
    ctx.strokeStyle = rgba(color, alpha);
    ctx.stroke();

    if (node === this.selected) {
      ctx.beginPath();
      ctx.arc(node.sx, node.sy, node.sr + 5, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(this.palette.text, 0.75 * alpha);
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- interaction -------------------------------------------------------

  private nodeAt(x: number, y: number): SimNode | null {
    let best: SimNode | null = null;
    let bestDistance = Infinity;
    for (const node of this.nodes) {
      if (node.hidden) continue;
      const distance = Math.hypot(node.sx - x, node.sy - y);
      const threshold = Math.max(node.sr + 6, 14);
      if (distance <= threshold && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  private pointerPosition(event: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private emitHover(node: SimNode | null) {
    if (node === this.hovered) return;
    this.hovered = node;
    this.canvas.style.cursor = node ? 'pointer' : 'grab';
    this.options.onHover?.(node ? { node, x: node.sx, y: node.sy, radius: node.sr } : null);
    this.draw();
  }

  private bind() {
    const canvas = this.canvas;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'pan-y';

    canvas.addEventListener('pointerdown', (event) => {
      canvas.setPointerCapture(event.pointerId);
      const point = this.pointerPosition(event);
      this.pointers.set(event.pointerId, point);
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        this.pinchDistance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
        this.panning = false;
        this.dragging = null;
        return;
      }
      this.pointerMoved = false;
      this.pointerStart = point;
      const node = this.nodeAt(point.x, point.y);
      if (node) {
        this.dragging = node;
        this.reheat(0.35);
      } else {
        this.panning = true;
        canvas.style.cursor = 'grabbing';
      }
    });

    canvas.addEventListener('pointermove', (event) => {
      const point = this.pointerPosition(event);
      if (this.pointers.has(event.pointerId)) this.pointers.set(event.pointerId, point);

      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
        if (this.pinchDistance > 0) {
          this.zoomBy(distance / this.pinchDistance, (a!.x + b!.x) / 2, (a!.y + b!.y) / 2);
        }
        this.pinchDistance = distance;
        return;
      }

      if (this.pointerStart && Math.hypot(point.x - this.pointerStart.x, point.y - this.pointerStart.y) > 4) {
        this.pointerMoved = true;
      }

      if (this.dragging) {
        const world = this.toWorld(point.x, point.y);
        this.dragging.x = world.x;
        this.dragging.y = world.y;
        this.dragging.vx = 0;
        this.dragging.vy = 0;
        this.draw();
        return;
      }
      if (this.panning) {
        if (this.pointerStart) {
          this.panX += event.movementX || point.x - this.pointerStart.x;
          this.panY += event.movementY || point.y - this.pointerStart.y;
          this.pointerStart = point;
        }
        this.draw();
        return;
      }
      this.emitHover(this.nodeAt(point.x, point.y));
    });

    const release = (event: PointerEvent) => {
      this.pointers.delete(event.pointerId);
      if (this.pointers.size < 2) this.pinchDistance = 0;
      const wasDragging = this.dragging;
      const point = this.pointerPosition(event);
      this.dragging = null;
      this.panning = false;
      canvas.style.cursor = this.hovered ? 'pointer' : 'grab';
      if (this.pointerMoved) {
        if (wasDragging) this.reheat(0.25);
        return;
      }
      const node = wasDragging ?? this.nodeAt(point.x, point.y);
      this.select(node ? node.id : null);
      if (event.pointerType !== 'mouse') this.emitHover(null);
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', (event) => {
      this.pointers.delete(event.pointerId);
      this.dragging = null;
      this.panning = false;
    });
    canvas.addEventListener('pointerleave', () => {
      if (!this.dragging && !this.panning) this.emitHover(null);
    });

    canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        this.zoomBy(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
      },
      { passive: false }
    );

    canvas.addEventListener('keydown', (event) => {
      const visible = this.nodes.filter((n) => !n.hidden);
      if (!visible.length) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
        const index = this.selected ? visible.indexOf(this.selected) : -1;
        const next = visible[(index + step + visible.length) % visible.length]!;
        this.select(next.id);
      } else if (event.key === 'Enter' && this.selected) {
        window.location.href = this.selected.href;
      } else if (event.key === 'Escape') {
        this.select(null);
      } else if (event.key === '+' || event.key === '=') {
        this.zoomBy(1.25);
      } else if (event.key === '-') {
        this.zoomBy(0.8);
      }
    });

    this.observer = new ResizeObserver(() => {
      const before = { w: this.width, h: this.height };
      this.measure();
      if (before.w < 10 || before.h < 10) {
        this.fit(false);
      } else {
        this.panX += (this.width - before.w) / 2;
        this.panY += (this.height - before.h) / 2;
      }
      this.draw();
    });
    this.observer.observe(this.canvas);
  }

  // ---- public API --------------------------------------------------------

  get zoomLevel() {
    return this.zoom;
  }

  /**
   * Fullscreen owns the whole screen, so one finger may pan freely; inline the
   * canvas must leave vertical swipes to the page.
   */
  setFreeTouchPanning(free: boolean) {
    this.canvas.style.touchAction = free ? 'none' : 'pan-y';
  }

  getNode(id: string): SimNode | undefined {
    return this.byId.get(id);
  }

  neighborsOf(id: string): SimNode[] {
    return [...(this.neighbors.get(id) ?? [])].map((nid) => this.byId.get(nid)!).filter(Boolean);
  }

  select(id: string | null) {
    const node = id ? this.byId.get(id) ?? null : null;
    if (node?.hidden) return;
    // The panel now carries everything the tooltip was hinting at.
    if (node) this.emitHover(null);
    this.selected = node;
    this.options.onSelect?.(node);
    this.draw();
  }

  /** Bring a node into view without changing the zoom level. */
  centerOn(id: string) {
    const node = this.byId.get(id);
    if (!node) return;
    this.panX = this.width / 2 - node.x * this.zoom;
    this.panY = this.height / 2 - node.y * this.zoom;
    this.draw();
  }

  /** Hide nodes the predicate rejects; edges follow their endpoints. */
  setVisibility(predicate: (node: SimNode) => boolean) {
    let visible = 0;
    for (const node of this.nodes) {
      node.hidden = !predicate(node);
      if (!node.hidden) visible++;
    }
    for (const edge of this.edges) edge.hidden = edge.source.hidden || edge.target.hidden;
    if (this.selected?.hidden) this.select(null);
    if (this.hovered?.hidden) this.emitHover(null);
    this.settle(90);
    this.draw();
    this.options.onViewChange?.({ zoom: this.zoom, visible });
    return visible;
  }

  /** Toggle Ideal Canonical Route overlay mode. */
  setIdealPathActive(active: boolean, stepIndex = -1) {
    this.idealPathActive = active;
    this.idealCurrentStep = stepIndex;
    if (active && stepIndex >= 0) {
      this.focusIdealStep(stepIndex);
    } else {
      this.draw();
    }
  }

  isIdealPathActive() {
    return this.idealPathActive;
  }

  getCurrentIdealStep() {
    return this.idealCurrentStep;
  }

  getIdealSteps() {
    return this.idealSteps;
  }

  /** Focus view on nodes belonging to a specific ideal path step. */
  focusIdealStep(stepIndex: number) {
    this.idealCurrentStep = stepIndex;
    const step = this.idealSteps[stepIndex];
    if (step && step.entities.length) {
      const stepNodes = step.entities
        .map((id) => this.byId.get(id))
        .filter((n): n is SimNode => Boolean(n && !n.hidden));
      if (stepNodes.length) {
        const avgX = stepNodes.reduce((sum, n) => sum + n.x, 0) / stepNodes.length;
        const avgY = stepNodes.reduce((sum, n) => sum + n.y, 0) / stepNodes.length;
        this.panX = this.width / 2 - avgX * this.zoom;
        this.panY = this.height / 2 - avgY * this.zoom;
      }
    }
    this.draw();
  }

  destroy() {
    this.destroyed = true;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
  }
}
