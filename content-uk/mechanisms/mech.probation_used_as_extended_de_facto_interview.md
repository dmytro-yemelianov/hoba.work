---
id: "mech.probation_used_as_extended_de_facto_interview"
type: "mechanism"
aliases:
  - "M-028"
title: "Використання випробувального терміну як подовженої співбесіди"
summary: "Керівники знижують вимоги на фінальних співбесідах, розглядаючи випробувальний термін як практичний етап відбору з легким звільненням у разі невідповідності."
operates_at:
  - "bar.probation_period_post_start_confirmation"
emissions:
  -
    artifact: "obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation"
    fidelity: "direct"
    likelihood: "medium"
    evidence:
      - "EVD-040"
      - "EVD-041"
    observed_at:
      - "post-offer"
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: []
    observed_at:
      - "post-offer"
  -
    artifact: "obs.rejection_naming_an_internal_hire_as_the_outcome"
    fidelity: "noise"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
facets:
  actor: "hiring-manager"
  nature: "incentive"
  visibility: "inferable"
  removability: "intermediary"
amplifies: []
masks: []
honest_baseline: false
status: "active"
evidence_level: "established"
evidence_ids:
  - "EVD-040"
  - "EVD-041"
specimens:
  -
    kind: "note"
    label: "Звіт про непроходження випробувального терміну"
    lines:
      -
        text: "Роботу кандидата оцінено протягом 60 днів."
        tell: false
      -
        text: "Темп виконання завдань не досяг очікуваного рівня автономності на другий місяць."
        tell: true
      -
        text: "Оформлено повідомлення про розірвання договору за статтею про випробувальний термін (EVD-040)."
        tell: false
    reading: "Етап співбесід було скорочено через переконання, що справжню кваліфікацію покаже лише реальна робота."
perspectives:
  -
    actor: "hiring-manager"
    sees: "Реальні робочі результати в спринтах, вважаючи випробувальний термін точнішим фільтром, ніж багатораундові інтерв'ю."
    reads: "Швидкий найм із відсіюванням на випробувальному терміні економить час інженерів на співбесіди."
    does: "Замінює тривалі технічні раунди практичною перевіркою під час випробувального терміну."
  -
    actor: "candidate"
    sees: "Повноцінний офер, який на практиці функціонує як тимчасовий контракт із підвищеним ризиком розірвання."
    reads: "Справжній бар'єр оцінки було перенесено на період після виходу на роботу без попередження."
    does: "Максимально викладається в перші місяці, зберігаючи контакти на ринку праці."
  -
    actor: "employer-policy"
    sees: "Статистику плинності на випробувальному терміні та документальне обґрунтування звільнень за законодавством (EVD-040)."
    reads: "Висока плинність на старті збільшує витрати на онбординг, хоча й залишається юридично коректною."
    does: "Відстежує відсоток проходження випробувального терміну та перевіряє правомірність рішень."
non_inferences:
  - "Не доводить факт грубого порушення трудової дисципліни."
---

# Використання випробувального терміну як подовженої співбесіди

Керівники знижують вимоги на фінальних співбесідах, розглядаючи випробувальний термін як практичний етап відбору з легким звільненням у разі невідповідності.

### Структурний контекст
- **Актор:** `hiring-manager`
- **Природа:** `incentive`
- **Усувність:** `intermediary`

### Не-висновки
- Не доводить факт грубого порушення трудової дисципліни.
