import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// ==========================================
// 1. BARRIERS (12)
// ==========================================
const barriers = [
  {
    id: 'HOBA-B-001',
    title: 'Application Ingestion',
    titleUk: 'Реєстрація та прийом заявки',
    stage: 'ingestion',
    order: 1,
    precedes: ['HOBA-B-002'],
    description: 'The initial ingestion gate where candidate CV and structured application fields enter the talent acquisition database / ATS.',
    descriptionUk: 'Початковий шлюз прийому, де резюме кандидата та структуровані поля заявки потрапляють до бази даних ATS.',
    pass_condition: 'Application record is successfully received, validated for minimum schema, and linked to the active job requisition.',
    pass_conditionUk: 'Запис заявки успішно отримано, перевірено на мінімальну відповідність схемі та прив’язано до активної вакансії.',
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-B-002',
    title: 'Automated Filter & Parser Threshold',
    titleUk: 'Автоматичний фільтр та поріг парсера',
    stage: 'ingestion',
    order: 2,
    precedes: ['HOBA-B-003', 'HOBA-B-004'],
    description: 'Algorithmic text extraction, keyword scoring, compliance screening (location/work authorization), and knockout question evaluations.',
    descriptionUk: 'Алгоритмічний парсинг тексту, підрахунок ключових слів, перевірка відповідності (локація/дозвіл на роботу) та відсіювальні питання.',
    pass_condition: 'CV parsing achieves sufficient extraction score and candidate passes all mandatory algorithmic gating rules.',
    pass_conditionUk: 'Парсинг резюме набирає достатній бал, і кандидат проходить усі обов’язкові правила фільтрації.',
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-B-003',
    title: 'Sourcing & Inbound Triage',
    titleUk: 'Сорсинг та первинне сортування',
    stage: 'sourcing',
    order: 3,
    precedes: ['HOBA-B-004'],
    description: 'Recruiter or sourcing coordinator manual review of parsed inbound applications vs active outbound talent pipelines.',
    descriptionUk: 'Ручний перегляд отриманих заявок рекрутером або сорсером у порівнянні з активними кандидатами з прямого пошуку.',
    pass_condition: 'Recruiter assigns application to the active short-list for initial conversational outreach.',
    pass_conditionUk: 'Рекрутер вносить заявку до короткого списку для первинного контакту.',
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-B-004',
    title: 'Recruiter Screening Call',
    titleUk: 'Скринінг-інтерв’ю з рекрутером',
    stage: 'recruiter',
    order: 4,
    precedes: ['HOBA-B-005'],
    description: 'Initial conversational interview evaluating salary expectations, timeline, communication, English fluency, and high-level role alignment.',
    descriptionUk: 'Первинна розмова для оцінки зарплатних очікувань, термінів, комунікації, рівня англійської та загальної відповідності ролі.',
    pass_condition: 'Recruiter and candidate align on core parameters and candidate is submitted to hiring team.',
    pass_conditionUk: 'Рекрутер та кандидат узгоджують ключові параметри, і профіль передається команді найму.',
    evidence_ids: ['EVD-001', 'EVD-005']
  },
  {
    id: 'HOBA-B-005',
    title: 'Technical Screen / Live Assessment',
    titleUk: 'Технічний скринінг / Лайв-кодинг',
    stage: 'technical',
    order: 5,
    precedes: ['HOBA-B-006', 'HOBA-B-007'],
    description: 'Synchronous technical evaluation assessing core technical competencies, problem-solving speed, and system architecture fundamentals.',
    descriptionUk: 'Синхронна технічна оцінка базових компетенцій, швидкості розв’язання задач та архітектурних основ.',
    pass_condition: 'Candidate achieves passing score on technical evaluation rubric from the assessing engineer.',
    pass_conditionUk: 'Кандидат отримує прохідний бал за технічною шкалою оцінювання від інженера.',
    evidence_ids: ['EVD-006']
  },
  {
    id: 'HOBA-B-006',
    title: 'Take-Home / Work Sample Evaluation',
    titleUk: 'Оцінка тестового завдання / Work Sample',
    stage: 'technical',
    order: 6,
    precedes: ['HOBA-B-007'],
    description: 'Asynchronous technical assignment or project artifact reviewed by engineering peers against quality benchmarks.',
    descriptionUk: 'Асинхронне тестове завдання або практичний проект, що перевіряється інженерами команди.',
    pass_condition: 'Code artifact satisfies architectural, functional, test coverage, and documentation requirements.',
    pass_conditionUk: 'Артефакт коду задовольняє функціональним вимогам, якості архітектури, тестам та документації.',
    evidence_ids: ['EVD-006']
  },
  {
    id: 'HOBA-B-007',
    title: 'Hiring Manager In-Depth Review',
    titleUk: 'Поглиблене інтерв’ю з наймаючим менеджером',
    stage: 'screening',
    order: 7,
    precedes: ['HOBA-B-008'],
    description: 'Detailed evaluation of candidate seniority, project ownership history, trade-off reasoning, and team-specific mission fit.',
    descriptionUk: 'Детальна оцінка сеньйорності кандидата, досвіду володіння проектами та відповідності завданням конкретної команди.',
    pass_condition: 'Hiring manager confirms candidate has required depth and approves progression to final panel.',
    pass_conditionUk: 'Менеджер підтверджує достатній рівень глибини та схвалює перехід до фінального етапу.',
    evidence_ids: ['EVD-002']
  },
  {
    id: 'HOBA-B-008',
    title: 'Team & Cross-Functional Panel',
    titleUk: 'Командне та крос-функціональне інтерв’ю',
    stage: 'team',
    order: 8,
    precedes: ['HOBA-B-009'],
    description: 'Multi-interviewer round assessing collaborative problem solving, code review etiquette, cross-functional communication, and cultural norms.',
    descriptionUk: 'Етап з кількома інтерв’юерами для перевірки спільної роботи, культури code review та комунікації.',
    pass_condition: 'Consensus score among team panelists meets or exceeds hire recommendation threshold.',
    pass_conditionUk: 'Консенсусний бал серед учасників панелі відповідає або перевищує поріг рекомендації до найму.',
    evidence_ids: ['EVD-006']
  },
  {
    id: 'HOBA-B-009',
    title: 'Compensation & Leveling Reconciliation',
    titleUk: 'Узгодження компенсації та грейду',
    stage: 'compensation',
    order: 9,
    precedes: ['HOBA-B-010'],
    description: 'Internal alignment between candidate expected compensation/level and company pay bands / leveling grid.',
    descriptionUk: 'Внутрішнє узгодження очікувань кандидата з зарплатною сіткою та системою грейдів компанії.',
    pass_condition: 'Candidate expectations fit within approved salary band and equity guidelines for the target grade.',
    pass_conditionUk: 'Очікування кандидата вкладаються у затверджений зарплатний діапазон для відповідного грейду.',
    evidence_ids: ['EVD-002', 'EVD-005']
  },
  {
    id: 'HOBA-B-010',
    title: 'Headcount & Executive Budget Approval',
    titleUk: 'Авторизація бюджету та headcount',
    stage: 'offer',
    order: 10,
    precedes: ['HOBA-B-011'],
    description: 'Formal sign-off by department leadership, finance, and talent committee to commit budget for the written offer.',
    descriptionUk: 'Офіційне затвердження керівництвом департаменту, фінансами та HR для формування офіційного офферу.',
    pass_condition: 'Active headcount requisition is formally certified and unblocked by financial leadership.',
    pass_conditionUk: 'Вакансія офіційно підтверджена та розблокована фінансовим керівництвом.',
    evidence_ids: ['EVD-004']
  },
  {
    id: 'HOBA-B-011',
    title: 'Reference & Background Verification',
    titleUk: 'Перевірка рекомендацій та бекграунду',
    stage: 'post-offer',
    order: 11,
    precedes: ['HOBA-B-012'],
    description: 'Third-party or internal verification of past employment records, academic degrees, and professional references.',
    descriptionUk: 'Перевірка попереднього досвіду роботи, освіти та рекомендацій від колишніх керівників чи колег.',
    pass_condition: 'All mandatory background checks clear with no unresolved factual discrepancies.',
    pass_conditionUk: 'Усі обов’язкові перевірки бекграунду пройдені без нерозв’язаних розбіжностей.',
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-B-012',
    title: 'Offer Closing & Contract Execution',
    titleUk: 'Закриття офферу та підписання контракту',
    stage: 'post-offer',
    order: 12,
    precedes: [],
    description: 'Final mutual execution of the formal employment agreement and start-date confirmation.',
    descriptionUk: 'Фінальне взаємне підписання трудового договору та підтвердження дати виходу на роботу.',
    pass_condition: 'Both parties sign offer contract and onboarding workflow is triggered.',
    pass_conditionUk: 'Обидві сторони підписують контракт, і запускається процес онбордингу.',
    evidence_ids: ['EVD-004']
  }
];

