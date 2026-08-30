---
id: "obs.rejection_after_the_application_sat_pending_for_months"
type: "observation"
aliases:
  - "A-015"
title: "Rejection after the application sat pending for months"
summary: "A rejection arrives six weeks or more after submission, with no contact in the interval and no stage ever entered."
stages:
  - "ingestion"
  - "screening"
perspectives:
  -
    actor: "actor.candidate"
    sees: "A submission in one month and a rejection in another, with nothing between them: no acknowledgement beyond the automatic one, no question, no stage."
    reads: "The interval bounds nothing on its own. A long wait is equally consistent with a queue that never reached the record and with a threshold that closed it on a date."
    does: "Checks whether the posting stayed live through the interval and whether the portal shows a status that changed before the message arrived, because those are the two things the interval can be compared against."
  -
    actor: "actor.recruiter"
    sees: "A requisition that has been closed for weeks and a disposition list that still has to be cleared before the quarter's reporting."
    reads: "Records that never entered the queue are not decisions deferred; they are decisions the queue never had capacity to reach."
    does: "Clears the outstanding dispositions in one operation, because the alternative is leaving them open against a requisition that no longer exists."
  -
    actor: "actor.ats_vendor"
    sees: "A retention rule firing against every record still in a pending state past the configured interval, and one notification queued per record."
    reads: "The configuration ran on schedule. Whether any of those records was ever opened is not a condition the rule tests."
    does: "Transitions the records, queues the notifications, and reports the cleared backlog as pipeline hygiene."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "evidence.mean_vacancy_duration_information_sector_dhi_dfh"
probes:
  -
    id: "PROBE-A-015-1"
    action: "Compare the date the posting came down with the date the rejection arrived, using the portal's own listing history or a saved copy of the posting."
    expected_signal: "Establishes whether the message followed the close of the search or an interval counted from submission."
    cost: "low"
    outcomes:
      -
        id: "message-follows-posting-close"
        label: "The posting came down first, and the message followed within days of it."
        excludes: []
      -
        id: "message-on-a-round-interval"
        label: "The message arrived a round number of days after submission — thirty, forty-five, sixty — and the posting's state did not change around it."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "A rejection arriving on a round calendar interval (e.g. 30/60 days) demonstrates an automated ATS queue expiry rule (mech.employment_gap_downranking_bias) rather than an active reviewer decision."
      -
        id: "posting-still-live"
        label: "The posting was still accepting applications when the rejection arrived."
        excludes:
          - "mech.genuine_technical_skill_shortfall"
        because: "A rejection arriving while the role remains active and seeking candidates indicates an automated knockout filter or ghost listing (mech.stale_or_orphaned_job_requisition/mech.automated_keyword_qualification_filter)."
      -
        id: "history-unavailable"
        label: "The posting's history cannot be recovered and no copy was kept."
        excludes: []
specimens:
  -
    kind: "ats"
    label: "Application timeline"
    lines:
      -
        at: "02 Mar"
        text: "Application submitted"
      -
        at: "02 Mar"
        text: "Status: Under review"
      -
        at: "01 May"
        text: "Status: Not selected"
        tell: true
      -
        at: "01 May"
        text: "Notification email queued"
    reading: "Sixty days between the two status lines, and nothing recorded in between. The record's history shows one transition, not a review."
  -
    kind: "email"
    label: "Rejection email"
    subject: "Update on your application"
    context: "received sixty days after submission"
    lines:
      -
        text: "Thank you for your interest. We have decided not to move forward with your application at this time."
      -
        text: "We encourage you to apply for future openings that match your background."
      -
        text: "No stage is named, and none was entered."
        tell: true
    reading: "The message is written to close a record, not to report a decision about one. Nothing in it distinguishes the sixtieth day from the first."
non_inferences:
  - "Does not mean the application was read at any point during the interval."
  - "Does not mean a decision on the merits was taken at the end of it."
---

# Rejection after the application sat pending for months

A rejection arrives six weeks or more after submission, with no contact in the interval and no stage ever entered.

### Diagnostic Non-Inferences
- Does not mean the application was read at any point during the interval.
- Does not mean a decision on the merits was taken at the end of it.
