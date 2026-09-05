/** Generated acquisition backlog from the executable case-space denominator. */
import {
  CASE_AXES,
  DERIVED_CASE_COORDINATES,
  type CaseAxis,
  type DerivedCaseCoordinate,
} from '@hoba/registry-core/case-space';
import type { CaseLift, CaseLiftCoordinateSummary, CaseLiftReport } from './case-lift.js';

export type CoverageBacklogPriority = 'critical' | 'high' | 'medium' | 'low';
export type CoverageBacklogStatus = 'absent' | 'thin' | 'unknown_in_scenario';
export type CoverageBacklogTargetKind = 'coordinate' | 'value' | 'pairwise' | 'scenario_unknown';
export type CoverageBacklogNeed =
  'observation' | 'mechanism' | 'record' | 'scenario' | 'evidence' | 'case_assignment';

export interface CoverageBacklogCoordinate {
  readonly coordinate: string;
  readonly block: string;
  readonly kind: 'scalar' | 'subset';
  readonly values_total: number;
  readonly values_touched: number;
  readonly assigned_sources: number;
  readonly missing_values: readonly string[];
  readonly unknown_declarations: number;
  readonly status?: CoverageBacklogStatus;
}

export interface CoverageBacklogPairwiseSkew {
  readonly left: string;
  readonly right: string;
  readonly touched_slots: number;
  readonly total_slots: number;
  readonly coverage_ratio: number;
}

export interface CoverageBacklogTarget {
  readonly id: string;
  readonly kind: CoverageBacklogTargetKind;
  readonly priority: CoverageBacklogPriority;
  readonly status: CoverageBacklogStatus;
  readonly coordinate?: string;
  readonly value?: string;
  readonly pair?: CoverageBacklogPairwiseSkew;
  readonly scenario?: string;
  readonly reason: string;
  readonly needed: readonly CoverageBacklogNeed[];
}

export interface CoverageBacklogReport {
  readonly version: '1.0.0';
  readonly method: {
    readonly unit: string;
    readonly boundary: string;
    readonly limitation: string;
  };
  readonly summary: {
    readonly coordinates_total: number;
    readonly coordinates_absent: number;
    readonly coordinates_thin: number;
    readonly values_missing: number;
    readonly scenario_unknowns: number;
    readonly pairwise_targets: number;
    readonly critical_targets: number;
    readonly high_targets: number;
    readonly medium_targets: number;
  };
  readonly coordinates: readonly CoverageBacklogCoordinate[];
  readonly priority_targets: readonly CoverageBacklogTarget[];
  readonly pairwise_skews: readonly CoverageBacklogPairwiseSkew[];
}

interface CoordinateDefinition {
  readonly id: string;
  readonly block: string;
  readonly kind: 'scalar' | 'subset';
  readonly values: readonly string[];
}

const STRATEGIC_PAIRS: readonly (readonly [string, string])[] = [
  ['worksite.mode', 'population.affected'],
  ['worksite.cadence', 'population.affected'],
  ['worksite.anchor', 'military.status'],
  ['military.status', 'jurisdiction'],
  ['military.status', 'population.affected'],
  ['latitude.employer', 'latitude.candidate'],
  ['funding.source', 'requisition.state'],
  ['requisition.state', 'outcome.signal'],
  ['entry.path', 'cohort.state'],
  ['visibility.candidate', 'statement.fidelity'],
  ['evidence.level', 'evidence.role'],
];

const PRIORITY_BLOCKS = new Set([
  'demand_money',
  'entry_object',
  'blocking_condition',
  'exterior_status',
]);

const scalarAxis = (axis: CaseAxis): CoordinateDefinition => ({
  id: axis.id,
  block: axis.block,
  kind: axis.kind === 'subset' ? 'subset' : 'scalar',
  values: axis.values,
});

const derivedAxis = (axis: DerivedCaseCoordinate): CoordinateDefinition => ({
  id: axis.id,
  block: 'derived',
  kind: 'scalar',
  values: axis.values,
});

const coordinateDefinitions: readonly CoordinateDefinition[] = [
  ...CASE_AXES.map(scalarAxis),
  ...DERIVED_CASE_COORDINATES.map(derivedAxis),
].sort((a, b) => a.id.localeCompare(b.id));

const definitionsById = new Map(
  coordinateDefinitions.map((definition) => [definition.id, definition])
);

const coordinateRank = new Map(
  coordinateDefinitions.map((definition, index) => [definition.id, index])
);

function declarationUnknowns(
  lifts: readonly CaseLift[]
): Map<string, { total: number; scenarios: string[] }> {
  const counts = new Map<string, { total: number; scenarios: string[] }>();
  for (const lift of lifts) {
    for (const declaration of lift.declarations) {
      if (declaration.status !== 'unknown') continue;
      const current = counts.get(declaration.coordinate) ?? { total: 0, scenarios: [] };
      current.total += 1;
      current.scenarios.push(lift.source.id);
      counts.set(declaration.coordinate, current);
    }
  }
  return counts;
}

