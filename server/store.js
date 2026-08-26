import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.GEX_DATA_DIR
  ? path.resolve(process.env.GEX_DATA_DIR)
  : path.resolve(__dirname, '..', '.data');
const dbPath = path.join(dataDir, 'gex-shanghai.json');
const isProduction = process.env.NODE_ENV === 'production';
const hasPostgresConfig = Boolean(process.env.DATABASE_URL || process.env.RDS_HOSTNAME);
const storageBackend = process.env.GEX_STORAGE_BACKEND ?? (hasPostgresConfig ? 'postgres' : 'file');

if (isProduction && storageBackend !== 'postgres') {
  throw new Error('Durable PostgreSQL storage is required in production. Configure DATABASE_URL or the RDS_* environment variables.');
}

let state;
let statePromise;
let postgresPool;
let operationQueue = Promise.resolve();

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

function normalizeState(candidate = {}) {
  const normalized = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
  normalized.users ??= [];
  normalized.sessions ??= [];
  normalized.passwordResetTokens ??= [];
  normalized.signupOtps ??= [];
  normalized.profiles ??= [];
  normalized.connections ??= [];
  normalized.messages ??= [];
  normalized.hiddenMessages ??= [];
  normalized.typingStates ??= [];
  return normalized;
}

function seedState() {
  const seededUsers = [
    ['user_seed_1', 'wang.mei@example.cn', 'demo1234'],
    ['user_seed_2', 'li.yun@example.cn', 'seed-pass-2'],
    ['user_seed_3', 'chen.xi@example.cn', 'seed-pass-3'],
    ['user_seed_4', 'wu.qing@example.cn', 'seed-pass-4'],
    ['user_seed_5', 'yang.yue@example.cn', 'seed-pass-5'],
    ['user_seed_6', 'zhang.lei@example.cn', 'seed-pass-6'],
  ].map(([id, email, password]) => ({
    id,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    language: 'zh',
  }));

  return normalizeState({ users: seededUsers });
}

function migrateState(candidate) {
  const migrated = normalizeState(candidate);
  const invalidUserIds = new Set(
    migrated.users
      .filter((user) => !user.email?.trim() || !user.email.includes('@') || !user.passwordHash)
      .map((user) => user.id),
  );

  if (invalidUserIds.size > 0) {
    migrated.users = migrated.users.filter((user) => !invalidUserIds.has(user.id));
    migrated.sessions = migrated.sessions.filter((session) => !invalidUserIds.has(session.userId));
    migrated.profiles = migrated.profiles.filter((profile) => !invalidUserIds.has(profile.ownerUserId));
    migrated.connections = migrated.connections.filter((connection) => !invalidUserIds.has(connection.requesterUserId) && !invalidUserIds.has(connection.targetUserId));
    migrated.messages = migrated.messages.filter((message) => !invalidUserIds.has(message.senderUserId));
  }

  const seedEmailMap = {
    user_seed_1: 'wang.mei@example.cn',
    user_seed_2: 'li.yun@example.cn',
    user_seed_3: 'chen.xi@example.cn',
    user_seed_4: 'wu.qing@example.cn',
    user_seed_5: 'yang.yue@example.cn',
    user_seed_6: 'zhang.lei@example.cn',
  };
  const seedLastSeenOffsetMinutes = {
    user_seed_1: 20,
    user_seed_2: 75,
    user_seed_3: 180,
    user_seed_4: 480,
    user_seed_5: 1440,
    user_seed_6: 4320,
  };

  for (const user of migrated.users) {
    if (seedEmailMap[user.id]) {
      user.email = seedEmailMap[user.id];
    }
    if (!user.lastSeenAt) {
      const offsetMinutes = seedLastSeenOffsetMinutes[user.id] ?? 30;
      user.lastSeenAt = new Date(Date.now() - offsetMinutes * 60000).toISOString();
    }
  }

  return migrated;
}

function enqueue(operation) {
  const queued = operationQueue.then(operation, operation);
  operationQueue = queued.catch(() => undefined);
  return queued;
}

function postgresConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const caBundlePath = process.env.RDS_CA_BUNDLE_PATH ?? '/app/rds-ca-bundle.pem';
  return {
    host: process.env.RDS_HOSTNAME,
    port: Number(process.env.RDS_PORT ?? 5432),
    database: process.env.RDS_DB_NAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    ssl: {
      ca: readFileSync(caBundlePath, 'utf8'),
      rejectUnauthorized: true,
    },
  };
}

async function getPostgresPool() {
  if (!postgresPool) {
    const { Pool } = await import('pg');
    postgresPool = new Pool({ ...postgresConfig(), max: Number(process.env.DB_POOL_SIZE ?? 10) });
    postgresPool.on('error', (error) => console.error('Unexpected PostgreSQL pool error', error));
  }
  return postgresPool;
}

async function initializePostgres() {
  const pool = await getPostgresPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gex_app_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    'INSERT INTO gex_app_state (id, state) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING',
    [JSON.stringify(seedState())],
  );
  const result = await pool.query('SELECT state FROM gex_app_state WHERE id = 1');
  state = migrateState(result.rows[0].state);
}

async function initializeFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    state = migrateState(JSON.parse(raw));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    state = seedState();
  }
  await saveFileState();
}

async function loadState() {
  if (!statePromise) {
    statePromise = storageBackend === 'postgres' ? initializePostgres() : initializeFile();
  }
  await statePromise;
  return state;
}

async function saveFileState() {
  await fs.mkdir(dataDir, { recursive: true });
  const temporaryPath = `${dbPath}.${process.pid}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(state, null, 2), 'utf8');
  await fs.rename(temporaryPath, dbPath);
}

async function saveState() {
  await loadState();
  if (storageBackend === 'postgres') {
    const pool = await getPostgresPool();
    await pool.query('UPDATE gex_app_state SET state = $1::jsonb, updated_at = NOW() WHERE id = 1', [JSON.stringify(state)]);
    return;
  }
  await saveFileState();
}

async function withPostgresState(mutator) {
  const pool = await getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT state FROM gex_app_state WHERE id = 1 FOR UPDATE');
    state = migrateState(result.rows[0].state);
    const mutationResult = await mutator(state);
    await client.query(
      'UPDATE gex_app_state SET state = $1::jsonb, updated_at = NOW() WHERE id = 1',
      [JSON.stringify(state)],
    );
    await client.query('COMMIT');
    return mutationResult;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function withState(mutator) {
  await loadState();
  return enqueue(async () => {
    if (storageBackend === 'postgres') {
      return withPostgresState(mutator);
    }
    const result = await mutator(state);
    await saveFileState();
    return result;
  });
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
  return { status: online ? 'online' : 'offline', lastSeenAt };
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
  return profile ? safeClone(profile) : null;
}

async function closeStore() {
  if (postgresPool) {
    await postgresPool.end();
    postgresPool = undefined;
  }
}

export {
  closeStore,
  createId,
  findProfileByOwner,
  getState,
  hashPassword,
  getUserPresence,
  loadState,
  sanitizeUser,
  saveState,
  storageBackend,
  touchUserActivity,
  toPublicProfile,
  withState,
  hashPassword as hash,
};
