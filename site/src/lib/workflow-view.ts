/**
 * Canvas renderer and player for a workflow state machine.
 *
 * The same discipline as the graph explorer: one <canvas>, no DOM node per
 * state, hit-testing and hover handled here, and the surrounding page owns the
 * real DOM — the transport controls, the detail panel and the ordered list that
 * works with the canvas switched off.
 *
 * A workflow is a walk, not a picture, so the player is the point: play, pause,
 * step either way, scrub. Playback follows the transitions rather than the
 * state order, so what you watch is a path a subject could actually take.
 *
 * The camera follows that walk. A hiring machine is thirteen states deep and
 * two wide, which is the worst possible shape for "fit it in the box": scaling
 * it down until it fits leaves the labels unreadable and two thirds of the
 * canvas empty. So the view keeps a legible scale and pans to the state being
 * played, the way a person reading a long diagram moves their eyes.
 */

export interface ViewState {
  id: string;
  title: string;
  kind: 'initial' | 'active' | 'terminal';
  owner: string;
  description: string;
  entities: string[];
  visible_to_candidate?: string;
  /** Entities that are the ways this state goes wrong. */
  deviations?: string[];
}

export interface ViewTransition {
  from: string;
  to: string;
  label: string;
  owner: string;
  guard: string;
  entities: string[];
  latency_expected_days?: number;
  latency_max_days?: number;
}

export interface WorkflowData {
  id: string;
  title: string;
  subject: string;
  states: ViewState[];
  transitions: ViewTransition[];
}

/**
 * Two ways to move through a machine.
 *
 * `play` walks a route the renderer chose, which is what you want when the
 * question is "what does this process do". `choose` hands the branch back to
 * the reader at every state that has more than one exit, which is what you want
 * when the question is "which of these happened to me". Same canvas, same
 * transport, same detail panel — the decision tree is not a second interaction
 * model, it is this one with the fork given away.
 */
export type WorkflowMode = 'play' | 'choose';

export interface WorkflowStep {
  index: number;
  total: number;
  state: ViewState;
  transition?: ViewTransition;
  /** In `choose` mode: the exits from this state, for the reader to pick from. */
  branches: ViewTransition[];
  /** In `choose` mode: the walk so far, oldest first. */
  trace: ViewState[];
  mode: WorkflowMode;
}

export interface WorkflowViewOptions {
  onSelect?: (state: ViewState | null) => void;
  onStep?: (step: WorkflowStep) => void;
  onPlaying?: (playing: boolean) => void;
  onMode?: (mode: WorkflowMode) => void;
}

type RGB = [number, number, number];

const KIND_VAR: Record<ViewState['kind'], string> = {
  initial: '--g-barrier',
  active: '--g-mechanism',
  terminal: '--g-loop',
};

const COLUMN = 272;
const ROW = 122;
const NODE_W = 224;
const NODE_H = 80;
const PAD = 36;

/** Below this the titles stop being readable, so the camera pans instead. */
const MIN_SCALE = 0.68;
const MAX_SCALE = 1.15;

function parseRGB(value: string, fallback: RGB): RGB {
  const parts = value.trim().split(/[\s,/]+/).slice(0, 3).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? (parts as RGB) : fallback;
}

const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

interface Placed extends ViewState {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

export class WorkflowView {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: WorkflowViewOptions;

  readonly states: Placed[] = [];
  readonly transitions: ViewTransition[];
  private readonly byId = new Map<string, Placed>();

  /** The path the player walks: a state, then the transition that leaves it. */
  private readonly path: { state: Placed; transition?: ViewTransition }[] = [];
  private cursor = 0;
  private timer = 0;
  private playing = false;

  /** `choose` mode state: the walk the reader has made, and the edges they took. */
  private mode: WorkflowMode = 'play';
  private trace: Placed[] = [];
  private traceEdges: (ViewTransition | undefined)[] = [];
  private readonly outgoing = new Map<string, ViewTransition[]>();

  private palette!: { text: RGB; muted: RGB; border: RGB; bg: RGB; accent: RGB; kind: Record<ViewState['kind'], RGB> };
  private scale = 1;
  private panX = 0;
  private panY = 0;
  private wantX = 0;
  private wantY = 0;
  private raf = 0;
  private dragging = false;
  private dragged = false;
  private width = 0;
  private height = 0;
  private hovered: Placed | null = null;
  private observer: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, data: WorkflowData, options: WorkflowViewOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('workflow-view: 2d canvas context unavailable');
    this.ctx = ctx;
    this.options = options;
    this.transitions = data.transitions;

