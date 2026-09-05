import { COLLECTION_FOR, type ContentLang, type EntityType, type RegistryBundle } from './types.js';

export type LocalizedText = Record<ContentLang, string>;
export type InventoryAuthority = 'canonical' | 'composition' | 'presentation' | 'derived';
export type InventoryLayer = 'finding' | 'context' | 'support';
export type WebAvailability = 'detail' | 'index' | 'none';

export interface EntityCatalogEntry {
  type: EntityType;
  collection: (typeof COLLECTION_FOR)[EntityType];
  name: string;
  plural: LocalizedText;
  label: LocalizedText;
  layer: InventoryLayer;
  authority: 'canonical';
  source: string;
  id_pattern: string;
  schema_file: string;
  api_path: string;
  web: { availability: WebAvailability; path?: string };
  purpose: LocalizedText;
  use_when: LocalizedText;
  not_for: LocalizedText;
  surfaces: {
    bulk_json: true;
    ndjson: true;
    rest: true;
    json_schema: true;
    search: true;
    lookup: true;
    graph_projection: boolean;
  };
}

const text = (en: string, uk: string): LocalizedText => ({ en, uk });

const entity = <T extends EntityType>(
  type: T,
  definition: Omit<
    EntityCatalogEntry,
    'type' | 'collection' | 'authority' | 'schema_file' | 'api_path'
  >
): EntityCatalogEntry => {
  const collection = COLLECTION_FOR[type];
  const name = definition.name;
  return {
    type,
    collection,
    authority: 'canonical',
    schema_file: `${name.toLowerCase()}.schema.json`,
    api_path: `/api/v1/${collection}`,
    ...definition,
  };
};

const complete = (graph_projection: boolean) => ({
  bulk_json: true as const,
  ndjson: true as const,
  rest: true as const,
  json_schema: true as const,
  search: true as const,
  lookup: true as const,
  graph_projection,
});

/**
 * The canonical inventory of ontology collections.
 *
 * This is deliberately richer than `entityTypeSchema`: the schema says what a
 * valid value is, while this catalog says what each value means and where it is
 * available. Generators, search, CLI/MCP discovery, and the site consume this
 * array so adding a collection cannot silently omit it from one surface.
 */
