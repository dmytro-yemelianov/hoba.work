---
id: "mech.inflated_requisition_requirements_vs_actual_team_needs"
type: "mechanism"
aliases:
  - "M-024"
title: "Завищені вимоги у вакансії порівняно з реальними задачами"
summary: "Оголошення перелічує 10+ технологій і планку старшого рівня для ролі, реальна робота якої — звичайна продуктова розробка."
operates_at:
  - "bar.requisition_approval_public_posting"
  - "bar.automated_filter_parser_threshold"
  - "bar.recruiter_screening_call"
emissions:
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["recruiter"]
  -
    artifact: "obs.materially_similar_role_reposted_shortly_after_rejection"
    observed_at: ["sourcing"]
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "hiring-manager"
  nature: "incentive"
  visibility: "inferable"
  removability: "intermediary"
amplifies:
  - "mech.automated_keyword_qualification_filter"
  - "mech.unstated_compensation_band_discrepancy"
masks: []
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "Форма затвердження з одним списком вимог на все, що ролі, можливо, доведеться закрити, і рівень, який треба обґрунтувати за сіткою грейдів."
    reads: "Список — єдиний письмовий опис стелі ролі. Вимогу, якої в ньому немає, потім не перевіриш на скринінгу, не пройшовши затвердження заново."
    does: "Пише надлишковий список — увесь стек і той досвід, якого вимагає рівень, — а калібрує вже потім, на живих кандидатах, у скринінгу й на панелі."
  -
    actor: "actor.recruiter"
    sees: "Список вимог, як його написано, і пайплайн, що тоншає під цим списком. Чого менеджер із найму вимагає насправді, але не записав, звідси не видно."
    reads: "Доки менеджер не скаже інакше, список і є стандартом скринінгу, а пул, що його проходить, малий."
    does: "Скринить за написаним списком, потім іде до менеджера зʼясувати, які пункти рухомі, — а time-to-fill рахується з дня відкриття вакансії."
  -
    actor: "actor.ats_vendor"
    sees: "Список вимог як налаштовувані критерії: роки, посади, названі технології — кожен пункт або ознака, яку читає модель ранжування, або нокаут-правило, яке клієнт може ввімкнути."
    reads: "Кожен пункт списку — вимога. У записі немає нічого, що відділяє те, що ролі потрібно, від того, чого комусь хотілося б."
    does: "Застосовує критерії так, як їх налаштовано, і ранжує відповідно. Довший список дає менший кваліфікований пул, а саме розмір пулу клієнт і бачить."
  -
    actor: "actor.candidate"
    sees: "Оголошення зі стосом названих технологій і зазначеним рівнем, а згодом — та сама роль, викладена знову."
    reads: "Список і є планкою. Які пункти справді несучі, ніде не написано там, куди кандидат має доступ, — як і те, на якому рівні його оцінюватимуть."
    does: "Або не подається на роль, реальна робота якої йому по силах, або подається й витрачає години; коли роль зʼявляється знову, нема чим відрізнити невзяту планку від списку, який не бере ніхто."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
specimens:
  -
    kind: "posting"
    label: "Оголошення і перший місяць роботи"
    lines:
      -
        text: "Оголошення: 10+ років розподілених систем, Kubernetes, Kafka, Rust, Go, Terraform, GraphQL, ML-serving, лідерство в on-call, менторство."
        tell: true
      -
        text: "Та сама команда, нотатки зі стендапів за квартал: CRUD-ендпоінти для білінг-дашборда, експорт звіту, два апгрейди бібліотек."
      -
        text: "Обидва описи стосуються однієї ролі."
    reading: "Список вимог одночасно є мрією, якорем і фільтром. Він описує стелю, яку хтось уявив, а не роботу в спринті."
non_inferences:
  - "Невідповідність роздутому «списку бажань» не означає, що кандидат не впорається з реальними ключовими задачами команди."
---

# Завищені вимоги у вакансії порівняно з реальними задачами

Оголошення перелічує 10+ технологій і планку старшого рівня для ролі, реальна робота якої — звичайна продуктова розробка.

### Структурний контекст
- **Актор:** `hiring-manager`
- **Природа:** `incentive`
- **Усувність:** `intermediary`

### Причинно-наслідкові звʼязки
- Посилює `mech.automated_keyword_qualification_filter` — Автоматичний фільтр за ключовими словами та роками
- Посилює `mech.unstated_compensation_band_discrepancy` — Неоголошена невідповідність зарплатних очікувань

### Не-висновки
- Невідповідність роздутому «списку бажань» не означає, що кандидат не впорається з реальними ключовими задачами команди.
