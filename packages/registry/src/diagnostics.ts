import { HOBAKnowledgeGraph } from './graph.js';
import {
  ArtifactNode,
  BarrierNode,
  DiagnosticInput,
  DiagnosticProbe,
  DiagnosticResult,
  EvidenceLevel,
  MechanismNode,
  PatternNode,
  LoopNode,
  RegistryBundle,
  RemovabilityType,
  StageId,
} from './types.js';

export class HOBADiagnosticEngine {
  private bundle: RegistryBundle;
  private graph: HOBAKnowledgeGraph;

  constructor(bundle: RegistryBundle, graph?: HOBAKnowledgeGraph) {
    this.bundle = bundle;
    this.graph = graph || new HOBAKnowledgeGraph(bundle);
  }

  public analyze(input: DiagnosticInput): DiagnosticResult {
    // 1. Step H: Hard Facts
    const selectedArtifacts: ArtifactNode[] = input.artifacts
      .map((id) => this.bundle.artifacts.find((a) => a.id === id))
      .filter((a): a is ArtifactNode => Boolean(a));

    const selectedStage: StageId | undefined = input.stage;

    // 2. Step O: Obstacle (Barrier Localization)
    const barrierSet = new Set<string>();

    if (selectedStage) {
      const stageBarriers = this.bundle.barriers.filter((b) => b.stage === selectedStage);
      for (const b of stageBarriers) barrierSet.add(b.id);
    } else {
      // Infer potential stages from artifacts
      const inferredStages = new Set<StageId>();
      for (const a of selectedArtifacts) {
        for (const s of a.stages) inferredStages.add(s);
      }
      const matchingBarriers = this.bundle.barriers.filter((b) => inferredStages.has(b.stage));
      for (const b of matchingBarriers) barrierSet.add(b.id);
    }

    const identifiedBarriers = this.bundle.barriers.filter((b) => barrierSet.has(b.id));

    // 3. Step B: Behind the Obstacle (Compatible Mechanisms)
    // Find mechanisms that operate at identified barriers OR emit selected artifacts
    const compatibleMechMap = new Map<
      string,
      {
        mechanism: MechanismNode;
        evidence_level: EvidenceLevel;
        honest_baseline: boolean;
        emitted_by_evidence: boolean;
        removability: RemovabilityType;
        amplified_by: string[];
        masks: string[];
      }
    >();

    const selectedArtifactIds = new Set(selectedArtifacts.map((a) => a.id));

    for (const m of this.bundle.mechanisms) {
      const operatesAtIdentifiedBarrier = m.operates_at.some((bid) => barrierSet.has(bid));
      const directlyEmitsArtifact = m.emissions.some((e) => selectedArtifactIds.has(e.artifact));

      if (operatesAtIdentifiedBarrier || directlyEmitsArtifact) {
        compatibleMechMap.set(m.id, {
          mechanism: m,
          evidence_level: m.evidence_level,
          honest_baseline: Boolean(m.honest_baseline),
          emitted_by_evidence: directlyEmitsArtifact,
          removability: m.facets.removability,
          amplified_by: this.graph.reverseAdjacency
            .get(m.id)
            ?.filter((edge) => edge.edge.type === 'amplifies')
            .map((edge) => edge.source) || [],
          masks: m.masks,
        });
      }
    }

    const compatibleMechanisms = Array.from(compatibleMechMap.values());

    // Related Patterns
    const relatedPatterns = this.bundle.patterns.filter((p) => {
      const matchesArtifact = p.required_artifacts.some((aid) => selectedArtifactIds.has(aid));
      const matchesMechanism = p.compatible_mechanisms.some((mid) => compatibleMechMap.has(mid));
      return matchesArtifact || matchesMechanism;
    });

    // Related Loops
    const relatedLoops = this.bundle.loops.filter((l) => {
      return l.mechanisms.some((mid) => compatibleMechMap.has(mid));
    });

    // Collect Non-inferences
    const nonInferenceSet = new Set<string>();
    for (const a of selectedArtifacts) {
      for (const ni of a.non_inferences) nonInferenceSet.add(ni);
    }
    for (const { mechanism } of compatibleMechanisms) {
      for (const ni of mechanism.non_inferences) nonInferenceSet.add(ni);
    }
    for (const p of relatedPatterns) {
      for (const ni of p.non_inferences) nonInferenceSet.add(ni);
    }

    // 4. Step A: Agency Partitioning & Probes
    const candidateRemovable: MechanismNode[] = [];
    const intermediaryDependent: MechanismNode[] = [];
    const exogenousNoAgency: MechanismNode[] = [];

    for (const { mechanism } of compatibleMechanisms) {
      if (mechanism.facets.removability === 'candidate') {
        candidateRemovable.push(mechanism);
      } else if (mechanism.facets.removability === 'intermediary') {
        intermediaryDependent.push(mechanism);
      } else {
        exogenousNoAgency.push(mechanism);
      }
    }

    // Collect Diagnostic Probes
    const probeMap = new Map<string, DiagnosticProbe>();
    for (const a of selectedArtifacts) {
      if (a.probes) {
        for (const p of a.probes) probeMap.set(p.id, p);
      }
    }

    const diagnosticProbes = Array.from(probeMap.values());

    // Agency Zone & Verdict
    let agencyZone: 'endogenous' | 'exogenous' | 'mixed' = 'mixed';
    if (candidateRemovable.length > 0 && exogenousNoAgency.length === 0 && intermediaryDependent.length === 0) {
      agencyZone = 'endogenous';
    } else if (candidateRemovable.length === 0 && (exogenousNoAgency.length > 0 || intermediaryDependent.length > 0)) {
      agencyZone = 'exogenous';
    }

    let verdict: 'diagnostic' | 'low_signal_ambiguity' = 'diagnostic';
    let probesSummary = '';

    if (selectedArtifacts.length === 0) {
      verdict = 'low_signal_ambiguity';
      probesSummary = 'No direct observations provided. Cannot establish compatible mechanisms without factual anchors.';
    } else if (candidateRemovable.length === 0 && diagnosticProbes.length === 0) {
      verdict = 'low_signal_ambiguity';
      probesSummary =
        'Low signal. No additional candidate action is justified by the available evidence. The compatible mechanisms are purely exogenous or intermediary-controlled.';
    } else {
      probesSummary = `${diagnosticProbes.length} bounded diagnostic probe(s) identified across ${candidateRemovable.length} candidate-removable mechanism(s).`;
    }

    return {
      input,
      mode: 'topological_uncalibrated',
      verdict,
      summary:
        verdict === 'low_signal_ambiguity'
          ? 'Low signal / high ambiguity. System indicates minimal candidate agency.'
          : `Decomposed into ${identifiedBarriers.length} barrier stage(s), ${compatibleMechanisms.length} compatible mechanism(s), and ${diagnosticProbes.length} diagnostic probe(s).`,
      hard_facts: {
        selected_artifacts: selectedArtifacts,
        stage: selectedStage,
        notes: input.notes,
      },
      obstacle: {
        identified_barriers: identifiedBarriers,
        primary_stage: selectedStage || (identifiedBarriers[0]?.stage),
      },
      behind: {
        compatible_mechanisms: compatibleMechanisms,
        related_patterns: relatedPatterns,
        related_loops: relatedLoops,
        non_inferences: Array.from(nonInferenceSet),
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
        compatible_mechanisms: compatibleMechanisms.length,
        candidate_removable: candidateRemovable.length,
        intermediary: intermediaryDependent.length,
        no_agency: exogenousNoAgency.length,
        patterns: relatedPatterns.length,
        loops: relatedLoops.length,
        probes: diagnosticProbes.length,
      },
      epistemic_disclaimer:
        'Topological / Uncalibrated Analysis: Compatible mechanisms reflect logical compatibility with observed facts and structural gates, not probabilistic certainty. An observation is not a cause; a rejection message is not necessarily a reason.',
    };
  }
}
