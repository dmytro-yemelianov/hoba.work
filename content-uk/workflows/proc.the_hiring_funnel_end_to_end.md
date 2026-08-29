---
id: "proc.the_hiring_funnel_end_to_end"
type: "workflow"
aliases:
  - "WF-001"
title: "Воронка найму від початку до кінця"
summary: "Від моменту авторизації хедкаунту до підписаного договору або закритого пошуку — з актором, який володіє кожним кроком, і з тим, що кандидат бачить зі свого місця."
subject: "вакансія та кандидат, який нею рухається"
states:
  -
    id: "drafted"
    title: "Вакансію складено"
    kind: "initial"
    owner: "actor.hiring_manager"
    description: "Менеджер описує роль. Рівень, вилку й вимоги вирішують саме тут — зазвичай просто копіюють останній пошук для тієї самої команди."
    entities:
      - "bar.requisition_approval_public_posting"
    visible_to_candidate: "Нічого. Публічно ролі ще не існує."
  -
    id: "authorised"
    title: "Хедкаунт авторизовано"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Фінанси й керівництво резервують бюджет під вакансію. Погодження може спливти, а пізніше його можуть і відкликати — воронка цього не помітить."
    entities:
      - "bar.requisition_approval_public_posting"
      - "bar.headcount_executive_budget_approval"
    visible_to_candidate: "Нічого."
  -
    id: "published"
    title: "Оголошення опубліковано"
    kind: "active"
    owner: "actor.recruiter"
    description: "Роль публічна. Оголошення можуть ще й автоматично оновлювати кожні тридцять днів — на вигляд це те саме, що нова вакансія."
    entities:
      - "bar.requisition_approval_public_posting"
      - "bar.outbound_sourcing_talent_pool_contact"
      - "mech.stale_or_orphaned_job_requisition"
    visible_to_candidate: "Оголошення й те, що в ньому розкрито."
  -
    id: "received"
    title: "Заявку отримано"
    kind: "active"
    owner: "actor.ats_vendor"
    description: "Запис існує й привʼязаний до вакансії. Ніхто нічого не прочитав."
    entities:
      - "bar.application_ingestion"
      - "obs.complete_silence_after_submission"
    visible_to_candidate: "Підтвердження — або тиша."
  -
    id: "machine-screened"
    title: "Автоматичний скринінг"
    kind: "active"
    owner: "actor.ats_vendor"
    description: "Розбір документа парсером, пороги ключових слів, нокаут-правила, ранжування. Рішення — менш ніж за секунду."
    entities:
      - "bar.automated_filter_parser_threshold"
      - "mech.ats_parser_extraction_failure"
      - "mech.automated_keyword_qualification_filter"
      - "mech.employment_gap_downranking_bias"
      - "mech.automated_application_expiration_timeout"
    visible_to_candidate: "Або нічого, або відмова за кілька хвилин."
  -
    id: "recruiter-queue"
    title: "У черзі до рекрутера"
    kind: "active"
    owner: "actor.recruiter"
    description: "Чекає, доки прочитає людина, — у вхідній черзі, на яку в тижні бракує годин."
    entities:
      - "bar.inbound_screening_triage"
      - "mech.recruiter_volume_quota_incentive_distortion"
      - "mech.speculative_sourcing_talent_pooling_without_opening"
    visible_to_candidate: "Тиша невизначеної тривалості."
  -
    id: "recruiter-screen"
    title: "Скринінг із рекрутером"
    kind: "active"
    owner: "actor.recruiter"
    description: "Розмова про компенсацію, терміни, локацію й двохвилинну версію останнього проєкту."
    entities:
      - "bar.recruiter_screening_call"
      - "obs.feedback_stating_candidate_is_overqualified_for_the_grade"
      - "mech.unstated_compensation_band_discrepancy"
      - "mech.experience_age_grading_mismatch"
    visible_to_candidate: "Сам дзвінок і ті параметри, які рекрутер називає."
  -
    id: "technical"
    title: "Технічна перевірка"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Задача наживо, тестове або і те, і те — оцінюють за шкалою, якої кандидат не бачить."
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
      - "obs.take_home_assignment_exceeding_reasonable_stated_scope"
      - "obs.explicit_feedback_citing_skill_depth_shortfall"
      - "mech.genuine_technical_skill_shortfall"
      - "mech.take_home_evaluation_fatigue_asymmetry"
    visible_to_candidate: "Сама задача, іноді структурований фідбек після неї."
  -
    id: "panel"
    title: "Панель менеджера та команди"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Глибина, володіння задачею й співпраця — оцінюють кілька інтервʼюерів, які можуть міряти різне."
    entities:
      - "bar.hiring_manager_in_depth_review"
      - "bar.team_cross_functional_panel"
      - "obs.communication_mismatch_or_tone_friction_in_panel"
      - "obs.conflicting_feedback_across_different_interviewers"
      - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
      - "mech.domain_specificity_over_weighting"
      - "mech.hiring_manager_consensus_impasse"
    visible_to_candidate: "Розмови. Оцінки — рідко."
  -
    id: "levelling"
    title: "Компенсація та грейд"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Рівень, який призначила панель, зустрічається з вилкою, яку затвердили фінанси. Уперше їх зіставляють."
    entities:
      - "bar.compensation_levelling_reconciliation"
      - "obs.compensation_band_reduced_or_altered_mid_process"
      - "mech.unstated_compensation_band_discrepancy"
    visible_to_candidate: "Цифра — або перемовини заново."
  -
    id: "approval"
    title: "Погодження офферу"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Менеджер, директор, фінанси й талант-комітет підписують по черзі. Усі, кого кандидат бачив, уже сказали «так»."
    entities:
      - "bar.headcount_executive_budget_approval"
      - "mech.headcount_freeze_or_budget_cancellation"
    visible_to_candidate: "Тиша, яку зазвичай називають «фінальні перевірки»."
  -
    id: "offer"
    title: "Оффер видано"
    kind: "active"
    owner: "actor.recruiter"
    description: "Письмовий оффер існує. Вакансія лишається відкритою, доки немає зустрічного підпису."
    entities:
      - "bar.offer_closing_contract_execution"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
    visible_to_candidate: "Документ офферу."
  -
    id: "verification"
    title: "Перевірка рекомендацій і бекграунду"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Сторонній запис зіставляють із тим, що заявив кандидат."
    entities:
      - "bar.reference_background_verification"
      - "mech.reference_check_discrepancy_or_regulatory_ineligibility"
    visible_to_candidate: "Запит документів — або нічого."
  -
    id: "hired"
    title: "Найнято"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Договір підписано з обох боків, дату виходу узгоджено, онбординг запущено."
    entities:
      - "bar.offer_closing_contract_execution"
    visible_to_candidate: "Підписаний договір."
  -
    id: "rejected"
    title: "Відмовлено"
    kind: "terminal"
    owner: "actor.recruiter"
    description: "Рішення ухвалено й повідомлено. Що воно каже про причину — питання цілком окреме."
    entities:
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.explicit_feedback_citing_skill_depth_shortfall"
      - "obs.feedback_stating_candidate_is_overqualified_for_the_grade"
    visible_to_candidate: "Повідомлення — від категорії за шкалою до шаблону."
  -
    id: "frozen"
    title: "Пошук заморожено або скасовано"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Бюджет відкликано або вакансію поставлено на паузу. Може статися будь-коли, зокрема після офферу."
    entities:
      - "obs.position_closed_after_final_interview_without_hire"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
      - "mech.headcount_freeze_or_budget_cancellation"
    visible_to_candidate: "Якщо пощастить — пояснення. Часто оголошення просто зникає."
  -
    id: "lapsed"
    title: "Спливло без рішення"
    kind: "terminal"
    owner: "actor.ats_vendor"
    description: "Ніхто нічого не вирішував. Запис пролежав довше за встановлений строк, або оголошення так і не зняли."
    entities:
      - "obs.complete_silence_after_submission"
      - "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
      - "mech.stale_or_orphaned_job_requisition"
      - "mech.automated_application_expiration_timeout"
    visible_to_candidate: "Тиша, а потім, можливо, масова відмова о другій ночі."
