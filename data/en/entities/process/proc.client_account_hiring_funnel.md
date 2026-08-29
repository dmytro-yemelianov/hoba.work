---
id: "proc.client_account_hiring_funnel"
type: "process"
aliases:
  - "WF-004"
title: "Client account hiring funnel"
summary: "From client demand and commercial contract to profile submission, client interview, and placement or unannounced closure."
subject: "a seat funded by a client contract and the candidate moving towards it"
states:
  -
    id: "demand"
    title: "Client demand & contract scope"
    kind: "initial"
    owner: "actor.client"
    description: "The end client identifies project headcount demand or issues a vendor tender. Budget exists if the contract is signed or is contingent on winning the bid."
    entities: []
    visible_to_candidate: "Nothing. The search is not visible publicly."
  -
    id: "search-open"
    title: "Vendor search opened"
    kind: "active"
    owner: "actor.recruiter"
    description: "Vendor recruiting opens direct outreach or listings. Whether an executed contract or an unawarded bid sits behind it is not disclosed."
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
      - "mech.speculative_sourcing_talent_pooling_without_opening"
    visible_to_candidate: "Outreach messages or job postings without commercial contract context."
  -
    id: "vendor-screen"
    title: "Vendor recruiter screen"
    kind: "active"
    owner: "actor.recruiter"
    description: "Introductory conversation assessing experience and target compensation against the vendor target margin."
    entities:
      - "bar.recruiter_screening_call"
      - "mech.unstated_compensation_band_discrepancy"
    visible_to_candidate: "A screening call where the rate band is presented as the vendor internal range."
  -
    id: "vendor-technical"
    title: "Vendor technical evaluation"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Technical interview or test task scored against the vendor assessment of the client technical threshold."
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
    visible_to_candidate: "A technical evaluation round with vendor engineering staff."
  -
    id: "submitted"
    title: "Submitted to client"
    kind: "active"
    owner: "actor.client"
    description: "The candidate CV is submitted to the client account team for profile review and interview selection."
    entities:
      - "bar.client_profile_approval_and_client_interview"
      - "obs.complete_silence_after_submission"
      - "obs.rejection_after_the_application_sat_pending_for_months"
    visible_to_candidate: "An extended waiting interval while the client reviews candidate batches."
  -
    id: "client-interview"
    title: "Client interview round"
    kind: "active"
    owner: "actor.client"
    description: "Interview conducted directly by client engineering or project management leadership."
    entities:
      - "bar.client_profile_approval_and_client_interview"
      - "obs.generic_closer_alignment_rejection_template"
    visible_to_candidate: "An external interview round evaluating project and culture fit."
  -
    id: "offer"
    title: "Offer formulation"
    kind: "active"
    owner: "actor.recruiter"
    description: "Compensation package calculated from client billing rate minus required gross margin."
    entities:
      - "bar.compensation_levelling_reconciliation"
    visible_to_candidate: "An offer package structured around vendor compensation models."
  -
    id: "verification"
    title: "Pre-placement verification"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Client-mandated background checks, certifications, and compliance paperwork."
    entities:
      - "bar.reference_background_verification"
    visible_to_candidate: "Document requests and compliance background screening."
  -
    id: "placed"
    title: "Contract signed & project start"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Contract executed and candidate onboarded onto active client delivery."
    entities:
      - "bar.offer_closing_contract_execution"
    visible_to_candidate: "Confirmed start date and client team onboarding."
  -
    id: "vendor-declined"
    title: "Vendor-level rejection"
    kind: "terminal"
    owner: "actor.recruiter"
    description: "The search terminates at vendor screening or technical evaluation before client submission."
    entities:
      - "obs.generic_closer_alignment_rejection_template"
    visible_to_candidate: "Standard rejection message from the vendor recruitment team."
  -
    id: "declined-by-client"
    title: "Declined by client"
    kind: "terminal"
    owner: "actor.client"
    description: "The client declines the CV submission or rejects the candidate after the client interview."
    entities:
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.rejection_naming_an_internal_hire_as_the_outcome"
    visible_to_candidate: "A generic rejection relayed by the vendor without client feedback details."
  -
    id: "closed-unfunded"
    title: "Search closed unfunded / tender lost"
    kind: "terminal"
    owner: "actor.client"
    description: "The search closes because the client tender was lost, project budget was cancelled, or the commercial contract was paused."
    entities:
      - "obs.complete_silence_after_submission"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
      - "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
    visible_to_candidate: "Unannounced silence or a notification that project requirements changed."
  -
    id: "bench-filled"
    title: "Requisition filled from internal bench"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "The position is allocated to an existing internal specialist released from another account, closing the external process."
    entities:
      - "obs.position_closed_after_final_interview_without_hire"
      - "obs.rejection_naming_an_internal_hire_as_the_outcome"
    visible_to_candidate: "A sudden search closure notification after advancing through interview rounds."
