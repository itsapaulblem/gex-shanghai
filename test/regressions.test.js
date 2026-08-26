import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const testDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gex-shanghai-test-'));
process.env.GEX_DATA_DIR = testDataDir;

const { closeStore, getState, loadState } = await import('../server/store.js');
const { seedDemoData } = await import('../server/demo-data.js');
const { register, resolveSession } = await import('../server/services/auth.js');
const { createProfile } = await import('../server/services/profiles.js');
const { approveConnection, rejectConnection, requestConnection } = await import('../server/services/connections.js');
const { deleteMessage, sendMessage } = await import('../server/services/chat.js');

function profileInput(alias, gender = '男') {
  return {
    honorific: 'Mr',
    surname: alias,
    childAlias: alias,
    gender,
    birthYear: 1995,
    age: 1,
    height: 175,
    weight: 65,
    city: '上海',
    hukou: '上海',
    hometown: '上海',
    education: '硕士',
    school: 'Test University',
    major: 'Engineering',
    industry: 'Technology',
    jobTitle: 'Engineer',
    income: '1.5-3万/月',
    property: '有房',
    car: '有车',
    traits: ['kind'],
    hobbies: 'Reading',
    about: '',
  };
}

test('security and behavior regressions', async (t) => {
  await loadState();
  const state = getState();
  state.users = [];
  state.sessions = [];
  state.profiles = [];
  state.connections = [];
  state.messages = [];
  state.hiddenMessages = [];
  state.typingStates = [];

  const firstSession = await register({ email: 'first@example.com', password: 'Strong!Pass1', language: 'en' });
  const secondSession = await register({ email: 'second@example.com', password: 'Strong!Pass2', language: 'en' });

  await t.test('auth responses never expose password credentials', async () => {
    assert.equal('passwordHash' in firstSession.user, false);
    assert.equal('passwordSalt' in firstSession.user, false);
    const resolved = await resolveSession(firstSession.token);
    assert.equal('passwordHash' in resolved.user, false);
    assert.equal('passwordSalt' in resolved.user, false);
  });

  const firstProfile = await createProfile(firstSession.user.id, profileInput('First'));
  const secondProfile = await createProfile(secondSession.user.id, profileInput('Second', '女'));

  await t.test('profile input is validated and age is server-derived', async () => {
    assert.equal(firstProfile.age, new Date().getFullYear() - 1995);
    await assert.rejects(
      createProfile('invalid_user_1', { ...profileInput('Invalid'), childAlias: '' }),
      { message: 'PROFILE_REQUIRED' },
    );
    await assert.rejects(
      createProfile('invalid_user_2', { ...profileInput('Invalid'), height: 'not-a-number' }),
      { message: 'HEIGHT_INVALID' },
    );
  });

  await t.test('self-connections are rejected', async () => {
    await assert.rejects(
      requestConnection(firstSession.user.id, firstProfile.id),
      { message: 'SELF_CONNECTION_NOT_ALLOWED' },
    );
  });

  let connection;
  await t.test('connection transitions require pending and rejected requests can be retried', async () => {
    connection = await requestConnection(firstSession.user.id, secondProfile.id);
    assert.equal(connection.status, 'pending');

    connection = await rejectConnection(connection.id, secondSession.user.id);
    assert.equal(connection.status, 'rejected');
    await assert.rejects(
      approveConnection(connection.id, secondSession.user.id),
      { message: 'CONNECTION_NOT_PENDING' },
    );

    connection = await requestConnection(firstSession.user.id, secondProfile.id);
    assert.equal(connection.status, 'pending');
    connection = await approveConnection(connection.id, secondSession.user.id);
    assert.equal(connection.status, 'approved');
    await assert.rejects(
      rejectConnection(connection.id, secondSession.user.id),
      { message: 'CONNECTION_NOT_PENDING' },
    );
  });

  await t.test('only a message sender can delete it for both users', async () => {
    const message = await sendMessage(connection.id, firstSession.user.id, 'hello');
    await assert.rejects(
      deleteMessage(connection.id, message.id, secondSession.user.id),
      { message: 'MESSAGE_DELETE_FORBIDDEN' },
    );
    await deleteMessage(connection.id, message.id, firstSession.user.id);
    assert.equal(state.messages.some((candidate) => candidate.id === message.id), false);
  });
});

test('demo data is realistic, internally consistent, idempotent, and preserves real accounts', async () => {
  const state = getState();
  const realUserIds = new Set(state.users.map((user) => user.id));
  const firstResult = await seedDemoData();

  assert.deepEqual(
    {
      profiles: firstResult.profiles,
      users: firstResult.users,
      connections: firstResult.connections,
      approvedConnections: firstResult.approvedConnections,
      messages: firstResult.messages,
    },
    { profiles: 300, users: 300, connections: 650, approvedConnections: 455, messages: 3600 },
  );

  const demoUsers = state.users.filter((user) => user.id.startsWith('demo_'));
  const demoProfiles = state.profiles.filter((profile) => profile.id.startsWith('demo_'));
  const demoConnections = state.connections.filter((connection) => connection.id.startsWith('demo_'));
  const demoMessages = state.messages.filter((message) => message.id.startsWith('demo_'));
  assert.equal(demoUsers.length, 300);
  assert.equal(demoProfiles.length, 300);
  assert.equal(demoConnections.length, 650);
  assert.equal(demoMessages.length, 3600);
  assert.ok(demoProfiles.every((profile) => /[\u3400-\u9fff]/u.test(`${profile.childAlias}${profile.about}`)));
  assert.ok(demoMessages.every((message) => /[\u3400-\u9fff]/u.test(message.text)));

  const userIds = new Set(state.users.map((user) => user.id));
  const profileIds = new Set(state.profiles.map((profile) => profile.id));
  const connectionIds = new Set(state.connections.map((connection) => connection.id));
  assert.ok(demoProfiles.every((profile) => userIds.has(profile.ownerUserId)));
  assert.ok(demoConnections.every((connection) => userIds.has(connection.requesterUserId) && userIds.has(connection.targetUserId)));
  assert.ok(demoConnections.every((connection) => profileIds.has(connection.requesterProfileId) && profileIds.has(connection.targetProfileId)));
  assert.ok(demoMessages.every((message) => connectionIds.has(message.connectionId) && userIds.has(message.senderUserId)));

  await seedDemoData();
  assert.equal(state.users.filter((user) => user.id.startsWith('demo_')).length, 300);
  assert.equal(state.connections.filter((connection) => connection.id.startsWith('demo_')).length, 650);
  assert.equal(state.messages.filter((message) => message.id.startsWith('demo_')).length, 3600);
  assert.ok([...realUserIds].every((userId) => state.users.some((user) => user.id === userId)));
});

test.after(async () => {
  await closeStore();
  await fs.rm(testDataDir, { recursive: true, force: true });
});
