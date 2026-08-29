---
id: "mech.genuine_technical_skill_shortfall"
type: "mechanism"
aliases:
  - "M-001"
title: "Об’єктивна нестача технічної кваліфікації"
summary: "Перевірений рівень технічних знань кандидата об’єктивно не досягає необхідного стандарту для цієї ролі."
operates_at:
  - "bar.technical_screen_live_assessment"
  - "bar.take_home_work_sample_evaluation"
  - "bar.hiring_manager_in_depth_review"
emissions:
  -
    artifact: "obs.explicit_feedback_citing_skill_depth_shortfall"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"]
    observed_at: ["technical"]
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["technical"]
facets:
  actor: "candidate"
  nature: "rule"
  visibility: "inferable"
  removability: "candidate"
amplifies: []
masks: []
perspectives:
  -
    actor: "hiring-manager"
    sees: "Письмові нотатки панелі щодо планки, встановленої для цього рівня, і саме завдання, якого ці нотатки стосуються."
    reads: "Прогалину на цьому рівні команда закриватиме власним часом. Невдалий найм видно рік, і в нього є імʼя; втраченого не видно, і імені в нього немає."
    does: "Відмовляє на тому рівні, на якому оцінював. Конкретика панелі лишається всередині циклу, якщо її не передадуть у формі, яку рекрутер може процитувати."
  -
    actor: "recruiter"
    sees: "Рекомендацію панелі й нотатку, що її супроводжує; оцінок, які за нею стоять, — ні."
    reads: "Відмова, яку треба сформулювати до наступного скринінгу. Чи можна переказати причину кандидатові, залежить від форми, в якій вона надійшла."
    does: "Пише лист про відмову. Вимірюють час до закриття вакансії, а не час до ясності, тож конкретна причина потрапляє в лист там, де вже є нотатка, яку можна процитувати."
  -
    actor: "candidate"
    sees: "Або лист, що називає задачу й ту властивість, якої забракло, або шаблон, який не називає нічого."
    reads: "Названу прогалину можна звірити з роботою. Шаблон лишає невідомими і планку, і рівень, і решту когорти."
    does: "Записує формулювання й дату та може відпрацювати названу тему. Це єдина ланка, яку кандидат тут контролює."
status: "active"
evidence_level: "established"
honest_baseline: true
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
specimens:
  -
    kind: "email"
    label: "Фідбек, який називає прогалину"
    subject: "Фідбек — технічний раунд"
    lines:
      -
        text: "Панель позитивно оцінила комунікацію й те, як ви структурували задачу."
      -
        text: "Прогалина конкретна: у задачі на конкурентність потрібен був обмежений пул воркерів, а в надісланому розвʼязку горутини створювалися без обмеження — на цьому рівні панель очікує, що це помітять."
        tell: true
      -
        text: "Будемо щиро раді повторній заявці, коли ви приділите цій темі трохи часу."
    reading: "Названа задача й названа властивість. Саме так виглядає фідбек про роботу, а не про «відповідність» — це рідкість, і її варто зберегти."
non_inferences:
  - "Відмова не означає, що кандидат не має інженерних здібностей, — лише те, що планку вимог не досягнуто за цим конкретним критерієм."
---

# Об’єктивна нестача технічної кваліфікації

Перевірений рівень технічних знань кандидата об’єктивно не досягає необхідного стандарту для цієї ролі.

### Структурний контекст
- **Актор:** `candidate`
- **Природа:** `rule`
- **Усувність:** `candidate`

### Не-висновки
- Відмова не означає, що кандидат не має інженерних здібностей, — лише те, що планку вимог не досягнуто за цим конкретним критерієм.
