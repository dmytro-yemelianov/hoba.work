---
id: "loop.inflated_requirements_search_saturation_loop"
type: "loop"
aliases:
  - "L-003"
title: "Петля завищених вимог і тривалого пошуку"
summary: "Команди пишуть завищені вимоги, які відсіюють сильних універсалів; пошук лишається відкритим місяцями, рекрутери втомлюються, а роль переписують посеред процесу."
mechanisms:
  - "mech.inflated_requisition_requirements_vs_actual_team_needs"
  - "mech.automated_keyword_qualification_filter"
  - "mech.mid_process_role_requirement_redefinition"
edges:
  -
    from: "mech.inflated_requisition_requirements_vs_actual_team_needs"
    to: "mech.automated_keyword_qualification_filter"
    relation: "amplifies"
  -
    from: "mech.automated_keyword_qualification_filter"
    to: "mech.mid_process_role_requirement_redefinition"
    relation: "amplifies"
  -
    from: "mech.mid_process_role_requirement_redefinition"
    to: "mech.inflated_requisition_requirements_vs_actual_team_needs"
    relation: "amplifies"
entry_points:
  - "mech.inflated_requisition_requirements_vs_actual_team_needs"
interventions:
  - "int.auto_close_stale_job_requisitions"
  - "int.standardized_late_stage_rejection_feedback_taxonomy"
  - "int.requirements_drawn_from_the_team_s_own_backlog"
specimens:
  -
    kind: "posting"
    label: "Та сама вакансія, переписана двічі"
    lines:
      -
        text: "Місяць 0 — 8 обовʼязкових технологій, 7+ років, обсяг staff-рівня. Заявок: 340. Дійшло до онсайту: 2. Найнято: 0."
      -
        text: "Місяць 3 — пошук досі відкритий. Вимоги переписали, піднявши планку: 10 технологій, 9+ років і формальний лід-досвід."
        tell: true
      -
        text: "Місяць 6 — пошук досі відкритий. Рекрутера переведено; команда закриває роботу понаднормово."
    reading: "Відповіддю на невдалий пошук став вужчий фільтр. Саме фільтр був причиною невдачі — і цей поворот робить історію петлею."
  -
    kind: "chat"
    label: "Звідки взялася вимога"
    lines:
      -
        speaker: "Рекрутер"
        at: "місяць 3"
        text: "Нам справді потрібні девʼять років і Rust? У беклозі переважно біллінгові ендпоінти."
      -
        speaker: "Менеджер із найму"
        at: "місяць 3"
        text: "За три місяці не подався ніхто, вартий уваги. Якщо знизимо планку — отримаємо більше того самого."
        tell: true
    reading: "Висновок іде у зворотний бік: порожній пайплайн читають як доказ, що планка занизька. Саме це прочитання робить наступну ітерацію ще жорсткішою."
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "Три місяці заявок, двох кандидатів, що дійшли до онсайту, жодного найму — і команду, яка закриває роботу понаднормово."
    reads: "У пайплайні немає нікого, кого хотіла б панель, а нижча планка додала б до того самого пулу, який уже відхилено."
    does: "Піднімає планку у вимогах, додає сигнал, якого бракувало, як формальну вимогу, і публікує знову: помилковий найм записують на нього, а відкриту вакансію — ні."
  -
    actor: "actor.recruiter"
    sees: "Вакансію, яка висить довше за нормативний час закриття, за яким її оцінюють, і список вимог, що після переписування став довшим."
    reads: "Вимоги — зона менеджера із найму, а він і є внутрішнім замовником цього пошуку."
    does: "Ставить питання один раз, публікує оновлений текст і переносить ресурс скринінгу на вакансії, які можна закрити."
  -
    actor: "actor.candidate"
    sees: "Вакансію з десятьма обовʼязковими технологіями, порогом у девʼять років і вимогою лід-досвіду — переопубліковану з довшим списком, ніж попередня версія."
    reads: "Цей список — або планка, або побажання, і оголошення не каже, що саме; роки досвіду — та частина, на яку фільтр здатен зреагувати."
    does: "Пропускає вакансію або подається попри список, якому не відповідає, і ніколи не дізнається, які саме вимоги насправді застосував скринінг."
status: "active"
evidence_level: "hypothesis"
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
  - "evidence.self_selected_survey_of_it_job_seekers_in_one_national_market_dou"
---

# Петля завищених вимог і тривалого пошуку

Команди пишуть завищені вимоги, які відсіюють сильних універсалів; пошук лишається відкритим місяцями, рекрутери втомлюються, а роль переписують посеред процесу.

### Динаміка циклу
Цей причинний цикл підсилює механізми з кожною ітерацією:
- `mech.inflated_requisition_requirements_vs_actual_team_needs` посилює `mech.automated_keyword_qualification_filter`
- `mech.automated_keyword_qualification_filter` посилює `mech.mid_process_role_requirement_redefinition`
- `mech.mid_process_role_requirement_redefinition` посилює `mech.inflated_requisition_requirements_vs_actual_team_needs`
