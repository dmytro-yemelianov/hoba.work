---
id: "mech.stale_or_orphaned_job_requisition"
type: "mechanism"
aliases:
  - "M-006"
title: "Застаріла або покинута вакансія"
summary: "Оголошення про роботу залишається активним на сайті, хоча команда припинила найм або зняла бюджет."
operates_at:
  - "bar.requisition_approval_public_posting"
  - "bar.application_ingestion"
  - "bar.automated_filter_parser_threshold"
  - "bar.inbound_screening_triage"
emissions:
  -
    artifact: "obs.complete_silence_after_submission"
    fidelity: "void"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
    observed_at: ["ingestion"]
  -
    artifact: "obs.materially_similar_role_reposted_shortly_after_rejection"
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
    observed_at: ["screening"]
facets:
  actor: "system"
  nature: "void"
  visibility: "opaque"
  removability: "none"
amplifies:
  - "mech.automated_application_expiration_timeout"
masks: []
perspectives:
  -
    actor: "actor.employer_policy"
    sees: "Вакансію, переведену в бюджеті у стан паузи або зняту з фінансування."
    reads: "Пауза зберігає можливість відновити пошук, а затвердження нічого не коштує, поки лишається невикористаним."
    does: "Фіксує зміну там, де ведуть бюджети. Зняти публічне оголошення — окрема дія в іншій системі, і бюджетне рішення її не запускає."
  -
    actor: "actor.ats_vendor"
    sees: "Запис оголошення в активному стані й заявки, що на нього надходять."
    reads: "Стан запису — поле, яким розпоряджається клієнт. Ніщо не відрізняє живий пошук від запису, який ніхто не закрив."
    does: "Далі показує й розсилає оголошення майданчиками та приймає заявки, а нерозглянуті заявки закриває, коли спрацьовує поріг автозакриття, увімкнений за замовчуванням."
  -
    actor: "actor.recruiter"
    sees: "Список вакансій у тому вигляді, в якому його тримає платформа, де оголошення без активного пошуку виглядає так само, як решта."
    reads: "Чи триває пошук — факт, який тримає команда, що його припинила, а не воронка."
    does: "Відповідає прямо й ініціює зняття оголошення, щойно надходить питання. Вакансія без пошуку за нею не потрапляє в час до закриття, а рахують саме його."
  -
    actor: "actor.candidate"
    sees: "Оголошення, яке видно на сайті компанії та на агрегаторах, і жодної відповіді після подачі."
    reads: "Тиша — той самий артефакт і тоді, коли запис лишили відкритим, і тоді, коли заявку прочитали й відклали."
    does: "Питає прямо, чи оголошення актуальне: це єдиний канал, який повертає стан запису. Фіксує дату кожної подачі."
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
specimens:
  -
    kind: "chat"
    label: "Питання, чи роль ще жива"
    lines:
      -
        speaker: "Кандидат"
        at: "день 0"
        text: "Я подавався на це в січні й ще раз у березні — оголошення актуальне?"
      -
        speaker: "Рекрутер"
        at: "день 2"
        text: "Зараз перевірю. Та команда припинила найм у грудні, оголошення мали зняти. Подбаю, щоб його прибрали."
        tell: true
    reading: "Оголошення не було приманкою й не було рішенням. Це запис, за який ніхто не відповідав, — і злитися тут варто на інше."
non_inferences:
  - "Тиша після заявки не відображає придатності кандидата."
---

# Застаріла або покинута вакансія

Оголошення про роботу залишається активним на сайті, хоча команда припинила найм або зняла бюджет.

### Структурний контекст
- **Актор:** `system`
- **Природа:** `void`
- **Усувність:** `none`

### Причинно-наслідкові звʼязки
- Посилює `mech.automated_application_expiration_timeout` — Автоматичне закриття заявки за таймаутом в ATS

### Не-висновки
- Тиша після заявки не відображає придатності кандидата.
