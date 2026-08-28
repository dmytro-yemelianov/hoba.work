/**
 * Vector Cat Engine — Type Definitions
 * Combinatorial Parametric System supporting trillions of unique cats.
 */

export type CatPose =
  | 'loaf' // Котобуханець (compact rounded bread, tucked paws)
  | 'sitting' // Гордовито сидячий (classic upright noble pose)
  | 'stretching' // Потягусі / Йога-кіт (arched back, extended paws)
  | 'chilling' // Чіл на спині / пузі (belly up / relaxed sprawl)
  | 'pounce' // Мисливець / Низький старт перед стрибком
  | 'orb' // Кругляш / Сферичний пухнастий кіт (chonk)
  | 'longcat' // Довгокіт / Кіт-ковбаска
  | 'box'; // Кіт у коробці ("якщо я влізу, я сиджу")

export type HeadShape =
  | 'round' // Кругленька
  | 'fluffyCheeks' // З пишними пухнастими щічками
  | 'triangle' // Витончена трикутна
  | 'heart' // Сердечком
  | 'chonky' // Масивна хлібна
  | 'oval'; // Овальна

export type EarType =
  | 'classic' // Класичні гострі
  | 'fold' // Шотландські висловухі (Scottish fold)
  | 'curl' // Закручені назад (American curl)
  | 'lynx' // З рисячими китицями
  | 'bigServal' // Величезні вуха-локатори
  | 'roundBear' // Округлі вушка
  | 'floppy'; // Опущені м'які

export type EyeShape =
  | 'animeSparkle' // Величезні блискучі очі з подвійним бліком
  | 'curvedHappy' // Закриті щасливі дужки (^ ^)
  | 'sleepyLids' // Сонні напівприкриті
  | 'shockedRound' // Круглі блюдечка від здивування (O O)
  | 'sassySquint' // Хитрий прищур
  | 'wink' // Підморгування (^ o)
  | 'derpCross' // Кумедні очі в різні боки (o . O)
  | 'slitPredator'; // Хижі вертикальні зіниці

export type EyeColor =
  | 'emerald' // Смарагдовий зелений (#10b981)
  | 'amberGold' // Теплий бурштиновий (#f59e0b)
  | 'cyanSky' // Небесно-блакитний (#0ea5e9)
  | 'sapphireDeep' // Глибокий волошковий сапфір (#3b82f6)
  | 'heterochromia' // Різнокольорові очі (блакитне + бурштинове)
  | 'rubyGlow' // Містичний рубіновий (#f43f5e)
  | 'amethystViolet' // Аметистовий фіолетовий (#a855f7)
  | 'copperSun'; // Мідний захід сонця (#ea580c)

export type MouthEmotion =
  | 'purr3' // :3 Класичний щасливий мурчик
  | 'blep' // :P Крихітний рожевий язичок
  | 'smugSmile' // Хитра самовдоволена посмішка
  | 'gaspO' // :O Відкритий здивований ротик з мікро-іклами
  | 'grumpyLine' // Суворий поважний невдоволений вираз
  | 'yowlScream' // Драматичний няв / спів
  | 'sleepyZ' // Сплячий спокійний ротик
  | 'neutralW'; // Акуратний w-подібний носик і губки

export type CoatStyle =
  | 'ginger' // Рудий / Мармеладний (Ginger / Orange Tabby)
  | 'voidBlack' // Чорний войд з фіолетово-синім бліком
  | 'snowWhite' // Білосніжний хмаринка
  | 'britishBlue' // Димчастий британський сіро-блакитний
  | 'classicTabby' // Класичний смугастик (сірий/коричневий таббі)
  | 'tuxedo' // Смокінг (чорно-білий з білими шкарпетками)
  | 'calico' // Триколірний каліко (білий + рудий + чорний)
  | 'siamese' // Сіамський / Колор-пойнт (світле тіло, темні точки)
  | 'cyberNeon' // Кіберпанк / Неоновий кіт (градієнт індиго-маджента)
  | 'pastelMarshmallow'; // Пастельний зефірний градієнт

