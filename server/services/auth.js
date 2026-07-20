import crypto from 'node:crypto';
import { createId, getState, hashPassword, sanitizeUser, touchUserActivity, withState } from '../store.js';
import { sendPasswordResetEmail, sendSignupOtpEmail } from './mailer.js';

function verifyPassword(password, user) {
  const candidate = user.passwordSalt ? hashPassword(password, user.passwordSalt) : hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(user.passwordHash));
}

function createSessionUser(user) {
  return {
    ...sanitizeUser(user),
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt ?? null,
  };
}

function validateRegistration(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    const error = new Error('EMAIL_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedEmail.includes('@')) {
    const error = new Error('EMAIL_INVALID');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPassword = validatePasswordStrength(password);

  return { normalizedEmail, normalizedPassword };
}

function validatePasswordStrength(password) {
  const normalizedPassword = password.trim();
  if (normalizedPassword.length < 8 || !/[A-Z]/.test(normalizedPassword) || !/[^A-Za-z0-9]/.test(normalizedPassword)) {
    const error = new Error('PASSWORD_TOO_WEAK');
    error.statusCode = 400;
    throw error;
  }

  return normalizedPassword;
}

function normalizeEmail(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  if (!normalizedEmail) {
    const error = new Error('EMAIL_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedEmail.includes('@')) {
    const error = new Error('EMAIL_INVALID');
    error.statusCode = 400;
    throw error;
  }

  return normalizedEmail;
}

function hashOtpCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function requestSignupOtp({ email, language = 'zh' }) {
  const normalizedEmail = normalizeEmail(email);

  return withState(async (state) => {
    const existingUser = state.users.find((user) => user.email === normalizedEmail);
    if (existingUser) {
      const error = new Error('EMAIL_EXISTS');
      error.statusCode = 409;
      throw error;
    }

    const code = generateOtpCode();
    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000).toISOString();
    const otpRecord = {
      id: createId('signup_otp'),
      email: normalizedEmail,
      codeHash: hashOtpCode(code),
      expiresAt,
      attempts: 0,
      verifiedAt: null,
      language,
      createdAt: new Date(now).toISOString(),
    };

    state.signupOtps = (state.signupOtps ?? []).filter((candidate) => candidate.email !== normalizedEmail);
    state.signupOtps.push(otpRecord);

    await sendSignupOtpEmail(normalizedEmail, code, language);
    return { ok: true, expiresAt };
  });
}

async function verifySignupOtp({ email, otp }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp ?? '').trim();
  if (!/^\d{6}$/.test(normalizedOtp)) {
    const error = new Error('OTP_INVALID');
    error.statusCode = 400;
    throw error;
  }

  return withState(async (state) => {
    const record = (state.signupOtps ?? []).find((candidate) => candidate.email === normalizedEmail) ?? null;
    if (!record) {
      const error = new Error('OTP_REQUIRED');
      error.statusCode = 400;
      throw error;
    }

    const expiresMs = new Date(record.expiresAt).getTime();
    if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
      state.signupOtps = (state.signupOtps ?? []).filter((candidate) => candidate.id !== record.id);
      const error = new Error('OTP_EXPIRED');
      error.statusCode = 400;
      throw error;
    }

    record.attempts = Number(record.attempts ?? 0) + 1;
    if (record.attempts > 5) {
      state.signupOtps = (state.signupOtps ?? []).filter((candidate) => candidate.id !== record.id);
      const error = new Error('OTP_TOO_MANY_ATTEMPTS');
      error.statusCode = 429;
      throw error;
    }

    if (record.codeHash !== hashOtpCode(normalizedOtp)) {
      const error = new Error('OTP_INVALID');
      error.statusCode = 400;
      throw error;
    }

    record.verifiedAt = new Date().toISOString();
    return { ok: true };
  });
}

async function register({ email, password, language = 'zh' }) {
  return withState(async (state) => {
    const { normalizedEmail, normalizedPassword } = validateRegistration(email, password);
    const existingUser = state.users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      const error = new Error('EMAIL_EXISTS');
      error.statusCode = 409;
      throw error;
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');

    const user = {
      id: createId('user'),
      email: normalizedEmail,
      passwordSalt,
      passwordHash: hashPassword(normalizedPassword, passwordSalt),
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
    touchUserActivity(user.id, session.createdAt);

    return {
      token: session.token,
      user: createSessionUser(user),
      profile: null,
    };
  });
}

async function login({ email, password }) {
  return withState(async (state) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = state.users.find((candidate) => candidate.email === normalizedEmail);

    if (!user || !verifyPassword(password.trim(), user)) {
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

    touchUserActivity(user.id);

    const profile = state.profiles.find((candidate) => candidate.ownerUserId === user.id) ?? null;

    return {
      token: session.token,
      user: createSessionUser(user),
      profile,
    };
  });
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function requestPasswordReset({ email, baseUrl }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  if (!normalizedEmail) {
    const error = new Error('EMAIL_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedEmail.includes('@')) {
    const error = new Error('EMAIL_INVALID');
    error.statusCode = 400;
    throw error;
  }

  const fallbackBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3001';
  const origin = String(baseUrl ?? fallbackBaseUrl).replace(/\/$/, '');

  return withState(async (state) => {
    const user = state.users.find((candidate) => candidate.email === normalizedEmail) ?? null;

    if (!user) {
      return { ok: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenRecord = {
      id: createId('reset'),
      userId: user.id,
      tokenHash: hashResetToken(resetToken),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    state.passwordResetTokens = state.passwordResetTokens.filter((candidate) => candidate.userId !== user.id);
    state.passwordResetTokens.push(tokenRecord);

    const resetLink = `${origin}/?resetToken=${encodeURIComponent(resetToken)}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return { ok: true };
  });
}

async function resetPassword({ token, password }) {
  const normalizedToken = String(token ?? '').trim();
  if (!normalizedToken) {
    const error = new Error('RESET_TOKEN_REQUIRED');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPassword = validatePasswordStrength(password);

  return withState(async (state) => {
    const tokenHash = hashResetToken(normalizedToken);
    const tokenRecord = state.passwordResetTokens.find((candidate) => candidate.tokenHash === tokenHash) ?? null;

    if (!tokenRecord) {
      const error = new Error('RESET_TOKEN_INVALID');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
      state.passwordResetTokens = state.passwordResetTokens.filter((candidate) => candidate.id !== tokenRecord.id);
      const error = new Error('RESET_TOKEN_EXPIRED');
      error.statusCode = 400;
      throw error;
    }

    const user = state.users.find((candidate) => candidate.id === tokenRecord.userId) ?? null;
    if (!user) {
      state.passwordResetTokens = state.passwordResetTokens.filter((candidate) => candidate.id !== tokenRecord.id);
      const error = new Error('RESET_TOKEN_INVALID');
      error.statusCode = 400;
      throw error;
    }

    const passwordSalt = crypto.randomBytes(16).toString('hex');
    user.passwordSalt = passwordSalt;
    user.passwordHash = hashPassword(normalizedPassword, passwordSalt);
    touchUserActivity(user.id);

    state.sessions = state.sessions.filter((session) => session.userId !== user.id);
    state.passwordResetTokens = state.passwordResetTokens.filter((candidate) => candidate.userId !== user.id);

    return { ok: true };
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
  touchUserActivity(user.id);

  return {
    token,
    user: createSessionUser(user),
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
    touchUserActivity(user.id);
    return createSessionUser(user);
  });
}

export {
  login,
  register,
  requestPasswordReset,
  requestSignupOtp,
  resetPassword,
  resolveSession,
  updateLanguage,
  verifySignupOtp,
};