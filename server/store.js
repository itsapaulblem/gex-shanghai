import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '.data');
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

  const now = new Date().toISOString();
  return {
    users: seededUsers,
    sessions: [],
    passwordResetTokens: [],
    profiles: [
      {
        id: 'profile_1',
        ownerUserId: 'user_seed_2',
        childAlias: '晨晨',
        gender: '男',
        birthYear: 1994,
        age: 31,
        height: 178,
        weight: 74,
        city: '上海',
        hukou: '上海',
        hometown: '上海',
        education: '硕士',
        school: '同济大学',
        major: '软件工程',
        industry: '互联网',
        jobTitle: '高级产品经理',
        income: '3-5万/月',
        property: '有房',
        car: '有车',
        traits: ['踏实', '孝顺', '爱运动'],
        hobbies: '篮球、摄影、露营',
        about: '工作稳定，生活习惯健康，周末喜欢运动与旅行。',
        preferences: '希望对方性格开朗，重视家庭。',
        createdAt: now,
      },
      {
        id: 'profile_2',
        ownerUserId: 'user_seed_3',
        childAlias: '悦悦',
        gender: '女',
        birthYear: 1997,
        age: 28,
        height: 163,
        weight: 52,
        city: '上海',
        hukou: '浙江',
        hometown: '杭州',
        education: '本科',
        school: '上海财经大学',
        major: '金融学',
        industry: '金融',
        jobTitle: '财富管理顾问',
        income: '1.5-3万/月',
        property: '无房',
        car: '无车',
        traits: ['温柔', '独立', '爱烹饪'],
        hobbies: '做饭、阅读、看展',
        about: '做事细致，性格温和，家庭观念强。',
        preferences: '希望对方认真稳定，能共同规划未来。',
        createdAt: now,
      },
      {
        id: 'profile_3',
        ownerUserId: 'user_seed_4',
        childAlias: '昊然',
        gender: '男',
        birthYear: 1992,
        age: 33,
        height: 175,
        weight: 70,
        city: '北京',
        hukou: '上海',
        hometown: '上海',
        education: '博士',
        school: '复旦大学',
        major: '临床医学',
        industry: '医疗',
        jobTitle: '主治医师',
        income: '2-3万/月',
        property: '有房',
        car: '有车',
        traits: ['稳重', '博学', '顾家'],
        hobbies: '跑步、读书、电影',
        about: '作息规律，工作繁忙但注重沟通。',
        preferences: '希望寻找愿意长期相伴的伴侣。',
        createdAt: now,
      },
      {
        id: 'profile_4',
        ownerUserId: 'user_seed_5',
        childAlias: '雨桐',
        gender: '女',
        birthYear: 1996,
        age: 29,
        height: 167,
        weight: 49,
        city: '上海',
        hukou: '上海',
        hometown: '苏州',
        education: '本科',
        school: '华东师范大学',
        major: '教育学',
        industry: '教育',
        jobTitle: '课程研发',
        income: '8千-1.5万/月',
        property: '有房',
        car: '无车',
        traits: ['活泼', '热情', '爱旅游'],
        hobbies: '旅行、瑜伽、摄影',
        about: '喜欢有计划的生活，也愿意体验新事物。',
        preferences: '期待三观一致、沟通顺畅。',
        createdAt: now,
      },
      {
        id: 'profile_5',
        ownerUserId: 'user_seed_6',
        childAlias: '子言',
        gender: '男',
        birthYear: 1995,
        age: 30,
        height: 180,
        weight: 76,
        city: '上海',
        hukou: '江苏',
        hometown: '南京',
        education: '硕士',
        school: '上海交通大学',
        major: '建筑学',
        industry: '建筑',
        jobTitle: '项目设计师',
        income: '1.5-3万/月',
        property: '无房',
        car: '有车',
        traits: ['踏实', '上进', '爱音乐'],
        hobbies: '音乐、徒步、木工',
        about: '做事认真，善于倾听，喜欢有温度的生活。',
        preferences: '希望对方善良、真诚、有责任感。',
        createdAt: now,
      },
      {
        id: 'profile_6',
        ownerUserId: 'user_seed_1',
        childAlias: '小满',
        gender: '女',
        birthYear: 1993,
        age: 32,
        height: 161,
        weight: 50,
        city: '杭州',
        hukou: '浙江',
        hometown: '杭州',
        education: '硕士',
        school: '浙江大学',
        major: '新闻传播',
        industry: '互联网',
        jobTitle: '品牌经理',
        income: '3-5万/月',
        property: '有房',
        car: '有车',
        traits: ['干练', '独立', '爱阅读'],
        hobbies: '阅读、咖啡、徒步',
        about: '做事高效，喜欢清晰直接的沟通。',
        preferences: '期待成熟稳重、彼此尊重。',
        createdAt: now,
      },
    ],
    connections: [],
    messages: [],
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
      state.profiles ??= [];
      state.connections ??= [];
      state.messages ??= [];

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