export const ENTITY_CATALOG = [
  entity('observation', {
    name: 'Observation',
    plural: text('Observations', 'Спостереження'),
    label: text('Observation', 'Спостереження'),
    layer: 'finding',
    source: 'data/{lang}/entities/observation/*.md',
    id_pattern: 'obs.* (legacy A-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/observations/{id}' },
    purpose: text(
      'A directly observable trace left by the hiring process.',
      'Безпосередньо спостережуваний слід, який залишає процес найму.'
    ),
    use_when: text(
      'Record what happened before interpreting why it happened.',
      'Фіксуйте, що сталося, перш ніж тлумачити, чому це сталося.'
    ),
    not_for: text(
      'Not a hidden-cause claim or a verdict about intent.',
      'Не твердження про приховану причину і не висновок про намір.'
    ),
    surfaces: complete(true),
  }),
  entity('barrier', {
    name: 'Barrier',
    plural: text('Barriers', 'Бар’єри'),
    label: text('Barrier', 'Бар’єр'),
    layer: 'finding',
    source: 'data/{lang}/entities/barrier/*.md',
    id_pattern: 'bar.* (legacy B-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/barriers/{id}' },
    purpose: text(
      'A gate where the nominal hiring path can stop or diverge.',
      'Точка, де нормативний шлях найму може зупинитися або відхилитися.'
    ),
    use_when: text('Locate where progress was blocked.', 'Визначайте, де саме рух зупинився.'),
    not_for: text(
      'Not an explanation of the force behind the blockage.',
      'Не пояснення сили, що спричинила блокування.'
    ),
    surfaces: complete(true),
  }),
  entity('mechanism', {
    name: 'Mechanism',
    plural: text('Mechanisms', 'Механізми'),
    label: text('Mechanism', 'Механізм'),
    layer: 'finding',
    source: 'data/{lang}/entities/mechanism/*.md',
    id_pattern: 'mech.* (legacy M-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/mechanisms/{id}' },
    purpose: text(
      'A causal force compatible with one or more observations and barriers.',
      'Причинна сила, сумісна з одним або кількома спостереженнями й бар’єрами.'
    ),
    use_when: text(
      'Build a bounded set of compatible explanations.',
      'Будуйте обмежений набір сумісних пояснень.'
    ),
    not_for: text(
      'Compatibility is not proof, probability, or attribution of motive.',
      'Сумісність — не доказ, не ймовірність і не приписування мотиву.'
    ),
    surfaces: complete(true),
  }),
  entity('pattern', {
    name: 'Pattern',
    plural: text('Patterns', 'Патерни'),
    label: text('Pattern', 'Патерн'),
    layer: 'finding',
    source: 'data/{lang}/entities/pattern/*.md',
    id_pattern: 'pat.* (legacy P-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/patterns/{id}' },
    purpose: text(
      'A recurring, rule-defined combination of observations and compatible mechanisms.',
      'Повторювана, формально визначена комбінація спостережень і сумісних механізмів.'
    ),
    use_when: text(
      'Name a cross-case structure.',
      'Називайте структуру, що повторюється між випадками.'
    ),
    not_for: text(
      'Not proof of one cause in one case.',
      'Не доказ однієї причини в одному випадку.'
    ),
    surfaces: complete(true),
  }),
  entity('loop', {
    name: 'Loop',
    plural: text('Loops', 'Петлі'),
    label: text('Loop', 'Петля'),
    layer: 'finding',
    source: 'data/{lang}/entities/loop/*.md',
    id_pattern: 'loop.* (legacy L-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/loops/{id}' },
    purpose: text(
      'A validated reinforcing cycle among mechanisms.',
      'Валідований підсилювальний цикл між механізмами.'
    ),
    use_when: text(
      'Explain why a condition persists or compounds.',
      'Пояснюйте, чому стан зберігається або посилюється.'
    ),
    not_for: text(
      'Not every repetition is a feedback loop.',
      'Не кожне повторення є петлею зворотного зв’язку.'
    ),
    surfaces: complete(true),
  }),
  entity('intervention', {
    name: 'Intervention',
    plural: text('Interventions', 'Втручання'),
    label: text('Intervention', 'Втручання'),
    layer: 'finding',
    source: 'data/{lang}/entities/intervention/*.md',
    id_pattern: 'int.* (legacy I-### aliases resolve)',
    web: { availability: 'detail', path: '/{locale}/interventions/{id}' },
    purpose: text(
      'An actor-owned change aimed at a barrier, mechanism, pattern, or loop.',
      'Зміна під контролем визначеного актора, спрямована на бар’єр, механізм, патерн або петлю.'
    ),
    use_when: text(
      'Ask what could change the system and who can do it.',
      'Визначайте, що може змінити систему і хто це контролює.'
    ),
    not_for: text('Not a promise of an employment outcome.', 'Не обіцянка працевлаштування.'),
    surfaces: complete(true),
  }),
  entity('actor', {
    name: 'Actor',
    plural: text('Actors', 'Актори'),
    label: text('Actor', 'Актор'),
    layer: 'context',
    source: 'data/{lang}/entities/actor/*.md',
    id_pattern: 'actor.*',
    web: { availability: 'detail', path: '/{locale}/actors/{slug}' },
    purpose: text(
      'A decision seat with explicit controls, blind spots, and incentives.',
      'Позиція ухвалення рішень із явними важелями, сліпими зонами та стимулами.'
    ),
    use_when: text(
      'Identify who controls a state or intervention.',
      'Визначайте, хто контролює стан або втручання.'
    ),
    not_for: text(
      'Not a named person, employer, or moral category.',
      'Не конкретна особа, роботодавець чи моральна категорія.'
    ),
    surfaces: complete(false),
  }),
  entity('process', {
    name: 'Process',
    plural: text('Processes', 'Процеси'),
    label: text('Process', 'Процес'),
    layer: 'context',
    source: 'data/{lang}/entities/process/*.md',
    id_pattern: 'proc.* (legacy WF-### aliases resolve)',
    web: { availability: 'index', path: '/{locale}/process' },
    purpose: text(
      'A state machine naming the subject, states, owners, transitions, and expected timing.',
      'Машина станів із предметом, станами, власниками, переходами та очікуваною тривалістю.'
    ),
    use_when: text(
      'Locate a situation in the hiring workflow.',
      'Розміщуйте ситуацію в процесі найму.'
    ),
    not_for: text(
      'Not a claim that every employer follows one path.',
      'Не твердження, що кожен роботодавець іде одним шляхом.'
    ),
    surfaces: complete(false),
  }),
  entity('era', {
    name: 'Era',
    plural: text('Eras', 'Ери'),
    label: text('Era', 'Ера'),
    layer: 'context',
    source: 'data/{lang}/entities/era/*.md',
    id_pattern: 'era.* (legacy E-### aliases resolve)',
    web: { availability: 'index', path: '/{locale}/eras' },
    purpose: text(
      'A sourced period of hiring economics: capital, hiring behavior, entry paths, and its ending.',
      'Підкріплений джерелами період економіки найму: капітал, поведінка найму, шляхи входу та завершення.'
    ),
    use_when: text(
      'Add macroeconomic context to a change over time.',
      'Додавайте макроекономічний контекст до змін у часі.'
    ),
    not_for: text('Not an individual forecast.', 'Не індивідуальний прогноз.'),
    surfaces: complete(false),
  }),
  entity('evidence', {
    name: 'Evidence',
    plural: text('Evidence records', 'Записи джерел'),
    label: text('Evidence record', 'Запис джерела'),
    layer: 'support',
    source: 'data/evidence/*.md',
    id_pattern: 'evidence.* (legacy EVD-### aliases resolve)',
    web: { availability: 'none' },
    purpose: text(
      'A language-neutral source supporting registry claims.',
      'Мовно нейтральне джерело, що підтримує твердження реєстру.'
    ),
    use_when: text(
      'Verify where a claim came from and how strong it is.',
      'Перевіряйте походження твердження та силу його підтвердження.'
    ),
    not_for: text(
      'A citation does not establish claims the source does not make.',
      'Посилання не доводить тверджень, яких джерело не робить.'
    ),
    surfaces: complete(false),
  }),
  entity('record', {
    name: 'Record',
    plural: text('Financial records', 'Фінансові записи'),
    label: text('Financial record', 'Фінансовий запис'),
    layer: 'support',
    source: 'data/{lang}/entities/record/*.md',
    id_pattern: 'record.* (legacy R-### aliases resolve)',
    web: { availability: 'none' },
    purpose: text(
      'A durable budget, contract, funding, fee, payroll, subscription, or runway state with explicit flows.',
      'Стійкий стан бюджету, контракту, фінансування, комісії, зарплат, підписки або runway з явними потоками.'
    ),
    use_when: text(
      'Trace ownership, funding, and conservation of value.',
      'Відстежуйте власність, фінансування та збереження вартості.'
    ),
    not_for: text(
      'Not a public-company filing or personal financial advice.',
      'Не корпоративна звітність і не персональна фінансова порада.'
    ),
    surfaces: complete(false),
  }),
] as const satisfies readonly EntityCatalogEntry[];

