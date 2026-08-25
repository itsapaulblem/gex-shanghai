import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.GEX_DATA_DIR
  ? path.resolve(process.env.GEX_DATA_DIR)
  : path.resolve(__dirname, '..', '.data');
const dbPath = path.join(dataDir, 'gex-shanghai.json');

let state;
let statePromise;

function hashPassword(password, salt = '') {
  if (!salt) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedState() {
  const seededUsers = [
    {
      id: 'user_seed_1',
      email: 'wang.mei@example.cn',
      passwordHash: hashPassword('demo1234'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
    {
      id: 'user_seed_2',
      email: 'li.yun@example.cn',
      passwordHash: hashPassword('seed-pass-2'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
    {
      id: 'user_seed_3',
      email: 'chen.xi@example.cn',
      passwordHash: hashPassword('seed-pass-3'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
    {
      id: 'user_seed_4',
      email: 'wu.qing@example.cn',
      passwordHash: hashPassword('seed-pass-4'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
    {
      id: 'user_seed_5',
      email: 'yang.yue@example.cn',
      passwordHash: hashPassword('seed-pass-5'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
    {
      id: 'user_seed_6',
      email: 'zhang.lei@example.cn',
      passwordHash: hashPassword('seed-pass-6'),
      createdAt: new Date().toISOString(),
      language: 'zh',
    },
  ];

  return {
    users: seededUsers,
    sessions: [],
    passwordResetTokens: [],
    signupOtps: [],
    profiles: [],
    connections: [],
    messages: [],
    hiddenMessages: [],
    typingStates: [],
  };
}

async function loadState() {
  if (!statePromise) {
    statePromise = (async () => {
      await fs.mkdir(dataDir, { recursive: true });
      try {
        const raw = await fs.readFile(dbPath, 'utf8');
        state = JSON.parse(raw);
      } catch {
        state = seedState();
        await saveState();
      }
      state.users ??= [];
      state.sessions ??= [];
      state.passwordResetTokens ??= [];
      state.signupOtps ??= [];
      state.profiles ??= [];
      state.connections ??= [];
      state.messages ??= [];
      state.hiddenMessages ??= [];
      state.typingStates ??= [];

      const invalidUserIds = new Set(
        state.users
          .filter((user) => !user.email?.trim() || !user.email.includes('@') || !user.passwordHash)
          .map((user) => user.id),
      );

      if (invalidUserIds.size > 0) {
        state.users = state.users.filter((user) => !invalidUserIds.has(user.id));
        state.sessions = state.sessions.filter((session) => !invalidUserIds.has(session.userId));
        state.profiles = state.profiles.filter((profile) => !invalidUserIds.has(profile.ownerUserId));
        state.connections = state.connections.filter((connection) => !invalidUserIds.has(connection.requesterUserId) && !invalidUserIds.has(connection.targetUserId));
        state.messages = state.messages.filter((message) => !invalidUserIds.has(message.senderUserId));
        await saveState();
      }

      const fallbackSeenAt = new Date().toISOString();
      let stateChanged = false;
      for (const user of state.users) {
        const seedEmailMap = {
          user_seed_1: 'wang.mei@example.cn',
          user_seed_2: 'li.yun@example.cn',
          user_seed_3: 'chen.xi@example.cn',
          user_seed_4: 'wu.qing@example.cn',
          user_seed_5: 'yang.yue@example.cn',
          user_seed_6: 'zhang.lei@example.cn',
        };

        if (seedEmailMap[user.id] && user.email !== seedEmailMap[user.id]) {
          user.email = seedEmailMap[user.id];
          stateChanged = true;
        }

        if (!user.lastSeenAt) {
          const seedLastSeenOffsetMinutes = {
            user_seed_1: 20,
            user_seed_2: 75,
            user_seed_3: 180,
            user_seed_4: 480,
            user_seed_5: 1440,
            user_seed_6: 4320,
          };

          const offsetMinutes = seedLastSeenOffsetMinutes[user.id] ?? 30;
          user.lastSeenAt = new Date(Date.now() - offsetMinutes * 60000).toISOString();
          stateChanged = true;
        }
      }

      if (stateChanged) {
        await saveState();
      }

      return state;
    })();
  }

  return statePromise;
}

async function saveState() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(state, null, 2), 'utf8');
}

async function withState(mutator) {
  await loadState();
  const result = await mutator(state);
  await saveState();
  return result;
}

function getState() {
  if (!state) {
    throw new Error('State has not been loaded yet.');
  }
  return state;
}

function touchUserActivity(userId, lastSeenAt = new Date().toISOString()) {
  const currentState = getState();
  const user = currentState.users.find((candidate) => candidate.id === userId);
  if (!user) {
    return null;
  }

  user.lastSeenAt = lastSeenAt;
  return user;
}

function getUserPresence(userId, currentState = getState()) {
  const user = currentState.users.find((candidate) => candidate.id === userId) ?? null;
  if (!user) {
    return { status: 'offline', lastSeenAt: null };
  }

  const lastSeenAt = user.lastSeenAt ?? user.createdAt ?? null;
  const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  const hasActiveSession = currentState.sessions.some((session) => session.userId === userId);
  const online = hasActiveSession && lastSeenMs > 0 && Date.now() - lastSeenMs < 5 * 60 * 1000;

  return {
    status: online ? 'online' : 'offline',
    lastSeenAt,
  };
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function findProfileByOwner(userId) {
  return getState().profiles.find((profile) => profile.ownerUserId === userId) ?? null;
}

function toPublicProfile(profile) {
  if (!profile) {
    return null;
  }

  return safeClone(profile);
}

export {
  createId,
  findProfileByOwner,
  getState,
  hashPassword,
  getUserPresence,
  loadState,
  sanitizeUser,
  saveState,
  touchUserActivity,
  toPublicProfile,
  withState,
  hashPassword as hash,
};
