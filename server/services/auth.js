import crypto from 'node:crypto';
import { createId, getState, hashPassword, sanitizeUser, withState } from '../store.js';

function verifyPassword(password, passwordHash) {
  const candidate = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(passwordHash));
}

async function register({ email, password, language = 'zh' }) {
  return withState(async (state) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = state.users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      const error = new Error('EMAIL_EXISTS');
      error.statusCode = 409;
      throw error;
    }

    const user = {
      id: createId('user'),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      language,
    };

    const session = {
      token: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    state.users.push(user);
    state.sessions.push(session);

    return {
      token: session.token,
      user: sanitizeUser(user),
      profile: null,
    };
  });
}

async function login({ email, password }) {
  return withState(async (state) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = state.users.find((candidate) => candidate.email === normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      const error = new Error('INVALID_CREDENTIALS');
      error.statusCode = 401;
      throw error;
    }

    const existingSession = state.sessions.find((session) => session.userId === user.id);
    const session = existingSession ?? {
      token: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    if (!existingSession) {
      state.sessions.push(session);
    }

    const profile = state.profiles.find((candidate) => candidate.ownerUserId === user.id) ?? null;

    return {
      token: session.token,
      user: sanitizeUser(user),
      profile,
    };
  });
}

async function resolveSession(token) {
  await withState(async () => undefined);
  const state = getState();
  const session = state.sessions.find((candidate) => candidate.token === token);

  if (!session) {
    return null;
  }

  const user = state.users.find((candidate) => candidate.id === session.userId);
  if (!user) {
    return null;
  }

  const profile = state.profiles.find((candidate) => candidate.ownerUserId === user.id) ?? null;

  return {
    token,
    user: sanitizeUser(user),
    profile,
  };
}

async function updateLanguage(userId, language) {
  return withState(async (state) => {
    const user = state.users.find((candidate) => candidate.id === userId);
    if (!user) {
      return null;
    }
    user.language = language;
    return sanitizeUser(user);
  });
}

export { login, register, resolveSession, updateLanguage };