export const ENTITY_TYPES = ENTITY_CATALOG.map((entry) => entry.type) as EntityType[];
export const ENTITY_BY_TYPE = Object.fromEntries(
  ENTITY_CATALOG.map((entry) => [entry.type, entry])
) as Record<EntityType, EntityCatalogEntry>;

export interface AuxiliaryDatasetCatalogEntry {
  id: 'scenarios' | 'archetypes' | 'formal-substrate';
  authority: Exclude<InventoryAuthority, 'canonical'>;
  label: LocalizedText;
  source: string;
  purpose: LocalizedText;
  use_when: LocalizedText;
  not_for: LocalizedText;
}

/** Data that relates to the ontology without becoming a twelfth entity type. */
export const AUXILIARY_DATASETS = [
  {
    id: 'scenarios',
    authority: 'composition',
    label: text('Validated scenarios', 'Валідовані сценарії'),
    source: 'data/scenarios/*.yaml',
    purpose: text(
      'Reusable situations composed from canonical entity IDs and explicit non-inferences.',
      'Повторно використовувані ситуації, складені з канонічних ID та явних невисновків.'
    ),
    use_when: text(
      'Start from a known situation instead of individual IDs.',
      'Починайте з відомої ситуації, а не з окремих ID.'
    ),
    not_for: text(
      'A scenario is not an ontology entity or a claim that every case matches it.',
      'Сценарій не є сутністю онтології й не стверджує, що кожен випадок йому відповідає.'
    ),
  },
  {
    id: 'archetypes',
    authority: 'presentation',
    label: text('Archetype overlays', 'Архетипні накладки'),
    source: 'data/archetypes/*.yaml',
    purpose: text(
      'A nickname and grid placement for browsing every non-evidence ontology entry.',
      'Псевдонім і позиція в сітці для огляду кожної сутності онтології, крім джерел.'
    ),
    use_when: text(
      'Browse or remember the catalog informally.',
      'Неформально переглядайте або запам’ятовуйте каталог.'
    ),
    not_for: text(
      'Archetypes are presentation, not evidence or canonical facts.',
      'Архетипи — подання, а не докази чи канонічні факти.'
    ),
  },
  {
    id: 'formal-substrate',
    authority: 'derived',
    label: text('Formal substrate', 'Формальний субстрат'),
    source: 'Derived by lift(bundle); never authored directly',
    purpose: text(
      'A four-primitive projection used for proofs, conservation checks, and cross-cutting queries.',
      'Проєкція на чотири примітиви для доказів, перевірок збереження та наскрізних запитів.'
    ),
    use_when: text(
      'Run formal checks over the authored registry.',
      'Запускайте формальні перевірки над авторським реєстром.'
    ),
    not_for: text(
      'Never edit the substrate as a second source of truth.',
      'Ніколи не редагуйте субстрат як друге джерело правди.'
    ),
  },
] as const satisfies readonly AuxiliaryDatasetCatalogEntry[];

