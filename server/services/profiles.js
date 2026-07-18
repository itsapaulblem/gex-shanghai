import { createId, getState, toPublicProfile, withState } from '../store.js';

function buildProfilePayload(input) {
  return {
    honorific: input.honorific?.trim() ?? '',
    surname: input.surname?.trim() ?? '',
    childAlias: input.childAlias.trim(),
    gender: input.gender,
    birthYear: Number(input.birthYear),
    age: Number(input.age),
    height: Number(input.height),
    weight: Number(input.weight),
    city: input.city.trim(),
    hukou: input.hukou.trim(),
    hometown: input.hometown.trim(),
    education: input.education.trim(),
    school: input.school.trim(),
    major: input.major.trim(),
    industry: input.industry.trim(),
    jobTitle: input.jobTitle.trim(),
    income: input.income.trim(),
    property: input.property.trim(),
    car: input.car.trim(),
    traits: input.traits.filter(Boolean).map((item) => item.trim()),
    hobbies: input.hobbies.trim(),
    about: input.about.trim(),
    preferences: input.preferences.trim(),
  };
}

function applyFilters(profiles, filters = {}) {
  const search = (filters.search ?? '').trim().toLowerCase();
  const gender = filters.gender ?? 'all';
  const city = filters.city ?? 'all';
  const education = filters.education ?? 'all';

  return profiles.filter((profile) => {
    const matchesSearch = !search || [profile.childAlias, profile.city, profile.hukou, profile.industry, profile.school, profile.about, profile.preferences]
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
    ownProfile: toPublicProfile(ownProfile),
    profiles: filteredProfiles.map(toPublicProfile),
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

  return toPublicProfile(profile);
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
    return profile;
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
    return profile;
  });
}

export { createProfile, getProfile, listProfiles, updateOwnProfile };