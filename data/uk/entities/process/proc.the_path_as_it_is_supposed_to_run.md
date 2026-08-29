---
id: "proc.the_path_as_it_is_supposed_to_run"
type: "process"
aliases:
  - "WF-003"
title: "Шлях, яким усе має відбуватись"
summary: "Одна вакансія — від справжньої потреби до рішення, з яким кандидат може щось зробити. Кожен крок записано як зобовʼязання, яке він має виконувати. Кожен барʼєр у реєстрі — це місце, де одне з цих зобовʼязань перестають виконувати."
subject: "одна вакансія й один кандидат, що крізь неї рухається"
states:
  -
    id: "real-need"
    title: "Справжня вакансія, описана чесно"
    kind: "initial"
    owner: "actor.hiring_manager"
    description: "Вакансія описує роботу, яка існує вже зараз, на рівні, якого команді справді бракує, у вилці, яку бюджет уже покриває. Тут немає нічого «на виріст»: список вимог — це те, що робота використовує, а не те, що випадково мали останні четверо кандидатів."
    entities:
      - "int.requirements_drawn_from_the_team_s_own_backlog"
    visible_to_candidate: "Поки нічого. Але все, що буде далі, успадкує те, що вирішили тут."
    deviations:
      - "mech.inflated_requisition_requirements_vs_actual_team_needs"
      - "mech.pre_selected_internal_candidate"
      - "mech.bench_priority_fill"
  -
    id: "published"
    title: "Опубліковано разом з умовами"
    kind: "active"
    owner: "actor.recruiter"
    description: "В оголошенні вказані вилка, правила щодо локації, етапи процесу й приблизна тривалість кожного. Коли пошук завершується, оголошення знімають."
    entities:
      - "int.upfront_compensation_band_disclosure"
      - "int.auto_close_stale_job_requisitions"
      - "int.internal_candidacy_stated_in_the_posting"
      - "int.outreach_states_the_requisition_behind_it"
    visible_to_candidate: "Роль, вилка, етапи й дата, до якої має прийти перша відповідь."
    deviations:
      - "bar.requisition_approval_public_posting"
      - "bar.outbound_sourcing_talent_pool_contact"
      - "mech.stale_or_orphaned_job_requisition"
      - "mech.speculative_sourcing_talent_pooling_without_opening"
      - "mech.bid_conditional_talent_pool"
      - "obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body"
  -
    id: "applied"
    title: "Відгукнувся — і знає про це"
    kind: "active"
    owner: "actor.candidate"
    description: "Заявку надіслано й підтверджено. Запис містить те, що кандидат насправді написав, і кандидат бачить, що заявка дійшла."
    entities:
      - "int.candidate_ats_parser_conformance_test_utility"
    visible_to_candidate: "Підтвердження, у якому названо роль і сказано, що буде далі."
    deviations:
      - "bar.application_ingestion"
      - "mech.ats_parser_extraction_failure"
  -
    id: "machine-check"
    title: "Машинна робота лишається механічною"
    kind: "active"
    owner: "actor.ats_vendor"
    description: "Автоматика прибирає дублікати, витягує дані й упорядковує. Вона не вирішує. А якщо правило все ж закриває заявку, це правило назване — і таке, яке людина могла б захистити вголос."
    entities:
      - "int.candidate_ats_parser_conformance_test_utility"
      - "int.remove_career_gap_feature_from_automated_ranking_models"
      - "int.distinct_closure_status_for_unreviewed_applications"
    visible_to_candidate: "Якщо правило закриває заявку тут — то яке саме."
    deviations:
      - "bar.automated_filter_parser_threshold"
      - "mech.automated_keyword_qualification_filter"
      - "mech.employment_gap_downranking_bias"
      - "mech.automated_application_expiration_timeout"
  -
    id: "human-read"
    title: "Прочитано людиною, у названий строк"
    kind: "active"
    owner: "actor.recruiter"
    description: "Кожну заявку, що пройшла механічний етап, читає людина — і читає до того, як вичерпається строк, обіцяний в оголошенні."
    entities:
      - "int.auto_close_stale_job_requisitions"
      - "int.screening_note_bound_to_observations_and_disposition_codes"
    visible_to_candidate: "Або наступний крок, або рішення — до дати, названої в оголошенні."
    deviations:
      - "bar.inbound_screening_triage"
      - "mech.recruiter_volume_quota_incentive_distortion"
  -
    id: "terms-check"
    title: "Умови звіряють, доки нічий час ще не витрачено"
    kind: "active"
    owner: "actor.recruiter"
    description: "Вилку, рівень, локацію, строк відпрацювання й дату старту кладуть поруч у першій же розмові — до того, як призначено будь-яку перевірку. Будь-яка зі сторін може зупинитись тут, і це нічого не коштує другій."
    entities:
      - "int.upfront_compensation_band_disclosure"
    visible_to_candidate: "Цифри й обмеження з обох боків, у першому дзвінку."
    deviations:
      - "bar.recruiter_screening_call"
      - "mech.unstated_compensation_band_discrepancy"
      - "mech.location_or_timezone_compliance_constraint"
      - "mech.experience_age_grading_mismatch"
  -
    id: "work-sample"
    title: "Оцінюють роботу — за критеріями, які показали"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Одне завдання з обмеженим часом, схоже на саму роботу. Критерії кандидат отримує до початку, ліміт часу діє й для того, хто перевіряє, і всіх оцінюють за тією самою шкалою."
    entities:
      - "int.strict_take_home_timebox_blinded_evaluation_rubric"
      - "int.candidate_work_index_submitted_with_the_application"
      - "int.publish_the_technical_screen_s_columns_and_threshold_before_the_round"
    visible_to_candidate: "Завдання, ліміт часу й критерії — до початку, а не після."
    deviations:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
      - "mech.genuine_technical_skill_shortfall"
      - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
      - "mech.take_home_evaluation_fatigue_asymmetry"
      - "mech.portfolio_work_artifact_misinterpretation"
  -
    id: "panel"
    title: "Одна панель, у кожного своє питання, одне правило рішення"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Кожен інтервʼюер знає, що саме він вимірює — і що більше цього не вимірює ніхто. Правило, яке перетворює їхні оцінки на рішення, узгоджене до першої розмови, і після старту процесу етапів не додають."
    entities:
      - "int.interview_seats_booked_with_prep_time_and_a_second_name_on_the_rota"
    visible_to_candidate: "З ким саме буде розмова, для чого кожна з них і скільки їх."
    deviations:
      - "bar.hiring_manager_in_depth_review"
      - "bar.team_cross_functional_panel"
      - "bar.client_profile_approval_and_client_interview"
      - "mech.stronger_competing_candidate_in_final_cohort"
      - "mech.interview_resource_scheduling_saturation"
      - "mech.mid_process_role_requirement_redefinition"
      - "mech.communication_or_working_style_friction"
      - "mech.domain_specificity_over_weighting"
      - "mech.hiring_manager_consensus_impasse"
  -
    id: "level-and-band"
    title: "Рівень зустрічається з опублікованою вилкою"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Рівень випливає з того, що зібрала панель, а вилка була публічною з першого дня. Звести їх — це арифметика, а не переговори про те, чи вилка взагалі існує."
    entities:
      - "int.upfront_compensation_band_disclosure"
    visible_to_candidate: "Та сама вилка, що була в оголошенні, і точка в ній, де стоїть офер."
    deviations:
      - "bar.compensation_levelling_reconciliation"
      - "mech.unstated_compensation_band_discrepancy"
  -
    id: "approval"
    title: "Погодження вже існує"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Хедкаунт підписали ще до публікації ролі, тож цей крок — контрпідпис, а не друге рішення. Якщо бюджет зникає, пошук закривають, а всім усередині кажуть про це."
    entities:
      - "int.auto_close_stale_job_requisitions"
      - "int.dated_funding_certification_before_the_final_round"
    visible_to_candidate: "Дата офера — а не невизначений період під назвою «фінальні перевірки»."
    deviations:
      - "bar.headcount_executive_budget_approval"
      - "mech.headcount_freeze_or_budget_cancellation"
  -
    id: "offer"
    title: "Письмовий офер, у якому є все"
    kind: "active"
    owner: "actor.recruiter"
    description: "Зарплата, рівень, посада, умови щодо локації, дата старту й усе, що є умовним, — письмово, зі строком на відповідь, який кандидат погодив. Ніщо з цього не змінюється після прийняття."
    entities: []
    visible_to_candidate: "Повний документ офера й час, який є на відповідь."
    deviations:
      - "bar.offer_closing_contract_execution"
      - "mech.headcount_freeze_or_budget_cancellation"
  -
    id: "verification"
    title: "Перевірки, співмірні з роллю, на які можна відповісти"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Лише ті перевірки, яких роль справді потребує. А якщо запис третьої сторони розходиться з тим, що казав кандидат, розбіжність показують кандидату до того, як вона щось вирішить."
    entities:
      - "int.verification_discrepancy_disclosure_and_reconciliation_window"
    visible_to_candidate: "Що саме перевіряють — і будь-яку розбіжність, перш ніж із неї зроблять якийсь висновок."
    deviations:
      - "bar.reference_background_verification"
      - "bar.probation_period_post_start_confirmation"
      - "mech.reference_check_discrepancy_or_regulatory_ineligibility"
      - "mech.start_date_slippage_and_post_acceptance_revocation"
      - "mech.probation_used_as_extended_de_facto_interview"
      - "obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation"
  -
    id: "hired"
    title: "Найнято на умовах, які були опубліковані"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Договір підписано з обох боків — на умовах, які були на сторінці від самого початку, з датою старту, яку обрали обидві сторони."
    entities: []
    visible_to_candidate: "Підписаний договір, що збігається з оголошенням."
    deviations: []
  -
    id: "declined"
    title: "Відмова з причиною, з якою можна щось зробити"
    kind: "terminal"
    owner: "actor.recruiter"
    description: "Наймають не кожного, і відмова — не відхилення. Частиною цього шляху її робить те, що вона приходить, називає етап, на якому все сталося, і критерій, за яким вирішили, — і каже, чи має сенс відгукуватись знову."
    entities:
      - "int.standardized_late_stage_rejection_feedback_taxonomy"
      - "int.recorded_finalist_standing_with_a_dated_re_entry_route"
    visible_to_candidate: "Який етап, який критерій і чи варто пробувати ще раз."
    deviations:
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.explicit_feedback_citing_skill_depth_shortfall"
      - "obs.feedback_stating_candidate_is_overqualified_for_the_grade"
      - "obs.conflicting_feedback_across_different_interviewers"
  -
    id: "closed"
    title: "Пошук закрито — і про це сказали"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Пошук має право зупинитись: потреба змінилась, бюджет зник, хтось усередині виявився саме тим. Цей шлях вимагає іншого — щоб оголошення зняли, а кожному, хто ще всередині процесу, сказали про це протягом кількох днів."
    entities:
      - "int.auto_close_stale_job_requisitions"
    visible_to_candidate: "Повідомлення про те, що пошук завершився, і коли саме."
    deviations:
      - "obs.complete_silence_after_submission"
      - "obs.position_closed_after_final_interview_without_hire"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
      - "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
      - "mech.stale_or_orphaned_job_requisition"
      - "mech.automated_application_expiration_timeout"
