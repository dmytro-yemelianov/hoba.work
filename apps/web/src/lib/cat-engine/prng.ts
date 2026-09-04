/**
 * Vector Cat Engine — PRNG & DNA Serialization
 */

import type {
  CatDNA,
  CatPose,
  HeadShape,
  EarType,
  EyeShape,
  EyeColor,
  MouthEmotion,
  CoatStyle,
  FurPattern,
  TailType,
  HeadAccessory,
  NeckAccessory,
  PropItem,
  BackdropTheme,
} from './types.js';

/** SFC32 (Small Fast Chaotic 32-bit PRNG) */
export function createRng(seedStr: string): () => number {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0; i < seedStr.length; i++) {
    const k = seedStr.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h4 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  let a = h1,
    b = h2,
    c = h3,
    d = h4;
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function pick<T>(arr: readonly T[], rng: () => number): T {
  const index = Math.floor(rng() * arr.length);
  return arr[index] ?? arr[0];
}

export function range(min: number, max: number, rng: () => number): number {
  return min + rng() * (max - min);
}

export function chance(prob: number, rng: () => number): boolean {
  return rng() < prob;
}

export const POSES: readonly CatPose[] = [
  'loaf',
  'sitting',
  'stretching',
  'chilling',
  'pounce',
  'orb',
  'longcat',
  'box',
];

export const HEAD_SHAPES: readonly HeadShape[] = [
  'round',
  'fluffyCheeks',
  'triangle',
  'heart',
  'chonky',
  'oval',
];

export const EAR_TYPES: readonly EarType[] = [
  'classic',
  'fold',
  'curl',
  'lynx',
  'bigServal',
  'roundBear',
  'floppy',
];

export const EYE_SHAPES: readonly EyeShape[] = [
  'animeSparkle',
  'curvedHappy',
  'sleepyLids',
  'shockedRound',
  'sassySquint',
  'wink',
  'derpCross',
  'slitPredator',
];

export const EYE_COLORS: readonly EyeColor[] = [
  'emerald',
  'amberGold',
  'cyanSky',
  'sapphireDeep',
  'heterochromia',
  'rubyGlow',
  'amethystViolet',
  'copperSun',
];

export const MOUTH_EMOTIONS: readonly MouthEmotion[] = [
  'purr3',
  'blep',
  'smugSmile',
  'gaspO',
  'grumpyLine',
  'yowlScream',
  'sleepyZ',
  'neutralW',
];

export const COAT_STYLES: readonly CoatStyle[] = [
  'ginger',
  'voidBlack',
  'snowWhite',
  'britishBlue',
  'classicTabby',
  'tuxedo',
  'calico',
  'siamese',
  'cyberNeon',
  'pastelMarshmallow',
];

export const FUR_PATTERNS: readonly FurPattern[] = [
  'none',
  'tabbyStripes',
  'dappledSpots',
  'bellyPatch',
  'socksAndBib',
  'heartPatch',
  'maskedBandit',
];

export const TAIL_TYPES: readonly TailType[] = [
  'fluffyPlume',
  'sleekWhip',
  'curlySpiral',
  'bobtailBun',
  'zigzagKink',
  'candyCane',
];

export const HEAD_ACCESSORIES: readonly HeadAccessory[] = [
  'none',
  'wizardHat',
  'royalCrown',
  'fishOnHead',
  'flowerCrown',
  'frogBeanie',
  'chefHat',
  'sunglasses',
  'angelHalo',
  'sproutLeaf',
  'partyHat',
  'devilHorns',
];

export const NECK_ACCESSORIES: readonly NeckAccessory[] = [
  'none',
  'bellCollar',
  'bowTie',
  'warmScarf',
  'fishbonePendant',
  'pearlNecklace',
  'bandanaPirate',
];

export const PROP_ITEMS: readonly PropItem[] = [
  'none',
  'coffeeMug',
  'yarnBall',
  'laserDot',
  'mouseFriend',
  'fishSkeleton',
  'pottedPlant',
  'butterflyOnNose',
];

export const BACKDROP_THEMES: readonly BackdropTheme[] = [
  'transparent',
  'sparkleStars',
  'floatingHearts',
  'pawPrints',
  'cozyPillow',
  'glowingAura',
  'cyberGrid',
  'fishPattern',
];

const CAT_TITLES_UK = [
  'Володар Теплих Батарей',
  'Гроза Кімнатних Вазонів',
  'Нічний Тигидик',
  'Сер Пухнастий Батончик',
  'Великий Муркач',
  'Професор Котобуханства',
  'Шукач Ранкового Корму',
  'Хранитель Затишку',
  'Магістр Сметанознавства',
  'Космічний Мяу',
];

const CAT_NAMES_UK = [
  'Борис',
  'Мурчик',
  'Сметанка',
  'Персик',
  'Люциферчик',
  'Василь',
  'Булочка',
  'Зефір',
  'Шкарпетик',
  'Піксель',
  'Гарбузик',
  'Кузьма',
  'Сімба',
  'Тимофій',
  'Зірочка',
];

const CAT_NAMES_EN = [
  'Barnaby',
  'Mochi',
  'Pixel',
  'Biscuit',
  'Shadow',
  'Buttercup',
  'Sir Pounce',
  'Waffles',
  'Ziggy',
  'Noodle',
  'Peanut',
  'Cosmo',
  'Ollie',
  'Milo',
  'Cleo',
];

const CAT_TITLES_EN = [
  'Ruler of Sunbeams',
  'Nighttime Zoomies Champion',
  'Grand Master of Loafing',
  'Snack Inspector General',
  'Sleeper of 18 Hours',
  'Potted Plant Overturner',
  'Keeper of Cozy Blankets',
  'Supreme Void Entity',
];

export function generateCatName(
  seed: string,
  lang: 'uk' | 'en' = 'uk'
): { name: string; title: string } {
  const rng = createRng(`${seed}-identity`);
  if (lang === 'uk') {
    return {
      name: pick(CAT_NAMES_UK, rng),
      title: pick(CAT_TITLES_UK, rng),
    };
  }
  return {
    name: pick(CAT_NAMES_EN, rng),
    title: pick(CAT_TITLES_EN, rng),
  };
}

/** Generates deterministic DNA from seed */
export function generateDNA(seed: string): CatDNA {
  const rng = createRng(seed);
  const identity = generateCatName(seed, 'uk');

  const pose = pick(POSES, rng);
  const headShape = pick(HEAD_SHAPES, rng);
  const earType = pick(EAR_TYPES, rng);
  const eyeShape = pick(EYE_SHAPES, rng);
  const eyeColor = pick(EYE_COLORS, rng);
  const mouthEmotion = pick(MOUTH_EMOTIONS, rng);
  const coatStyle = pick(COAT_STYLES, rng);
  const furPattern = pick(FUR_PATTERNS, rng);
  const tailType = pick(TAIL_TYPES, rng);

  // Accessories have weighted distribution so not every cat is overloaded, but 60% have fun items
  const headAccessory = chance(0.45, rng)
    ? pick(
        HEAD_ACCESSORIES.filter((x) => x !== 'none'),
        rng
      )
    : 'none';
  const neckAccessory = chance(0.55, rng)
    ? pick(
        NECK_ACCESSORIES.filter((x) => x !== 'none'),
        rng
      )
    : 'none';
  const propItem = chance(0.4, rng)
    ? pick(
        PROP_ITEMS.filter((x) => x !== 'none'),
        rng
      )
    : 'none';
  const backdropTheme = pick(BACKDROP_THEMES, rng);

  return {
    seed,
    version: 1,
    pose,
    headShape,
    earType,
    eyeShape,
    eyeColor,
    mouthEmotion,
    coatStyle,
    furPattern,
    tailType,
    headAccessory,
    neckAccessory,
    propItem,
    backdropTheme,
    whiskerLength: range(0.7, 1.3, rng),
    blushIntensity: range(0.2, 0.9, rng),
    chonkFactor: range(0.85, 1.25, rng),
    earAngleOffset: range(-8, 8, rng),
    tailWagAngle: range(-15, 15, rng),
    furHueShift: range(-15, 15, rng),
    name: identity.name,
    title: identity.title,
  };
}

/** Creates a new random seed */
export function randomSeed(): string {
  const adj = [
    'cosmic',
    'chonky',
    'fluffy',
    'sleepy',
    'spicy',
    'noble',
    'derpy',
    'golden',
    'velvet',
    'quantum',
  ];
  const noun = [
    'cat',
    'loaf',
    'paw',
    'purr',
    'tail',
    'whiskers',
    'biscuit',
    'panther',
    'muffin',
    'feline',
  ];
  const num = Math.floor(Math.random() * 9000 + 1000);
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  return `${a}-${n}-${num}`;
}
