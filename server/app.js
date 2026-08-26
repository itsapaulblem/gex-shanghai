import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { approveConnection, cancelConnection, listConnections, rejectConnection, removeConnection, requestConnection } from './services/connections.js';
import { deleteMessage, hideMessageForUser, listMessages, sendMessage, setTypingState } from './services/chat.js';
import { login, register, requestPasswordReset, requestSignupOtp, resetPassword, resolveSession, updateLanguage, verifySignupOtp } from './services/auth.js';
import { createProfile, getProfile, listProfiles, updateOwnProfile } from './services/profiles.js';
import { getState, loadState, storageBackend, withState } from './store.js';
import { seedDemoData } from './demo-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const publicDir = distDir;
const port = Number(process.env.PORT ?? 3001);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function getToken(request) {
  const header = request.headers.authorization ?? '';
  if (header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  return url.searchParams.get('token');
}

async function getCurrentSession(request) {
  const token = getToken(request);
  if (!token) {
    return null;
  }

  return resolveSession(token);
}

async function serveStatic(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return false;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const assetPath = path.join(publicDir, pathname);
  const normalizedPath = path.normalize(assetPath);
  if (!normalizedPath.startsWith(publicDir)) {
    return false;
  }

  try {
    const stat = await fs.stat(normalizedPath);
    if (stat.isDirectory()) {
      return false;
    }

    const data = await fs.readFile(normalizedPath);
    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }[ext] ?? 'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
    });
    response.end(data);
    return true;
  } catch {
    if (pathname !== '/index.html') {
      try {
        const indexPath = path.join(publicDir, 'index.html');
        const html = await fs.readFile(indexPath, 'utf8');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(html);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const session = await getCurrentSession(request);
  const currentUser = session?.user ?? null;

  try {
    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { ok: true, storage: storageBackend });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/metrics/public') {
      await withState(async () => undefined);
      const state = getState();
      const now = Date.now();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayMs = startOfToday.getTime();

      const activeParents = state.users.length;
      const connectionsToday = state.connections.filter((connection) => {
        const updatedAtMs = new Date(connection.updatedAt ?? connection.createdAt).getTime();
        return connection.status === 'approved' && Number.isFinite(updatedAtMs) && updatedAtMs >= startOfTodayMs;
      }).length;
      const newProfiles24h = state.profiles.filter((profile) => {
        const createdAtMs = new Date(profile.createdAt).getTime();
        return Number.isFinite(createdAtMs) && now - createdAtMs <= 24 * 60 * 60 * 1000;
      }).length;

      sendJson(response, 200, { activeParents, connectionsToday, newProfiles24h });
      return;
    }

    const forwardedProto = request.headers['x-forwarded-proto'];
    const protocol = typeof forwardedProto === 'string' && forwardedProto ? forwardedProto.split(',')[0] : 'http';
    const requestBaseUrl = process.env.APP_BASE_URL ?? `${protocol}://${request.headers.host}`;

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await readBody(request);
      const result = await register(body);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/request-signup-otp') {
      const body = await readBody(request);
      const result = await requestSignupOtp(body);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/verify-signup-otp') {
      const body = await readBody(request);
      const result = await verifySignupOtp(body);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(request);
      const result = await login(body);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/forgot-password') {
      const body = await readBody(request);
      const result = await requestPasswordReset({ ...body, baseUrl: requestBaseUrl });
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/reset-password') {
      const body = await readBody(request);
      const result = await resetPassword(body);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/me') {
      if (!session) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      sendJson(response, 200, session);
      return;
    }

    if (request.method === 'PATCH' && url.pathname === '/api/me/language') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const body = await readBody(request);
      const user = await updateLanguage(currentUser.id, body.language);
      sendJson(response, 200, { user });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/profiles') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const { ownProfile, profiles } = await listProfiles(currentUser.id, Object.fromEntries(url.searchParams.entries()));
      sendJson(response, 200, { ownProfile, profiles });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/profiles') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const body = await readBody(request);
      const profile = await createProfile(currentUser.id, body);
      sendJson(response, 201, { profile });
      return;
    }

    if (request.method === 'PATCH' && url.pathname === '/api/profiles/me') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const body = await readBody(request);
      const profile = await updateOwnProfile(currentUser.id, body);
      sendJson(response, 200, { profile });
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/profiles/')) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const profileId = url.pathname.split('/').pop();
      const profile = await getProfile(profileId, currentUser.id);
      if (!profile) {
        sendJson(response, 404, { error: 'PROFILE_NOT_FOUND' });
        return;
      }

      sendJson(response, 200, { profile });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/connections') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connections = await listConnections(currentUser.id);
      sendJson(response, 200, connections);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/connections') {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const body = await readBody(request);
      const connection = await requestConnection(currentUser.id, body.targetProfileId);
      sendJson(response, 201, { connection });
      return;
    }

    if (request.method === 'POST' && url.pathname.match(/^\/api\/connections\/[^/]+\/(approve|reject)$/)) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const [, , , connectionId, action] = url.pathname.split('/');
      const connection = action === 'approve'
        ? await approveConnection(connectionId, currentUser.id)
        : await rejectConnection(connectionId, currentUser.id);
      sendJson(response, 200, { connection });
      return;
    }

    if (request.method === 'POST' && url.pathname.match(/^\/api\/connections\/[^/]+\/cancel$/)) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connectionId = url.pathname.split('/')[3];
      const connection = await cancelConnection(connectionId, currentUser.id);
      sendJson(response, 200, { connection });
      return;
    }

    if (request.method === 'POST' && url.pathname.match(/^\/api\/connections\/[^/]+\/remove$/)) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connectionId = url.pathname.split('/')[3];
      const connection = await removeConnection(connectionId, currentUser.id);
      sendJson(response, 200, { connection });
      return;
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/chats/')) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connectionId = url.pathname.split('/')[3];
      const chat = await listMessages(connectionId, currentUser.id);
      if (!chat) {
        sendJson(response, 404, { error: 'CHAT_NOT_FOUND' });
        return;
      }

      sendJson(response, 200, chat);
      return;
    }

    if (request.method === 'POST' && url.pathname.startsWith('/api/chats/') && url.pathname.endsWith('/messages')) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connectionId = url.pathname.split('/')[3];
      const body = await readBody(request);
      const message = await sendMessage(connectionId, currentUser.id, body.text ?? '', body.imageDataUrl ?? '');
      sendJson(response, 201, { message });
      return;
    }

    if (request.method === 'POST' && url.pathname.startsWith('/api/chats/') && url.pathname.endsWith('/typing')) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const connectionId = url.pathname.split('/')[3];
      const body = await readBody(request);
      const result = await setTypingState(connectionId, currentUser.id, Boolean(body.isTyping));
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/chats\/[^/]+\/messages\/[^/]+$/)) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const [, , , connectionId, , messageId] = url.pathname.split('/');
      const result = await deleteMessage(connectionId, messageId, currentUser.id);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && url.pathname.match(/^\/api\/chats\/[^/]+\/messages\/[^/]+\/hide$/)) {
      if (!currentUser) {
        sendJson(response, 401, { error: 'UNAUTHORIZED' });
        return;
      }

      const [, , , connectionId, , messageId] = url.pathname.split('/');
      const result = await hideMessageForUser(connectionId, messageId, currentUser.id);
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'SERVER_ERROR';
    sendJson(response, statusCode, { error: message });
  }
}

await loadState();

if (process.env.SEED_DEMO_DATA === 'true') {
  const seedResult = await seedDemoData();
  console.log('Demo data ready:', seedResult);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    await handleApi(request, response);
    return;
  }

  const served = await serveStatic(request, response);
  if (served) {
    return;
  }

  if (request.method === 'GET') {
    try {
      const indexPath = path.join(distDir, 'index.html');
      const html = await fs.readFile(indexPath, 'utf8');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(html);
      return;
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Build the frontend first or run the Vite dev server.');
      return;
    }
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
});

server.listen(port, () => {
  console.log(`Gex Shanghai API listening on http://localhost:${port}`);
});
