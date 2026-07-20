import { createId, getState, withState } from '../store.js';
import { getConnectionForChat } from './connections.js';

function getParticipantUserIds(connection) {
  return [connection.requesterUserId, connection.targetUserId].filter(Boolean);
}

function isLikelyImageDataUrl(value) {
  return typeof value === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

function collectTypingUsers(connectionId, currentUserId, state) {
  const now = Date.now();
  const typingStates = state.typingStates ?? [];

  state.typingStates = typingStates.filter((entry) => {
    const expiresAt = new Date(entry.expiresAt).getTime();
    return Number.isFinite(expiresAt) && expiresAt > now;
  });

  return state.typingStates
    .filter((entry) => entry.connectionId === connectionId && entry.userId !== currentUserId)
    .map((entry) => entry.userId);
}

async function listMessages(connectionId, userId) {
  const connection = await getConnectionForChat(connectionId, userId);
  if (!connection || connection.status !== 'approved') {
    return null;
  }

  await withState(async () => undefined);
  const state = getState();
  const hiddenMessageIds = new Set(
    (state.hiddenMessages ?? [])
      .filter((entry) => entry.userId === userId && entry.connectionId === connectionId)
      .map((entry) => entry.messageId),
  );
  const messages = state.messages
    .filter((message) => message.connectionId === connectionId && !hiddenMessageIds.has(message.id))
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  return {
    connection,
    messages,
    typingUserIds: collectTypingUsers(connectionId, userId, state),
  };
}

async function sendMessage(connectionId, userId, text, imageDataUrl = '') {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection || connection.status !== 'approved') {
      const error = new Error('CHAT_UNAVAILABLE');
      error.statusCode = 403;
      throw error;
    }

    const isParticipant = connection.requesterUserId === userId || connection.targetUserId === userId;
    if (!isParticipant) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    const normalizedText = String(text ?? '').trim();
    const normalizedImage = String(imageDataUrl ?? '').trim();
    const hasImage = normalizedImage.length > 0;

    if (!normalizedText && !hasImage) {
      const error = new Error('MESSAGE_EMPTY');
      error.statusCode = 400;
      throw error;
    }

    if (hasImage && !isLikelyImageDataUrl(normalizedImage)) {
      const error = new Error('MESSAGE_IMAGE_INVALID');
      error.statusCode = 400;
      throw error;
    }

    if (hasImage && normalizedImage.length > 2_500_000) {
      const error = new Error('MESSAGE_IMAGE_TOO_LARGE');
      error.statusCode = 400;
      throw error;
    }

    const message = {
      id: createId('message'),
      connectionId,
      senderUserId: userId,
      text: normalizedText,
      messageType: hasImage ? 'image' : 'text',
      imageDataUrl: hasImage ? normalizedImage : null,
      createdAt: new Date().toISOString(),
    };

    state.messages.push(message);
    state.typingStates = (state.typingStates ?? []).filter((entry) => !(entry.connectionId === connectionId && entry.userId === userId));
    return message;
  });
}

async function setTypingState(connectionId, userId, isTyping) {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection || connection.status !== 'approved') {
      const error = new Error('CHAT_UNAVAILABLE');
      error.statusCode = 403;
      throw error;
    }

    const participantIds = getParticipantUserIds(connection);
    if (!participantIds.includes(userId)) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    state.typingStates = (state.typingStates ?? []).filter((entry) => !(entry.connectionId === connectionId && entry.userId === userId));

    if (isTyping) {
      state.typingStates.push({
        id: createId('typing'),
        connectionId,
        userId,
        expiresAt: new Date(Date.now() + 6000).toISOString(),
      });
    }

    return { ok: true };
  });
}

async function deleteMessage(connectionId, messageId, userId) {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection || connection.status !== 'approved') {
      const error = new Error('CHAT_UNAVAILABLE');
      error.statusCode = 403;
      throw error;
    }

    const isParticipant = connection.requesterUserId === userId || connection.targetUserId === userId;
    if (!isParticipant) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    const index = state.messages.findIndex((candidate) => candidate.id === messageId && candidate.connectionId === connectionId);
    if (index === -1) {
      const error = new Error('MESSAGE_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    const [deleted] = state.messages.splice(index, 1);
    state.hiddenMessages = (state.hiddenMessages ?? []).filter((entry) => entry.messageId !== deleted.id);
    return { ok: true, message: deleted };
  });
}

async function hideMessageForUser(connectionId, messageId, userId) {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection || connection.status !== 'approved') {
      const error = new Error('CHAT_UNAVAILABLE');
      error.statusCode = 403;
      throw error;
    }

    const isParticipant = connection.requesterUserId === userId || connection.targetUserId === userId;
    if (!isParticipant) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    const message = state.messages.find((candidate) => candidate.id === messageId && candidate.connectionId === connectionId) ?? null;
    if (!message) {
      const error = new Error('MESSAGE_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    state.hiddenMessages ??= [];
    const alreadyHidden = state.hiddenMessages.some((entry) => entry.userId === userId && entry.messageId === messageId);
    if (!alreadyHidden) {
      state.hiddenMessages.push({
        id: createId('hidden_message'),
        connectionId,
        messageId,
        userId,
        createdAt: new Date().toISOString(),
      });
    }

    return { ok: true };
  });
}

export { deleteMessage, hideMessageForUser, listMessages, sendMessage, setTypingState };