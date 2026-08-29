---
id: "actor.candidate"
type: "actor"
slug: "candidate"
title: "Кандидат"
summary: "Людина, яка подається. Єдина сторона у воронці, яка бачить увесь свій процес — і майже нічого з чужого."
controls:
  - "Що подано і в якій машиночитній формі"
  - "У які процеси заходити і коли виходити"
  - "Які питання ставити й коли саме"
  - "Що зафіксовано: дати, формулювання, хто це сказав"
blind_to:
  - "Чи вакансія профінансована, заморожена чи вже обіцяна всередині"
  - "Вилку, рівень і шкалу, за якою оцінюють"
  - "Скільки ще людей у пайплайні й звідки вони"
  - "Чи відмову написала людина, чи її видало правило"
incentives:
  - "Дійти до рішення досить швидко, щоб не втратити інші варіанти"
  - "Не витрачати неоплачувані години на процеси, яких насправді не існувало"
  - "Зберегти можливість податися знову, не спаливши стосунки"
aliases:
  facet:
    - "candidate"
  intervention:
    - "candidate-action"
specimens:
  -
    kind: "note"
    label: "Що кандидат бачить і чого не бачить"
    lines:
      -
        text: "Видно: кожне отримане повідомлення, кожну дату, кожну названу причину, кожну витрачену годину."
      -
        text: "Не видно: статус вакансії, затверджену вилку, шкалу оцінки, глибину черги й те, чи хтось узагалі це читав."
        tell: true
      -
        text: "Більшість болю від процесу найму — це спроба вивести другий список із першого."
    reading: "Саме ця асиметрія і є причиною існування реєстру. Він її не усуває — він робить межу між двома списками явною."
recommendations:
  -
    id: "check-parser-output-before-submitting"
    title: "Перевіряйте, що витягнув парсер, перед поданням"
    rationale: "Форма файлу — на боці кандидата; рішення, яке ухвалює читач після неї, — ні. Розкладка, яку людина читає без зусиль, може лягти в запис як нуль позицій досвіду, і бал, що з цього випливає, — це арифметика над тим, що вдалося витягти. Прогін файлу через парсер заздалегідь перетворює невидимий збій на правку в документі."
    cost: "low"
    costs: "Експорт в одну колонку звичайним текстом віддає верстку, а кожну наступну правку документа доводиться перевіряти знову."
    targets:
      - "mech.ats_parser_extraction_failure"
      - "bar.application_ingestion"
      - "bar.automated_filter_parser_threshold"
      - "obs.rejection_within_minutes_of_application_submission"
    interventions:
      - "int.candidate_ats_parser_conformance_test_utility"
  -
    id: "ask-what-the-conversation-is-attached-to"
    title: "Питайте, до чого привʼязана ця розмова"
    rationale: "Чи стоїть за зверненням затверджена вакансія і чи вже йде внутрішня кандидатура — цього немає в жодному полі, яке кандидат бачить. Запитати на першому обміні — єдиний шлях до обох відповідей, і вони приходять раніше за неоплачувані години."
    cost: "low"
    costs: "Логістичне питання в першій відповіді випереджає розмову про саму роботу, а відповідь нема з чим звірити."
    targets:
      - "mech.speculative_sourcing_talent_pooling_without_opening"
      - "mech.pre_selected_internal_candidate"
      - "mech.stale_or_orphaned_job_requisition"
      - "bar.outbound_sourcing_talent_pool_contact"
      - "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
    interventions: []
  -
    id: "ask-for-the-band-before-assessment"
    title: "Питайте вилку до того, як призначать оцінювання"
    rationale: "Вилка, рівень і шкала — це другий із двох списків кандидата, а зарплатний глухий кут тримається на тому, що число першим називає кандидат. Питання про вилку до призначення оцінювання виносить розбіжність на скринінг, а не на четвертий тиждень, коли години вже витрачені."
    cost: "medium"
    costs: "Це питання може завершити процес уже на скринінгу, а очікування, назване рано, фіксує число раніше, ніж зафіксовано рівень."
    targets:
      - "mech.unstated_compensation_band_discrepancy"
      - "bar.recruiter_screening_call"
      - "bar.compensation_levelling_reconciliation"
      - "pat.compensation_double_bind"
      - "obs.compensation_band_reduced_or_altered_mid_process"
    interventions:
      - "int.upfront_compensation_band_disclosure"
  -
    id: "keep-a-dated-record"
    title: "Ведіть датований запис кожного повідомлення"
    rationale: "Дати, формулювання і те, хто це сказав, — єдина частина процесу, якою кандидат володіє повністю. Записані одразу, вони відділяють те, що процес встановив, від того, чого він не встановив: відмова через хвилини після подання, вакансія, що знову на дошці, два раунди, зворотний звʼязок яких не сходиться."
    cost: "low"
    costs: "Це неоплачуваний адміністративний час саме тоді, коли часу найменше, а повний запис процесу, що закінчився мовчанням, лишається записом мовчання."
    targets:
      - "pat.closed_then_reposted_requisition_motif"
      - "obs.materially_similar_role_reposted_shortly_after_rejection"
      - "obs.conflicting_feedback_across_different_interviewers"
      - "obs.multiple_interview_reschedulings_or_interviewer_no_show"
      - "mech.mid_process_role_requirement_redefinition"
    interventions: []
  -
    id: "submit-at-the-stated-timebox"
    title: "Здавайте у заявлений таймбокс і назвіть, що відрізали"
    rationale: "Години, які забирає тестове, беруться з того самого бюджету, що й сам пошук, а скільки хвилин його читатимуть, вирішують по той бік воріт. Зупинка на заявленому таймбоксі й запис того, що довелося відрізати, тримають завдання в узгодженому обсязі й лишають компроміси на папері."
    cost: "medium"
    costs: "Роботу, зупинену на таймбоксі, читають поруч із тими, що на ньому не зупинилися, а хвилини рецензента кандидат не встановлює."
    targets:
      - "loop.take_home_opportunity_cost_saturation_loop"
      - "mech.take_home_evaluation_fatigue_asymmetry"
      - "bar.take_home_work_sample_evaluation"
      - "obs.take_home_assignment_exceeding_reasonable_stated_scope"
    interventions:
      - "int.strict_take_home_timebox_blinded_evaluation_rubric"
  -
    id: "set-a-closing-date-for-silence"
    title: "Призначайте дату, коли ви закриваєте мовчазний процес"
    rationale: "Мовчання після подання накриває і оголошення, яке ніхто не зняв, і пакетний процес, що закриває заявки за таймаутом, і чергу, до якої не дійшли, — і жодного з трьох ззовні не видно. Обрана заздалегідь дата закриття перетворює відкрите питання на завершене й повертає години тим пошукам, які відповіли."
    cost: "medium"
    costs: "Відповідь, що приходить після обраної дати, зараховується як відсутність відповіді, а вже витрачений час списується, а не вичікується."
    targets:
      - "mech.automated_application_expiration_timeout"
      - "mech.stale_or_orphaned_job_requisition"
      - "mech.recruiter_volume_quota_incentive_distortion"
      - "bar.inbound_screening_triage"
      - "obs.complete_silence_after_submission"
    interventions:
      - "int.auto_close_stale_job_requisitions"
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# Кандидат

Людина, яка подається. Єдина сторона у воронці, яка бачить увесь свій процес — і майже нічого з чужого.