transitions:
  -
    from: "drafted"
    to: "authorised"
    label: "бюджет погоджено"
    owner: "actor.employer_policy"
    guard: "Фінанси резервують хедкаунт під вакансію."
    latency_expected_days: 7
    latency_max_days: 21
    entities:
      - "bar.headcount_executive_budget_approval"
  -
    from: "authorised"
    to: "published"
    label: "оголошення виходить"
    owner: "actor.recruiter"
    guard: "Затверджену вакансію з написаним описом публікують."
    latency_expected_days: 2
    latency_max_days: 7
    entities:
      - "bar.requisition_approval_public_posting"
  -
    from: "published"
    to: "received"
    label: "заявку подано"
    owner: "actor.candidate"
    guard: "Кандидат подається або відповідає на вихідний контакт."
    latency_expected_days: 7
    latency_max_days: 30
    entities:
      - "bar.application_ingestion"
      - "bar.outbound_sourcing_talent_pool_contact"
  -
    from: "received"
    to: "machine-screened"
    label: "правила спрацьовують"
    owner: "actor.ats_vendor"
    guard: "Запис достатньо повний, щоб налаштовані правила відпрацювали."
    latency_expected_days: 1
    latency_max_days: 3
    entities:
      - "bar.automated_filter_parser_threshold"
  -
    from: "machine-screened"
    to: "recruiter-queue"
    label: "пороги пройдено"
    owner: "actor.ats_vendor"
    guard: "Оцінка розбору й усі нокаут-правила проходять."
    latency_expected_days: 1
    latency_max_days: 3
    entities:
      - "bar.automated_filter_parser_threshold"
  -
    from: "machine-screened"
    to: "rejected"
    label: "відсіяно фільтром"
    owner: "actor.ats_vendor"
    guard: "Будь-яке нокаут-правило падає або ранг нижчий за поріг просування."
    latency_expected_days: 1
    latency_max_days: 7
    entities:
      - "obs.rejection_within_minutes_of_application_submission"
      - "mech.automated_keyword_qualification_filter"
      - "mech.employment_gap_downranking_bias"
  -
    from: "recruiter-queue"
    to: "recruiter-screen"
    label: "у шорт-лист"
    owner: "actor.recruiter"
    guard: "Людина читає профіль і додає його до списку."
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.inbound_screening_triage"
  -
    from: "recruiter-queue"
    to: "lapsed"
    label: "спливло за часом"
    owner: "actor.ats_vendor"
    guard: "Ніхто не переглянув профіль до того, як минув строк."
    latency_expected_days: 30
    latency_max_days: 60
    entities:
      - "mech.automated_application_expiration_timeout"
  -
    from: "recruiter-screen"
    to: "technical"
    label: "параметри збігаються"
    owner: "actor.recruiter"
    guard: "Очікування, терміни й локація сумісні, профіль передають команді."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.recruiter_screening_call"
  -
    from: "recruiter-screen"
    to: "rejected"
    label: "параметри не збігаються"
    owner: "actor.recruiter"
    guard: "Компенсація, рівень, локація чи доступність відсіюють кандидата ще до розмови про інженерію."
    latency_expected_days: 2
    latency_max_days: 5
    entities:
      - "obs.feedback_stating_candidate_is_overqualified_for_the_grade"
      - "mech.unstated_compensation_band_discrepancy"
      - "mech.location_or_timezone_compliance_constraint"
      - "mech.experience_age_grading_mismatch"
  -
    from: "technical"
    to: "panel"
    label: "перевірку пройдено"
    owner: "actor.hiring_manager"
    guard: "Оцінка перевищує поріг шкали."
    latency_expected_days: 5
    latency_max_days: 12
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
  -
    from: "technical"
    to: "rejected"
    label: "перевірку не пройдено"
    owner: "actor.hiring_manager"
    guard: "Оцінка не дотягує — або перевірка надто поверхова, щоб побачити те, що там є."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "obs.explicit_feedback_citing_skill_depth_shortfall"
      - "mech.genuine_technical_skill_shortfall"
      - "mech.take_home_evaluation_fatigue_asymmetry"
  -
    from: "panel"
    to: "levelling"
    label: "панель рекомендує найм"
    owner: "actor.hiring_manager"
    guard: "Згода в панелі дотягує до порога «брати»."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.hiring_manager_in_depth_review"
      - "bar.team_cross_functional_panel"
  -
    from: "panel"
    to: "rejected"
    label: "панель не дійшла консенсусу"
    owner: "actor.hiring_manager"
    guard: "Панель розділилася, а правило одностайності в такому разі означає «не брати»."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "obs.conflicting_feedback_across_different_interviewers"
      - "mech.hiring_manager_consensus_impasse"
  -
    from: "levelling"
    to: "approval"
    label: "рівень і вилка сходяться"
    owner: "actor.employer_policy"
    guard: "Призначений рівень і затверджена вилка перетинаються."
    latency_expected_days: 2
    latency_max_days: 5
    entities:
      - "bar.compensation_levelling_reconciliation"
  -
    from: "levelling"
    to: "rejected"
    label: "рівень і вилка не сходяться"
    owner: "actor.employer_policy"
    guard: "Очікування поза вилкою, і не рухається ні рівень, ні цифра."
    latency_expected_days: 2
    latency_max_days: 5
    entities:
      - "obs.compensation_band_reduced_or_altered_mid_process"
      - "mech.unstated_compensation_band_discrepancy"
  -
    from: "approval"
    to: "offer"
    label: "погодження завершено"
    owner: "actor.employer_policy"
    guard: "Кожен погоджувач у ланцюгу дав добро."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.headcount_executive_budget_approval"
  -
    from: "approval"
    to: "frozen"
    label: "хедкаунт відкликано"
    owner: "actor.employer_policy"
    guard: "Бюджет знято або оголошено фриз до видачі офферу."
    latency_expected_days: 3
    latency_max_days: 14
    entities:
      - "mech.headcount_freeze_or_budget_cancellation"
  -
    from: "offer"
    to: "verification"
    label: "оффер прийнято"
    owner: "actor.candidate"
    guard: "Кандидат підписує, починаються перевірки."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.reference_background_verification"
  -
    from: "offer"
    to: "frozen"
    label: "оффер відкликано"
    owner: "actor.employer_policy"
    guard: "Фриз застає вже виданий оффер до того, як надходить зустрічний підпис."
    latency_expected_days: 2
    latency_max_days: 7
    entities:
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
      - "mech.headcount_freeze_or_budget_cancellation"
  -
    from: "verification"
    to: "hired"
    label: "перевірки чисті"
    owner: "actor.employer_policy"
    guard: "Жодної неусуненої розбіжності у сторонньому записі."
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.offer_closing_contract_execution"
      - "bar.probation_period_post_start_confirmation"
  -
    from: "verification"
    to: "rejected"
    label: "розбіжність не усунено"
    owner: "actor.employer_policy"
    guard: "Невідповідність у записі або обмеження щодо права на роботу не усунуто."
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "mech.reference_check_discrepancy_or_regulatory_ineligibility"
  -
    from: "published"
    to: "lapsed"
    label: "оголошення переживає пошук"
    owner: "actor.ats_vendor"
    guard: "Найм припиняється, але оголошення ніхто не знімає."
    latency_expected_days: 60
    latency_max_days: 120
    entities:
      - "mech.stale_or_orphaned_job_requisition"
  -
    from: "rejected"
    to: "published"
    label: "вакансію відкрито знову"
    owner: "actor.recruiter"
    guard: "Пошук перезапускають — іноді зі зміненим профілем, іноді це автоматичне оновлення."
    latency_expected_days: 14
    latency_max_days: 60
    entities:
      - "obs.materially_similar_role_reposted_shortly_after_rejection"
      - "pat.closed_then_reposted_requisition_motif"
specimens: []
status: "active"
evidence_level: "strongly_supported"
evidence_ids: []
---

# Воронка найму від початку до кінця

Від моменту авторизації хедкаунту до підписаного договору або закритого пошуку — з актором, який володіє кожним кроком, і з тим, що кандидат бачить зі свого місця.
