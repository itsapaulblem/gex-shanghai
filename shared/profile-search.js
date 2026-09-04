import { pinyin } from 'pinyin-pro';

const SEARCH_TRANSLATIONS = {
  互联网: ['internet', 'tech', 'technology'],
  金融: ['finance', 'financial'],
  教育: ['education'],
  建筑: ['construction', 'architecture'],
  医疗: ['medical', 'healthcare'],
  硕士: ['master', 'masters', 'graduate'],
  本科: ['bachelor', 'bachelors', 'undergraduate'],
  博士: ['phd', 'doctorate'],
  大专: ['college', 'associate'],
  有房: ['own house', 'property owner'],
  无房: ['no house', 'no property'],
  有车: ['own car'],
  无车: ['no car'],
};

const PROFILE_SEARCH_FIELDS = [
  'childAlias',
  'city',
  'hukou',
  'hometown',
  'education',
  'school',
  'major',
  'industry',
  'jobTitle',
  'income',
  'property',
  'car',
  'hobbies',
  'about',
  'preferences',
  'preferredAgeRange',
  'preferredHeightRange',
  'minEducationLevel',
  'hukouPreference',
  'additionalPreferences',
];

function searchableVersions(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const phonetic = pinyin(normalized, { toneType: 'none' }).toLowerCase();
  const compactPhonetic = phonetic.replace(/[\s'-]+/g, '');
  const translations = Object.entries(SEARCH_TRANSLATIONS)
    .filter(([chinese]) => normalized.includes(chinese))
    .flatMap(([, aliases]) => aliases);

  return [normalized, phonetic, compactPhonetic, ...translations];
}

function buildProfileSearchCorpus(profile) {
  const values = PROFILE_SEARCH_FIELDS.map((field) => profile?.[field]);
  values.push(...(Array.isArray(profile?.traits) ? profile.traits : []));
  values.push(profile?.age, profile?.height);

  return [
    ...values.flatMap(searchableVersions),
    'city',
    'hukou',
    'school',
    'industry',
    'education',
    'income',
    'height',
  ].join(' ');
}

function matchesProfileSearch(profile, query) {
  const tokens = String(query ?? '')
    .trim()
    .toLowerCase()
    .split(/[\s,，]+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const corpus = buildProfileSearchCorpus(profile);
  return tokens.every((token) => corpus.includes(token));
}

export { buildProfileSearchCorpus, matchesProfileSearch };