transitions:
  -
    from: "real-need"
    to: "published"
    label: "опубліковано з умовами"
    owner: "actor.recruiter"
    guard: "Погоджена вакансія, вилка й описаний процес виходять у світ разом."
    latency_expected_days: 2
    latency_max_days: 7
    entities:
      - "int.upfront_compensation_band_disclosure"
  -
    from: "published"
    to: "applied"
    label: "надіслано заявку"
    owner: "actor.candidate"
    guard: "Кандидат відгукується на умови, які міг прочитати заздалегідь."
    latency_expected_days: 7
    latency_max_days: 30
    entities: []
  -
    from: "applied"
    to: "machine-check"
    label: "запис оброблено"
    owner: "actor.ats_vendor"
    guard: "Заявку розібрано й підтверджено."
    latency_expected_days: 1
    latency_max_days: 2
    entities:
      - "int.candidate_ats_parser_conformance_test_utility"
  -
    from: "machine-check"
    to: "human-read"
    label: "передано людині"
    owner: "actor.ats_vendor"
    guard: "Жодне автоматичне правило не закрило заявку, тож тепер вона в людини."
    latency_expected_days: 2
    latency_max_days: 5
    entities:
      - "int.remove_career_gap_feature_from_automated_ranking_models"
  -
    from: "human-read"
    to: "terms-check"
    label: "варте розмови"
    owner: "actor.recruiter"
    guard: "Людина прочитала профіль і хоче поговорити."
    latency_expected_days: 3
    latency_max_days: 7
    entities: []
  -
    from: "terms-check"
    to: "work-sample"
    label: "умови сумісні"
    owner: "actor.recruiter"
    guard: "Вилка, рівень, локація й терміни влаштовують обидві сторони — і це сказано вголос."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "int.upfront_compensation_band_disclosure"
  -
    from: "work-sample"
    to: "panel"
    label: "робота відповідає критеріям"
    owner: "actor.hiring_manager"
    guard: "Завдання оцінили за критеріями, які кандидат отримав."
    latency_expected_days: 5
    latency_max_days: 10
    entities:
      - "int.strict_take_home_timebox_blinded_evaluation_rubric"
  -
    from: "panel"
    to: "level-and-band"
    label: "панель вирішує за своїм правилом"
    owner: "actor.hiring_manager"
    guard: "Узгоджене правило рішення дає «наймаємо»."
    latency_expected_days: 3
    latency_max_days: 5
    entities: []
  -
    from: "level-and-band"
    to: "approval"
    label: "рівень потрапляє у вилку"
    owner: "actor.employer_policy"
    guard: "Рівень, призначений за доказами, лягає в точку опублікованої вилки."
    latency_expected_days: 2
    latency_max_days: 4
    entities: []
  -
    from: "approval"
    to: "offer"
    label: "контрпідпис"
    owner: "actor.employer_policy"
    guard: "Погодження, яке існувало ще до публікації, підтверджено."
    latency_expected_days: 2
    latency_max_days: 5
    entities: []
  -
    from: "offer"
    to: "verification"
    label: "офер прийнято"
    owner: "actor.candidate"
    guard: "Кандидат приймає повний письмовий офер у погоджений строк."
    latency_expected_days: 3
    latency_max_days: 7
    entities: []
  -
    from: "verification"
    to: "hired"
    label: "перевірки чисті"
    owner: "actor.employer_policy"
    guard: "Немає нічого невирішеного з того, що співмірне ролі."
    latency_expected_days: 5
    latency_max_days: 14
    entities: []
  -
    from: "human-read"
    to: "declined"
    label: "відмова після прочитання"
    owner: "actor.recruiter"
    guard: "Людина вирішила «ні» — і сказала, на якому етапі та за яким критерієм."
    entities:
      - "int.standardized_late_stage_rejection_feedback_taxonomy"
  -
    from: "terms-check"
    to: "declined"
    label: "умови несумісні"
    owner: "actor.recruiter"
    guard: "Розрив названо в тій самій розмові, до того, як призначили будь-яку перевірку."
    entities:
      - "int.upfront_compensation_band_disclosure"
  -
    from: "work-sample"
    to: "declined"
    label: "робота не відповідає критеріям"
    owner: "actor.hiring_manager"
    guard: "Оцінка нижча за спільні критерії, і критерій названо."
    entities:
      - "int.standardized_late_stage_rejection_feedback_taxonomy"
      - "int.strict_take_home_timebox_blinded_evaluation_rubric"
  -
    from: "panel"
    to: "declined"
    label: "правило рішення дає «ні»"
    owner: "actor.hiring_manager"
    guard: "Правило, узгоджене заздалегідь, дає «не наймаємо», і сказано, який вимір це вирішив."
    entities:
      - "int.standardized_late_stage_rejection_feedback_taxonomy"
  -
    from: "level-and-band"
    to: "declined"
    label: "рівень і очікування не зустрічаються"
    owner: "actor.employer_policy"
    guard: "Опублікована вилка й заявлені очікування кандидата не перетинаються — і обидві сторони знали про це раніше."
    entities:
      - "int.upfront_compensation_band_disclosure"
  -
    from: "verification"
    to: "declined"
    label: "розбіжність лишається"
    owner: "actor.employer_policy"
    guard: "Кандидату показали розбіжність, і вона лишилась невирішеною."
    entities: []
  -
    from: "published"
    to: "closed"
    label: "потреба змінилась"
    owner: "actor.employer_policy"
    guard: "Роботи більше немає, і оголошення знімають того ж тижня."
    entities:
      - "int.auto_close_stale_job_requisitions"
  -
    from: "approval"
    to: "closed"
    label: "бюджет забрали"
    owner: "actor.employer_policy"
    guard: "Хедкаунт скасовано, і кожному кандидату в процесі кажуть про це протягом кількох днів."
    entities:
      - "int.auto_close_stale_job_requisitions"
  -
    from: "offer"
    to: "closed"
    label: "офер відкликано з поясненням"
    owner: "actor.employer_policy"
    guard: "Виданий офер не може встояти, і кандидату негайно пояснюють письмово, чому."
    entities: []
