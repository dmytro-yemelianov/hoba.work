---
id: "proc.client_account_hiring_funnel"
type: "process"
aliases:
  - "WF-004"
title: "Найм під клієнтський контракт"
summary: "Від виникнення клієнтського попиту та контракту до передачі профілю, співбесіди у замовника й виходу на проєкт або тихого закриття пошуку."
subject: "місце, фінансоване контрактом замовника, і кандидат на шляху до нього"
states:
  -
    id: "demand"
    title: "Попит замовника та контур контракту"
    kind: "initial"
    owner: "actor.client"
    description: "Кінцевий клієнт відкриває потребу в інженерних ресурсах або оголошує тендер. Фінансування є реальним за підписаного контракту або ймовірнісним до виграшу тендеру."
    entities: []
    visible_to_candidate: "Нічого. Пошук не є публічним."
  -
    id: "search-open"
    title: "Відкриття пошуку вендором"
    kind: "active"
    owner: "actor.recruiter"
    description: "Рекрутери вендора розпочинають прямий сорсинг або публікацію оголошень. Що стоїть за пошуком — підписаний контракт чи очікування виграшу — не розкривається."
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
      - "mech.speculative_sourcing_talent_pooling_without_opening"
    visible_to_candidate: "Повідомлення про відкриту вакансію без комерційного контексту контракту."
  -
    id: "vendor-screen"
    title: "Скринінг рекрутером вендора"
    kind: "active"
    owner: "actor.recruiter"
    description: "Первинна розмова щодо досвіду та зарплатних очікувань з урахуванням планової маржі вендора."
    entities:
      - "bar.recruiter_screening_call"
      - "mech.unstated_compensation_band_discrepancy"
    visible_to_candidate: "Розмова з рекрутером, де вилка подається як власна внутрішня вилка компанії."
  -
    id: "vendor-technical"
    title: "Технічна оцінка вендором"
    kind: "active"
    owner: "actor.hiring_manager"
    description: "Технічне інтерв'ю або тестове завдання, оцінене за внутрішніми критеріями вендора щодо очікуваної планки клієнта."
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
    visible_to_candidate: "Технічний етап із технічними спеціалістами вендора."
  -
    id: "submitted"
    title: "Профіль передано замовнику"
    kind: "active"
    owner: "actor.client"
    description: "Резюме кандидата передається акаунт-команді клієнта для перегляду та відбору на клієнтську співбесіду."
    entities:
      - "bar.client_profile_approval_and_client_interview"
      - "obs.complete_silence_after_submission"
      - "obs.rejection_after_the_application_sat_pending_for_months"
    visible_to_candidate: "Тривалий період очікування, поки замовник розглядає передані профілі."
  -
    id: "client-interview"
    title: "Співбесіда із замовником"
    kind: "active"
    owner: "actor.client"
    description: "Співбесіда безпосередньо з технічною командою або керівництвом проєкту на стороні клієнта."
    entities:
      - "bar.client_profile_approval_and_client_interview"
      - "obs.generic_closer_alignment_rejection_template"
    visible_to_candidate: "Додаткова співбесіда, на якій оцінюється відповідність специфіці проєкту клієнта."
  -
    id: "offer"
    title: "Формування пропозиції"
    kind: "active"
    owner: "actor.recruiter"
    description: "Фіналізація пакета винагороди на основі білінгового рейту клієнта за вирахуванням маржі."
    entities:
      - "bar.compensation_levelling_reconciliation"
    visible_to_candidate: "Пропозиція роботи від імені вендора."
  -
    id: "verification"
    title: "Передпроєктна перевірка"
    kind: "active"
    owner: "actor.employer_policy"
    description: "Перевірка рекомендацій, сертифікатів та оформлення юридичних документів за вимогами клієнта."
    entities:
      - "bar.reference_background_verification"
    visible_to_candidate: "Запит документів та проходження перевірки бекграунду."
  -
    id: "placed"
    title: "Підписання контракту та старт на проєкті"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Підписання договору та інтеграція спеціаліста в активну команду проєкту клієнта."
    entities:
      - "bar.offer_closing_contract_execution"
    visible_to_candidate: "Підтверджена дата старту та вихід на проєкт."
  -
    id: "vendor-declined"
    title: "Відхилено вендором"
    kind: "terminal"
    owner: "actor.recruiter"
    description: "Процес зупинено на етапі внутрішнього скринінгу чи технічної оцінки до передачі резюме клієнту."
    entities:
      - "obs.generic_closer_alignment_rejection_template"
    visible_to_candidate: "Стандартне повідомлення про відмову від рекрутера вендора."
  -
    id: "declined-by-client"
    title: "Відхилено замовником"
    kind: "terminal"
    owner: "actor.client"
    description: "Клієнт відхилив передане резюме або відмовив кандидату за результатами клієнтської співбесіди."
    entities:
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.rejection_naming_an_internal_hire_as_the_outcome"
    visible_to_candidate: "Типова відмова, передана вендором без наведення деталей відмови замовника."
  -
    id: "closed-unfunded"
    title: "Пошук закрито без фінансування / тендер втрачено"
    kind: "terminal"
    owner: "actor.client"
    description: "Пошук зупинено через програш у тендері, скасування фінансування замовником або призупинення проєкту."
    entities:
      - "obs.complete_silence_after_submission"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
      - "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
    visible_to_candidate: "Раптове припинення комунікації або повідомлення про зміну планів замовника."
  -
    id: "bench-filled"
    title: "Позицію закрито внутрішнім бенчем"
    kind: "terminal"
    owner: "actor.employer_policy"
    description: "Позицію перекрито внутрішнім інженером компанії, який звільнився з іншого проєкту, що зупинило зовнішній процес."
    entities:
      - "obs.position_closed_after_final_interview_without_hire"
      - "obs.rejection_naming_an_internal_hire_as_the_outcome"
    visible_to_candidate: "Повідомлення про закриття пошуку після успішного проходження етапів."
