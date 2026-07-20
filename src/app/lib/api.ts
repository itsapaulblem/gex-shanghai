export type Locale = 'zh' | 'en';

export interface UserRecord {
  id: string;
  email: string;
  createdAt: string;
  language: Locale;
  passwordHash?: string;
  passwordSalt?: string | null;
}

export interface ProfileRecord {
  id: string;
  ownerUserId: string;
  presence?: {
    status: 'online' | 'offline';
    lastSeenAt: string | null;
  };
  honorific?: string;
  surname?: string;
  childAlias: string;
  gender: '男' | '女';
  birthYear: number;
  age: number;
  height: number;
  weight?: number;
  city: string;
  hukou: string;
  hometown: string;
  education: string;
  school: string;
  major: string;
  industry: string;
  jobTitle: string;
  income: string;
  property: string;
  car: string;
  traits: string[];
  hobbies: string;
  about: string;
  preferredAgeRange?: string;
  preferredHeightRange?: string;
  minEducationLevel?: string;
  hukouPreference?: string;
  additionalPreferences?: string;
  preferences: string;
  createdAt: string;
}

export interface ConnectionRecord {
  id: string;
  requesterUserId: string;
  requesterProfileId: string;
  targetUserId: string;
  targetProfileId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  requesterProfile?: ProfileRecord | null;
  targetProfile?: ProfileRecord | null;
  otherProfile?: ProfileRecord | null;
  ownProfile?: ProfileRecord | null;
  direction?: 'incoming' | 'outgoing' | 'other';
}

export interface MessageRecord {
  id: string;
  connectionId: string;
  senderUserId: string;
  text: string;
  messageType?: 'text' | 'image';
  imageDataUrl?: string | null;
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  user: UserRecord;
  profile: ProfileRecord | null;
}

export interface RequestOkResponse {
  ok: true;
}

export interface SignupOtpResponse {
  ok: true;
  expiresAt?: string;
}

async function requestJson<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : 'REQUEST_FAILED';
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  requestSignupOtp: (data: { email: string; language?: Locale }) => requestJson<SignupOtpResponse>('/api/auth/request-signup-otp', { method: 'POST', body: JSON.stringify(data) }),
  verifySignupOtp: (data: { email: string; otp: string }) => requestJson<RequestOkResponse>('/api/auth/verify-signup-otp', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { email: string; password: string; language?: Locale }) => requestJson<SessionRecord>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) => requestJson<SessionRecord>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  requestPasswordReset: (data: { email: string }) => requestJson<RequestOkResponse>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { token: string; password: string }) => requestJson<RequestOkResponse>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  me: (token: string) => requestJson<SessionRecord>('/api/me', {}, token),
  setLanguage: (token: string, language: Locale) => requestJson<{ user: UserRecord }>('/api/me/language', { method: 'PATCH', body: JSON.stringify({ language }) }, token),
  listProfiles: (token: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters ?? {});
    const query = params.toString();
    return requestJson<{ ownProfile: ProfileRecord | null; profiles: ProfileRecord[] }>(`/api/profiles${query ? `?${query}` : ''}`, {}, token);
  },
  getProfile: (token: string, id: string) => requestJson<{ profile: ProfileRecord }>(`/api/profiles/${id}`, {}, token),
  createProfile: (token: string, data: Record<string, unknown>) => requestJson<{ profile: ProfileRecord }>('/api/profiles', { method: 'POST', body: JSON.stringify(data) }, token),
  updateOwnProfile: (token: string, data: Record<string, unknown>) => requestJson<{ profile: ProfileRecord }>('/api/profiles/me', { method: 'PATCH', body: JSON.stringify(data) }, token),
  listConnections: (token: string) => requestJson<{ ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] }>('/api/connections', {}, token),
  requestConnection: (token: string, targetProfileId: string) => requestJson<{ connection: ConnectionRecord }>('/api/connections', { method: 'POST', body: JSON.stringify({ targetProfileId }) }, token),
  approveConnection: (token: string, connectionId: string) => requestJson<{ connection: ConnectionRecord }>(`/api/connections/${connectionId}/approve`, { method: 'POST' }, token),
  rejectConnection: (token: string, connectionId: string) => requestJson<{ connection: ConnectionRecord }>(`/api/connections/${connectionId}/reject`, { method: 'POST' }, token),
  cancelConnection: (token: string, connectionId: string) => requestJson<{ connection: ConnectionRecord }>(`/api/connections/${connectionId}/cancel`, { method: 'POST' }, token),
  removeConnection: (token: string, connectionId: string) => requestJson<{ connection: ConnectionRecord }>(`/api/connections/${connectionId}/remove`, { method: 'POST' }, token),
  loadChat: (token: string, connectionId: string) => requestJson<{ connection: ConnectionRecord; messages: MessageRecord[]; typingUserIds?: string[] }>(`/api/chats/${connectionId}`, {}, token),
  sendMessage: (token: string, connectionId: string, payload: { text?: string; imageDataUrl?: string | null }) => requestJson<{ message: MessageRecord }>(`/api/chats/${connectionId}/messages`, { method: 'POST', body: JSON.stringify(payload) }, token),
  setTyping: (token: string, connectionId: string, isTyping: boolean) => requestJson<RequestOkResponse>(`/api/chats/${connectionId}/typing`, { method: 'POST', body: JSON.stringify({ isTyping }) }, token),
  deleteMessage: (token: string, connectionId: string, messageId: string) => requestJson<RequestOkResponse>(`/api/chats/${connectionId}/messages/${messageId}`, { method: 'DELETE' }, token),
  hideMessageForSelf: (token: string, connectionId: string, messageId: string) => requestJson<RequestOkResponse>(`/api/chats/${connectionId}/messages/${messageId}/hide`, { method: 'POST' }, token),
};