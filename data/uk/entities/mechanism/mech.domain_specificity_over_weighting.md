---
id: "mech.domain_specificity_over_weighting"
type: "mechanism"
aliases:
  - "M-018"
title: "Надмірний акцент на вузькоспецифічному доменному досвіді"
summary: "Інтервʼюер вимагає досвіду саме у вузькій галузі й ставить його вище за переносну інженерну глибину."
operates_at:
  - "bar.recruiter_screening_call"
  - "bar.hiring_manager_in_depth_review"
emissions:
  -
    artifact: "obs.rejection_naming_a_specific_industry_sector_as_required"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
    observed_at: ["recruiter"]
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["recruiter"]
  -
    artifact: "obs.explicit_feedback_citing_skill_depth_shortfall"
    observed_at: ["team"]
    fidelity: "direct"
    likelihood: "medium"
    evidence: ["evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"]
facets:
  actor: "hiring-manager"
  nature: "bias"
  visibility: "inferable"
  removability: "intermediary"
amplifies:
  - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "Прогалину в тому, як команда покриває конкретний набір правил чи протоколів, і кандидата, чия глибина — у суміжній формі тієї самої задачі."
    reads: "Переносна глибина плюс розгін, який команда оплачує, уже маючи нестачу рук. Промах саме в галузі видно після найму, і за ним стоїть конкретне імʼя."
    does: "Тримає галузь як вимогу, а не як вподобання, і саме вона вирішує раунд, хоч би що записала решта панелі."
  -
    actor: "actor.candidate"
    sees: "Технічну розмову, яка йде добре аж до питання про конкретну галузь, а потім відмову з формулюванням про ближчу відповідність."
    reads: "Або інженерію почули, а вирішила галузь, або інженерія і була причиною, а галузь — це формулювання. Лист тримає обидва прочитання."
    does: "Фіксує, у якому місці раунду стався поворот, і в наступному оголошенні читає галузеві іменники як вимоги, а не як контекст."
  -
    actor: "actor.recruiter"
    sees: "Бриф із названою галуззю і панелі, що повертають нотатки з посиланням на галузь, а не на технічну шкалу."
    reads: "Вимога, яка звужує пул, поки time-to-fill рахується далі, і яку тримає менеджер із найму, а не рекрутер."
    does: "Скринить за галуззю, бо шортліст без неї повертає менеджер із найму, а решті надсилає стандартне формулювання."
  -
    actor: "actor.ats_vendor"
    sees: "Вимогу, внесену як галузевий термін, і модель ранжування, для якої цей термін — така сама ознака, як інші."
    reads: "Налаштоване вподобання, оцінене так, як його задали. У платформі нічим не описати те, що суміжна галузь розвʼязує ту саму задачу."
    does: "Ранжує й фільтрує за терміном у тому вигляді, як його внесли, і профілі, чия глибина описана іншими іменниками, падають нижче порога перегляду."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.employment_interview_reliability_new_meta_analytic_estimates_by_structure_and_format"
specimens:
  -
    kind: "transcript"
    label: "Момент, де раунд повернув"
    context: "12-та хвилина"
    lines:
      -
        speaker: "Інтервʼюер"
        at: "12:03"
        text: "Ви будували системи розрахунків, але не саме в картках?"
      -
        speaker: "Кандидат"
        at: "12:09"
        text: "Не в картках. Але форма задачі та сама — ідемпотентність, звірка, реверси на кшталт чарджбеків."
      -
        speaker: "Інтервʼюер"
        at: "12:19"
        text: "Нам справді потрібен хтось, хто жив у карткових рейках. Правила схем — це окремий світ."
        tell: true
    reading: "Переносну глибину почули й відклали заради знайомства саме з цією галуззю. Це легітимне й водночас вузьке вподобання; відмова — про фільтр, а не про інженерію."
non_inferences:
  - "Брак знання конкретного пропрієтарного протоколу не спростовує переносних загальноінженерних навичок."
---

# Надмірний акцент на вузькоспецифічному доменному досвіді

Інтервʼюер вимагає досвіду саме у вузькій галузі й ставить його вище за переносну інженерну глибину.

### Структурний контекст
- **Актор:** `hiring-manager`
- **Природа:** `bias`
- **Усувність:** `intermediary`

### Причинно-наслідкові звʼязки
- Посилює `mech.hidden_evaluation_rubric_or_undisclosed_priority` — Прихована шкала оцінки або неоголошений пріоритет
- Маскує `mech.genuine_technical_skill_shortfall` — Об’єктивна нестача технічної кваліфікації

### Не-висновки
- Брак знання конкретного пропрієтарного протоколу не спростовує переносних загальноінженерних навичок.
