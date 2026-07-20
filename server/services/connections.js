import { createId, getState, getUserPresence, toPublicProfile, withState } from '../store.js';

function decorateProfile(profile, state) {
  if (!profile) {
    return null;
  }

  return {
    ...toPublicProfile(profile),
    presence: getUserPresence(profile.ownerUserId, state),
  };
}

function getParticipantProfileIds(connection) {
  return [connection.requesterProfileId, connection.targetProfileId];
}

function computeConnectionView(connection, userId, state) {
  const requesterProfile = state.profiles.find((profile) => profile.id === connection.requesterProfileId) ?? null;
  const targetProfile = state.profiles.find((profile) => profile.id === connection.targetProfileId) ?? null;
  const requesterUserId = requesterProfile?.ownerUserId ?? connection.requesterUserId;
  const targetUserId = targetProfile?.ownerUserId ?? connection.targetUserId;
  const ownProfile = state.profiles.find((profile) => profile.ownerUserId === userId) ?? null;
  const isRequester = requesterUserId === userId;
  const isTarget = targetUserId === userId;
  const otherProfile = isRequester ? targetProfile : requesterProfile;

  return {
    ...connection,
    requesterProfile: decorateProfile(requesterProfile, state),
    targetProfile: decorateProfile(targetProfile, state),
    ownProfile: decorateProfile(ownProfile, state),
    otherProfile: decorateProfile(otherProfile, state),
    direction: isRequester ? 'outgoing' : isTarget ? 'incoming' : 'other',
  };
}

async function requestConnection(userId, targetProfileId) {
  return withState(async (state) => {
    const requesterProfile = state.profiles.find((profile) => profile.ownerUserId === userId);
    if (!requesterProfile) {
      const error = new Error('PROFILE_REQUIRED');
      error.statusCode = 400;
      throw error;
    }

    const targetProfile = state.profiles.find((profile) => profile.id === targetProfileId);
    if (!targetProfile) {
      const error = new Error('TARGET_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    const existing = state.connections.find((connection) => {
      const sameDirection = connection.requesterProfileId === requesterProfile.id && connection.targetProfileId === targetProfile.id;
      const reversedDirection = connection.requesterProfileId === targetProfile.id && connection.targetProfileId === requesterProfile.id;
      return sameDirection || reversedDirection;
    });

    if (existing) {
      return computeConnectionView(existing, userId, state);
    }

    const connection = {
      id: createId('connection'),
      requesterUserId: userId,
      requesterProfileId: requesterProfile.id,
      targetUserId: targetProfile.ownerUserId,
      targetProfileId: targetProfile.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.connections.push(connection);
    return computeConnectionView(connection, userId, state);
  });
}

async function listConnections(userId) {
  await withState(async () => undefined);
  const state = getState();
  const ownProfile = state.profiles.find((profile) => profile.ownerUserId === userId) ?? null;
  const relevant = state.connections.filter((connection) => connection.requesterUserId === userId || connection.targetUserId === userId);
  const incoming = relevant.filter((connection) => connection.targetUserId === userId && connection.status === 'pending').map((connection) => computeConnectionView(connection, userId, state));
  const outgoing = relevant.filter((connection) => connection.requesterUserId === userId && connection.status === 'pending').map((connection) => computeConnectionView(connection, userId, state));
  const connected = relevant.filter((connection) => connection.status === 'approved').map((connection) => computeConnectionView(connection, userId, state));

  return {
    ownProfile: decorateProfile(ownProfile, state),
    incoming,
    outgoing,
    connected,
  };
}

async function getConnection(connectionId, userId) {
  await withState(async () => undefined);
  const state = getState();
  const connection = state.connections.find((candidate) => candidate.id === connectionId);
  if (!connection || (connection.requesterUserId !== userId && connection.targetUserId !== userId)) {
    return null;
  }

  return computeConnectionView(connection, userId, state);
}

async function approveConnection(connectionId, userId) {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection) {
      const error = new Error('CONNECTION_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    if (connection.targetUserId !== userId) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    connection.status = 'approved';
    connection.updatedAt = new Date().toISOString();

    return computeConnectionView(connection, userId, state);
  });
}

async function rejectConnection(connectionId, userId) {
  return withState(async (state) => {
    const connection = state.connections.find((candidate) => candidate.id === connectionId);
    if (!connection) {
      const error = new Error('CONNECTION_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    if (connection.targetUserId !== userId) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    connection.status = 'rejected';
    connection.updatedAt = new Date().toISOString();

    return computeConnectionView(connection, userId, state);
  });
}

async function cancelConnection(connectionId, userId) {
  return withState(async (state) => {
    const index = state.connections.findIndex((candidate) => candidate.id === connectionId);
    if (index === -1) {
      const error = new Error('CONNECTION_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    const connection = state.connections[index];
    if (connection.requesterUserId !== userId) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    if (connection.status !== 'pending') {
      const error = new Error('CANCEL_NOT_ALLOWED');
      error.statusCode = 400;
      throw error;
    }

    state.connections.splice(index, 1);
    return computeConnectionView(connection, userId, state);
  });
}

async function removeConnection(connectionId, userId) {
  return withState(async (state) => {
    const index = state.connections.findIndex((candidate) => candidate.id === connectionId);
    if (index === -1) {
      const error = new Error('CONNECTION_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    const connection = state.connections[index];
    const isParticipant = connection.requesterUserId === userId || connection.targetUserId === userId;
    if (!isParticipant) {
      const error = new Error('FORBIDDEN');
      error.statusCode = 403;
      throw error;
    }

    if (connection.status !== 'approved') {
      const error = new Error('REMOVE_NOT_ALLOWED');
      error.statusCode = 400;
      throw error;
    }

    state.connections.splice(index, 1);
    return computeConnectionView(connection, userId, state);
  });
}

async function isApprovedParticipant(connectionId, userId) {
  await withState(async () => undefined);
  const state = getState();
  const connection = state.connections.find((candidate) => candidate.id === connectionId);
  if (!connection) {
    return false;
  }

  const isParticipant = connection.requesterUserId === userId || connection.targetUserId === userId;
  return isParticipant && connection.status === 'approved';
}

async function getConnectionForChat(connectionId, userId) {
  await withState(async () => undefined);
  const state = getState();
  const connection = state.connections.find((candidate) => candidate.id === connectionId);
  if (!connection || (connection.requesterUserId !== userId && connection.targetUserId !== userId)) {
    return null;
  }

  return computeConnectionView(connection, userId, state);
}

export {
  approveConnection,
  cancelConnection,
  getConnection,
  getConnectionForChat,
  isApprovedParticipant,
  listConnections,
  removeConnection,
  rejectConnection,
  requestConnection,
};