transitions:
  -
    from: "demand"
    to: "search-open"
    owner: "actor.client"
    label: "Contract signed or tender profiles required"
    guard: "Commercial contract signed or tender requires candidate CVs"
    latency_expected_days: 3
    latency_max_days: 10
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
  -
    from: "search-open"
    to: "vendor-screen"
    owner: "actor.recruiter"
    label: "Candidate responds to vendor outreach"
    guard: "Outreach accepted and screen booked"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
  -
    from: "search-open"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Tender lost or client contract cancelled early"
    guard: "Commercial opportunity discontinued before screening"
    latency_expected_days: 7
    latency_max_days: 30
    entities: []
  -
    from: "vendor-screen"
    to: "vendor-technical"
    owner: "actor.recruiter"
    label: "Vendor recruiter screen passed"
    guard: "Expectations aligned with client billing margin"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.recruiter_screening_call"
  -
    from: "vendor-screen"
    to: "vendor-declined"
    owner: "actor.recruiter"
    label: "Screening mismatch or rate misalignment"
    guard: "Candidate rate exceeds allowable vendor margin or skills misfit"
    latency_expected_days: 2
    latency_max_days: 5
    entities: []
  -
    from: "vendor-technical"
    to: "submitted"
    owner: "actor.hiring_manager"
    label: "Vendor assessment passed"
    guard: "Technical bar meets vendor expectation of client threshold"
    latency_expected_days: 4
    latency_max_days: 10
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
  -
    from: "vendor-technical"
    to: "vendor-declined"
    owner: "actor.hiring_manager"
    label: "Vendor assessment not met"
    guard: "Profile does not meet vendor internal quality bar"
    latency_expected_days: 3
    latency_max_days: 7
    entities: []
  -
    from: "submitted"
    to: "client-interview"
    owner: "actor.client"
    label: "Client approves CV submission"
    guard: "Client manager accepts profile and requests interview"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "submitted"
    to: "declined-by-client"
    owner: "actor.client"
    label: "Client rejects CV submission"
    guard: "Client manager rejects profile on CV review"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "submitted"
    to: "bench-filled"
    owner: "actor.employer_policy"
    label: "Vendor assigns internal bench specialist"
    guard: "Bench consultant becomes available mid-search"
    latency_expected_days: 3
    latency_max_days: 10
    entities: []
  -
    from: "submitted"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Client cancels requisition or loses project funding"
    guard: "Client withdraws demand during profile review"
    latency_expected_days: 7
    latency_max_days: 30
    entities: []
  -
    from: "client-interview"
    to: "offer"
    owner: "actor.client"
    label: "Client approves interview"
    guard: "Client confirms candidate meets project requirements"
    latency_expected_days: 4
    latency_max_days: 10
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "client-interview"
    to: "declined-by-client"
    owner: "actor.client"
    label: "Client declines after interview"
    guard: "Client decides against candidate after meeting"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "offer"
    to: "verification"
    owner: "actor.recruiter"
    label: "Offer agreed and contract drafted"
    guard: "Candidate accepts offer parameters"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.compensation_levelling_reconciliation"
  -
    from: "offer"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Client pulls project before signing"
    guard: "Client cancels funding after offer extended"
    latency_expected_days: 4
    latency_max_days: 14
    entities: []
  -
    from: "verification"
    to: "placed"
    owner: "actor.employer_policy"
    label: "Background check passed and start date confirmed"
    guard: "Verification complete and project onboarding commences"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.reference_background_verification"
      - "bar.offer_closing_contract_execution"
      - "bar.probation_period_post_start_confirmation"
specimens: []
status: "active"
evidence_level: "strongly_supported"
evidence_ids: []
---

# Client account hiring funnel

From client demand and commercial contract to profile submission, client interview, and placement or unannounced closure.
