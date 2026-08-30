---
id: "mech.mid_process_role_requirement_redefinition"
type: "mechanism"
aliases:
  - "M-013"
title: "Зміна вимог до ролі під час процесу найму"
summary: "Команда змінює стек, рівень або обсяг ролі, поки кандидати ще в процесі, і вже виставлені оцінки перестають діяти."
operates_at:
  - "bar.hiring_manager_in_depth_review"
  - "bar.team_cross_functional_panel"
  - "bar.compensation_levelling_reconciliation"
emissions:
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
    observed_at: ["team"]
  -
    artifact: "obs.materially_similar_role_reposted_shortly_after_rejection"
    observed_at: ["sourcing"]
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "hiring-manager"
  nature: "noise"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "mech.unstated_compensation_band_discrepancy"
  - "mech.inflated_requisition_requirements_vs_actual_team_needs"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "Обсяг, який має закрити роль, зрушив після того, як вакансію відкрили, а нотатки панелі перед ним писали ще за попереднім описом."
    reads: "Сильні нотатки за ціллю, якої вже немає. Переграти чотири раунди коштує команді тижнів, яких їй і так бракує."
    does: "Переписує вимоги, переоцінює наявні нотатки за ними й вирішує, на якому рівні — якщо взагалі — кандидат лишається кандидатом."
  -
    actor: "actor.recruiter"
    sees: "Вакансія, опис якої змінюється, поки кандидати ще в процесі, і менеджер із найму, який просить профіль, відсутній у початковому брифі."
    reads: "Пайплайн, зібраний під старий бриф, більше не конвертує, а time-to-fill усе ще рахується від дати першого відкриття вакансії."
    does: "Переказує нову версію ролі всім, хто ще в процесі, або закриває їх стандартним формулюванням і шукає наново за новим описом."
  -
    actor: "actor.candidate"
    sees: "Чотири раунди позитивного сигналу, потім відмова, яка описує іншу роль, ніж та, на яку подавався, і схоже оголошення на дошці згодом."
    reads: "Раунди пройдено, а ціль зрушила — або раунди не пройдено, і змінений опис — це ввічлива версія. Обидва прочитання лягають на той самий лист."
    does: "Фіксує початковий опис, дати й формулювання зміни та вирішує, чи питати, яка саме вимога тут нова."
  -
    actor: "actor.employer_policy"
    sees: "Змінена вакансія, що надходить на повторне затвердження з іншим рівнем або вилкою, тоді як початкова досі рахується відкритою."
    reads: "Зміна рівня й вилки на вже затвердженій вакансії — саме це й розвʼязує сітка грейдів. У самій зміні ніде не зафіксовано годин інтервʼю, витрачених за старим обсягом."
    does: "Затверджує або відхиляє новий рівень і вилку, і процес відновлюється чи зупиняється на етапі звірки."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
specimens:
  -
    kind: "email"
    label: "Роль, яка змінилася під ногами"
    lines:
      -
        text: "Дякую за чотири раунди — нотатки панелі були послідовно сильними."
      -
        text: "Відколи ми відкрили вакансію, команда перевела сервіс на Rust і додала в роль лідерство в on-call. За новим профілем ми шукаємо людину з продакшн-Rust і формальним лід-досвідом."
        tell: true
      -
        text: "Розумію, що ви проходили інтервʼю за попереднім описом. Мені прикро за це."
    reading: "Оцінки не перескладали — їх переоцінили за ціллю, яка зрушила вже після того, як їх виставили."
non_inferences:
  - "Відмову спричинила зміна мандата команди, а не попередні відповіді кандидата на співбесідах."
---

# Зміна вимог до ролі під час процесу найму

Команда змінює стек, рівень або обсяг ролі, поки кандидати ще в процесі, і вже виставлені оцінки перестають діяти.

### Структурний контекст
- **Актор:** `hiring-manager`
- **Природа:** `noise`
- **Усувність:** `none`

### Причинно-наслідкові звʼязки
- Посилює `mech.unstated_compensation_band_discrepancy` — Неоголошена невідповідність зарплатних очікувань
- Посилює `mech.inflated_requisition_requirements_vs_actual_team_needs` — Завищені вимоги у вакансії порівняно з реальними задачами
- Маскує `mech.genuine_technical_skill_shortfall` — Об’єктивна нестача технічної кваліфікації

### Не-висновки
- Відмову спричинила зміна мандата команди, а не попередні відповіді кандидата на співбесідах.
