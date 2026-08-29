---
id: "mech.headcount_freeze_or_budget_cancellation"
type: "mechanism"
aliases:
  - "M-007"
title: "Замороження headcount або скасування бюджету"
summary: "Керівництво або фінансовий відділ блокує нові найми через зміну бюджету під час триваючого процесу інтерв’ю."
operates_at:
  - "bar.team_cross_functional_panel"
  - "bar.headcount_executive_budget_approval"
  - "bar.offer_closing_contract_execution"
emissions:
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
  -
    artifact: "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "mech.stale_or_orphaned_job_requisition"
masks:
  - "mech.genuine_technical_skill_shortfall"
  - "mech.stronger_competing_candidate_in_final_cohort"
perspectives:
  -
    actor: "actor.employer_policy"
    sees: "Реєстр відкритих вакансій і прогноз, під який планують квартал. У якій із цих вакансій людина стоїть у фінальному раунді — такого поля в цьому зрізі немає."
    reads: "Затверджена вакансія — це опція, яку можна поставити на паузу, і пауза обходиться дешевше, ніж тримати вакансію відкритою. Рішення ухвалюють на рівні підрозділу, а не окремого процесу."
    does: "Зупиняє фінансування по підрозділу з названої дати й передає вказівку вниз. Процеси, що вже тривають, закривають ті, хто їх веде."
  -
    actor: "actor.recruiter"
    sees: "Дата, коли вакансія змінює статус у системі, і вказівка, що надходить разом зі зміною. Прогнозу, який за цим стоїть, рекрутеру не показують."
    reads: "Пайплайн цілий, але йому нема куди прийти. Час до закриття цієї вакансії перестає бути числом, на яке хтось може вплинути."
    does: "Скасовує призначені раунди й пише повідомлення. Формулювання лишається за рекрутером; те, що можна розкрити, — ні."
  -
    actor: "actor.hiring_manager"
    sees: "Вакансія більше не профінансована, а робота, заради якої її відкривали, лишається на команді. Рекомендація панелі тепер нічого не вирішує."
    reads: "Пошук закінчився з причини, якої немає ні в циклі, ні в кандидатах. Прогалина в команді лишається, а дату повторного відкриття встановлює не менеджер."
    does: "Перестає збирати панелі й перерозподіляє роботу по команді. Тих, хто вже в циклі, передають рекрутеру на закриття."
  -
    actor: "actor.candidate"
    sees: "Скасований фінальний раунд або офер, який не приходить, — із датою і з тією причиною, яку називає повідомлення."
    reads: "За часом це стається одразу після вже пройдених раундів, тож причина, що лежить вище процесу, і вирок у самому процесі звідси виглядають однаково."
    does: "Фіксує дату й формулювання, питає, вакансію поставлено на паузу чи закрито, і не зупиняє інші процеси."
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
specimens:
  -
    kind: "email"
    label: "Замороження, як його передали вниз"
    lines:
      -
        text: "Мушу поставити наш процес на паузу. Сьогодні вранці оголосили замороження найму по всьому підрозділу, він діє негайно."
        tell: true
      -
        text: "Ваш фінальний раунд мав бути в четвер. Я його скасовую, щоб ви не готувалися до того, чого я все одно не проведу."
      -
        text: "Напишу прямо, щойно щось знатиму, — зокрема якщо відповідь буде, що це не відкриється знову."
    reading: "Причина лежить вище циклу найму й має дату. Чи можна її звірити з публічними новинами — ось проба, яку варто провести."
non_inferences:
  - "Результати кандидата на інтерв’ю не були причиною припинення процесу."
---

# Замороження headcount або скасування бюджету

Керівництво або фінансовий відділ блокує нові найми через зміну бюджету під час триваючого процесу інтерв’ю.

### Структурний контекст
- **Актор:** `policy`
- **Природа:** `rule`
- **Усувність:** `none`

### Причинно-наслідкові звʼязки
- Посилює `mech.stale_or_orphaned_job_requisition` — Застаріла або покинута вакансія
- Маскує `mech.genuine_technical_skill_shortfall` — Об’єктивна нестача технічної кваліфікації
- Маскує `mech.stronger_competing_candidate_in_final_cohort` — Сильніший конкурентний кандидат у фінальній групі

### Не-висновки
- Результати кандидата на інтерв’ю не були причиною припинення процесу.
