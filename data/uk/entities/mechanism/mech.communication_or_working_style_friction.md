---
id: "mech.communication_or_working_style_friction"
type: "mechanism"
aliases:
  - "M-015"
title: "Невідповідність комунікаційного стилю або робочої культури"
summary: "Під час спільної вправи кандидат говорить різко, захищається у відповідь на критику або не чує співрозмовника."
operates_at:
  - "bar.recruiter_screening_call"
  - "bar.team_cross_functional_panel"
emissions:
  -
    artifact: "obs.communication_mismatch_or_tone_friction_in_panel"
    observed_at: ["team"]
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"]
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["recruiter"]
facets:
  actor: "candidate"
  nature: "bias"
  visibility: "observable"
  removability: "candidate"
amplifies: []
masks: []
perspectives:
  -
    actor: "actor.candidate"
    sees: "Сам обмін репліками, як він відбувся під тиском часу, і відмова, яка згадує відповідність або співпрацю, але не вказує на конкретний момент."
    reads: "Коротка відповідь, дана ще під час роботи над задачею, і нотатка про неї, якої не перечитати. Звірити прочитання немає з чим."
    does: "Відновлює сесію з памʼяті й змінює те, як формулює незгоду в наступній."
  -
    actor: "actor.hiring_manager"
    sees: "Письмові враження панелі про те, як пройшла незгода, поряд із технічними оцінками. Запису немає, і кожен інтервʼюер бачив свої пів години."
    reads: "Сигнал про те, як людина сприймає ревʼю в команді, якій із нею працювати щодня. Поганий найм за цією віссю видно рік, і під ним стоїть імʼя."
    does: "Порівнює враження з технічними нотатками, а якщо панель розколота — розвʼязує на користь консервативнішого результату."
  -
    actor: "actor.recruiter"
    sees: "Рекомендацію панелі з причиною, записаною як стиль або відповідність, і жодного транскрипту за нею."
    reads: "Рішення остаточне, і його важко викласти кандидату письмово так, щоб це не читалося як оцінка особистості."
    does: "Надсилає стандартне формулювання про ближчу відповідність або переказує конкретну нотатку, якщо панель сформулювала її так, що з нею можна щось зробити."
status: "active"
evidence_level: "proven"
honest_baseline: true
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
specimens:
  -
    kind: "transcript"
    label: "Обмін репліками, про який ідеться в нотатці"
    context: "33-тя хвилина, парне програмування"
    lines:
      -
        speaker: "Інтервʼюер"
        at: "33:02"
        text: "Здається, цей цикл робить більше роботи, ніж потрібно."
      -
        speaker: "Кандидат"
        at: "33:06"
        text: "Нормально. Вхід обмежений."
        tell: true
      -
        speaker: "Інтервʼюер"
        at: "33:11"
        text: "Так, але якби не був?"
      -
        speaker: "Кандидат"
        at: "33:14"
        text: "Тоді я б переписав. Але він обмежений."
    reading: "Панель записала це як опір критиці. Коротка відповідь під тиском часу й захисна позиція в транскрипті виглядають однаково — тому це в наборі чесних базових механізмів, а не у виправданнях."
non_inferences:
  - "Тертя в стилі спілкування під час стресової співбесіди не є постійною рисою характеру."
---

# Невідповідність комунікаційного стилю або робочої культури

Під час спільної вправи кандидат говорить різко, захищається у відповідь на критику або не чує співрозмовника.

### Структурний контекст
- **Актор:** `candidate`
- **Природа:** `bias`
- **Усувність:** `candidate`

### Не-висновки
- Тертя в стилі спілкування під час стресової співбесіди не є постійною рисою характеру.