function coordinateBacklog(
  liftCoordinates: readonly CaseLiftCoordinateSummary[],
  lifts: readonly CaseLift[]
): CoverageBacklogCoordinate[] {
  const byCoordinate = new Map(liftCoordinates.map((summary) => [summary.coordinate, summary]));
  const unknowns = declarationUnknowns(lifts);
  return coordinateDefinitions.map((definition) => {
    const summary = byCoordinate.get(definition.id);
    const valuesTouched = Object.keys(summary?.values ?? {}).length;
    const missingValues = definition.values.filter((value) => summary?.values[value] === undefined);
    const assignedSources = summary?.assigned_sources ?? 0;
    const unknownDeclarations = unknowns.get(definition.id)?.total ?? 0;
    const thin =
      assignedSources > 0 &&
      (valuesTouched / definition.values.length < 0.5 ||
        assignedSources <= 2 ||
        unknownDeclarations > 0);
    return {
      coordinate: definition.id,
      block: definition.block,
      kind: definition.kind,
      values_total: definition.values.length,
      values_touched: valuesTouched,
      assigned_sources: assignedSources,
      missing_values: missingValues,
      unknown_declarations: unknownDeclarations,
      status:
        assignedSources === 0
          ? 'absent'
          : thin
            ? 'thin'
            : unknownDeclarations > 0
              ? 'unknown_in_scenario'
              : undefined,
    };
  });
}

function valuesForPair(lift: CaseLift, coordinate: string): readonly string[] {
  const value = lift.assignment[coordinate];
  if (value === undefined) return [];
  return typeof value === 'string' ? [value] : value;
}

function pairSkew(
  lifts: readonly CaseLift[],
  left: string,
  right: string
): CoverageBacklogPairwiseSkew | undefined {
  const leftDefinition = definitionsById.get(left);
  const rightDefinition = definitionsById.get(right);
  if (!leftDefinition || !rightDefinition) return undefined;
  const touched = new Set<string>();
  for (const lift of lifts) {
    for (const leftValue of valuesForPair(lift, left)) {
      for (const rightValue of valuesForPair(lift, right))
        touched.add(`${leftValue} × ${rightValue}`);
    }
  }
  const total = leftDefinition.values.length * rightDefinition.values.length;
  return {
    left,
    right,
    touched_slots: touched.size,
    total_slots: total,
    coverage_ratio: total === 0 ? 0 : Number((touched.size / total).toFixed(4)),
  };
}

function allPairwiseSkews(lifts: readonly CaseLift[]): CoverageBacklogPairwiseSkew[] {
  const pairs: CoverageBacklogPairwiseSkew[] = [];
  for (let i = 0; i < coordinateDefinitions.length; i += 1) {
    for (let j = i + 1; j < coordinateDefinitions.length; j += 1) {
      const skew = pairSkew(lifts, coordinateDefinitions[i]!.id, coordinateDefinitions[j]!.id);
      if (skew) pairs.push(skew);
    }
  }
  return pairs
    .sort(
      (a, b) =>
        a.coverage_ratio - b.coverage_ratio ||
        b.total_slots - a.total_slots ||
        a.left.localeCompare(b.left) ||
        a.right.localeCompare(b.right)
    )
    .slice(0, 30);
}

function priorityFor(coordinate: CoverageBacklogCoordinate): CoverageBacklogPriority {
  if (coordinate.assigned_sources === 0 && PRIORITY_BLOCKS.has(coordinate.block)) return 'critical';
  if (coordinate.assigned_sources === 0 || coordinate.unknown_declarations > 0) return 'high';
  if (coordinate.values_touched / coordinate.values_total < 0.5 || coordinate.assigned_sources <= 2)
    return 'medium';
  return 'low';
}

function needsFor(coordinate: string): readonly CoverageBacklogNeed[] {
  if (
    coordinate.startsWith('funding.') ||
    coordinate.startsWith('chain.') ||
    coordinate.startsWith('cost.')
  ) {
    return ['record', 'evidence', 'case_assignment'];
  }
  if (coordinate.startsWith('worksite.') || coordinate.startsWith('latitude.')) {
    return ['scenario', 'record', 'case_assignment', 'evidence'];
  }
  if (
    coordinate === 'military.status' ||
    coordinate === 'population.affected' ||
    coordinate === 'jurisdiction'
  ) {
    return ['scenario', 'record', 'evidence', 'case_assignment'];
  }
  if (
    coordinate.startsWith('block.') ||
    coordinate.startsWith('visibility.') ||
    coordinate.startsWith('statement.')
  ) {
    return ['mechanism', 'observation', 'evidence', 'case_assignment'];
  }
  return ['scenario', 'case_assignment', 'evidence'];
}