export type FurPattern =
  | 'none' // Суцільне забарвлення
  | 'tabbyStripes' // Тигрові смужки на спинці та лобику (знак M)
  | 'dappledSpots' // Плямистий леопардовий візерунок
  | 'bellyPatch' // Біла манишка / пузико
  | 'socksAndBib' // Білі шкарпетки на всіх 4 лапках та грудка
  | 'heartPatch' // Сердечко на боці
  | 'maskedBandit'; // Маска єнота / окуляри навколо очей

export type TailType =
  | 'fluffyPlume' // Пишний лисячий хвіст
  | 'sleekWhip' // Тонкий витончений хвіст гачком
  | 'curlySpiral' // Закручений бубликом
  | 'bobtailBun' // Короткий хвостик-помпончик
  | 'zigzagKink' // Хвіст блискавкою / з заломом
  | 'candyCane'; // Хвіст-тростина з білим кінчиком

export type HeadAccessory =
  | 'none'
  | 'wizardHat' // Гостроверхий капелюх чарівника із зіркою
  | 'royalCrown' // Золота корона з рубіном
  | 'fishOnHead' // Маленька весела рибка на маківці
  | 'flowerCrown' // Віночок із весняних квітів
  | 'frogBeanie' // Шапочка-жабка з оченятами
  | 'chefHat' // Кухарський ковпак
  | 'sunglasses' // Круті сонцезахисні окуляри
  | 'angelHalo' // Сяючий золотий німб
  | 'sproutLeaf' // Маленький зелений пагінець на голові
  | 'partyHat' // Святковий ковпачок з конфеті
  | 'devilHorns'; // Маленькі грайливі ріжки

export type NeckAccessory =
  | 'none'
  | 'bellCollar' // Червоний нашийник із золотим дзвіночком
  | 'bowTie' // Елегантний чорний або червоний метелик
  | 'warmScarf' // Затишний в'язаний смугастий шарф
  | 'fishbonePendant' // Кулон у вигляді риб'ячого кістяка
  | 'pearlNecklace' // Перлове намисто
  | 'bandanaPirate'; // Піратська бандана з черепком

export type PropItem =
  | 'none'
  | 'coffeeMug' // Чашка гарячої кави з парою
  | 'yarnBall' // Клубок шерсті з розмотаною ниткою
  | 'laserDot' // Червона лазерна крапка на підлозі
  | 'mouseFriend' // Маленьке іграшкове мишеня
  | 'fishSkeleton' // З'їдена рибка
  | 'pottedPlant' // Перекинутий або цілий вазончик
  | 'butterflyOnNose'; // Яскравий метелик, що сів на носик

export type BackdropTheme =
  | 'transparent' // Чистий прозорий фон
  | 'sparkleStars' // Золоті мерехтливі зірочки
  | 'floatingHearts' // Рожеві плаваючі сердечка
  | 'pawPrints' // Сліди від котячих лапок
  | 'cozyPillow' // М'яка затишна подушка знизу
  | 'glowingAura' // Радіальне магічне свічення
  | 'cyberGrid' // Неонова перспектива кіберпанку
  | 'fishPattern'; // Делікатні плаваючі контури рибок

/** Complete DNA representation of a Cat */
export interface CatDNA {
  seed: string;
  version: number;
  pose: CatPose;
  headShape: HeadShape;
  earType: EarType;
  eyeShape: EyeShape;
  eyeColor: EyeColor;
  mouthEmotion: MouthEmotion;
  coatStyle: CoatStyle;
  furPattern: FurPattern;
  tailType: TailType;
  headAccessory: HeadAccessory;
  neckAccessory: NeckAccessory;
  propItem: PropItem;
  backdropTheme: BackdropTheme;
  // Continuous micro-parameters (0..1) for infinite subtle organic variation
  whiskerLength: number;
  blushIntensity: number;
  chonkFactor: number; // 0.8 (sleek) to 1.3 (ultra chonk)
  earAngleOffset: number; // Slight tilt
  tailWagAngle: number;
  furHueShift: number; // Subtle shift in primary tone (-20..+20 deg)
  name?: string;
  title?: string;
}

export interface CatColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  belly: string;
  innerEar: string;
  nose: string;
  tongue: string;
  eyeLeft: string;
  eyeRight: string;
  lineStroke: string;
  blush: string;
  accent: string;
  shadow: string;
  highlight: string;
}
