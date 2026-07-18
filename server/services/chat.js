import { createId, getState, withState } from '../store.js';
import { getConnectionForChat } from './connections.js';

async function listMessages(connectionId, userId) {
  const connection = await getConnectionForChat(connectionId, userId);
  if (!connection || connection.status !== 'approved') {
    return null;
  }

  await withState(async () => undefined);
  const state = getState();
  const messages = state.messages
    .filter((message) => message.connectionId === connectionId)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  return {
    connection,
    messages,
  };
}

async function sendMessage(connectionId, userId, text) {
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

    const message = {
      id: createId('message'),
      connectionId,
      senderUserId: userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    state.messages.push(message);
    return message;
  });
}

export { listMessages, sendMessage };