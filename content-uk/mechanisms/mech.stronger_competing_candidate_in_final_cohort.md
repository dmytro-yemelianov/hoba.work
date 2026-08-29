---
id: "mech.stronger_competing_candidate_in_final_cohort"
type: "mechanism"
aliases:
  - "M-002"
title: "Сильніший конкурентний кандидат у фінальній групі"
summary: "Кандидат успішно пройшов усі пороги, але інший кандидат у когорті показав кращу специфічну експертизу або менший час адаптації."
operates_at:
  - "bar.hiring_manager_in_depth_review"
  - "bar.team_cross_functional_panel"
  - "bar.headcount_executive_budget_approval"
emissions:
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "distortion"
    likelihood: "low"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "candidate"
  nature: "rule"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "actor.candidate"
    sees: "Відмову, яка приходить після того, як пройдено всі раунди, без жодної згадки про те, хто ще був у фінальній групі."
    reads: "Ззовні недосягнута планка й програне порівняння приходять в одному конверті. Когорта — не те поле, яке кандидат бачить."
    does: "Розбирає власне проходження, бо це єдина доступна змінна: ранжування, яке все вирішило, не надходить у відповідь на жодне питання."
  -
    actor: "actor.hiring_manager"
    sees: "Фіналістів, які всі проходять планку, і різницю в тому, скільки кожному треба до самостійної роботи."
    reads: "Це вибір між прийнятними людьми, а не знайдена в комусь помилка. Час на розгін — та різниця, яку можна назвати."
    does: "Бере коротший розгін і закриває вакансію. Ранжування не породжує помилки, яку можна повернути, тож рекрутерові немає що передати по суті."
  -
    actor: "actor.recruiter"
    sees: "Одну вакансію, кількох фіналістів і рішення, яке називає вибір, а не нестачу."
    reads: "У результаті немає нічого, що читалося б як фідбек, а те, що все вирішило, стосується людини, якій цей лист не адресований."
    does: "Надсилає стандартне формулювання й залишає профіль для наступної вакансії того самого рівня."
status: "active"
evidence_level: "proven"
honest_baseline: true
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
specimens:
  -
    kind: "email"
    label: "Відмова, яка називає порівняння"
    lines:
      -
        text: "Рішення було справді складним — ви пройшли всі планки, які ми ставили."
      -
        text: "Ми взяли іншого фіналіста, який уже впроваджував ту саму платіжну інфраструктуру, на яку ми мігруємо, — це скорочує розгін приблизно на квартал."
        tell: true
      -
        text: "Якщо знову відкриється щось цього рівня, звернуся до вас напряму."
    reading: "Тут ніде не сказано, що кандидатові чогось забракло. Вирішило порівняння, а порівняння не є властивістю жодної зі сторін."
non_inferences:
  - "Не означає, що кандидат отримав негативний фідбек; відносне ранжування у когорті поза контролем кандидата."
---

# Сильніший конкурентний кандидат у фінальній групі

Кандидат успішно пройшов усі пороги, але інший кандидат у когорті показав кращу специфічну експертизу або менший час адаптації.

### Структурний контекст
- **Актор:** `candidate`
- **Природа:** `rule`
- **Усувність:** `none`

### Причинно-наслідкові звʼязки
- Маскує `mech.genuine_technical_skill_shortfall` — Об’єктивна нестача технічної кваліфікації

### Не-висновки
- Не означає, що кандидат отримав негативний фідбек; відносне ранжування у когорті поза контролем кандидата.