function coordinateTargets(
  coordinates: readonly CoverageBacklogCoordinate[]
): CoverageBacklogTarget[] {
  const targets: CoverageBacklogTarget[] = [];
  for (const coordinate of coordinates) {
    if (!coordinate.status) continue;
    const priority = priorityFor(coordinate);
    targets.push({
      id: `coordinate:${coordinate.coordinate}`,
      kind: 'coordinate',
      priority,
      status: coordinate.status,
      coordinate: coordinate.coordinate,
      reason:
        coordinate.assigned_sources === 0
          ? `${coordinate.coordinate} has no machine-authored assignment in the current lift.`
          : `${coordinate.coordinate} is thin: ${coordinate.values_touched}/${coordinate.values_total} values touched across ${coordinate.assigned_sources} source(s).`,
      needed: needsFor(coordinate.coordinate),
    });
    for (const value of coordinate.missing_values.slice(0, 4)) {
      targets.push({
        id: `value:${coordinate.coordinate}:${value}`,
        kind: 'value',
        priority: priority === 'critical' ? 'high' : priority,
        status: coordinate.status,
        coordinate: coordinate.coordinate,
        value,
        reason: `${coordinate.coordinate}.${value} has no current example.`,
        needed: needsFor(coordinate.coordinate),
      });
    }
  }
  return targets;
}

function scenarioUnknownTargets(lifts: readonly CaseLift[]): CoverageBacklogTarget[] {
  return lifts.flatMap((lift) =>
    lift.declarations
      .filter((declaration) => declaration.status === 'unknown')
      .map((declaration) => ({
        id: `scenario_unknown:${lift.source.id}:${declaration.coordinate}`,
        kind: 'scenario_unknown' as const,
        priority: 'high' as const,
        status: 'unknown_in_scenario' as const,
        coordinate: declaration.coordinate,
        scenario: lift.source.id,
        reason: `${lift.source.id} explicitly marks ${declaration.coordinate} as unknown: ${declaration.basis}`,
        needed: ['case_assignment', 'evidence'] as const,
      }))
  );
}

function strategicPairTargets(lifts: readonly CaseLift[]): CoverageBacklogTarget[] {
  return STRATEGIC_PAIRS.flatMap(([left, right]) => {
    const pair = pairSkew(lifts, left, right);
    if (!pair || pair.coverage_ratio >= 0.15) return [];
    const priority: CoverageBacklogPriority = pair.touched_slots === 0 ? 'critical' : 'high';
    return [
      {
        id: `pairwise:${left}:${right}`,
        kind: 'pairwise' as const,
        priority,
        status: pair.touched_slots === 0 ? ('absent' as const) : ('thin' as const),
        pair,
        reason: `${left} × ${right} has ${pair.touched_slots}/${pair.total_slots} observed authored combinations.`,
        needed: ['scenario', 'case_assignment', 'evidence'] as const,
      },
    ];
  });
}

function targetSort(a: CoverageBacklogTarget, b: CoverageBacklogTarget): number {
  const priorityOrder: Record<CoverageBacklogPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const priorityDelta = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (priorityDelta !== 0) return priorityDelta;
  const aRank = a.coordinate ? (coordinateRank.get(a.coordinate) ?? 999) : 998;
  const bRank = b.coordinate ? (coordinateRank.get(b.coordinate) ?? 999) : 998;
  return aRank - bRank || a.id.localeCompare(b.id);
}

export function buildCoverageBacklog(lift: CaseLiftReport): CoverageBacklogReport {
  const coordinates = coordinateBacklog(lift.coordinates, lift.lifts);
  const pairwiseSkews = allPairwiseSkews(lift.lifts);
  const targets = [
    ...coordinateTargets(coordinates),
    ...scenarioUnknownTargets(lift.lifts),
    ...strategicPairTargets(lift.lifts),
  ]
    .sort(targetSort)
    .slice(0, 80);
  return {
    version: '1.0.0',
    method: {
      unit: 'missing or thin coordinate/value/pair target',
      boundary:
        'Generated from the executable case-space denominator and current case lift; no synthetic prose or inferred cases are authored here.',
      limitation:
        'A target is an acquisition prompt, not a claim that the missing combination exists in the world.',
    },
    summary: {
      coordinates_total: coordinates.length,
      coordinates_absent: coordinates.filter((coordinate) => coordinate.status === 'absent').length,
      coordinates_thin: coordinates.filter((coordinate) => coordinate.status === 'thin').length,
      values_missing: coordinates.reduce(
        (sum, coordinate) => sum + coordinate.missing_values.length,
        0
      ),
      scenario_unknowns: lift.summary.declared_unknown,
      pairwise_targets: targets.filter((target) => target.kind === 'pairwise').length,
      critical_targets: targets.filter((target) => target.priority === 'critical').length,
      high_targets: targets.filter((target) => target.priority === 'high').length,
      medium_targets: targets.filter((target) => target.priority === 'medium').length,
    },
    coordinates,
    priority_targets: targets,
    pairwise_skews: pairwiseSkews,
  };
}
