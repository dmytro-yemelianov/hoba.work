import { HOBAKnowledgeGraph } from './graph.js';
import { narrow, separation } from './separation.js';
import type {
  AgencyZone,
  ObservationNode,
  CompatibleMechanism,
  DiagnosticInput,
  DiagnosticProbe,
  DiagnosticResult,
  MechanismNode,
  RegistryBundle,
  StageId,
} from '@hoba/registry-core/types';

export const EPISTEMIC_DISCLAIMER =
  'Topological / Uncalibrated Analysis: Compatible mechanisms reflect logical compatibility with observed facts and structural gates, not probabilistic certainty. An observation is not a cause; a rejection message is not necessarily a reason.';

/**
 * The hoba protocol (H → O → B → A) over a loaded registry.
 *
 * The engine is pure and browser-safe; it is the single implementation shared by
 * the CLI, the MCP server and the site's analysis wizard.
 */
export class HOBADiagnosticEngine {
  private readonly bundle: RegistryBundle;
  private readonly graph: HOBAKnowledgeGraph;

  constructor(bundle: RegistryBundle, graph?: HOBAKnowledgeGraph) {
    this.bundle = bundle;
    this.graph = graph ?? new HOBAKnowledgeGraph(bundle);
  }

  public analyze(input: DiagnosticInput): DiagnosticResult {
    // 1. Step H: Hard Facts — resolve the observed artifacts (deprecated nodes are excluded from analysis).
    const selectedArtifacts: ObservationNode[] = [];
    const unknownArtifactIds: string[] = [];
    for (const id of input.artifacts) {
      const node = this.graph.getNode(id);
      if (node?.type === 'observation' && node.status === 'active') selectedArtifacts.push(node);
      else unknownArtifactIds.push(id);
    }
    const selectedArtifactIds = new Set(selectedArtifacts.map((a) => a.id));
    const selectedStage: StageId | undefined = input.stage;

    // 2. Step O: Obstacle — localize barriers by explicit stage, else by the stages the artifacts appear at.
    const stagesInScope = new Set<StageId>();
    if (selectedStage) {
      stagesInScope.add(selectedStage);
    } else {
      for (const a of selectedArtifacts) for (const s of a.stages) stagesInScope.add(s);
    }
    const identifiedBarriers = this.bundle.barriers.filter(
      (b) => b.status === 'active' && stagesInScope.has(b.stage)
    );
    const barrierSet = new Set(identifiedBarriers.map((b) => b.id));

    // 3. Step B: Behind the Obstacle — mechanisms that operate at an identified barrier OR emit a selected artifact.
    const compatibleMechanisms: CompatibleMechanism[] = [];
    for (const m of this.bundle.mechanisms) {
      if (m.status !== 'active') continue;
      const operatesAtIdentifiedBarrier = m.operates_at.some((bid) => barrierSet.has(bid));
      const emitsSelectedArtifact = m.emissions.some((e) => selectedArtifactIds.has(e.artifact));
      if (!operatesAtIdentifiedBarrier && !emitsSelectedArtifact) continue;

      // Attribution, never exclusion. Where an emission records the stages its
      // trace is seen at and the reader named a stage, an emission placed
      // elsewhere stops counting as a direct account of what was observed —
      // but the mechanism stays compatible, because a stage the atlas cannot
      // place is not the same as a stage it rules out.
      const directlyEmitsArtifact = m.emissions.some(
        (e) =>
          selectedArtifactIds.has(e.artifact) &&
          (!selectedStage || e.observed_at.length === 0 || e.observed_at.includes(selectedStage))
      );

      // Emits every one of them, not merely one. Same stage rule as above, so a
      // mechanism is not dropped over a trace the atlas has not placed.
      const accountsForAll =
        selectedArtifactIds.size > 0 &&
        [...selectedArtifactIds].every((id) =>
          m.emissions.some(
            (e) =>
              e.artifact === id &&
              (!selectedStage ||
                e.observed_at.length === 0 ||
                e.observed_at.includes(selectedStage))
          )
        );

      compatibleMechanisms.push({
        mechanism: m,
        evidence_level: m.evidence_level,
        honest_baseline: m.honest_baseline,
        emitted_by_evidence: directlyEmitsArtifact,
        accounts_for_all: accountsForAll,
        removability: m.facets.removability,
        amplified_by: (this.graph.reverseAdjacency.get(m.id) ?? [])
          .filter((item) => item.edge.type === 'amplifies')
          .map((item) => item.source),
        masks: m.masks,
      });
    }
    const compatibleIds = new Set(compatibleMechanisms.map((c) => c.mechanism.id));

    const relatedPatterns = this.bundle.patterns.filter(
      (p) =>
        p.status === 'active' &&
        (p.required_artifacts.some((aid) => selectedArtifactIds.has(aid)) ||
          p.compatible_mechanisms.some((mid) => compatibleIds.has(mid)))
    );

    const relatedLoops = this.bundle.loops.filter(
      (l) => l.status === 'active' && l.mechanisms.some((mid) => compatibleIds.has(mid))
    );

    const nonInferenceSet = new Set<string>();
    for (const a of selectedArtifacts) for (const ni of a.non_inferences) nonInferenceSet.add(ni);
    for (const { mechanism } of compatibleMechanisms)
      for (const ni of mechanism.non_inferences) nonInferenceSet.add(ni);
    for (const p of relatedPatterns) for (const ni of p.non_inferences) nonInferenceSet.add(ni);

    // 4. Probes are attached to observations; de-duplicate by probe ID (IDs are
    // validated to be unique).
    const probeMap = new Map<string, DiagnosticProbe>();
    for (const a of selectedArtifacts) for (const p of a.probes) probeMap.set(p.id, p);
    const diagnosticProbes = Array.from(probeMap.values());

    // 5. Narrowing. A probe result can only remove a mechanism, and only where
    // the outcome is logically incompatible with it — so the reported set is
    // still "what is compatible", never "what happened". Everything downstream
    // reads the narrowed set, or the agency partition would keep offering
    // actions against causes the reader has already ruled out.
    const compatibleBeforeProbes = compatibleMechanisms.map((c) => c.mechanism.id);
    const narrowing = narrow(compatibleBeforeProbes, diagnosticProbes, input.probe_results ?? []);
    const survives = new Set(narrowing.remaining);
    const narrowed = compatibleMechanisms.filter((c) => survives.has(c.mechanism.id));
    const separationReport = separation(narrowing.remaining, diagnosticProbes);

    // 6. Step A: agency partitioning over what is left.
    const candidateRemovable: MechanismNode[] = [];
    const intermediaryDependent: MechanismNode[] = [];
    const exogenousNoAgency: MechanismNode[] = [];
    for (const { mechanism } of narrowed) {
      switch (mechanism.facets.removability) {
        case 'candidate':
          candidateRemovable.push(mechanism);
          break;
        case 'intermediary':
          intermediaryDependent.push(mechanism);
          break;
        default:
          exogenousNoAgency.push(mechanism);
      }
    }

    const agencyZone = classifyAgencyZone(
      candidateRemovable.length,
      intermediaryDependent.length,
      exogenousNoAgency.length
    );

    /**
     * A verdict of `diagnostic` claims the observation narrowed the field. When
     * most of the registry is still compatible it narrowed nothing, and saying
     * so anyway is the false certainty this protocol exists to avoid: the
     * generic rejection template alone leaves 27 of 28 mechanisms open.
     *
     * The line is half — more than half the active mechanisms still standing
     * means the observation has not told you which half.
     */
    const activeMechanisms = this.bundle.mechanisms.filter((m) => m.status === 'active').length;
    const narrowedNothing = activeMechanisms > 0 && narrowed.length * 2 > activeMechanisms;

    let verdict: DiagnosticResult['verdict'] = 'diagnostic';
    /** Which low-signal reason fired, so the summary can say the true one. */
    let lowSignalReason: 'no-anchors' | 'no-agency' | 'no-narrowing' | null = null;
    let probesSummary: string;
    if (selectedArtifacts.length === 0) {
      verdict = 'low_signal_ambiguity';
      lowSignalReason = 'no-anchors';
      probesSummary =
        'No direct observations provided. Cannot establish compatible mechanisms without factual anchors.';
    } else if (narrowedNothing) {
      verdict = 'low_signal_ambiguity';
      lowSignalReason = 'no-narrowing';
      probesSummary = `${narrowed.length} of ${activeMechanisms} mechanism(s) remain compatible, so the observation(s) given do not narrow the field. A second, different observation is what separates them.`;
    } else if (candidateRemovable.length === 0 && diagnosticProbes.length === 0) {
      verdict = 'low_signal_ambiguity';
      lowSignalReason = 'no-agency';
      probesSummary =
        'Low signal. No additional candidate action is justified by the available evidence. The compatible mechanisms are purely exogenous or intermediary-controlled.';
    } else {
      probesSummary = `${diagnosticProbes.length} bounded diagnostic probe(s) attached to the selected observation(s); ${candidateRemovable.length} candidate-removable mechanism(s) in scope.`;
    }

    return {
      input,
      mode: 'topological_uncalibrated',
      verdict,
      summary:
        lowSignalReason === 'no-narrowing'
          ? `Low signal / high ambiguity. The observation(s) given do not narrow the field: ${narrowed.length} of ${activeMechanisms} mechanisms remain compatible.`
          : verdict === 'low_signal_ambiguity'
            ? 'Low signal / high ambiguity. System indicates minimal candidate agency.'
            : `Decomposed into ${identifiedBarriers.length} barrier gate(s), ${compatibleMechanisms.length} compatible mechanism(s), and ${diagnosticProbes.length} diagnostic probe(s).`,
      hard_facts: {
        selected_artifacts: selectedArtifacts,
        unknown_artifact_ids: unknownArtifactIds,
        stage: selectedStage,
        notes: input.notes,
      },
      obstacle: {
        identified_barriers: identifiedBarriers,
        primary_stage: selectedStage ?? identifiedBarriers[0]?.stage,
      },
      behind: {
        compatible_mechanisms: narrowed,
        related_patterns: relatedPatterns,
        related_loops: relatedLoops,
        non_inferences: Array.from(nonInferenceSet),
        compatible_before_probes: compatibleBeforeProbes,
        narrowing,
        separation: separationReport,
      },
      agency: {
        candidate_removable: candidateRemovable,
        intermediary_dependent: intermediaryDependent,
        exogenous_no_agency: exogenousNoAgency,
        diagnostic_probes: diagnosticProbes,
        probes_summary: probesSummary,
        agency_zone: agencyZone,
      },
      counts: {
        compatible_mechanisms: narrowed.length,
        accounts_for_all: narrowed.filter((c) => c.accounts_for_all).length,
        candidate_removable: candidateRemovable.length,
        intermediary: intermediaryDependent.length,
        no_agency: exogenousNoAgency.length,
        patterns: relatedPatterns.length,
        loops: relatedLoops.length,
        probes: diagnosticProbes.length,
      },
      epistemic_disclaimer: EPISTEMIC_DISCLAIMER,
    };
  }
}

export function classifyAgencyZone(
  candidate: number,
  intermediary: number,
  exogenous: number
): AgencyZone {
  if (candidate + intermediary + exogenous === 0) return 'undetermined';
  if (candidate > 0 && intermediary === 0 && exogenous === 0) return 'endogenous';
  if (candidate === 0) return 'exogenous';
  return 'mixed';
}