specimens: []
status: "active"
evidence_level: "unknown"
evidence_ids: []
---

# Шлях, яким усе має відбуватись

Це канонічний шлях: одна вакансія — від справжньої потреби до рішення, з яким
кандидат може щось зробити. Він записаний як машина, бо так записана решта
реєстру, і бо зобовʼязання, яке не вдається виразити станом і умовою переходу,
зазвичай і не є зобовʼязанням.

**Це конструкція, а не опис когось конкретного.** Жоден роботодавець не працює
саме так. Шлях зібрано з речей, які роботодавці й самі кажуть, що роблять, —
вилка в оголошенні, критерії, узгоджені до інтервʼю, рішення у названий строк,
зняте оголошення, коли пошук завершився, — і складено в один порядок, щоб решті
атласу було з чим себе звіряти.

У цьому весь сенс. Барʼєр — це не просто шлюз: шлюзи — це нормально, і на цьому
шляху їх чотирнадцять. Барʼєр — це точка, у якій одне з цих зобовʼязань
перестають виконувати. Поле `deviations` у кожному стані називає, які саме, — і
тому кожен барʼєр реєстру зʼявляється рівно на одному стані цього шляху, а
кожен механізм — щонайменше на одному.

Дві речі цей шлях свідомо **не** вважає відхиленнями. Відмова — не відхилення:
більшості кандидатів відмовляють, і шлях, який міг би закінчитись лише наймом,
був би вигадкою, а не стандартом. Закритий пошук — теж не відхилення: потреби
змінюються, бюджети зникають. Частиною шляху, а не відхиленням від нього, обидві
ці розвʼязки робить те, що вони приходять, кажуть, що сталося, і приходять
вчасно, щоб з цього була користь.
