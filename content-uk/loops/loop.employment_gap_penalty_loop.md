---
id: "loop.employment_gap_penalty_loop"
type: "loop"
aliases:
  - "L-001"
title: "Петля штрафу за перерву в роботі"
summary: "Перерва в роботі запускає автоматичне пониження в ранжуванні (mech.employment_gap_downranking_bias), через що профіль не проходить фільтри за ключовими словами й кваліфікацією (mech.automated_keyword_qualification_filter); через меншу кількість запрошень на інтервʼю перерва довшає, а довша перерва посилює пониження."
mechanisms:
  - "mech.employment_gap_downranking_bias"
  - "mech.automated_keyword_qualification_filter"
edges:
  -
    from: "mech.employment_gap_downranking_bias"
    to: "mech.automated_keyword_qualification_filter"
    relation: "amplifies"
  -
    from: "mech.automated_keyword_qualification_filter"
    to: "mech.employment_gap_downranking_bias"
    relation: "amplifies"
entry_points:
  - "mech.employment_gap_downranking_bias"
interventions:
  - "int.remove_career_gap_feature_from_automated_ranking_models"
specimens:
  -
    kind: "ats"
    label: "Той самий профіль через два цикли"
    context: "те саме резюме, той самий ринок, девʼять місяців різниці"
    lines:
      -
        text: "Цикл 1 — навички 91, домен 88, штраф за безперервність −22 (перерва 14 міс) → ранг 57"
        tell: true
      -
        text: "Цикл 2 — навички 91, домен 88, штраф за безперервність −34 (перерва 23 міс) → ранг 45"
        tell: true
      -
        text: "Поріг просування обидва рази: 60."
    reading: "Між цими двома рядками в роботі не змінилося нічого. Зрушила єдина змінна, яку читає штраф, — і зрушила саме тому, що першого разу штраф спрацював."
  -
    kind: "note"
    label: "Чому петля замикається"
    lines:
      -
        text: "Пониження в ранжуванні опускає профіль нижче порогу фільтра."
      -
        text: "Нижче порогу інтервʼю не буває."
      -
        text: "Без інтервʼю немає й офферу, тож перерва зростає далі."
      -
        text: "Довша перерва збільшує штраф на наступній заявці."
        tell: true
    reading: "Кожен крок окремо є розумним правилом. Разом вони утворюють цикл, входом якого є його ж вихід."
perspectives:
  -
    actor: "candidate"
    sees: "Заявки, на які немає жодної відповіді, або шаблонні відмови — з тим самим резюме й на тому самому ринку, що й у попередньому циклі."
    reads: "Між циклами в профілі щось зрушило, і єдине, що справді зрушило, — довжина самої перерви."
    does: "Продовжує подаватися, бо заявки — єдиний доступний вхід, а кожен місяць без інтервʼю додається до перерви, з якою піде наступна заявка."
  -
    actor: "recruiter"
    sees: "Ранжовану чергу з кількасот заявок, тоді як прочитати можна кілька десятків, і час до закриття вакансії, який вимірюють."
    reads: "Порядок у черзі — це сортування списку, який неможливо прочитати повністю, а не судження про когось із нього."
    does: "Читає згори вниз, доки не вичерпає тижневий ресурс, — і саме там ранжування стає рішенням."
  -
    actor: "ats-vendor"
    sees: "Ознаку безперервності, обчислену з дат у розпізнаній історії роботи, увімкнену за замовчуванням."
    reads: "Це один із входів ранжування, яке покупець оцінює за пропускною здатністю; а сама оцінка не фіксує, чи профіль опинився внизу тому, що його не вдалося прочитати, а не тому, що бракує кваліфікації."
    does: "Застосовує штраф на кожному проході підрахунку й лишає його налаштуванням, яке клієнт може вимкнути, — але жоден стандартний сценарій не підказує це зробити."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "evidence.duration_dependence_and_labor_market_conditions_evidence_from_a_field_experiment"
---

# Петля штрафу за перерву в роботі

Перерва в роботі запускає автоматичне пониження в ранжуванні (mech.employment_gap_downranking_bias), через що профіль не проходить фільтри за ключовими словами й кваліфікацією (mech.automated_keyword_qualification_filter); через меншу кількість запрошень на інтервʼю перерва довшає, а довша перерва посилює пониження.

### Динаміка циклу
Цей причинний цикл підсилює механізми з кожною ітерацією:
- `mech.employment_gap_downranking_bias` посилює `mech.automated_keyword_qualification_filter`
- `mech.automated_keyword_qualification_filter` посилює `mech.employment_gap_downranking_bias`