transitions:
  -
    from: "demand"
    to: "search-open"
    owner: "actor.client"
    label: "Підписано контракт або оголошено тендер"
    guard: "Наявний підписаний комерційний договір або вимога надати резюме під тендер"
    latency_expected_days: 3
    latency_max_days: 10
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
  -
    from: "search-open"
    to: "vendor-screen"
    owner: "actor.recruiter"
    label: "Кандидат відповів на звернення"
    guard: "Звернення прийнято та погоджено час первинної розмови"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.outbound_sourcing_talent_pool_contact"
  -
    from: "search-open"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Тендер програно або контракт скасовано до початку співбесід"
    guard: "Комерційна можливість анульована до проведення оцінки"
    latency_expected_days: 7
    latency_max_days: 30
    entities: []
  -
    from: "vendor-screen"
    to: "vendor-technical"
    owner: "actor.recruiter"
    label: "Скринінг вендором пройдено"
    guard: "Зарплатні очікування відповідають розрахунковій маржі вендора"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.recruiter_screening_call"
  -
    from: "vendor-screen"
    to: "vendor-declined"
    owner: "actor.recruiter"
    label: "Невідповідність очікувань за ставкою або профілем"
    guard: "Запит перевищує допустиму маржу вендора або профіль не відповідає вакансії"
    latency_expected_days: 2
    latency_max_days: 5
    entities: []
  -
    from: "vendor-technical"
    to: "submitted"
    owner: "actor.hiring_manager"
    label: "Технічну оцінку вендора пройдено"
    guard: "Рівень відповідає внутрішньому уявленню вендора про вимоги замовника"
    latency_expected_days: 4
    latency_max_days: 10
    entities:
      - "bar.technical_screen_live_assessment"
      - "bar.take_home_work_sample_evaluation"
  -
    from: "vendor-technical"
    to: "vendor-declined"
    owner: "actor.hiring_manager"
    label: "Технічну оцінку не пройдено"
    guard: "Профіль не досягає внутрішньої планки вендора"
    latency_expected_days: 3
    latency_max_days: 7
    entities: []
  -
    from: "submitted"
    to: "client-interview"
    owner: "actor.client"
    label: "Замовник погодив резюме"
    guard: "Менеджер клієнта схвалив профіль та призначив інтерв'ю"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "submitted"
    to: "declined-by-client"
    owner: "actor.client"
    label: "Замовник відхилив резюме"
    guard: "Менеджер замовника відхилив кандидата на етапі скринінгу резюме"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "submitted"
    to: "bench-filled"
    owner: "actor.employer_policy"
    label: "Вендор призначив внутрішнього спеціаліста"
    guard: "Внутрішній спеціаліст звільнився з іншого проєкту під час пошуку"
    latency_expected_days: 3
    latency_max_days: 10
    entities: []
  -
    from: "submitted"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Замовник скасував позицію або втратив бюджет"
    guard: "Клієнт відкликав запит під час розгляду профілів"
    latency_expected_days: 7
    latency_max_days: 30
    entities: []
  -
    from: "client-interview"
    to: "offer"
    owner: "actor.client"
    label: "Замовник погодив кандидата після співбесіди"
    guard: "Клієнт підтвердив відповідність кандидата вимогам команди проєкту"
    latency_expected_days: 4
    latency_max_days: 10
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "client-interview"
    to: "declined-by-client"
    owner: "actor.client"
    label: "Замовник відмовив після співбесіди"
    guard: "Клієнт вирішив не продовжувати співпрацю після зустрічі"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.client_profile_approval_and_client_interview"
  -
    from: "offer"
    to: "verification"
    owner: "actor.recruiter"
    label: "Пропозицію узгоджено та підготовлено договір"
    guard: "Кандидат прийняв запропоновані умови"
    latency_expected_days: 3
    latency_max_days: 7
    entities:
      - "bar.compensation_levelling_reconciliation"
  -
    from: "offer"
    to: "closed-unfunded"
    owner: "actor.client"
    label: "Замовник зупинив проєкт до фінального підписання"
    guard: "Клієнт скасував фінансування після виставлення пропозиції"
    latency_expected_days: 4
    latency_max_days: 14
    entities: []
  -
    from: "verification"
    to: "placed"
    owner: "actor.employer_policy"
    label: "Перевірку пройдено та погоджено дату виходу"
    guard: "Документи оформлено, розпочато онбординг на проєкт замовника"
    latency_expected_days: 5
    latency_max_days: 14
    entities:
      - "bar.reference_background_verification"
      - "bar.offer_closing_contract_execution"
      - "bar.probation_period_post_start_confirmation"
specimens: []
status: "active"
evidence_level: "strongly_supported"
evidence_ids: []
---

# Найм під клієнтський контракт

Від виникнення клієнтського попиту та контракту до передачі профілю, співбесіди у замовника й виходу на проєкт або тихого закриття пошуку.