// ==========================================
// 2. ARTIFACTS / OBSERVATIONS (14)
// ==========================================
const artifacts = [
  {
    id: 'HOBA-A-001',
    title: 'Complete silence after submission',
    titleUk: 'Повна тиша після відправки заявки',
    summary: 'No automated receipt, acknowledgement, rejection, or recruiter outreach is received following application submission.',
    summaryUk: 'Жодного автоматичного підтвердження, відмови чи повідомлення від рекрутера після відправки резюме.',
    stages: ['ingestion', 'sourcing'],
    evidence_ids: ['EVD-001'],
    probes: [
      {
        id: 'PROBE-A-001-1',
        action: 'Check email spam and security quarantine folders for ATS automated acknowledgement tokens.',
        expected_signal: 'Confirms whether application was ingested and generated a confirmation ID.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove the application was reviewed by a human.',
      'Does not prove the role was cancelled or already filled.'
    ]
  },
  {
    id: 'HOBA-A-002',
    title: 'Generic "closer alignment" rejection template',
    titleUk: 'Шаблонна відмова про "кандидата з більшою відповідністю"',
    summary: 'Standard automated email stating the team decided to proceed with candidates whose profiles more closely match role requirements.',
    summaryUk: 'Стандартний лист про те, що компанія вирішила рухатися далі з кандидатами, чий досвід точніше відповідає ролі.',
    stages: ['screening', 'recruiter', 'technical'],
    evidence_ids: ['EVD-001'],
    probes: [
      {
        id: 'PROBE-A-002-1',
        action: 'Compare CV keyword density with exact requirement phrases in the published job description.',
        expected_signal: 'Reveals potential vocabulary mismatch between candidate phrasing and ATS rubric.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not establish which specific skill was deemed insufficient.',
      'Does not establish whether a human reviewer read the full resume.'
    ]
  },
  {
    id: 'HOBA-A-003',
    title: 'Position closed after final interview without hire',
    titleUk: 'Вакансію закрито після фінального етапу без найму',
    summary: 'Candidate completes all interview rounds, but is informed that the requisition has been cancelled, frozen, or closed.',
    summaryUk: 'Кандидат проходить усі етапи інтерв’ю, після чого повідомляють, що вакансію заморожено або закрито.',
    stages: ['team', 'offer'],
    evidence_ids: ['EVD-004'],
    probes: [
      {
        id: 'PROBE-A-003-1',
        action: 'Politely inquire with recruiter if the position was closed due to business budget restructuring or team reallocation.',
        expected_signal: 'Clarifies whether barrier was candidate-specific or macroeconomic/budgetary.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove candidate failed technical or behavioral evaluations.',
      'Does not prove the company lied about opening intention.'
    ]
  },
  {
    id: 'HOBA-A-004',
    title: 'Materially similar role reposted shortly after rejection',
    titleUk: 'Схожа вакансія перевикладена невдовзі після відмови',
    summary: 'Candidate observes the same or near-identical job listing reposted or refreshed on job boards within 1–8 weeks of rejection.',
    summaryUk: 'Кандидат бачить ту саму або майже ідентичну вакансію, опубліковану знову через 1–8 тижнів після відмови.',
    stages: ['sourcing', 'screening', 'technical'],
    evidence_ids: ['EVD-004'],
    probes: [
      {
        id: 'PROBE-A-004-1',
        action: 'Check job listing requisition ID or ask recruiter whether the posting is an automated ATS refresh or a distinct headcount opening.',
        expected_signal: 'Distinguishes between automated job board bot refreshes and genuine recurring hiring demand.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not establish that the role was a "fake" or "ghost" posting.',
      'Does not establish that the prior interview feedback was fraudulent.'
    ]
  },
  {
    id: 'HOBA-A-005',
    title: 'Compensation band reduced or altered mid-process',
    titleUk: 'Зниження або зміна зарплатної вилки під час процесу',
    summary: 'Offered or discussed compensation band is revised downward from previously agreed or advertised range.',
    summaryUk: 'Запропонований рівень зарплати знижується порівняно з раніше обговореним або заявленим діапазоном.',
    stages: ['recruiter', 'compensation', 'offer'],
    evidence_ids: ['EVD-005'],
    probes: [
      {
        id: 'PROBE-A-005-1',
        action: 'Request clarification on whether the revised band reflects a lower leveling grade or a company-wide budget adjustment.',
        expected_signal: 'Separates leveling evaluation outcome from company financial constraints.',
        cost: 'medium'
      }
    ],
    non_inferences: [
      'Does not prove intentional bait-and-switch malice unless verified by company policy evidence.'
    ]
  },
  {
    id: 'HOBA-A-006',
    title: 'Take-home assignment exceeding reasonable stated scope',
    titleUk: 'Тестове завдання суттєво перевищує заявлений обсяг',
    summary: 'Take-home assignment requires building complex production-grade features demanding 20+ hours instead of stated 2–4 hours.',
    summaryUk: 'Тестове завдання вимагає побудови складної повноцінної системи, що забирає 20+ годин замість заявлених 2–4.',
    stages: ['technical'],
    evidence_ids: ['EVD-006'],
    probes: [
      {
        id: 'PROBE-A-006-1',
        action: 'Define explicit boundaries and trade-offs in submission README stating assumptions made to fit the agreed timebox.',
        expected_signal: 'Tests whether evaluators value scope management and communication over unbounded free work.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove the company is harvesting free intellectual property for production use.'
    ]
  },
  {
    id: 'HOBA-A-007',
    title: 'Multiple interview reschedulings or interviewer no-show',
    titleUk: 'Багаторазові переноси інтерв’ю або неявка інтерв’юера',
    summary: 'Interviews are repeatedly postponed, delayed at short notice, or interviewer fails to join scheduled call.',
    summaryUk: 'Інтерв’ю переносяться кілька разів, скасовуються в останній момент або інтерв’юер не з’являється на зустріч.',
    stages: ['recruiter', 'technical', 'team'],
    evidence_ids: ['EVD-001'],
    probes: [
      {
        id: 'PROBE-A-007-1',
        action: 'Offer clear flexible availability slots and confirm contact details 2 hours prior to the call.',
        expected_signal: 'Minimizes scheduling friction and verifies recruiter responsiveness.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not imply candidate rejection; frequently reflects interviewer calendar congestion or emergency incidents.'
    ]
  },
  {
    id: 'HOBA-A-008',
    title: 'Explicit feedback citing skill-depth shortfall',
    titleUk: 'Конкретний фідбек про брак глибини у конкретній навичці',
    summary: 'Interviewer or recruiter provides structured notes citing a specific deficit in algorithmic complexity, architecture, or tool mastery.',
    summaryUk: 'Інтерв’юер або рекрутер надає конкретні зауваження щодо недостатньої глибини в алгоритмах, системному дизайні чи інструментах.',
    stages: ['technical', 'team'],
    evidence_ids: ['EVD-006'],
    probes: [
      {
        id: 'PROBE-A-008-1',
        action: 'Review interview problem solution against industry standard patterns and identify edge cases missed.',
        expected_signal: 'Verifies whether candidate code truly lacked required optimization or rigor.',
        cost: 'medium'
      }
    ],
    non_inferences: [
      'Does not imply general incompetence; reflects threshold for this specific role level.'
    ]
  },
  {
    id: 'HOBA-A-009',
    title: 'Rejection within minutes of application submission',
    titleUk: 'Відмова протягом кількох хвилин після відправки',
    summary: 'Automated rejection email arrives within 2 to 30 minutes of form submission, outside human business hours.',
    summaryUk: 'Автоматична відмова надходить через 2–30 хвилин після подачі, часто у неробочий час.',
    stages: ['ingestion'],
    evidence_ids: ['EVD-001'],
    probes: [
      {
        id: 'PROBE-A-009-1',
        action: 'Audit application answers to mandatory knock-out questions (work permit, country of residence, minimum years experience).',
        expected_signal: 'Identifies exact boolean filter rule triggered by ATS.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not imply candidate resume was judged as poor by human engineers.'
    ]
  },
  {
    id: 'HOBA-A-010',
    title: 'Communication mismatch or tone friction in panel',
    titleUk: 'Комунікаційне тертя або невідповідність тону під час панелі',
    summary: 'Noticeable divergence in communication style, pacing, or terminology during live panel discussions.',
    summaryUk: 'Відчутна розбіжність у стилі комунікації, темпі або термінології під час живого спілкування з командою.',
    stages: ['recruiter', 'team'],
    evidence_ids: ['EVD-006'],
    probes: [
      {
        id: 'PROBE-A-010-1',
        action: 'Request explicit feedback on collaborative dynamic from recruiter.',
        expected_signal: 'Clarifies whether friction was perceived as attitude issue or stylistic preference.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove candidate lacks teamwork skills globally.'
    ]
  },
  {
    id: 'HOBA-A-011',
    title: 'Offer rescinded or delayed due to internal freeze',
    titleUk: 'Оффер відкликано або відкладено через внутрішній фриз',
    summary: 'Candidate is verbally offered a role or receives written offer which is subsequently delayed or retracted before start date.',
    summaryUk: 'Кандидату озвучено оффер, який згодом затримують або скасовують до дати виходу через рішення керівництва.',
    stages: ['offer', 'post-offer'],
    evidence_ids: ['EVD-004'],
    probes: [
      {
        id: 'PROBE-A-011-1',
        action: 'Request formal written notice regarding whether requisition is permanently cancelled or deferred to next fiscal quarter.',
        expected_signal: 'Provides timeline clarity for candidate decision-making.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not imply candidate failed reference checks unless explicitly stated.'
    ]
  },
  {
    id: 'HOBA-A-012',
    title: 'Unsolicited recruiter outreach followed by ghosting',
    titleUk: 'Вхідне повідомлення від рекрутера з подальшим зникненням',
    summary: 'Recruiter initiates direct outreach expressing strong interest, but ceases communication after candidate responds with availability.',
    summaryUk: 'Рекрутер сам пише кандидату про зацікавленість, але зникає після того, як кандидат надає резюме або слоти для дзвінка.',
    stages: ['sourcing', 'recruiter'],
    evidence_ids: ['EVD-001'],
    probes: [
      {
        id: 'PROBE-A-012-1',
        action: 'Send one single polite follow-up after 5 business days referencing original outreach thread.',
        expected_signal: 'Recovers stalled conversation if recruiter was out-of-office or overwhelmed.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove candidate profile was rejected; often indicates batch automated sourcing campaigns.'
    ]
  },
  {
    id: 'HOBA-A-013',
    title: 'Feedback stating candidate is overqualified for the grade',
    titleUk: 'Фідбек про надмірну кваліфікацію (overqualified) для грейду',
    summary: 'Candidate is rejected on the grounds that their experience, seniority, or previous scope exceeds the open position tier.',
    summaryUk: 'Кандидату відмовляють з поясненням, що його досвід та сеньйорність перевищують рамки відкритої вакансії.',
    stages: ['recruiter', 'screening', 'team'],
    evidence_ids: ['EVD-002'],
    probes: [
      {
        id: 'PROBE-A-013-1',
        action: 'Inquire whether the organization has higher-tier or staff-level requisitions open where broader scope is desired.',
        expected_signal: 'Channels candidate into appropriate leveling track.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not imply the candidate is undesirable, but signals retention/flight-risk and compensation mismatch concerns.'
    ]
  },
  {
    id: 'HOBA-A-014',
    title: 'Conflicting feedback across different interviewers',
    titleUk: 'Суперечливий фідбек від різних інтерв’юерів',
    summary: 'Feedback from one round praises architectural depth while another round claims insufficient technical background.',
    summaryUk: 'Один інтерв’юер хвалить системний дизайн, а інший стверджує про слабку технічну базу.',
    stages: ['technical', 'team'],
    evidence_ids: ['EVD-006'],
    probes: [
      {
        id: 'PROBE-A-014-1',
        action: 'Request aggregated hiring rubric summary from talent partner.',
        expected_signal: 'Reveals whether team had misaligned internal evaluation criteria.',
        cost: 'low'
      }
    ],
    non_inferences: [
      'Does not prove bad faith; highlights lack of rubric calibration across the hiring committee.'
    ]
  }
];

// ==========================================
// 3. MECHANISMS (24)
// ==========================================
const mechanisms = [
  {
    id: 'HOBA-M-001',
    title: 'Genuine Technical Skill Shortfall',
    titleUk: 'Об’єктивна нестача технічної кваліфікації',
    summary: 'The candidate’s verified technical execution or domain depth does not meet the established baseline for the role level.',
    summaryUk: 'Перевірений рівень технічних знань кандидата об’єктивно не досягає необхідного стандарту для цієї ролі.',
    operates_at: ['HOBA-B-005', 'HOBA-B-006', 'HOBA-B-007'],
    emissions: [
      { artifact: 'HOBA-A-008', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-006'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'candidate',
      nature: 'rule',
      visibility: 'inferable',
      removability: 'candidate'
    },
    amplifies: [],
    masks: [],
    honest_baseline: true,
    evidence_level: 'established',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Rejection does not mean the candidate has no engineering ability, only that the requirement bar was unmet for this specific benchmark.'
    ]
  },
  {
    id: 'HOBA-M-002',
    title: 'Stronger Competing Candidate in Final Cohort',
    titleUk: 'Сильніший конкурентний кандидат у фінальній групі',
    summary: 'Candidate cleared all passing bars, but another applicant in the same pipeline demonstrated superior domain overlap or lower onboarding overhead.',
    summaryUk: 'Кандидат успішно пройшов усі пороги, але інший кандидат у когорті показав кращу специфічну експертизу або менший час адаптації.',
    operates_at: ['HOBA-B-007', 'HOBA-B-008', 'HOBA-B-010'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-003', fidelity: 'distortion', likelihood: 'low', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'candidate',
      nature: 'rule',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: [],
    masks: ['HOBA-M-001'],
    honest_baseline: true,
    evidence_level: 'established',
    evidence_ids: ['EVD-001', 'EVD-006'],
    non_inferences: [
      'Does not mean candidate had negative feedback; relative cohort ranking is outside candidate control.'
    ]
  },
  {
    id: 'HOBA-M-003',
    title: 'ATS Parser Extraction Failure',
    titleUk: 'Збій екстракції даних парсером ATS',
    summary: 'Multi-column formatting, graphics, custom fonts, or unsupported document layouts cause ATS parser to corrupt or omit critical work history.',
    summaryUk: 'Складна верстка резюме у дві колонки, таблиці чи нестандартні шрифти призводять до спотворення даних парсером ATS.',
    operates_at: ['HOBA-B-001', 'HOBA-B-002'],
    emissions: [
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'medium', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-009', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'system',
      nature: 'noise',
      visibility: 'inferable',
      removability: 'candidate'
    },
    amplifies: ['HOBA-M-008'],
    masks: [],
    evidence_level: 'established',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Does not imply human recruiter evaluated and disliked candidate experience.'
    ]
  },
  {
    id: 'HOBA-M-004',
    title: 'Unstated Compensation Band Discrepancy',
    titleUk: 'Неоголошена невідповідність зарплатних очікувань',
    summary: 'Candidate market rate exceeds budgeted compensation for the requisition, but salary band was never published or clarified early.',
    summaryUk: 'Ринкова вартість кандидата перевищує внутрішній бюджет вакансії, який не був озвучений на старті.',
    operates_at: ['HOBA-B-004', 'HOBA-B-009'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-005'] },
      { artifact: 'HOBA-A-005', fidelity: 'direct', likelihood: 'medium', evidence: ['EVD-005'] },
      { artifact: 'HOBA-A-013', fidelity: 'euphemism', likelihood: 'medium', evidence: ['EVD-002'] }
    ],
    facets: {
      actor: 'policy',
      nature: 'rule',
      visibility: 'opaque',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-013'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-005'],
    non_inferences: [
      'Rejection does not mean candidate is overpriced for the market, only mismatched with this specific employer budget.'
    ]
  },
  {
    id: 'HOBA-M-005',
    title: 'Pre-Selected Internal Candidate',
    titleUk: 'Попередньо обраний внутрішній кандидат',
    summary: 'Requisition was publicly advertised to satisfy corporate policy or legal compliance while an internal employee was already earmarked for the role.',
    summaryUk: 'Вакансія була опублікована для виконання формальних вимог чи комплаєнсу, хоча внутрішнього кандидата вже було визначено.',
    operates_at: ['HOBA-B-001', 'HOBA-B-003', 'HOBA-B-007'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-004'] },
      { artifact: 'HOBA-A-003', fidelity: 'euphemism', likelihood: 'medium', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'policy',
      nature: 'incentive',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: [],
    masks: ['HOBA-M-002'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-004'],
    non_inferences: [
      'Cannot be asserted as fact without internal hiring log confirmation.'
    ]
  },
  {
    id: 'HOBA-M-006',
    title: 'Stale or Orphaned Job Requisition',
    titleUk: 'Застаріла або покинута вакансія',
    summary: 'Job posting remains active on careers page and aggregator portals despite the team having ceased active hiring or closed headcount.',
    summaryUk: 'Оголошення про роботу залишається активним на сайті, хоча команда припинила найм або зняла бюджет.',
    operates_at: ['HOBA-B-001', 'HOBA-B-002', 'HOBA-B-003'],
    emissions: [
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'high', evidence: ['EVD-004'] },
      { artifact: 'HOBA-A-004', fidelity: 'noise', likelihood: 'medium', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'system',
      nature: 'void',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: ['HOBA-M-020'],
    masks: [],
    evidence_level: 'established',
    evidence_ids: ['EVD-004'],
    non_inferences: [
      'Application silence does not reflect candidate suitability.'
    ]
  },
  {
    id: 'HOBA-M-007',
    title: 'Headcount Freeze or Budget Cancellation',
    titleUk: 'Замороження headcount або скасування бюджету',
    summary: 'Executive leadership or finance halts all new hires across division due to macroeconomic factors or revenue shifts mid-interview process.',
    summaryUk: 'Керівництво або фінансовий відділ блокує нові найми через зміну бюджету під час триваючого процесу інтерв’ю.',
    operates_at: ['HOBA-B-008', 'HOBA-B-010', 'HOBA-B-012'],
    emissions: [
      { artifact: 'HOBA-A-003', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-004'] },
      { artifact: 'HOBA-A-011', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'policy',
      nature: 'rule',
      visibility: 'inferable',
      removability: 'none'
    },
    amplifies: ['HOBA-M-006'],
    masks: ['HOBA-M-001', 'HOBA-M-002'],
    evidence_level: 'established',
    evidence_ids: ['EVD-004'],
    non_inferences: [
      'Candidate performance in interview was not the causal trigger for process termination.'
    ]
  },
  {
    id: 'HOBA-M-008',
    title: 'Automated Keyword / Qualification Filter',
    titleUk: 'Автоматичний фільтр за ключовими словами та роками',
    summary: 'Deterministic filter rejecting applications missing exact acronyms, certifications, or specific years-of-experience thresholds.',
    summaryUk: 'Детермінований фільтр, що відсіює заявки за відсутністю точних абревіатур, сертифікатів або мінімальної кількості років досвіду.',
    operates_at: ['HOBA-B-002'],
    emissions: [
      { artifact: 'HOBA-A-009', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'system',
      nature: 'rule',
      visibility: 'inferable',
      removability: 'candidate'
    },
    amplifies: ['HOBA-M-011'],
    masks: [],
    evidence_level: 'established',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Passing keyword filters does not guarantee interview invitation.'
    ]
  },
  {
    id: 'HOBA-M-009',
    title: 'Recruiter Volume & Quota Incentive Distortion',
    titleUk: 'Спотворення через метрики та квоти рекрутера',
    summary: 'Recruiters optimize for pipeline velocity and superficial pattern-matching due to overwhelming applicant volume (500+ per req).',
    summaryUk: 'Рекрутери змушені швидко сканувати профілі (по 5-10 секунд) через великий обсяг заявок, віддаючи перевагу шаблонам.',
    operates_at: ['HOBA-B-003', 'HOBA-B-004'],
    emissions: [
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-012', fidelity: 'noise', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'recruiter',
      nature: 'incentive',
      visibility: 'inferable',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-012'],
    masks: ['HOBA-M-008'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Does not mean recruiter is individually negligent; reflects structural capacity mismatch.'
    ]
  },
  {
    id: 'HOBA-M-010',
    title: 'Hidden Evaluation Rubric or Undisclosed Priority',
    titleUk: 'Прихована шкала оцінки або неоголошений пріоритет',
    summary: 'The interview team grades candidate against specific undisclosed architectural dogmas, internal frameworks, or unwritten biases.',
    summaryUk: 'Команда інтерв’ю оцінює кандидата за внутрішніми специфічними уподобаннями, які не були вказані в описі вакансії.',
    operates_at: ['HOBA-B-005', 'HOBA-B-007', 'HOBA-B-008'],
    emissions: [
      { artifact: 'HOBA-A-008', fidelity: 'distortion', likelihood: 'medium', evidence: ['EVD-006'] },
      { artifact: 'HOBA-A-014', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-006'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'bias',
      visibility: 'opaque',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-022'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Failure to guess unstated preferences is not equivalent to lack of core competence.'
    ]
  },
  {
    id: 'HOBA-M-011',
    title: 'Employment Gap Downranking Bias',
    titleUk: 'Упередження та пенальті за перерву в роботі',
    summary: 'Automated ranking algorithms or human screeners discount candidates with recent career breaks regardless of verified project history.',
    summaryUk: 'Алгоритми або рекрутери автоматично знижують пріоритет кандидатів із прогалинами у досвіді, незалежно від кваліфікації.',
    operates_at: ['HOBA-B-002', 'HOBA-B-003'],
    emissions: [
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'high', evidence: ['EVD-003'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-003'] }
    ],
    facets: {
      actor: 'system',
      nature: 'bias',
      visibility: 'inferable',
      removability: 'none'
    },
    amplifies: ['HOBA-M-008'],
    masks: [],
    evidence_level: 'supported',
    evidence_ids: ['EVD-003'],
    non_inferences: [
      'Employment gap does not correlate with underlying technical decline.'
    ]
  },
  {
    id: 'HOBA-M-012',
    title: 'Interview Resource & Scheduling Saturation',
    titleUk: 'Перевантаження інтерв’юерів та календарна сатурація',
    summary: 'Engineering interviewers are overwhelmed with sprint commitments, leading to calendar fragmentation, rush reviews, or dropped loops.',
    summaryUk: 'Інженери-інтерв’юери перевантажені задачами спринтів, що призводить до постійних переносів та поверхневої перевірки.',
    operates_at: ['HOBA-B-005', 'HOBA-B-007', 'HOBA-B-008'],
    emissions: [
      { artifact: 'HOBA-A-007', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-001', fidelity: 'noise', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'noise',
      visibility: 'inferable',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-019'],
    masks: [],
    evidence_level: 'supported',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Rescheduling is an operational issue and does not indicate negative evaluation.'
    ]
  },
  {
    id: 'HOBA-M-013',
    title: 'Mid-Process Role Requirement Redefinition',
    titleUk: 'Зміна вимог до ролі під час процесу найму',
    summary: 'Team changes tech stack, seniority requirements, or project scope mid-funnel, invalidating previous interview assessments.',
    summaryUk: 'Команда змінює фокус, технологічний стек або грейд ролі безпосередньо під час співбесід.',
    operates_at: ['HOBA-B-007', 'HOBA-B-008', 'HOBA-B-009'],
    emissions: [
      { artifact: 'HOBA-A-003', fidelity: 'distortion', likelihood: 'medium', evidence: ['EVD-004'] },
      { artifact: 'HOBA-A-004', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'noise',
      visibility: 'inferable',
      removability: 'none'
    },
    amplifies: ['HOBA-M-004'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-004'],
    non_inferences: [
      'Candidate rejection was driven by shifting team mandate, not prior interview answers.'
    ]
  },
  {
    id: 'HOBA-M-014',
    title: 'Location or Timezone Compliance Constraint',
    titleUk: 'Обмеження за локацією, часовим поясом або юрисдикцією',
    summary: 'Company legal or tax entity cannot support remote employment contracts in candidate physical residency jurisdiction.',
    summaryUk: 'Компанія юридично не може наймати спеціалістів у податковій юрисдикції кандидата.',
    operates_at: ['HOBA-B-002', 'HOBA-B-004'],
    emissions: [
      { artifact: 'HOBA-A-009', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'policy',
      nature: 'rule',
      visibility: 'observable',
      removability: 'intermediary'
    },
    amplifies: [],
    masks: [],
    evidence_level: 'established',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Legal geography barrier is completely independent of candidate technical competence.'
    ]
  },
  {
    id: 'HOBA-M-015',
    title: 'Communication or Working Style Friction',
    titleUk: 'Невідповідність комунікаційного стилю або робочої культури',
    summary: 'Candidate demonstrated abrasive tone, defensive reactions to critique, or inability to listen during collaborative interview problem solving.',
    summaryUk: 'Кандидат проявив оборонну позицію на фідбек, категоричність або складнощі у конструктивному діалозі під час панелі.',
    operates_at: ['HOBA-B-004', 'HOBA-B-008'],
    emissions: [
      { artifact: 'HOBA-A-010', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-006'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'candidate',
      nature: 'bias',
      visibility: 'observable',
      removability: 'candidate'
    },
    amplifies: [],
    masks: [],
    honest_baseline: true,
    evidence_level: 'established',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Style friction during high-stress interview is not a permanent personality defect.'
    ]
  },
  {
    id: 'HOBA-M-016',
    title: 'Speculative Sourcing / Talent Pooling Without Opening',
    titleUk: 'Спекулятивний сорсинг та формування "резерву" без вакансії',
    summary: 'Recruiters proactively gather candidate pools for future anticipated headcount that is not yet authorized or funded.',
    summaryUk: 'Рекрутери ведуть переговори та збирають контакти на майбутнє без відкритої вакансії.',
    operates_at: ['HOBA-B-003', 'HOBA-B-004'],
    emissions: [
      { artifact: 'HOBA-A-012', fidelity: 'distortion', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'recruiter',
      nature: 'incentive',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: ['HOBA-M-009'],
    masks: [],
    evidence_level: 'supported',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Ghosting after outbound message indicates absence of immediate opening, not profile rejection.'
    ]
  },
  {
    id: 'HOBA-M-017',
    title: 'Experience-Age Grading Mismatch',
    titleUk: 'Невідповідність років досвіду очікуванням від грейду',
    summary: 'Candidate with 10+ years applied for mid/senior role, triggering fears of boredom, rapid churn, or salary dissatisfaction.',
    summaryUk: 'Кандидат із великим досвідом розглядається на позицію середнього рівня, викликаючи сумніви щодо довготривалої мотивації.',
    operates_at: ['HOBA-B-003', 'HOBA-B-004', 'HOBA-B-007'],
    emissions: [
      { artifact: 'HOBA-A-013', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-002'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'recruiter',
      nature: 'bias',
      visibility: 'inferable',
      removability: 'none'
    },
    amplifies: ['HOBA-M-004'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-002'],
    non_inferences: [
      'Being rejected as "overqualified" is an organizational tier mismatch, not a candidate deficiency.'
    ]
  },
  {
    id: 'HOBA-M-018',
    title: 'Domain Specificity Over-Weighting',
    titleUk: 'Надмірний акцент на вузькоспецифічному доменному досвіді',
    summary: 'Interviewer requires exact vertical experience (e.g. adtech, crypto, specific payment processor) over deep transferable systems fundamentals.',
    summaryUk: 'Інтерв’юери вимагають точного знання вузької предметної області замість фундаментальних інженерних навичок.',
    operates_at: ['HOBA-B-004', 'HOBA-B-007'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-008', fidelity: 'direct', likelihood: 'medium', evidence: ['EVD-006'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'bias',
      visibility: 'inferable',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-010'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Transferable general engineering skills are not disproven by lack of specific proprietary protocol knowledge.'
    ]
  },
  {
    id: 'HOBA-M-019',
    title: 'Take-Home Evaluation Fatigue & Asymmetry',
    titleUk: 'Втома оцінювачів та асиметрія перевірки тестових завдань',
    summary: 'Reviewers perform hurried 5-minute scans of complex 15-hour take-home projects, missing subtle architectural patterns and tests.',
    summaryUk: 'Перевіряючі витрачають лічені хвилини на перевірку коду, над яким кандидат працював днями, пропускаючи архітектурні рішення.',
    operates_at: ['HOBA-B-006'],
    emissions: [
      { artifact: 'HOBA-A-006', fidelity: 'noise', likelihood: 'medium', evidence: ['EVD-006'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'noise',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: ['HOBA-M-012'],
    masks: ['HOBA-M-001'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Take-home rejection under evaluation fatigue does not measure true software engineering craftsmanship.'
    ]
  },
  {
    id: 'HOBA-M-020',
    title: 'Automated Application Expiration Timeout',
    titleUk: 'Автоматичне закриття заявки за таймаутом в ATS',
    summary: 'ATS configuration automatically issues bulk rejections to all pending unreviewed applications after 45 or 60 days.',
    summaryUk: 'Система ATS автоматично відправляє масові відмови всім нерозглянутим кандидатам після спливу 45–60 днів.',
    operates_at: ['HOBA-B-001', 'HOBA-B-003'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'void', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-001', fidelity: 'void', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'system',
      nature: 'rule',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: [],
    masks: ['HOBA-M-006'],
    evidence_level: 'established',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Bulk timeout rejection contains zero qualitative assessment of candidate profile.'
    ]
  },
  {
    id: 'HOBA-M-021',
    title: 'Reference Check Discrepancy or Regulatory Ineligibility',
    titleUk: 'Розбіжність у бекграунді або регуляторна невідповідність',
    summary: 'Third-party check reveals unverified employment dates, unconfirmed degrees, or direct conflict of interest.',
    summaryUk: 'Перевірка виявляє документальні розбіжності у датах роботи, відсутність диплому чи конфлікт інтересів.',
    operates_at: ['HOBA-B-011'],
    emissions: [
      { artifact: 'HOBA-A-011', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'medium', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'candidate',
      nature: 'rule',
      visibility: 'observable',
      removability: 'candidate'
    },
    amplifies: [],
    masks: [],
    honest_baseline: true,
    evidence_level: 'established',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Administrative mismatch in dates is distinct from fraudulent resume misrepresentation.'
    ]
  },
  {
    id: 'HOBA-M-022',
    title: 'Hiring Manager Consensus Impasse',
    titleUk: 'Розкол думок та відсутність консенсусу в комітеті найму',
    summary: 'The interview panel splits 50/50 without an executive tiebreaker, defaulting conservatively to a "no-hire" decision.',
    summaryUk: 'Інтерв’юери розділилися в оцінках порівну, і за відсутності лідера процес за замовчуванням завершується відмовою.',
    operates_at: ['HOBA-B-008'],
    emissions: [
      { artifact: 'HOBA-A-014', fidelity: 'direct', likelihood: 'high', evidence: ['EVD-006'] },
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'bias',
      visibility: 'opaque',
      removability: 'none'
    },
    amplifies: [],
    masks: ['HOBA-M-002'],
    evidence_level: 'supported',
    evidence_ids: ['EVD-006'],
    non_inferences: [
      'Split panel reflects lack of calibrated internal standards rather than candidate failure.'
    ]
  },
  {
    id: 'HOBA-M-023',
    title: 'Portfolio / Work Artifact Misinterpretation',
    titleUk: 'Невірне тлумачення портфоліо чи проектного артефакту',
    summary: 'Screeners overlook candidate role architecture due to non-standard repository layout or unindexed open-source contributions.',
    summaryUk: 'Рев’юери не помічають ключові частини коду через нестандартну структуру репозиторію чи відсутність оглядового README.',
    operates_at: ['HOBA-B-003', 'HOBA-B-005'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-008', fidelity: 'distortion', likelihood: 'medium', evidence: ['EVD-006'] }
    ],
    facets: {
      actor: 'candidate',
      nature: 'noise',
      visibility: 'inferable',
      removability: 'candidate'
    },
    amplifies: ['HOBA-M-001'],
    masks: [],
    evidence_level: 'supported',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Misinterpreted architecture can be corrected through structured documentation.'
    ]
  },
  {
    id: 'HOBA-M-024',
    title: 'Inflated Requisition Requirements vs Actual Team Needs',
    titleUk: 'Завищені вимоги у вакансії порівняно з реальними задачами',
    summary: 'Job description demands 10+ niche technologies and Staff-level qualifications for a straightforward feature engineering role.',
    summaryUk: 'Опис вакансії вимагає 10+ технологій та сеньйорного досвіду для типової продуктової розробки.',
    operates_at: ['HOBA-B-002', 'HOBA-B-004'],
    emissions: [
      { artifact: 'HOBA-A-002', fidelity: 'euphemism', likelihood: 'high', evidence: ['EVD-001'] },
      { artifact: 'HOBA-A-004', fidelity: 'noise', likelihood: 'medium', evidence: ['EVD-004'] }
    ],
    facets: {
      actor: 'hiring-manager',
      nature: 'incentive',
      visibility: 'inferable',
      removability: 'intermediary'
    },
    amplifies: ['HOBA-M-008', 'HOBA-M-004'],
    masks: [],
    evidence_level: 'supported',
    evidence_ids: ['EVD-001'],
    non_inferences: [
      'Failing to meet an inflated "wishlist" does not mean candidate cannot excel at the team’s actual core tasks.'
    ]
  }
];

// ==========================================
// 4. PATTERNS (4)
// ==========================================
const patterns = [
  {
    id: 'HOBA-P-001',
    title: 'Seniority Double Bind',
    titleUk: 'Пастка подвійної сеньйорності',
    summary: 'Candidate is simultaneously rejected as overqualified for junior/mid roles and underqualified (or insufficiently specialized) for staff/leadership roles.',
    summaryUk: 'Кандидата одночасно відсіюють як "надто досвідченого" для мідл-ролей і недостатньо спеціалізованого для стафф/лід позицій.',
    required_artifacts: ['HOBA-A-002', 'HOBA-A-013'],
    compatible_mechanisms: ['HOBA-M-001', 'HOBA-M-004', 'HOBA-M-017'],
    trigger_rule: 'Candidate observes rejection for overqualification at level N and skill-depth shortfall at level N+1 within the same market cycle.',
    trigger_ruleUk: 'Кандидат отримує відмову через оверкваліфікацію на рівні N та зауваження щодо браку глибини на рівні N+1.',
    establishes: [
      'Candidate falls into an evaluation boundary gap where compensation/experience expectations mismatch standard job tiers.'
    ],
    establishesUk: [
      'Кандидат потрапляє в проміжну зону грейдів, де зарплатні очікування та досвід не вписуються у стандартні шаблони компаній.'
    ],
    non_inferences: [
      'Does not establish that the candidate lacks market value.',
      'Does not establish malice or coordinated collusion between employers.'
    ],
    non_inferencesUk: [
      'Не доводить відсутність цінності кандидата на ринку.',
      'Не доводить змови між роботодавцями.'
    ],
    interventions: ['HOBA-I-002', 'HOBA-I-003'],
    evidence_ids: ['EVD-002']
  },
  {
    id: 'HOBA-P-002',
    title: 'Closed-Then-Reposted Requisition Motif',
    titleUk: 'Мотив "Закрито та відкрито знову"',
    summary: 'A candidate completes multiple late-stage interviews, is rejected with a generic message, and sees the identical role reposted weeks later.',
    summaryUk: 'Кандидат проходить фінальні інтерв’ю, отримує шаблонну відмову, а через кілька тижнів бачить ту саму вакансію опублікованою знову.',
    required_artifacts: ['HOBA-A-003', 'HOBA-A-004'],
    compatible_mechanisms: ['HOBA-M-002', 'HOBA-M-006', 'HOBA-M-010', 'HOBA-M-013'],
    trigger_rule: 'Candidate observes role closure/rejection followed by public reopening of materially similar role listing within 60 days.',
    trigger_ruleUk: 'Спостереження закриття вакансії з наступним повторним публічним розміщенням протягом 60 днів.',
    establishes: [
      'The requisition requirements or target profile were not satisfied by the interviewed pool, or search criteria changed mid-process.'
    ],
    establishesUk: [
      'Вимоги вакансії або профіль не були задоволені кандидатами з поточного пулу, або критерії пошуку змінилися.'
    ],
    non_inferences: [
      'Does not establish that the original job listing was fake or a ghost job.',
      'Does not establish that candidate was intentionally misled.'
    ],
    non_inferencesUk: [
      'Не доводить, що первинна вакансія була фейковою.',
      'Не доводить навмисного введення в оману.'
    ],
    interventions: ['HOBA-I-001', 'HOBA-I-003'],
    evidence_ids: ['EVD-004']
  },
  {
    id: 'HOBA-P-003',
    title: 'Experience-Age Impossibility',
    titleUk: 'Неможливість комбінації досвіду та років',
    summary: 'Requisition requires more years of hands-on experience in a specific framework or tool than that technology has existed in the open-source ecosystem.',
    summaryUk: 'Вимога більшої кількості років досвіду у фреймворку, ніж цей фреймворк існує у світі.',
    required_artifacts: ['HOBA-A-002', 'HOBA-A-009'],
    compatible_mechanisms: ['HOBA-M-008', 'HOBA-M-024'],
    trigger_rule: 'Job description or automated screen requires X years of experience where X > technology_age.',
    trigger_ruleUk: 'Вимога X років досвіду у технології, де X перевищує вік самої технології.',
    establishes: [
      'Job description was authored without technical review, using copy-paste templates with automated gating rules.'
    ],
    establishesUk: [
      'Опис вакансії був складений без технічної валідації на основі скопійованих шаблонів.'
    ],
    non_inferences: [
      'Does not imply technical team is incompetent, only that HR screening pipeline lacks technical validation.'
    ],
    non_inferencesUk: [
      'Не свідчить про слабкість технічної команди, а лише про відсутність перевірки в HR-процесі.'
    ],
    interventions: ['HOBA-I-005'],
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-P-004',
    title: 'Compensation Double Bind',
    titleUk: 'Зарплатний глухий кут',
    summary: 'Candidate is required to state salary expectation first; quoting high triggers immediate rejection, while quoting low triggers leveling downranking.',
    summaryUk: 'Кандидат змушений першим назвати очікування: вища цифра веде до відмови, а нижча призводить до заниження грейду.',
    required_artifacts: ['HOBA-A-002', 'HOBA-A-005'],
    compatible_mechanisms: ['HOBA-M-004', 'HOBA-M-017'],
    trigger_rule: 'Asymmetric salary inquiry where employer refuses band disclosure prior to candidate submitting binding number.',
    trigger_ruleUk: 'Асиметричний запит зарплати без попереднього розкриття вилки компанією.',
    establishes: [
      'Information asymmetry is utilized as an uncalibrated gatekeeper before technical merit is evaluated.'
    ],
    establishesUk: [
      'Асиметрія інформації використовується як бар’єр до оцінки реальної технічної кваліфікації.'
    ],
    non_inferences: [
      'Does not mean employer has unlimited budget or malice.'
    ],
    non_inferencesUk: [
      'Не означає злого наміру роботодавця.'
    ],
    interventions: ['HOBA-I-002'],
    evidence_ids: ['EVD-005']
  }
];

// ==========================================
// 5. LOOPS (3)
// ==========================================
const loops = [
  {
    id: 'HOBA-L-001',
    title: 'Employment Gap Penalty Loop',
    titleUk: 'Петля пенальті за перерву в роботі',
    summary: 'An initial gap in employment triggers automated ATS downranking, resulting in fewer interview invitations, which extends the employment gap.',
    summaryUk: 'Перерва в роботі активує алгоритмічне зниження рейтингу в ATS, що веде до зменшення інтерв’ю і ще більше подовжує перерву.',
    mechanisms: ['HOBA-M-011', 'HOBA-M-008', 'HOBA-M-009'],
    edges: [
      { from: 'HOBA-M-011', to: 'HOBA-M-008', relation: 'amplifies' },
      { from: 'HOBA-M-008', to: 'HOBA-M-009', relation: 'amplifies' },
      { from: 'HOBA-M-009', to: 'HOBA-M-011', relation: 'amplifies' }
    ],
    entry_points: ['HOBA-M-011'],
    interventions: ['HOBA-I-004'],
    evidence_ids: ['EVD-003']
  },
  {
    id: 'HOBA-L-002',
    title: 'Take-Home Opportunity-Cost Saturation Loop',
    titleUk: 'Петля витрат часу на тестові завдання',
    summary: 'Candidates invest heavy hours into unbounded take-home assignments, reducing bandwidth for applications, while reviewers suffer evaluation fatigue.',
    summaryUk: 'Кандидати витрачають десятки годин на тестові завдання, втрачаючи час на пошук, поки перевіряючі поверхнево сканують код через втому.',
    mechanisms: ['HOBA-M-012', 'HOBA-M-019'],
    edges: [
      { from: 'HOBA-M-012', to: 'HOBA-M-019', relation: 'amplifies' },
      { from: 'HOBA-M-019', to: 'HOBA-M-012', relation: 'amplifies' }
    ],
    entry_points: ['HOBA-M-012'],
    interventions: ['HOBA-I-006'],
    evidence_ids: ['EVD-006']
  },
  {
    id: 'HOBA-L-003',
    title: 'Inflated-Requirements Search Saturation Loop',
    titleUk: 'Петля завищених вимог та тривалого пошуку',
    summary: 'Teams write inflated requirements, filtering out strong generalists, prolonging open search, causing recruiter fatigue and mid-process role redefinitions.',
    summaryUk: 'Завищені вимоги відсіюють сильних спеціалістів, вакансія висить місяцями, команда виснажується і починає змінювати вимоги на льоту.',
    mechanisms: ['HOBA-M-024', 'HOBA-M-008', 'HOBA-M-013'],
    edges: [
      { from: 'HOBA-M-024', to: 'HOBA-M-008', relation: 'amplifies' },
      { from: 'HOBA-M-008', to: 'HOBA-M-013', relation: 'amplifies' },
      { from: 'HOBA-M-013', to: 'HOBA-M-024', relation: 'amplifies' }
    ],
    entry_points: ['HOBA-M-024'],
    interventions: ['HOBA-I-001', 'HOBA-I-003'],
    evidence_ids: ['EVD-001', 'EVD-004']
  }
];

// ==========================================
// 6. INTERVENTIONS (6)
// ==========================================
const interventions = [
  {
    id: 'HOBA-I-001',
    title: 'Auto-Close Stale Job Requisitions',
    titleUk: 'Автоматичне закриття неактивних вакансій',
    summary: 'Implement automated ATS policy to expire public listings when headcount authorization lapses or no interview activity occurs within 60 days.',
    summaryUk: 'Впровадження автоматичного правила закриття вакансій в ATS при спливу 60 днів без активних інтерв’ю чи скасуванні бюджету.',
    targets: ['HOBA-M-006', 'HOBA-B-001'],
    actor: 'employer-policy',
    scope: 'organizational',
    cost: 'low',
    expected_effects: [
      'Reduce stale public listings and candidate application waste',
      'Reduce ambiguous post-application silence'
    ],
    expected_effectsUk: [
      'Зменшення застарілих вакансій та даремних витрат часу кандидатів',
      'Зниження повної тиші після відправки резюме'
    ],
    measurements: [
      'stale_requisition_rate',
      'closure_latency_days'
    ],
    evidence_ids: ['EVD-004']
  },
  {
    id: 'HOBA-I-002',
    title: 'Upfront Compensation Band Disclosure',
    titleUk: 'Відкрите розкриття зарплатної вилки на старті',
    summary: 'Publish verified salary and equity bands directly in job descriptions or disclose them prior to scheduling technical interview rounds.',
    summaryUk: 'Публікація точного зарплатного діапазону в описі вакансії або на першому скринінгу до початку технічних етапів.',
    targets: ['HOBA-M-004', 'HOBA-B-004', 'HOBA-B-009'],
    actor: 'employer-policy',
    scope: 'industry',
    cost: 'low',
    expected_effects: [
      'Eliminate late-stage compensation mismatch dropouts',
      'Reduce time wasted on mismatched leveling conversations'
    ],
    expected_effectsUk: [
      'Усунення відмов на фінальних етапах через невідповідність зарплати',
      'Економія часу команди на невідповідних грейдах'
    ],
    measurements: [
      'late_stage_compensation_drop_rate',
      'candidate_pipeline_satisfaction'
    ],
    evidence_ids: ['EVD-005']
  },
  {
    id: 'HOBA-I-003',
    title: 'Standardized Late-Stage Rejection Feedback Taxonomy',
    titleUk: 'Стандартизована таксономія зворотного зв’язку для фіналістів',
    summary: 'Provide candidates reaching technical or panel stages with structured, rubric-based feedback categories rather than generic templates.',
    summaryUk: 'Надання кандидатам після технічних інтерв’ю структурованого фідбеку за категоріями замість шаблону про "більшу відповідність".',
    targets: ['HOBA-M-001', 'HOBA-M-010', 'HOBA-B-007', 'HOBA-B-008'],
    actor: 'recruiter-process',
    scope: 'organizational',
    cost: 'medium',
    expected_effects: [
      'Provide actionable feedback signals to candidates',
      'Enforce consistent interviewer calibration across rounds'
    ],
    expected_effectsUk: [
      'Надання кандидатам зрозумілого сигналу для розвитку',
      'Підвищення якості калібрування інтерв’юерів'
    ],
    measurements: [
      'informative_feedback_ratio',
      'interviewer_calibration_variance'
    ],
    evidence_ids: ['EVD-006']
  },
  {
    id: 'HOBA-I-004',
    title: 'Remove Career Gap Feature from Automated Ranking Models',
    titleUk: 'Вилучення ознаки перерви в роботі з моделей ранжування',
    summary: 'Disable employment duration gap penalties in recruitment AI algorithms and screening models.',
    summaryUk: 'Вимкнення пенальті за прогалини в резюме в алгоритмах сорсингу та скорингу кандидатів.',
    targets: ['HOBA-M-011', 'HOBA-L-001'],
    actor: 'ats-vendor',
    scope: 'ecosystem',
    cost: 'low',
    expected_effects: [
      'Break algorithmic unemployment penalty loop',
      'Broaden candidate pool to include skilled returning talent'
    ],
    expected_effectsUk: [
      'Розрив алгоритмічної петлі покарання за перерву в роботі',
      'Розширення воронки за рахунок кваліфікованих спеціалістів'
    ],
    measurements: [
      'gap_candidate_screen_rate',
      'long_term_placement_success'
    ],
    evidence_ids: ['EVD-003']
  },
  {
    id: 'HOBA-I-005',
    title: 'Candidate ATS Parser Conformance Test Utility',
    titleUk: 'Інструмент перевірки коректності парсингу резюме в ATS',
    summary: 'Provide candidates with an open-source parsing validation tool to verify CV machine-readability before submission.',
    summaryUk: 'Відкритий інструмент для кандидатів, що дозволяє перевірити коректність зчитування тексту резюме парсерами ATS.',
    targets: ['HOBA-M-003', 'HOBA-B-002'],
    actor: 'candidate-action',
    scope: 'individual',
    cost: 'low',
    expected_effects: [
      'Eliminate formatting-induced silent parsing failures',
      'Increase candidate confidence in resume ingestion fidelity'
    ],
    expected_effectsUk: [
      'Усунення збоїв зчитування даних через форматування',
      'Впевненість кандидата у збереженні структури даних'
    ],
    measurements: [
      'parser_extraction_error_rate',
      'ingestion_pass_rate'
    ],
    evidence_ids: ['EVD-001']
  },
  {
    id: 'HOBA-I-006',
    title: 'Strict Take-Home Timebox & Blinded Evaluation Rubric',
    titleUk: 'Обмеження часу тестових та анонімна перевірка за шкалою',
    summary: 'Enforce strict 3-hour scope limits on take-homes, compensate candidates for extended samples, and grade submissions blind.',
    summaryUk: 'Встановлення чіткого ліміту в 3 години на тестове завдання, оплата тривалих завдань та анонімна перевірка коду.',
    targets: ['HOBA-M-019', 'HOBA-L-002', 'HOBA-B-006'],
    actor: 'hiring-manager',
    scope: 'organizational',
    cost: 'medium',
    expected_effects: [
      'Prevent reviewer fatigue and asymmetric code evaluation',
      'Respect candidate time investment and eliminate IP exploitation concerns'
    ],
    expected_effectsUk: [
      'Запобігання поверхневій перевірці через втому інженерів',
      'Повага до часу кандидата та прозорість критеріїв оцінки'
    ],
    measurements: [
      'take_home_completion_rate',
      'inter_rater_rubric_correlation'
    ],
    evidence_ids: ['EVD-006']
  }
];

// Helper to write content
function writeContent(lang: 'en' | 'uk') {
  const dirPrefix = lang === 'en' ? 'content' : 'content-uk';

  const writeEntity = (subDir: string, id: string, frontmatter: any, title: string, bodyText: string) => {
    const fullDir = path.join(rootDir, dirPrefix, subDir);
    fs.mkdirSync(fullDir, { recursive: true });
    const yamlHeader = Object.entries(frontmatter)
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          if (v.length === 0) return `${k}: []`;
          if (typeof v[0] === 'object') {
            return `${k}:\n${v
              .map((item) => {
                const sub = Object.entries(item)
                  .map(([ik, iv]) => `    ${ik}: ${JSON.stringify(iv)}`)
                  .join('\n');
                return `  -\n${sub}`;
              })
              .join('\n')}`;
          }
          return `${k}:\n${v.map((item) => `  - ${JSON.stringify(item)}`).join('\n')}`;
        }
        if (typeof v === 'object' && v !== null) {
          const sub = Object.entries(v)
            .map(([ik, iv]) => `  ${ik}: ${JSON.stringify(iv)}`)
            .join('\n');
          return `${k}:\n${sub}`;
        }
        return `${k}: ${JSON.stringify(v)}`;
      })
      .join('\n');

    const fileContent = `---\n${yamlHeader}\n---\n\n# ${title}\n\n${bodyText}\n`;
    fs.writeFileSync(path.join(fullDir, `${id}.md`), fileContent, 'utf-8');
  };

  // 1. Barriers
  for (const b of barriers) {
    const title = lang === 'en' ? b.title : b.titleUk;
    const desc = lang === 'en' ? b.description : b.descriptionUk;
    const passCond = lang === 'en' ? b.pass_condition : b.pass_conditionUk;
    const fm = {
      id: b.id,
      type: 'barrier',
      title,
      stage: b.stage,
      order: b.order,
      precedes: b.precedes,
      description: desc,
      pass_condition: passCond,
      status: 'active',
      evidence_level: 'established',
      evidence_ids: b.evidence_ids
    };
    writeEntity('barriers', b.id, fm, title, `${desc}\n\n### Pass Condition\n${passCond}`);
  }

  // 2. Artifacts
  for (const a of artifacts) {
    const title = lang === 'en' ? a.title : a.titleUk;
    const summary = lang === 'en' ? a.summary : a.summaryUk;
    const nonInfs = lang === 'en' ? a.non_inferences : a.non_inferences;
    const fm = {
      id: a.id,
      type: 'artifact',
      title,
      summary,
      stages: a.stages,
      status: 'active',
      evidence_level: 'supported',
      evidence_ids: a.evidence_ids,
      probes: a.probes,
      non_inferences: nonInfs
    };
    writeEntity('artifacts', a.id, fm, title, `${summary}\n\n### Diagnostic Non-Inferences\n${nonInfs.map((n) => `- ${n}`).join('\n')}`);
  }

  // 3. Mechanisms
  for (const m of mechanisms) {
    const title = lang === 'en' ? m.title : m.titleUk;
    const summary = lang === 'en' ? m.summary : m.summaryUk;
    const nonInfs = lang === 'en' ? m.non_inferences : m.non_inferences;
    const fm = {
      id: m.id,
      type: 'mechanism',
      title,
      summary,
      operates_at: m.operates_at,
      emissions: m.emissions,
      facets: m.facets,
      amplifies: m.amplifies,
      masks: m.masks,
      status: 'active',
      evidence_level: m.evidence_level,
      honest_baseline: Boolean(m.honest_baseline),
      evidence_ids: m.evidence_ids,
      non_inferences: nonInfs
    };
    writeEntity('mechanisms', m.id, fm, title, `${summary}\n\n### Structural Context\n- **Actor:** \`${m.facets.actor}\`\n- **Nature:** \`${m.facets.nature}\`\n- **Removability:** \`${m.facets.removability}\`\n\n### Non-Inferences\n${nonInfs.map((n) => `- ${n}`).join('\n')}`);
  }

  // 4. Patterns
  for (const p of patterns) {
    const title = lang === 'en' ? p.title : p.titleUk;
    const summary = lang === 'en' ? p.summary : p.summaryUk;
    const trigger = lang === 'en' ? p.trigger_rule : p.trigger_ruleUk;
    const establishes = lang === 'en' ? p.establishes : p.establishesUk;
    const nonInfs = lang === 'en' ? p.non_inferences : p.non_inferencesUk;
    const fm = {
      id: p.id,
      type: 'pattern',
      title,
      summary,
      required_artifacts: p.required_artifacts,
      compatible_mechanisms: p.compatible_mechanisms,
      trigger_rule: trigger,
      establishes,
      non_inferences: nonInfs,
      interventions: p.interventions,
      status: 'active',
      evidence_level: 'supported',
      evidence_ids: p.evidence_ids
    };
    writeEntity('patterns', p.id, fm, title, `${summary}\n\n### Trigger Rule\n${trigger}\n\n### What this Establishes\n${establishes.map((e) => `- ${e}`).join('\n')}\n\n### What this Does NOT Establish\n${nonInfs.map((n) => `- ${n}`).join('\n')}`);
  }

  // 5. Loops
  for (const l of loops) {
    const title = lang === 'en' ? l.title : l.titleUk;
    const summary = lang === 'en' ? l.summary : l.summaryUk;
    const fm = {
      id: l.id,
      type: 'loop',
      title,
      summary,
      mechanisms: l.mechanisms,
      edges: l.edges,
      entry_points: l.entry_points,
      interventions: l.interventions,
      status: 'active',
      evidence_level: 'supported',
      evidence_ids: l.evidence_ids
    };
    writeEntity('loops', l.id, fm, title, `${summary}\n\n### Cycle Dynamics\nThis causal loop reinforces mechanisms across iterations:\n${l.edges.map((e) => `- \`${e.from}\` ${e.relation} \`${e.to}\``).join('\n')}`);
  }

  // 6. Interventions
  for (const i of interventions) {
    const title = lang === 'en' ? i.title : i.titleUk;
    const summary = lang === 'en' ? i.summary : i.summaryUk;
    const effects = lang === 'en' ? i.expected_effects : i.expected_effectsUk;
    const fm = {
      id: i.id,
      type: 'intervention',
      title,
      summary,
      targets: i.targets,
      actor: i.actor,
      scope: i.scope,
      cost: i.cost,
      status: 'active',
      evidence_level: 'supported',
      expected_effects: effects,
      measurements: i.measurements,
      evidence_ids: i.evidence_ids
    };
    writeEntity('interventions', i.id, fm, title, `${summary}\n\n### Expected Effects\n${effects.map((e) => `- ${e}`).join('\n')}\n\n### Measurements\n${i.measurements.map((m) => `- \`${m}\``).join('\n')}`);
  }
}

writeContent('en');
writeContent('uk');
console.log('Seeded content for EN and UK successfully.');
