import { createId, getState, getUserPresence, toPublicProfile, withState } from '../store.js';

function toProfileResponse(profile, state) {
  if (!profile) {
    return null;
  }

  return {
    ...toPublicProfile(profile),
    presence: getUserPresence(profile.ownerUserId, state),
  };
}

function validationError(code) {
  const error = new Error(code);
  error.statusCode = 400;
  return error;
}

function requiredText(input, field) {
  if (typeof input?.[field] !== 'string' || !input[field].trim()) {
    throw validationError('PROFILE_REQUIRED');
  }

  return input[field].trim();
}

function optionalText(input, field) {
  if (input?.[field] == null) {
    return '';
  }

  if (typeof input[field] !== 'string') {
    throw validationError('PROFILE_INVALID');
  }

  return input[field].trim();
}

function positiveNumber(input, field, errorCode) {
  const rawValue = input?.[field];
  if ((typeof rawValue !== 'string' && typeof rawValue !== 'number') || String(rawValue).trim() === '') {
    throw validationError('PROFILE_REQUIRED');
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) {
    throw validationError(errorCode);
  }

  return value;
}

function buildProfilePayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw validationError('PROFILE_INVALID');
  }

  const birthYear = positiveNumber(input, 'birthYear', 'PROFILE_INVALID');
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(birthYear) || birthYear < 1940 || birthYear > currentYear) {
    throw validationError('PROFILE_INVALID');
  }

  if (input.gender !== '男' && input.gender !== '女') {
    throw validationError('PROFILE_INVALID');
  }

  if (!Array.isArray(input.traits)) {
    throw validationError('PROFILE_REQUIRED');
  }

  const traits = input.traits
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  if (traits.length === 0 || traits.length !== input.traits.length) {
    throw validationError('PROFILE_REQUIRED');
  }

  const preferenceDetails = {
    preferredAgeRange: optionalText(input, 'preferredAgeRange'),
    preferredHeightRange: optionalText(input, 'preferredHeightRange'),
    minEducationLevel: optionalText(input, 'minEducationLevel'),
    hukouPreference: optionalText(input, 'hukouPreference'),
    additionalPreferences: optionalText(input, 'additionalPreferences'),
  };

  const preferencesSummary = [
    preferenceDetails.preferredAgeRange,
    preferenceDetails.preferredHeightRange,
    preferenceDetails.minEducationLevel,
    preferenceDetails.hukouPreference,
    preferenceDetails.additionalPreferences,
  ].filter(Boolean).join(' · ');

  return {
    honorific: requiredText(input, 'honorific'),
    surname: requiredText(input, 'surname'),
    childAlias: requiredText(input, 'childAlias'),
    gender: input.gender,
    birthYear,
    age: currentYear - birthYear,
    height: positiveNumber(input, 'height', 'HEIGHT_INVALID'),
    weight: positiveNumber(input, 'weight', 'WEIGHT_INVALID'),
    city: requiredText(input, 'city'),
    hukou: requiredText(input, 'hukou'),
    hometown: requiredText(input, 'hometown'),
    education: requiredText(input, 'education'),
    school: requiredText(input, 'school'),
    major: requiredText(input, 'major'),
    industry: requiredText(input, 'industry'),
    jobTitle: requiredText(input, 'jobTitle'),
    income: requiredText(input, 'income'),
    property: requiredText(input, 'property'),
    car: requiredText(input, 'car'),
    traits,
    hobbies: requiredText(input, 'hobbies'),
    about: optionalText(input, 'about'),
    ...preferenceDetails,
    preferences: preferencesSummary,
  };
}

function applyFilters(profiles, filters = {}) {
  const search = (filters.search ?? '').trim().toLowerCase();
  const gender = filters.gender ?? 'all';
  const city = filters.city ?? 'all';
  const education = filters.education ?? 'all';

  return profiles.filter((profile) => {
    const matchesSearch = !search || [profile.childAlias, profile.city, profile.hukou, profile.industry, profile.school, profile.about, profile.preferences, profile.preferredAgeRange, profile.preferredHeightRange, profile.minEducationLevel, profile.hukouPreference, profile.additionalPreferences]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));

    const matchesGender = gender === 'all' || profile.gender === gender;
    const matchesCity = city === 'all' || profile.city === city;
    const matchesEducation = education === 'all' || profile.education === education;

    return matchesSearch && matchesGender && matchesCity && matchesEducation;
  });
}

function sortProfiles(profiles, sort = 'latest') {
  const cloned = [...profiles];

  if (sort === 'age-asc') {
    return cloned.sort((left, right) => left.age - right.age);
  }

  if (sort === 'age-desc') {
    return cloned.sort((left, right) => right.age - left.age);
  }

  if (sort === 'height') {
    return cloned.sort((left, right) => right.height - left.height);
  }

  return cloned.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

async function listProfiles(userId, filters = {}) {
  await withState(async () => undefined);
  const state = getState();
  const ownProfile = state.profiles.find((profile) => profile.ownerUserId === userId);
  const profiles = state.profiles.filter((profile) => profile.ownerUserId !== userId);
  const filteredProfiles = sortProfiles(applyFilters(profiles, filters), filters.sort);

  return {
    ownProfile: toProfileResponse(ownProfile, state),
    profiles: filteredProfiles.map((profile) => toProfileResponse(profile, state)),
  };
}

async function getProfile(profileId, userId) {
  await withState(async () => undefined);
  const state = getState();
  const profile = state.profiles.find((candidate) => candidate.id === profileId) ?? null;

  if (!profile) {
    return null;
  }

  const ownProfile = state.profiles.find((candidate) => candidate.ownerUserId === userId);
  if (profile.ownerUserId !== userId && !ownProfile) {
    return profile;
  }

  return toProfileResponse(profile, state);
}

async function createProfile(userId, input) {
  return withState(async (state) => {
    const existingProfile = state.profiles.find((profile) => profile.ownerUserId === userId);
    if (existingProfile) {
      const error = new Error('PROFILE_EXISTS');
      error.statusCode = 409;
      throw error;
    }

    const profile = {
      id: createId('profile'),
      ownerUserId: userId,
      ...buildProfilePayload(input),
      createdAt: new Date().toISOString(),
    };

    state.profiles.push(profile);
    return toProfileResponse(profile, state);
  });
}

async function updateOwnProfile(userId, input) {
  return withState(async (state) => {
    const profile = state.profiles.find((candidate) => candidate.ownerUserId === userId);
    if (!profile) {
      const error = new Error('PROFILE_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    Object.assign(profile, buildProfilePayload(input));
    return toProfileResponse(profile, state);
  });
}

export { createProfile, getProfile, listProfiles, updateOwnProfile };
