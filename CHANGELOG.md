# Changelog

All notable changes to the **hoba** platform (Hiring Obstacles & Barriers Atlas) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for packages and [Calendar Versioning](https://calver.org/) for registry content releases.

---

## [0.5.0] - 2026-08-28 (Registry 2026.08.3, Schema 1.2.0)

### Added
- **Substrate Graph Engine**: Unified four-primitive substrate model (`Record`, `EventClass`, `Condition`, `Flow`) supporting monotonic derivations, epistemic visibility gates, and bidirectional lifting/projection with 100% equivalence.
- **Formal Verification in Lean 4 Kernel**: Formalized state machines, topological ranking, cycle detection, path depth bounds ($\le 12$ on `WF-003`), and non-divergent resource flow conservation proved in kernel (`Hoba.Machine`, `Hoba.Theorems`).
- **Temporal Latency Bounds & Dwell Anomaly Engine**: Added empirical turnaround limits (`latency_expected_days`, `latency_max_days`) across all canonical workflows (`WF-001`, `WF-002`, `WF-003`, `WF-004`). Implemented `substrateDetectTemporalAnomalies` to identify stalled states and map them to hidden mechanisms (`M-006`, `M-020`, `M-025`, `M-009`, `M-007`, `M-027`).
- **Candidate Runway & Solvency Calculus**: Implemented `substrateCalculateRunway` computing liquid search horizons and classifying vulnerability risk profiles under down-levelling pressures (`M-017`, `P-004`).
- **Algebraic Pattern Emptiness Evaluation**: Formally proved that all 4 patterns (`P-001`..`P-004`) evaluate to `computed_empty` unsatisfiable contradictions under discrete rank, qualification invariance, tech timeline, and mutual information constraints.
- **New CLI Subcommands**:
  - `hoba latency <wf> <state> <days>`: diagnose dwell anomalies.
  - `hoba runway <savings> <monthly_burn>`: calculate runway and vulnerability.
  - `hoba patterns`: display algebraic status and contradiction proofs.
  - `hoba conservation`: audit flow conservation across financial records.
- **New MCP Agent Tools**: `detect_temporal_anomalies`, `calculate_runway`, `verify_flow_conservation`, `evaluate_pattern_emptiness`.
- **Interactive Web Calculators**: Added stage dwell anomaly diagnoser and runway solvency calculator on `/check`, and published pattern emptiness and latency matrix on `/data`.
- **Statutory & Primary Evidence Expansion**: Added `EVD-042`..`EVD-045` grounding interventions `I-008`, `I-014`, `I-015`, `I-017` in 5 U.S.C. § 2301, 29 C.F.R. § 1607.4, EU AI Act Annex III, Restatement of Employment Law § 2.02, and GDPR Art. 5(1)(e).

---

## [0.4.1] - 2026-08-26 (Registry 2026.08.2, Schema 1.1.0)
- Client account expansion: added `client` actor, `B-015`, `WF-004` (vendor sub-contracting flow), `M-025`, `M-026`.
- Epilogue expansion: added `B-016`, `M-027`, `M-028`, `A-020`, `EVD-040`, `EVD-041`.