export type DataSurfaceId =
  | 'web'
  | 'source'
  | 'rest'
  | 'bulk-json'
  | 'ndjson'
  | 'graph'
  | 'schemas'
  | 'openapi'
  | 'cli'
  | 'mcp'
  | 'llm-text'
  | 'validation'
  | 'lean';

export interface DataSurface {
  id: DataSurfaceId;
  label: LocalizedText;
  location: string;
  includes: LocalizedText;
  best_for: LocalizedText;
  caveat: LocalizedText;
}

/** Every supported way to consume or maintain the data, with its boundary stated. */
export const DATA_SURFACES: readonly DataSurface[] = [
  {
    id: 'web',
    label: text('Website', 'Вебсайт'),
    location: 'https://hoba.work',
    includes: text(
      'Curated reader views, analysis, scenarios, context, and this inventory.',
      'Кураторські читацькі подання, аналіз, сценарії, контекст і цей інвентар.'
    ),
    best_for: text('Reading and exploration.', 'Читання та дослідження.'),
    caveat: text(
      'Not every support record has a dedicated page.',
      'Не кожен допоміжний запис має окрему сторінку.'
    ),
  },
  {
    id: 'source',
    label: text('Authored source', 'Авторські джерела'),
    location: 'data/** + registry.yaml',
    includes: text(
      'The canonical bilingual ontology, evidence, scenarios, and presentation overlays.',
      'Канонічна двомовна онтологія, джерела, сценарії та презентаційні накладки.'
    ),
    best_for: text('Reviewing or proposing changes.', 'Перегляд або пропозиція змін.'),
    caveat: text(
      'Generated files must never be edited by hand.',
      'Згенеровані файли не можна редагувати вручну.'
    ),
  },
  {
    id: 'rest',
    label: text('Static REST API', 'Статичний REST API'),
    location: '/api/v1/{collection}/index.json + /api/v1/{collection}/{id}.json',
    includes: text(
      'Lists and per-ID documents for all 11 ontology collections, plus the graph projection.',
      'Списки та документи за ID для всіх 11 колекцій онтології, а також графова проєкція.'
    ),
    best_for: text(
      'Simple HTTP integrations and one-record lookup.',
      'Прості HTTP-інтеграції та отримання одного запису.'
    ),
    caveat: text('Read-only and release-versioned.', 'Лише читання та версіонування за релізами.'),
  },
  {
    id: 'bulk-json',
    label: text('Registry JSON', 'JSON реєстру'),
    location: '/data/latest/registry.json',
    includes: text(
      'The complete 11-collection ontology bundle.',
      'Повний пакет онтології з 11 колекцій.'
    ),
    best_for: text(
      'Bulk ingestion and reproducible snapshots.',
      'Масове завантаження та відтворювані знімки.'
    ),
    caveat: text(
      'Scenarios and archetypes are separate datasets.',
      'Сценарії та архетипи є окремими наборами.'
    ),
  },
  {
    id: 'ndjson',
    label: text('NDJSON', 'NDJSON'),
    location: '/data/latest/registry.ndjson',
    includes: text(
      'One line per ontology entry across all 11 collections.',
      'Один рядок на кожну сутність усіх 11 колекцій.'
    ),
    best_for: text(
      'Streaming, indexing, and line-oriented ETL.',
      'Потокова обробка, індексація та рядковий ETL.'
    ),
    caveat: text(
      'Release metadata lives in manifest.json.',
      'Метадані релізу містяться в manifest.json.'
    ),
  },
  {
    id: 'graph',
    label: text('Graph exports', 'Графові експорти'),
    location: '/data/latest/{graph.json,graph.graphml,nodes.csv,edges.csv}',
    includes: text(
      'The six reader-facing finding types and their causal/topological relations.',
      'Шість читацьких типів знахідок та їхні причинні/топологічні зв’язки.'
    ),
    best_for: text('Network analysis and visualization.', 'Мережевий аналіз і візуалізація.'),
    caveat: text(
      'This is a projection, not the complete ontology inventory.',
      'Це проєкція, а не повний інвентар онтології.'
    ),
  },
  {
    id: 'schemas',
    label: text('JSON Schemas', 'JSON Schema'),
    location: '/schemas/*.schema.json',
    includes: text(
      'Draft-07 schemas for all 11 entity types and the complete bundle.',
      'Draft-07 схеми для всіх 11 типів сутностей і повного пакета.'
    ),
    best_for: text(
      'Validating files and generating typed clients.',
      'Валідація файлів і генерація типізованих клієнтів.'
    ),
    caveat: text(
      'Semantic cross-record rules still require the validator.',
      'Семантичні міжзаписні правила все одно потребують валідатора.'
    ),
  },
  {
    id: 'openapi',
    label: text('OpenAPI', 'OpenAPI'),
    location: '/openapi.json',
    includes: text(
      'The read-only REST contract for all 11 collections and graph projection.',
      'Контракт REST лише для читання для всіх 11 колекцій і графової проєкції.'
    ),
    best_for: text('Client generation and API discovery.', 'Генерація клієнтів і огляд API.'),
    caveat: text(
      'Static hosting means there are no write operations.',
      'Статичний хостинг не має операцій запису.'
    ),
  },
  {
    id: 'cli',
    label: text('CLI', 'CLI'),
    location: 'hoba',
    includes: text(
      'Search, lookup, scenarios, diagnostics, validation, timing, runway, graph, and formal checks.',
      'Пошук, lookup, сценарії, діагностика, валідація, час, runway, граф і формальні перевірки.'
    ),
    best_for: text(
      'Local automation, CI, and human-readable investigation.',
      'Локальна автоматизація, CI та читабельне дослідження.'
    ),
    caveat: text(
      'Run against a registry checkout; use --json for automation.',
      'Запускайте на checkout реєстру; для автоматизації використовуйте --json.'
    ),
  },
  {
    id: 'mcp',
    label: text('MCP server', 'MCP-сервер'),
    location: '@hoba/mcp',
    includes: text(
      'Canonical lookup/search plus deterministic diagnostic and validation tools.',
      'Канонічний lookup/search та детерміновані діагностичні й валідаційні інструменти.'
    ),
    best_for: text(
      'Agent and LLM tool use without copying the dataset into prompts.',
      'Використання агентами та LLM без копіювання набору в промпти.'
    ),
    caveat: text(
      'Natural-language reasoning belongs to the client; MCP returns data and checks.',
      'Мовне міркування належить клієнту; MCP повертає дані та перевірки.'
    ),
  },
  {
    id: 'llm-text',
    label: text('LLM discovery text', 'Текст для LLM'),
    location: '/llms.txt + /llms-full.txt',
    includes: text(
      'A compact map and a full readable snapshot of the documented registry.',
      'Компактна мапа та повний читабельний знімок задокументованого реєстру.'
    ),
    best_for: text(
      'Retrieval/bootstrap when MCP is unavailable.',
      'Початкове завантаження або retrieval, коли MCP недоступний.'
    ),
    caveat: text(
      'Prefer MCP or structured exports for exact IDs and current counts.',
      'Для точних ID і актуальних підрахунків віддавайте перевагу MCP або структурованим експортам.'
    ),
  },
  {
    id: 'validation',
    label: text('Validation tools', 'Інструменти валідації'),
    location: 'hoba validate / MCP validate_* / HTTP validation endpoints',
    includes: text(
      'Schema, referential, graph, mirror-parity, scenario, analysis, and claim checks.',
      'Перевірки схем, посилань, графа, паритету мовних дзеркал, сценаріїв, аналізів і тверджень.'
    ),
    best_for: text(
      'Checking proposed data and integrations before publication.',
      'Перевірка запропонованих даних та інтеграцій до публікації.'
    ),
    caveat: text(
      'Validation proves conformance, not that a causal claim is true.',
      'Валідація доводить відповідність, а не істинність причинного твердження.'
    ),
  },
  {
    id: 'lean',
    label: text('Lean projection', 'Lean-проєкція'),
    location: 'formal/lean/Hoba/Data.lean',
    includes: text(
      'Generated formal data used by theorem checks.',
      'Згенеровані формальні дані для перевірки теорем.'
    ),
    best_for: text('Machine-checked invariants.', 'Машинно перевірені інваріанти.'),
    caveat: text(
      'Derived from canonical data; never edit generated Lean by hand.',
      'Виводиться з канонічних даних; не редагуйте згенерований Lean вручну.'
    ),
  },
] as const;