    for (const t of data.transitions) this.outgoing.set(t.from, [...(this.outgoing.get(t.from) ?? []), t]);
    this.layout(data);
    this.buildPath();
    const start = this.states.find((s) => s.kind === 'initial') ?? this.states[0]!;
    this.trace = [start];
    this.traceEdges = [undefined];
    this.refreshTheme();
    this.measure();
    this.frame(true);
    this.bind();
    this.draw();
  }

  // ---- layout ------------------------------------------------------------

  /**
   * Longest-path layering: a state sits one column right of the furthest state
   * that can reach it, so the machine reads left to right and a back edge is
   * visibly a back edge.
   */
  private layout(data: WorkflowData) {
    const outgoing = new Map<string, ViewTransition[]>();
    for (const t of data.transitions) outgoing.set(t.from, [...(outgoing.get(t.from) ?? []), t]);

    const depth = new Map<string, number>();
    const start = data.states.find((s) => s.kind === 'initial') ?? data.states[0]!;
    const walk = (id: string, at: number, seen: Set<string>) => {
      if (seen.has(id)) return; // a cycle: keep the depth already assigned
      if ((depth.get(id) ?? -1) >= at) return;
      depth.set(id, at);
      const next = new Set(seen).add(id);
      for (const t of outgoing.get(id) ?? []) walk(t.to, at + 1, next);
    };
    walk(start.id, 0, new Set());
    for (const s of data.states) if (!depth.has(s.id)) depth.set(s.id, 0);

    // Responsive wrapped pipeline layout: 4 columns per row
    const MAX_COLS = data.states.length > 5 ? 4 : Math.min(4, Math.max(2, data.states.length));
    const gridOccupancy = new Map<string, number>();

    for (const state of data.states) {
      const d = depth.get(state.id)!;
      const tier = Math.floor(d / MAX_COLS);
      const col = d % MAX_COLS;
      const cellKey = `${tier}:${col}`;
      const branchIndex = gridOccupancy.get(cellKey) ?? 0;
      gridOccupancy.set(cellKey, branchIndex + 1);

      const x = (col - (MAX_COLS - 1) / 2) * COLUMN;
      const y = (tier * 1.5 + branchIndex * 0.95) * ROW;
      const placed: Placed = { ...state, x, y, sx: 0, sy: 0 };
      this.states.push(placed);
      this.byId.set(placed.id, placed);
    }
  }

  /** Depth-first from the initial state, so playback follows a real route. */
  private buildPath() {
    const outgoing = new Map<string, ViewTransition[]>();
    for (const t of this.transitions) outgoing.set(t.from, [...(outgoing.get(t.from) ?? []), t]);
    const start = this.states.find((s) => s.kind === 'initial') ?? this.states[0]!;
    const seen = new Set<string>();
    const walk = (state: Placed) => {
      if (seen.has(state.id)) return;
      seen.add(state.id);
      const exits = outgoing.get(state.id) ?? [];
      if (!exits.length) {
        this.path.push({ state });
        return;
      }
      for (const transition of exits) {
        const target = this.byId.get(transition.to);
        this.path.push({ state, transition });
        if (target && !seen.has(target.id)) walk(target);
      }
    };
    walk(start);
    for (const state of this.states) if (!seen.has(state.id)) this.path.push({ state });
  }

  // ---- theme and camera --------------------------------------------------