export interface UsageSituation {
  id: string;
  situation: LocalizedText;
  recommended: readonly DataSurfaceId[];
  action: LocalizedText;
}

export const USAGE_SITUATIONS: readonly UsageSituation[] = [
  {
    id: 'read',
    situation: text('Understand one concept in context', 'Зрозуміти одне поняття в контексті'),
    recommended: ['web'],
    action: text(
      'Open the reader page; follow related entries and evidence.',
      'Відкрийте читацьку сторінку; переходьте до пов’язаних сутностей і джерел.'
    ),
  },
  {
    id: 'lookup',
    situation: text('Fetch one known canonical ID', 'Отримати один відомий канонічний ID'),
    recommended: ['rest', 'cli', 'mcp'],
    action: text(
      'GET the collection item, run hoba show, or call get_node.',
      'Зробіть GET елемента колекції, виконайте hoba show або викличте get_node.'
    ),
  },
  {
    id: 'search',
    situation: text('Find concepts without knowing an ID', 'Знайти поняття без знання ID'),
    recommended: ['cli', 'mcp'],
    action: text(
      'Search all 11 ontology collections by ID, title, and prose.',
      'Шукайте в усіх 11 колекціях за ID, назвою та текстом.'
    ),
  },
  {
    id: 'known-situation',
    situation: text(
      'Start from a recurring real-world situation',
      'Почати з повторюваної реальної ситуації'
    ),
    recommended: ['web', 'cli', 'mcp'],
    action: text(
      'Use a validated scenario, then inspect its explicit non-inferences.',
      'Використайте валідований сценарій і перевірте його явні невисновки.'
    ),
  },
  {
    id: 'diagnose',
    situation: text(
      'Separate observations from compatible causes',
      'Відокремити спостереження від сумісних причин'
    ),
    recommended: ['cli', 'mcp', 'web'],
    action: text(
      'Run the H→O→B→A diagnostic protocol; do not jump from signal to motive.',
      'Запустіть діагностичний протокол H→O→B→A; не переходьте від сигналу прямо до мотиву.'
    ),
  },
  {
    id: 'bulk',
    situation: text(
      'Load the entire ontology into a data system',
      'Завантажити всю онтологію в систему даних'
    ),
    recommended: ['bulk-json', 'ndjson'],
    action: text(
      'Use registry.json for one snapshot or NDJSON for streaming.',
      'Використайте registry.json для знімка або NDJSON для потоку.'
    ),
  },
  {
    id: 'network',
    situation: text(
      'Analyze causal/topological relationships',
      'Аналізувати причинні/топологічні зв’язки'
    ),
    recommended: ['graph'],
    action: text(
      'Use graph JSON/GraphML/CSV; remember it is the six-type finding projection.',
      'Використайте graph JSON/GraphML/CSV; пам’ятайте, що це проєкція шести типів знахідок.'
    ),
  },
  {
    id: 'integrate',
    situation: text('Build a typed integration', 'Побудувати типізовану інтеграцію'),
    recommended: ['openapi', 'schemas', 'rest'],
    action: text(
      'Generate a client from OpenAPI and validate payloads with JSON Schema.',
      'Згенеруйте клієнт з OpenAPI та валідуйте payload через JSON Schema.'
    ),
  },
  {
    id: 'agent',
    situation: text('Give an agent exact registry access', 'Дати агенту точний доступ до реєстру'),
    recommended: ['mcp'],
    action: text(
      'Connect the MCP server so the model calls tools instead of guessing from copied prose.',
      'Під’єднайте MCP-сервер, щоб модель викликала інструменти, а не вгадувала з копійованого тексту.'
    ),
  },
  {
    id: 'contribute',
    situation: text('Add or change registry data', 'Додати або змінити дані реєстру'),
    recommended: ['source', 'validation'],
    action: text(
      'Edit authored data only, run strict validation and the build, then review generated drift.',
      'Редагуйте лише авторські дані, запустіть strict validation і build, потім перевірте generated drift.'
    ),
  },
  {
    id: 'prove',
    situation: text('Verify formal invariants', 'Перевірити формальні інваріанти'),
    recommended: ['validation', 'lean'],
    action: text(
      'Regenerate the formal projection and run the Lean checks.',
      'Перегенеруйте формальну проєкцію та запустіть Lean-перевірки.'
    ),
  },
] as const;

export const LATEST_EXPORTS = [
  'inventory.json',
  'coverage.json',
  'registry.json',
  'registry.ndjson',
  'nodes.csv',
  'edges.csv',
  'graph.graphml',
  'graph.json',
  'schema.json',
  'manifest.json',
] as const;

export interface BuildDataInventoryOptions {
  scenarios: number;
  archetypes: number;
}

/** A serializable, measured view of the catalog for humans and machines. */
export function buildDataInventory(bundle: RegistryBundle, options: BuildDataInventoryOptions) {
  const collections = ENTITY_CATALOG.map((entry) => ({
    ...entry,
    count: bundle[entry.collection].length,
  }));
  const ontologyEntries = collections.reduce((sum, entry) => sum + entry.count, 0);
  const nonEvidenceEntries = collections
    .filter((entry) => entry.type !== 'evidence')
    .reduce((sum, entry) => sum + entry.count, 0);

  return {
    inventory_version: '1.0.0',
    registry_version: bundle.version,
    schema_version: bundle.schema_version,
    updated_at: bundle.updated_at,
    authority_model: {
      canonical: text(
        'Authored ontology and evidence: the source of truth.',
        'Авторська онтологія та джерела: джерело правди.'
      ),
      composition: text(
        'Validated references over canonical IDs; never a new entity kind.',
        'Валідовані посилання на канонічні ID; ніколи не новий тип сутності.'
      ),
      presentation: text(
        'Browsing metadata with no evidentiary authority.',
        'Метадані для огляду без доказової сили.'
      ),
      derived: text(
        'Recomputed output; never edited as source.',
        'Перерахований результат; ніколи не редагується як джерело.'
      ),
    },
    totals: {
      ontology_entries: ontologyEntries,
      non_evidence_entries: nonEvidenceEntries,
      collections: collections.length,
      scenarios: options.scenarios,
      archetypes: options.archetypes,
    },
    collections,
    auxiliary_datasets: AUXILIARY_DATASETS.map((entry) => ({
      ...entry,
      count:
        entry.id === 'scenarios'
          ? options.scenarios
          : entry.id === 'archetypes'
            ? options.archetypes
            : null,
    })),
    surfaces: DATA_SURFACES,
    situations: USAGE_SITUATIONS,
    latest_exports: LATEST_EXPORTS,
  } as const;
}