  refreshTheme() {
    const cs = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: RGB) => parseRGB(cs.getPropertyValue(name), fallback);
    this.palette = {
      text: read('--c-text', [230, 237, 243]),
      muted: read('--c-muted', [139, 148, 158]),
      border: read('--c-border', [31, 38, 51]),
      bg: read('--c-bg', [10, 12, 16]),
      accent: read('--c-accent', [88, 166, 255]),
      kind: {
        initial: read(KIND_VAR.initial, [63, 185, 80]),
        active: read(KIND_VAR.active, [88, 166, 255]),
        terminal: read(KIND_VAR.terminal, [219, 97, 162]),
      },
    };
    this.draw();
  }

  private measure() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private bounds() {
    const xs = this.states.map((s) => s.x);
    const ys = this.states.map((s) => s.y);
    return {
      minX: Math.min(...xs) - NODE_W / 2,
      maxX: Math.max(...xs) + NODE_W / 2,
      minY: Math.min(...ys) - NODE_H / 2,
      maxY: Math.max(...ys) + NODE_H / 2,
    };
  }

  /**
   * The height at which this machine needs no vertical scaling — a two-row
   * machine should not be given the same box as a five-row one and half of it
   * left empty. The page clamps this into something reasonable.
   */
  preferredHeight(): number {
    const { minY, maxY } = this.bounds();
    return Math.round(maxY - minY + PAD * 2);
  }

  /**
   * One camera rule: show the whole machine when it fits at a legible size,
   * otherwise keep the size and put the state being played in view.
   */
  frame(immediate = false) {
    const { minX, maxX, minY, maxY } = this.bounds();
    const fit = Math.min((this.width - PAD * 2) / (maxX - minX), (this.height - PAD * 2) / (maxY - minY));
    this.scale = clamp(fit, MIN_SCALE, MAX_SCALE);

    const spanX = (maxX - minX) * this.scale;
    const spanY = (maxY - minY) * this.scale;
    const focus = this.current()?.state;

    if (spanX <= this.width - PAD * 2 || !focus) {
      this.wantX = this.width / 2 - ((minX + maxX) / 2) * this.scale;
    } else {
      // Keep the active state a little left of centre: what comes next matters
      // more than what has already been walked.
      const want = this.width * 0.42 - focus.x * this.scale;
      this.wantX = clamp(want, this.width - PAD - maxX * this.scale, PAD - minX * this.scale);
    }

    if (spanY <= this.height - PAD * 2 || !focus) {
      this.wantY = this.height / 2 - ((minY + maxY) / 2) * this.scale;
    } else {
      const want = this.height / 2 - focus.y * this.scale;
      this.wantY = clamp(want, this.height - PAD - maxY * this.scale, PAD - minY * this.scale);
    }

    if (immediate || this.reducedMotion()) {
      this.panX = this.wantX;
      this.panY = this.wantY;
      this.draw();
      return;
    }
    this.glide();
  }

  private reducedMotion() {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }

  private glide() {
    if (this.raf) return;
    const tick = () => {
      const dx = this.wantX - this.panX;
      const dy = this.wantY - this.panY;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        this.panX = this.wantX;
        this.panY = this.wantY;
        this.raf = 0;
        this.draw();
        return;
      }
      this.panX += dx * 0.18;
      this.panY += dy * 0.18;
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  // ---- playback ----------------------------------------------------------

  get step() {
    return { index: this.cursor, total: this.length };
  }

  get isPlaying() {
    return this.playing;
  }

  get walkMode(): WorkflowMode {
    return this.mode;
  }

  /** How many positions the current mode has. */
  private get length(): number {
    return this.mode === 'play' ? this.path.length : this.trace.length;
  }

  /** Where the reader is now, in whichever mode is running. */
  private current(): { state: Placed; transition?: ViewTransition } | undefined {
    if (this.mode === 'play') return this.path[this.cursor];
    const state = this.trace[this.cursor];
    return state ? { state, transition: this.traceEdges[this.cursor] } : undefined;
  }

  /** The states walked so far — what the canvas draws as already visited. */
  private walked(): Set<string> {
    const source = this.mode === 'play' ? this.path.slice(0, this.cursor + 1).map((p) => p.state) : this.trace.slice(0, this.cursor + 1);
    return new Set(source.map((s) => s.id));
  }

  private branches(): ViewTransition[] {
    if (this.mode !== 'choose') return [];
    const at = this.trace[this.cursor];
    return at ? (this.outgoing.get(at.id) ?? []) : [];
  }

  private announce() {
    const at = this.current();
    if (!at) return;
    this.options.onStep?.({
      index: this.cursor,
      total: this.length,
      state: at.state,
      transition: at.transition,
      branches: this.branches(),
      trace: this.trace.slice(0, this.cursor + 1),
      mode: this.mode,
    });
    this.options.onSelect?.(at.state);
    this.frame();
    this.draw();
  }

  /**
   * Switching modes resets the position, because a cursor into a chosen route
   * means nothing in a route the renderer picked, and the reverse.
   */
  setMode(mode: WorkflowMode) {
    if (mode === this.mode) return;
    this.pause();
    this.mode = mode;
    this.reset();
    this.options.onMode?.(mode);
  }

  seek(index: number) {
    this.cursor = clamp(index, 0, Math.max(0, this.length - 1));
    this.announce();
  }

  next() {
    if (this.cursor >= this.length - 1) {
      this.pause();
      return;
    }
    this.seek(this.cursor + 1);
  }

  previous() {
    this.seek(this.cursor - 1);
  }

  /**
   * Take one exit from the current state. Choosing again from a state you have
   * stepped back to discards the rest of the old walk, which is the behaviour
   * that makes back-and-try-the-other-branch work.
   */
  choose(transitionIndex: number) {
    if (this.mode !== 'choose') return;
    const exits = this.branches();
    const transition = exits[transitionIndex];
    const target = transition && this.byId.get(transition.to);
    if (!transition || !target) return;
    this.trace = [...this.trace.slice(0, this.cursor + 1), target];
    this.traceEdges = [...this.traceEdges.slice(0, this.cursor + 1), transition];
    this.cursor = this.trace.length - 1;
    this.announce();
  }

  /** Replay a walk from a shared link. Unreachable steps stop the replay. */
  restore(stateIds: string[]) {
    if (this.mode !== 'choose' || !stateIds.length) return;
    this.reset();
    for (const id of stateIds) {
      const index = this.branches().findIndex((t) => t.to === id);
      if (index < 0) break;
      this.choose(index);
    }
  }

  /** The walk so far as state ids — what a shared link carries. */
  get walk(): string[] {
    return this.trace.slice(1, this.cursor + 1).map((s) => s.id);
  }

  play(intervalMs = 1600) {
    // Nothing to auto-play when the fork belongs to the reader.
    if (this.playing || this.mode === 'choose') return;
    // A reader who asked for less motion gets the controls, not the animation.
    if (this.reducedMotion()) {
      this.next();
      return;
    }
    this.playing = true;
    this.options.onPlaying?.(true);
    this.timer = window.setInterval(() => this.next(), intervalMs);
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    window.clearInterval(this.timer);
    this.options.onPlaying?.(false);
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  reset() {
    this.pause();
    if (this.mode === 'choose') {
      const start = this.states.find((s) => s.kind === 'initial') ?? this.states[0]!;
      this.trace = [start];
      this.traceEdges = [undefined];
    }
    this.cursor = 0;
    this.announce();
  }

  selectState(id: string) {
    // In `choose` mode the position is the reader's walk, not an index into a
    // route, so clicking a state jumps only if they have already been there.
    const source = this.mode === 'play' ? this.path.map((p) => p.state.id) : this.trace.map((s) => s.id);
    const index = source.indexOf(id);
    if (index >= 0) this.seek(index);
  }

  // ---- drawing -----------------------------------------------------------

  private draw() {
    const ctx = this.ctx;
    if (!this.palette) return;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const state of this.states) {
      state.sx = state.x * this.scale + this.panX;
      state.sy = state.y * this.scale + this.panY;
    }

    const at = this.current();
    const activeState = at?.state;
    const activeTransition = at?.transition;
    const visited = this.walked();

    for (const transition of this.transitions) {
      const from = this.byId.get(transition.from);
      const to = this.byId.get(transition.to);
      if (!from || !to) continue;
      const live = transition === activeTransition;
      this.drawEdge(from, to, live, visited.has(from.id) && visited.has(to.id));
    }

    for (const state of this.states) {
      this.drawState(state, state === activeState, visited.has(state.id));
    }

    this.drawEdgeFades();
  }

  /** Soft edges where the machine runs off the canvas, so panning is legible. */
  private drawEdgeFades() {
    const { minX, maxX } = this.bounds();
    const ctx = this.ctx;
    const bg = this.palette.bg;
    const left = minX * this.scale + this.panX < -4;
    const right = maxX * this.scale + this.panX > this.width + 4;
    const w = 44;
    if (left) {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, rgba(bg, 0.95));
      g.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, this.height);
    }
    if (right) {
      const g = ctx.createLinearGradient(this.width - w, 0, this.width, 0);
      g.addColorStop(0, rgba(bg, 0));
      g.addColorStop(1, rgba(bg, 0.95));
      ctx.fillStyle = g;
      ctx.fillRect(this.width - w, 0, w, this.height);
    }
  }

  private drawEdge(from: Placed, to: Placed, live: boolean, walked: boolean) {
    const ctx = this.ctx;
    const w = (NODE_W / 2) * this.scale;
    const h = (NODE_H / 2) * this.scale;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    let x1 = from.sx;
    let y1 = from.sy;
    let x2 = to.sx;
    let y2 = to.sy;
    let c1x = x1;
    let c1y = y1;
    let c2x = x2;
    let c2y = y2;
    let isBack = false;

    if (Math.abs(dy) < 30) {
      // Same row
      const back = dx < 0;
      isBack = back;
      x1 = from.sx + (back ? -w : w);
      x2 = to.sx + (back ? w : -w);
      const bend = back ? Math.max(28, Math.abs(x2 - x1) * 0.18) : 0;
      c1x = x1 + (back ? -bend : bend);
      c1y = from.sy - bend;
      c2x = x2 + (back ? bend : -bend);
      c2y = to.sy - bend;
    } else if (Math.abs(dx) < 60) {
      // Direct vertical connection
      const down = dy > 0;
      y1 = from.sy + (down ? h : -h);
      y2 = to.sy + (down ? -h : h);
      c1x = x1;
      c1y = y1 + (down ? 24 : -24);
      c2x = x2;
      c2y = y2 + (down ? -24 : 24);
    } else if (dy > 0 && dx < 0) {
      // Row wrap (e.g. end of row 0 to start of row 1)
      x1 = from.sx + w;
      y1 = from.sy;
      x2 = to.sx - w;
      y2 = to.sy;
      c1x = x1 + 45 * this.scale;
      c1y = from.sy + 35 * this.scale;
      c2x = x2 - 45 * this.scale;
      c2y = to.sy - 35 * this.scale;
    } else {
      // General diagonal connection
      const back = dx < 0;
      isBack = back;
      x1 = from.sx + (back ? -w : w);
      y1 = from.sy;
      x2 = to.sx + (back ? w : -w);
      y2 = to.sy;
      c1x = (x1 + x2) / 2;
      c1y = y1;
      c2x = (x1 + x2) / 2;
      c2y = y2;
    }

    ctx.save();
    ctx.strokeStyle = live ? rgba(this.palette.accent, 1) : rgba(this.palette.border, walked ? 1 : 0.55);
    ctx.lineWidth = live ? 2.5 : 1.4;
    if (isBack) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(y2 - c2y, x2 - c2x);
    const size = live ? 9 : 6;
    ctx.fillStyle = live ? rgba(this.palette.accent, 1) : rgba(this.palette.border, walked ? 1 : 0.55);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(angle - 0.4) * size, y2 - Math.sin(angle - 0.4) * size);
    ctx.lineTo(x2 - Math.cos(angle + 0.4) * size, y2 - Math.sin(angle + 0.4) * size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawState(state: Placed, active: boolean, walked: boolean) {
    const ctx = this.ctx;
    const hue = this.palette.kind[state.kind];
    const w = NODE_W * this.scale;
    const h = NODE_H * this.scale;
    const x = state.sx - w / 2;
    const y = state.sy - h / 2;
    const r = 9 * this.scale;
    const dim = active ? 1 : walked ? 0.92 : 0.62;
    const hover = state === this.hovered && !active;

    ctx.save();
    if (active) {
      ctx.shadowColor = rgba(hue, 0.5);
      ctx.shadowBlur = 22;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = rgba(this.palette.bg, 0.96);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = active ? 2.5 : 1.4;
    ctx.strokeStyle = rgba(hue, hover ? 1 : dim);
    ctx.stroke();

    // A left rule in the kind's hue, so terminal states read as terminal.
    ctx.beginPath();
    ctx.roundRect(x, y, 4 * this.scale, h, [r, 0, 0, r]);
    ctx.fillStyle = rgba(hue, dim);
    ctx.fill();

    const padX = 13 * this.scale;
    const inner = w - padX - 10 * this.scale;

    // The deviation count is the reason this view exists: a state that can go
    // wrong says so before you click it.
    const marks = state.deviations?.length ?? 0;
    if (marks) {
      const dot = 8 * this.scale;
      ctx.beginPath();
      ctx.arc(x + w - 12 * this.scale, y + 12 * this.scale, dot / 2 + 3 * this.scale, 0, Math.PI * 2);
      ctx.fillStyle = rgba(this.palette.kind.terminal, active || walked ? 0.9 : 0.5);
      ctx.fill();
      ctx.font = `700 ${Math.max(8, 9 * this.scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = rgba(this.palette.bg, 1);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(marks), x + w - 12 * this.scale, y + 12.5 * this.scale);
    }

    const size = Math.max(10.5, Math.min(14, 13.5 * this.scale));
    ctx.font = `${active ? 600 : 500} ${size}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = rgba(this.palette.text, dim);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const lines = this.wrap(state.title, marks ? inner - 14 * this.scale : inner, 3);
    const lead = size * 1.3;
    const top = state.sy - ((lines.length - 1) * lead) / 2;
    lines.forEach((line, i) => ctx.fillText(line, x + padX, top + i * lead));
    ctx.restore();
  }

  /** Two lines of title, broken on words, the last one elided if it must be. */
  private wrap(value: string, max: number, maxLines: number): string[] {
    const ctx = this.ctx;
    if (ctx.measureText(value).width <= max) return [value];
    const words = value.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    let taken = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= max || !line) {
        line = candidate;
        taken++;
        continue;
      }
      lines.push(line);
      line = word;
      taken++;
      if (lines.length === maxLines - 1) break;
    }
    const rest = words.slice(taken).join(' ');
    lines.push(this.ellipsis(rest ? `${line} ${rest}` : line, max));
    return lines.slice(0, maxLines);
  }

  private ellipsis(value: string, max: number): string {
    const ctx = this.ctx;
    if (ctx.measureText(value).width <= max) return value;
    let out = value;
    while (out.length > 1 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1);
    return `${out}…`;
  }

  // ---- interaction -------------------------------------------------------

  private stateAt(x: number, y: number): Placed | null {
    const w = (NODE_W * this.scale) / 2;
    const h = (NODE_H * this.scale) / 2;
    return this.states.find((s) => Math.abs(s.sx - x) <= w && Math.abs(s.sy - y) <= h) ?? null;
  }

  private bind() {
    const canvas = this.canvas;
    canvas.style.touchAction = 'pan-y';
    canvas.style.cursor = 'grab';
    let lastX = 0;

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      this.dragging = true;
      this.dragged = false;
      lastX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      if (this.dragging) {
        const dx = event.clientX - lastX;
        if (Math.abs(dx) > 2) this.dragged = true;
        lastX = event.clientX;
        this.panX += dx;
        this.wantX = this.panX;
        this.draw();
        return;
      }
      const hit = this.stateAt(event.clientX - rect.left, event.clientY - rect.top);
      if (hit !== this.hovered) {
        this.hovered = hit;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        this.draw();
      }
    });

    const release = (event: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    canvas.addEventListener('click', (event) => {
      if (this.dragged) return; // a pan is not a selection
      const rect = canvas.getBoundingClientRect();
      const hit = this.stateAt(event.clientX - rect.left, event.clientY - rect.top);
      if (hit) {
        this.pause();
        this.selectState(hit.id);
      }
    });

    canvas.addEventListener(
      'wheel',
      (event) => {
        // Horizontal intent pans the machine; vertical intent scrolls the page.
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        this.panX -= event.deltaX;
        this.wantX = this.panX;
        this.draw();
      },
      { passive: false }
    );

    canvas.addEventListener('keydown', (event) => {
      const actions: Record<string, () => void> = {
        ' ': () => this.toggle(),
        ArrowRight: () => {
          this.pause();
          this.next();
        },
        ArrowLeft: () => {
          this.pause();
          this.previous();
        },
        Home: () => this.reset(),
        End: () => {
          this.pause();
          this.seek(this.length - 1);
        },
      };
      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    });

    this.observer = new ResizeObserver(() => {
      this.measure();
      this.frame(true);
    });
    this.observer.observe(canvas);
  }

  destroy() {
    this.pause();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
  }
}
