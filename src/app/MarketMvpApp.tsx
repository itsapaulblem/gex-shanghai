import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Globe2,
  Heart,
  LogIn,
  Filter,
  MessageSquare,
  Search,
  Send,
  Shield,
  Sparkles,
  UserPlus,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { api, type ConnectionRecord, type Locale, type MessageRecord, type ProfileRecord, type SessionRecord } from './lib/api';

type Screen = 'auth' | 'setup' | 'me' | 'browse' | 'detail' | 'connections' | 'chat';
type AuthMode = 'login' | 'register';
type GenderFilter = 'all' | '男' | '女';
type SortMode = 'latest' | 'age-asc' | 'age-desc' | 'height';

type ProfileFormState = {
  honorific: string;
  surname: string;
  childAlias: string;
  gender: '男' | '女';
  birthYear: string;
  age: string;
  height: string;
  weight: string;
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
  traits: string;
  hobbies: string;
  preferredAgeRange: string;
  preferredHeightRange: string;
  minEducationLevel: string;
  hukouPreference: string;
  additionalPreferences: string;
  about: string;
  preferences: string;
};

type Copy = {
  appName: string;
  subtitle: string;
  authTitle: string;
  authDescription: string;
  register: string;
  login: string;
  email: string;
  password: string;
  signIn: string;
  createAccount: string;
  language: string;
  browse: string;
  profileSetup: string;
  connections: string;
  chat: string;
  signOut: string;
  requestConnect: string;
  pending: string;
  approved: string;
  incoming: string;
  outgoing: string;
  connected: string;
  completeProfileNotice: string;
  translationHint: string;
  searchPlaceholder: string;
  firstStepTitle: string;
  firstStepDescription: string;
  myProfile: string;
  myConnections: string;
};

const COPY: Record<Locale, Copy> = {
  zh: {
    appName: '上海人民公园相亲角',
    subtitle: '线上网站',
    authTitle: '为孩子寻得合适良缘',
    authDescription: '以家庭责任为起点，帮助孩子进入更稳妥的婚配路径。登录后先完善档案，再浏览、连接与私聊。',
    register: '注册',
    login: '登录',
    email: '邮箱',
    password: '密码',
    signIn: '登录 / 注册',
    createAccount: '创建账户',
    language: 'English',
    browse: '浏览相亲角',
    profileSetup: '创建子女档案',
    connections: '我的连接',
    chat: '私信房间',
    signOut: '退出登录',
    requestConnect: '发送连接申请',
    pending: '待处理',
    approved: '已通过',
    incoming: '收到的申请',
    outgoing: '我发出的申请',
    connected: '已连接',
    completeProfileNotice: '请填写完整子女资料，解锁浏览、申请与私聊功能。',
    translationHint: '网站主语言为中文，左上角可切换为英文界面。',
    searchPlaceholder: '搜索年龄、城市、行业、学校、户籍...',
    firstStepTitle: '先创建档案',
    firstStepDescription: '请填写完整子女资料，系统才会开放浏览、申请和私信功能。',
    myProfile: '我的档案',
    myConnections: '我的连接',
  },
  en: {
    appName: 'Shanghai People’s Park Marriage Market',
    subtitle: 'Online website',
    authTitle: 'Find a Match, Build a Future',
    authDescription: 'Turn family responsibility into lasting outcomes: more compatible profiles, stronger family cohesion, and a better chance at a stable match.',
    register: 'Register',
    login: 'Sign in',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in / Register',
    createAccount: 'Create account',
    language: '中文',
    browse: 'Browse profiles',
    profileSetup: 'Create child profile',
    connections: 'Connections',
    chat: 'Private chat',
    signOut: 'Sign out',
    requestConnect: 'Request to connect',
    pending: 'Pending',
    approved: 'Approved',
    incoming: 'Incoming requests',
    outgoing: 'Outgoing requests',
    connected: 'Connected',
    completeProfileNotice: 'Complete the child profile to unlock browsing, requests, and chat.',
    translationHint: 'The site is Chinese-first, and you can switch the interface to English from the top left.',
    searchPlaceholder: 'Search by age, city, industry, school, hukou...',
    firstStepTitle: 'Create the profile first',
    firstStepDescription: 'Please complete the child profile to unlock browsing, requests, and chat.',
    myProfile: 'My Profile',
    myConnections: 'My Connections',
  },
};

const defaultProfileForm: ProfileFormState = {
  honorific: 'Mr',
  surname: '',
  childAlias: '',
  gender: '男',
  birthYear: '1995',
  age: '31',
  height: '175',
  weight: '65',
  city: '上海',
  hukou: '上海',
  hometown: '上海',
  education: '硕士',
  school: '',
  major: '',
  industry: '',
  jobTitle: '',
  income: '1.5-3万/月',
  property: '有房',
  car: '有车',
  traits: '',
  hobbies: '',
  preferredAgeRange: '',
  preferredHeightRange: '',
  minEducationLevel: '',
  hukouPreference: '',
  additionalPreferences: '',
  about: '',
  preferences: '',
};

const HONORIFIC_OPTIONS = [
  { label: 'Mr', value: 'Mr' },
  { label: 'Mrs', value: 'Mrs' },
  { label: 'Ms', value: 'Ms' },
  { label: 'Dr', value: 'Dr' },
  { label: 'Mdm', value: 'Mdm' },
];

const INCOME_OPTIONS = [
  '0-1万/月',
  '1-2万/月',
  '2-3万/月',
  '3-5万/月',
  '5-8万/月',
  '8-12万/月',
  '12-15万/月',
  '15-20万/月',
  '20万/月以上',
];

const AGE_RANGE_OPTIONS = [
  { label: 'Any age', value: 'all' },
  { label: '20-25', value: '20-25' },
  { label: '26-30', value: '26-30' },
  { label: '31-35', value: '31-35' },
  { label: '36-40', value: '36-40' },
  { label: '40+', value: '40+' },
];

const SALARY_RANGE_OPTIONS = [
  { label: 'Any salary', value: 'all' },
  { label: '0-1万/月', value: '0-1万/月' },
  { label: '1-2万/月', value: '1-2万/月' },
  { label: '2-3万/月', value: '2-3万/月' },
  { label: '3-5万/月', value: '3-5万/月' },
  { label: '5-8万/月', value: '5-8万/月' },
  { label: '8-12万/月', value: '8-12万/月' },
  { label: '12-15万/月', value: '12-15万/月' },
  { label: '15-20万/月', value: '15-20万/月' },
  { label: '20万/月以上', value: '20万/月以上' },
];

const BIRTH_YEARS = Array.from({ length: 2026 - 1940 + 1 }, (_, index) => String(2026 - index));

const REQUIRED_PROFILE_FIELDS: (keyof ProfileFormState)[] = [
  'honorific',
  'surname',
  'childAlias',
  'gender',
  'birthYear',
  'age',
  'height',
  'weight',
  'hukou',
  'hometown',
  'education',
  'school',
  'major',
  'industry',
  'jobTitle',
  'income',
  'property',
  'car',
  'traits',
  'hobbies',
  'preferredAgeRange',
];

const PROFILE_SETUP_STEPS: { title: { zh: string; en: string }; fields: (keyof ProfileFormState)[] }[] = [
  {
    title: { zh: '基本信息', en: 'Basic info' },
    fields: ['honorific', 'surname', 'childAlias', 'gender', 'birthYear', 'age', 'height', 'weight', 'hukou', 'hometown'],
  },
  {
    title: { zh: '学历与职业', en: 'Education & career' },
    fields: ['education', 'school', 'major', 'industry', 'jobTitle', 'income', 'property', 'car'],
  },
  {
    title: { zh: '个人描述', en: 'Profile story' },
    fields: ['traits', 'hobbies', 'preferredAgeRange', 'preferredHeightRange', 'minEducationLevel', 'hukouPreference', 'additionalPreferences'],
  },
];

const PROFILE_FIELD_LABELS: Record<keyof ProfileFormState, { zh: string; en: string }> = {
  honorific: { zh: '称呼', en: 'Title' },
  surname: { zh: '姓氏', en: 'Surname' },
  childAlias: { zh: '子女称呼', en: 'Alias' },
  gender: { zh: '性别', en: 'Gender' },
  birthYear: { zh: '出生年份', en: 'Birth year' },
  age: { zh: '年龄', en: 'Age' },
  height: { zh: '身高', en: 'Height' },
  weight: { zh: '体重', en: 'Weight' },
  city: { zh: '现居城市', en: 'City' },
  hukou: { zh: '户籍', en: 'Hukou' },
  hometown: { zh: '老家', en: 'Hometown' },
  education: { zh: '最高学历', en: 'Highest education' },
  school: { zh: '大学 / 学校', en: 'University / School' },
  major: { zh: '所学专业', en: 'Major / Field of Study' },
  industry: { zh: '行业', en: 'Industry' },
  jobTitle: { zh: '职业', en: 'Job title' },
  income: { zh: '月收入', en: 'Monthly income' },
  property: { zh: '房产', en: 'Property' },
  car: { zh: '车辆', en: 'Car' },
  traits: { zh: '孩子性格描述', en: 'Personality (written by parent)' },
  hobbies: { zh: '兴趣爱好', en: 'Hobbies & Interests' },
  preferredAgeRange: { zh: '期望年龄范围', en: 'Preferred Age Range' },
  preferredHeightRange: { zh: '期望身高范围', en: 'Preferred Height (cm)' },
  minEducationLevel: { zh: '最低学历要求', en: 'Min. Education Level' },
  hukouPreference: { zh: '户籍偏好', en: 'Hukou Preference' },
  additionalPreferences: { zh: '其他要求', en: 'Additional Preferences' },
  about: { zh: '简介', en: 'About' },
  preferences: { zh: '择偶要求', en: 'Preferences' },
};

function getInitialLocale(): Locale {
  const stored = window.localStorage.getItem('gex-locale');
  return stored === 'en' ? 'en' : 'zh';
}

function getInitialToken() {
  return window.localStorage.getItem('gex-token');
}

function getPendingOutgoingConnection(
  profileId: string,
  connections: { ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null,
) {
  return connections?.outgoing.find((connection) => connection.targetProfileId === profileId && connection.status === 'pending') ?? null;
}

function badgeClass(type: 'default' | 'red' | 'green' | 'gold' | 'yellow' = 'default') {
  const styles = {
    default: 'bg-[#EEE9E0] text-[#5A5248] border border-[#D8D0C4]',
    red: 'bg-[#FEF0F0] text-[#B5272A] border border-[#F5C4C5]',
    green: 'bg-[#EBF5EE] text-[#2C8A4A] border border-[#B8DAC4]',
    gold: 'bg-[#FDF6E3] text-[#9A6F1A] border border-[#E8D49A]',
    yellow: 'bg-[#FFF2C7] text-[#8A6500] border border-[#F0D27A]',
  };
  return styles[type];
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'red' | 'green' | 'gold' | 'yellow' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ${badgeClass(tone)}`}>{children}</span>;
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <div className="text-sm font-semibold text-[#1A1208]">{title}</div>
        {subtitle ? <div className="mt-0.5 text-xs font-mono text-[#7A6E62]">{subtitle}</div> : null}
      </div>
      <div className="h-px flex-1 bg-[#D8D0C4]" />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-[#D8D0C4] bg-white ${className}`}>{children}</div>;
}

function toTraits(text: string) {
  return text
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatAge(profile: ProfileRecord) {
  return `${profile.age}岁 · ${profile.height}cm`;
}

function sortProfiles(profiles: ProfileRecord[], sort: SortMode) {
  const cloned = [...profiles];

  if (sort === 'age-asc') {
    return cloned.sort((left, right) => left.age - right.age);
  }

  if (sort === 'age-desc') {
    return cloned.sort((left, right) => right.age - left.age);
  }

  if (sort === 'height') {
    return cloned.sort((left, right) => right.height - left.height);
  }

  return cloned.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function formatLastSeen(lastSeenAt?: string | null) {
  if (!lastSeenAt) {
    return '';
  }

  const deltaMs = Date.now() - new Date(lastSeenAt).getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return 'just now';
  }

  const minutes = Math.max(1, Math.floor(deltaMs / 60000));
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function ProfilePill({ profile }: { profile: ProfileRecord }) {
  return <Badge tone={profile.hukou === '上海' ? 'gold' : 'default'}>{profile.hukou === '上海' ? '沪籍' : profile.hukou}</Badge>;
}

function getProfileConnectionState(
  profileId: string,
  connections: { ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null,
) {
  const pending = connections?.outgoing.some((connection) => connection.targetProfileId === profileId && connection.status === 'pending') ?? false;
  if (pending) {
    return 'pending' as const;
  }

  const connected = connections?.connected.some((connection) => {
    const relatedProfileId = connection.otherProfile?.id ?? connection.targetProfileId ?? connection.requesterProfileId;
    return relatedProfileId === profileId;
  }) ?? false;

  return connected ? 'connected' as const : 'none' as const;
}

export default function MarketMvpApp() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordVisible, setAuthPasswordVisible] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [browsePage, setBrowsePage] = useState(1);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [connections, setConnections] = useState<{ ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null>(null);
  const [chat, setChat] = useState<{ connection: ConnectionRecord; messages: MessageRecord[] } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all' as GenderFilter,
    ageRange: 'all',
    salaryRange: 'all',
    sort: 'latest' as SortMode,
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>(defaultProfileForm);

  const copy = COPY[locale];
  const ownProfile = session?.profile ?? null;

  function showNotice(message: string, tone: 'error' | 'success' = 'error') {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 2800);
  }

  function formatErrorMessage(error: unknown) {
    const code = String((error as { message?: string } | null)?.message ?? error ?? 'REQUEST_FAILED');
    const mapped: Record<string, string> = {
      EMAIL_REQUIRED: 'Error! Email is required!',
      EMAIL_INVALID: 'Error! Email must include @!',
      EMAIL_EXISTS: 'Error! Email exists!',
      INVALID_CREDENTIALS: 'Error! Wrong Password!',
      PASSWORD_TOO_WEAK: 'Error! Password needs 8 characters, one uppercase letter, and one special character!',
      CANCEL_NOT_ALLOWED: 'Error! Only pending requests can be cancelled!',
      PROFILE_EXISTS: 'Error! Profile already exists!',
      PROFILE_NOT_FOUND: 'Error! Profile not found!',
      UNAUTHORIZED: 'Error! Please sign in again!',
      REQUEST_FAILED: 'Error! Request failed!',
    };
    return mapped[code] ?? `Error! ${code.replaceAll('_', ' ')}`;
  }

  function populateProfileForm(profile?: ProfileRecord | null) {
    setProfileForm({
      honorific: profile?.honorific ?? 'Mr',
      surname: profile?.surname ?? '',
      childAlias: profile?.childAlias ?? '',
      gender: profile?.gender ?? '男',
      birthYear: String(profile?.birthYear ?? 1995),
      age: String(profile?.age ?? 31),
      height: String(profile?.height ?? 175),
      weight: String(profile?.weight ?? 65),
      city: profile?.city ?? '上海',
      hukou: profile?.hukou ?? '上海',
      hometown: profile?.hometown ?? '上海',
      education: profile?.education ?? '硕士',
      school: profile?.school ?? '',
      major: profile?.major ?? '',
      industry: profile?.industry ?? '',
      jobTitle: profile?.jobTitle ?? '',
      income: profile?.income ?? '1.5-3万/月',
      property: profile?.property ?? '有房',
      car: profile?.car ?? '有车',
      traits: profile?.traits?.join(', ') ?? '',
      hobbies: profile?.hobbies ?? '',
      preferredAgeRange: '',
      preferredHeightRange: '',
      minEducationLevel: '',
      hukouPreference: '',
      additionalPreferences: '',
      about: profile?.about ?? '',
      preferences: profile?.preferences ?? '',
    });
  }

  async function refreshSession(activeToken = token) {
    if (!activeToken) {
      setSession(null);
      setScreen('auth');
      setLoading(false);
      return;
    }

    try {
      const current = await api.me(activeToken);
      setSession(current);
      setToken(activeToken);
      window.localStorage.setItem('gex-token', activeToken);
      window.localStorage.setItem('gex-locale', current.user.language);
      setLocale(current.user.language);

      if (current.profile) {
        setScreen('browse');
        await refreshBrowse(activeToken);
        await refreshConnections(activeToken);
      } else {
        populateProfileForm(null);
        setSetupStep(1);
        setScreen('setup');
      }
    } finally {
      setLoading(false);
    }
  }

  async function refreshBrowse(activeToken = token, currentFilters = filters) {
    if (!activeToken) {
      return;
    }

    const payload = await api.listProfiles(activeToken, {
      search: currentFilters.search,
      gender: currentFilters.gender,
      sort: currentFilters.sort,
    });

    setProfiles(payload.profiles);
    setSession((current) => (current ? { ...current, profile: payload.ownProfile } : current));
  }

  async function refreshConnections(activeToken = token) {
    if (!activeToken) {
      return;
    }

    const payload = await api.listConnections(activeToken);
    setConnections(payload);
  }

  useEffect(() => {
    refreshSession().catch((error) => {
      window.localStorage.removeItem('gex-token');
      setToken(null);
      setSession(null);
      setScreen('auth');
      setLoading(false);
      showNotice(formatErrorMessage(error));
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem('gex-locale', locale);
    if (token) {
      api.setLanguage(token, locale).catch(() => undefined);
    }
  }, [locale, token]);

  useEffect(() => {
    if (token && session?.profile) {
      refreshBrowse(token, filters).catch((error) => showNotice(formatErrorMessage(error)));
    }
  }, [filters.sort]);

  async function submitAuth() {
    try {
      setAuthBusy(true);
      const payload = authMode === 'login'
        ? await api.login({ email: authEmail, password: authPassword })
        : await api.register({ email: authEmail, password: authPassword, language: locale });

      window.localStorage.setItem('gex-token', payload.token);
      setToken(payload.token);
      setSession(payload);
      setLocale(payload.user.language);
      setScreen(payload.profile ? 'browse' : 'setup');
      if (payload.profile) {
        await Promise.all([refreshBrowse(payload.token), refreshConnections(payload.token)]);
      }
      showNotice(authMode === 'login' ? 'Success! Logged in.' : 'Success! Account created.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitProfile() {
    if (!token) {
      return;
    }

    try {
      setProfileBusy(true);
      const missingField = REQUIRED_PROFILE_FIELDS.find((field) => {
        const value = profileForm[field];
        return typeof value === 'string' ? !value.trim() : false;
      });

      if (missingField) {
        throw new Error('PROFILE_REQUIRED');
      }

      const payload = {
        ...profileForm,
        age: Number(profileForm.age),
        birthYear: Number(profileForm.birthYear),
        height: Number(profileForm.height),
        weight: Number(profileForm.weight),
        traits: toTraits(profileForm.traits),
        about: profileForm.traits,
        preferences: [
          profileForm.preferredAgeRange,
          profileForm.preferredHeightRange,
          profileForm.minEducationLevel,
          profileForm.hukouPreference,
          profileForm.additionalPreferences,
        ].filter(Boolean).join(' · '),
      };
      if (ownProfile) {
        await api.updateOwnProfile(token, payload);
        showNotice(locale === 'zh' ? 'Success! 档案已更新。' : 'Success! Profile updated.', 'success');
      } else {
        await api.createProfile(token, payload);
        showNotice(locale === 'zh' ? 'Success! 档案已提交。' : 'Success! Profile submitted.', 'success');
      }
      await refreshSession(token);
    } catch (error) {
      showNotice(formatErrorMessage(error));
    } finally {
      setProfileBusy(false);
    }
  }

  async function openProfile(profileId: string) {
    if (!token) {
      return;
    }

    try {
      const payload = await api.getProfile(token, profileId);
      setSelectedProfile(payload.profile);
      setScreen('detail');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function requestConnect(profileId: string) {
    if (!token) {
      return;
    }

    try {
      await api.requestConnection(token, profileId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? 'Success! 连接申请已发送。' : 'Success! Connection request sent.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function approve(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      await api.approveConnection(token, connectionId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? 'Success! 已同意连接。' : 'Success! Connection approved.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function reject(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      await api.rejectConnection(token, connectionId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? 'Success! 已拒绝连接。' : 'Success! Connection rejected.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function cancelRequest(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      await api.cancelConnection(token, connectionId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? 'Success! 已取消申请。' : 'Success! Request cancelled.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function openChat(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      const payload = await api.loadChat(token, connectionId);
      setChat(payload);
      setScreen('chat');
      setMessageText('');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function sendChatMessage() {
    if (!token || !chat || !messageText.trim()) {
      return;
    }

    try {
      await api.sendMessage(token, chat.connection.id, messageText.trim());
      const payload = await api.loadChat(token, chat.connection.id);
      setChat(payload);
      setMessageText('');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function signOut() {
    window.localStorage.removeItem('gex-token');
    setToken(null);
    setSession(null);
    setConnections(null);
    setProfiles([]);
    setChat(null);
    setSelectedProfile(null);
    setScreen('auth');
  }

  function openOwnProfilePage() {
    if (!ownProfile) {
      showNotice(locale === 'zh' ? '请先创建个人档案。' : 'Please create a profile first.');
      populateProfileForm(null);
      setSetupStep(1);
      setScreen('setup');
      return;
    }

    populateProfileForm(ownProfile);
    setSetupStep(1);
    setScreen('setup');
  }

  const incomingCount = connections?.incoming.length ?? 0;
  const connectedCount = connections?.connected.length ?? 0;
  const outgoingCount = connections?.outgoing.length ?? 0;

  const filteredProfiles = useMemo(() => {
    const searchTokens = filters.search
      .trim()
      .toLowerCase()
      .split(/[\s,，]+/)
      .filter(Boolean);

    function parseSalaryValue(text: string) {
      const normalized = text.trim().replace(/[–—~]/g, '-').replace(/\s+/g, '');
      if (!normalized) {
        return null;
      }

      const extractValue = (part: string) => {
        const match = part.match(/(\d+(?:\.\d+)?)(千|k|万)?/i);
        if (!match) {
          return null;
        }

        const number = Number(match[1]);
        if (!Number.isFinite(number)) {
          return null;
        }

        const unit = match[2]?.toLowerCase();
        if (unit === '千' || unit === 'k') {
          return number / 10;
        }

        return number;
      };

      if (normalized.includes('以上') || normalized.includes('>=') || normalized.includes('≥')) {
        const min = extractValue(normalized);
        return min === null ? null : { min, max: Number.POSITIVE_INFINITY };
      }

      if (normalized.includes('-')) {
        const [left, right] = normalized.split('-');
        const min = extractValue(left);
        const max = extractValue(right);
        if (min === null || max === null) {
          return null;
        }
        return { min: Math.min(min, max), max: Math.max(min, max) };
      }

      const exact = extractValue(normalized);
      return exact === null ? null : { min: exact, max: exact };
    }

    function parseAgeRange(value: string) {
      if (!value || value === 'all') {
        return null;
      }

      if (value.endsWith('+')) {
        const min = Number(value.slice(0, -1));
        return Number.isFinite(min) ? { min, max: Number.POSITIVE_INFINITY } : null;
      }

      const [start, end] = value.split('-').map(Number);
      return Number.isFinite(start) && Number.isFinite(end) ? { min: Math.min(start, end), max: Math.max(start, end) } : null;
    }

    const filtered = profiles.filter((profile) => {
      const matchesGender = filters.gender === 'all' || profile.gender === filters.gender;
      const corpus = [
        profile.childAlias,
        profile.city,
        profile.hukou,
        profile.hometown,
        profile.education,
        profile.school,
        profile.major,
        profile.industry,
        profile.jobTitle,
        profile.income,
        profile.property,
        profile.car,
        profile.hobbies,
        profile.about,
        profile.preferences,
        profile.traits.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchTokens.length === 0 || searchTokens.every((token) => corpus.includes(token));

      const ageRange = parseAgeRange(filters.ageRange);
      const salaryRange = filters.salaryRange === 'all' ? null : parseSalaryValue(filters.salaryRange);
      const profileSalary = parseSalaryValue(profile.income);

      const matchesAge = !ageRange || (profile.age >= ageRange.min && profile.age <= ageRange.max);
      const matchesSalary = !salaryRange || (profileSalary ? profileSalary.max >= salaryRange.min && profileSalary.min <= salaryRange.max : false);

      return matchesGender && matchesSearch && matchesAge && matchesSalary;
    });
    return sortProfiles(filtered, filters.sort);
  }, [filters.ageRange, filters.gender, filters.salaryRange, filters.search, filters.sort, profiles]);

  const browsableProfiles = filteredProfiles.filter((profile) => !ownProfile || profile.id !== ownProfile.id);
  const browsePageCount = Math.max(1, Math.ceil(browsableProfiles.length / 6));
  const activeBrowsePage = Math.min(browsePage, browsePageCount);
  const pagedBrowseProfiles = browsableProfiles.slice((activeBrowsePage - 1) * 6, activeBrowsePage * 6);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F4EF] text-[#5A5248]">Loading...</div>;
  }

  if (screen === 'auth') {
    return (
      <div className="relative min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <button
          onClick={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248] shadow-sm"
        >
          <Globe2 size={14} /> {copy.language}
        </button>
        <div className="mx-auto grid min-h-screen max-w-6xl gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden border-r border-[#D8D0C4] bg-white px-8 py-10 lg:px-12">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A87C1A] text-white font-serif text-lg font-bold">缘</div>
                <div>
                  <div className="font-serif text-lg font-semibold">{copy.appName}</div>
                  <div className="text-[10px] font-mono text-[#7A6E62]">{copy.subtitle}</div>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-[#A87C1A]">
                <Sparkles size={14} /> {locale === 'zh' ? '责任撮合 · 以家为本' : 'Responsible matchmaking · family first'}
              </div>
              <h1 className="font-serif text-5xl font-semibold leading-tight">{copy.authTitle}</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#5A5248]">{copy.authDescription}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Shield,
                    title: locale === 'zh' ? '匿名与隐私' : 'Privacy first',
                    body: locale === 'zh' ? '档案默认不公开姓名与联系方式，只有双方同意后才开放聊天。' : 'Profiles stay anonymous until both sides agree to connect, then chat unlocks.',
                  },
                  {
                    icon: Users,
                    title: locale === 'zh' ? '家庭责任' : 'Family responsibility',
                    body: locale === 'zh' ? '把“为孩子寻良缘”变成可执行的家庭行动。' : 'Turn the duty to guide a child toward marriage into a clear, practical step.',
                  },
                  {
                    icon: Sparkles,
                    title: locale === 'zh' ? '规模与结果' : 'Scale with outcomes',
                    body: locale === 'zh' ? '用更多活跃档案提高匹配机会，争取更稳妥的结果。' : 'A larger active pool means more choices, stronger competition, and better long-term outcomes.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="border-[#E8D49A] bg-[#FFF9E8] p-4">
                      <Icon className="mb-3 text-[#A87C1A]" size={18} />
                      <div className="text-base font-semibold">{item.title}</div>
                      <div className="mt-1 text-sm leading-7 text-[#5A5248]">{item.body}</div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 lg:px-10">
            <Card className="w-full max-w-md p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1A1208]">{authMode === 'login' ? copy.login : copy.register}</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-full border border-[#E8D49A] bg-[#FFF9E8] p-1">
                <button
                  onClick={() => setAuthMode('register')}
                  className={`rounded-full px-3 py-2 text-base ${authMode === 'register' ? 'bg-[#A87C1A] text-white' : 'text-[#5A5248]'}`}
                >
                  {copy.createAccount}
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`rounded-full px-3 py-2 text-base ${authMode === 'login' ? 'bg-[#A87C1A] text-white' : 'text-[#5A5248]'}`}
                >
                  {copy.login}
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.email}</div>
                  <input
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    type="email"
                    className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-base outline-none focus:border-[#A87C1A]"
                    placeholder="parent@example.com"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.password}</div>
                  <div className="relative">
                    <input
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      type={authPasswordVisible ? 'text' : 'password'}
                      className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 pr-12 text-base outline-none focus:border-[#A87C1A]"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setAuthPasswordVisible((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7A6E62]"
                      aria-label={authPasswordVisible ? (locale === 'zh' ? '隐藏密码' : 'Hide password') : (locale === 'zh' ? '显示密码' : 'Show password')}
                    >
                      {authPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <button
                  onClick={submitAuth}
                  disabled={authBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2C8A4A] px-4 py-3 text-base font-medium text-white hover:bg-[#247A40] disabled:opacity-60"
                >
                  <LogIn size={16} /> {copy.signIn}
                </button>
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  if (screen === 'setup') {
    const currentSetupStep = PROFILE_SETUP_STEPS[setupStep - 1];
    const totalSetupSteps = PROFILE_SETUP_STEPS.length;

    function renderProfileField(fieldKey: keyof ProfileFormState) {
      const fieldLabel = PROFILE_FIELD_LABELS[fieldKey];
      const isWideField = fieldKey === 'gender' || fieldKey === 'traits' || fieldKey === 'hobbies' || fieldKey === 'preferredAgeRange' || fieldKey === 'preferredHeightRange' || fieldKey === 'hukouPreference' || fieldKey === 'additionalPreferences';
      const labelText = locale === 'zh' ? `${fieldLabel.zh} / ${fieldLabel.en}` : `${fieldLabel.en} / ${fieldLabel.zh}`;
      const required = REQUIRED_PROFILE_FIELDS.includes(fieldKey);

      return (
        <label key={fieldKey} className={`block ${isWideField ? 'md:col-span-2' : ''}`}>
          <div className="mb-1 text-[11px] font-medium text-[#1A1208]">
            {labelText}{required ? ' *' : ''}
          </div>
          {fieldKey === 'gender' ? (
            <div className="flex gap-3">
              {['男', '女'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setProfileForm((current) => ({ ...current, gender: gender as '男' | '女' }))}
                  className={`rounded-full border px-4 py-2 text-sm ${profileForm.gender === gender ? 'border-[#A87C1A] bg-[#FEF0F0] text-[#A87C1A]' : 'border-[#D8D0C4] bg-white text-[#5A5248]'}`}
                >
                  {gender} / {gender === '男' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          ) : fieldKey === 'birthYear' ? (
            <select
              value={profileForm.birthYear}
              onChange={(event) => setProfileForm((current) => ({ ...current, birthYear: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {BIRTH_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          ) : fieldKey === 'honorific' ? (
            <select
              value={profileForm.honorific}
              onChange={(event) => setProfileForm((current) => ({ ...current, honorific: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {HONORIFIC_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : fieldKey === 'income' ? (
            <select
              value={profileForm.income}
              onChange={(event) => setProfileForm((current) => ({ ...current, income: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {INCOME_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : fieldKey === 'property' ? (
            <select
              value={profileForm.property}
              onChange={(event) => setProfileForm((current) => ({ ...current, property: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {['有房', '无房'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : fieldKey === 'car' ? (
            <select
              value={profileForm.car}
              onChange={(event) => setProfileForm((current) => ({ ...current, car: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {['有车', '无车'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : fieldKey === 'preferredAgeRange' ? (
            <input
              value={profileForm.preferredAgeRange}
              onChange={(event) => setProfileForm((current) => ({ ...current, preferredAgeRange: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'e.g. 28–35岁' : 'e.g. 28-35'}
            />
          ) : fieldKey === 'preferredHeightRange' ? (
            <input
              value={profileForm.preferredHeightRange}
              onChange={(event) => setProfileForm((current) => ({ ...current, preferredHeightRange: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'e.g. 170cm以上' : 'e.g. 170cm or taller'}
            />
          ) : fieldKey === 'minEducationLevel' ? (
            <select
              value={profileForm.minEducationLevel}
              onChange={(event) => setProfileForm((current) => ({ ...current, minEducationLevel: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              <option value="">Select...</option>
              {['不限', '大专', '本科', '硕士', '博士'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : fieldKey === 'hukouPreference' ? (
            <input
              value={profileForm.hukouPreference}
              onChange={(event) => setProfileForm((current) => ({ ...current, hukouPreference: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'e.g. 上海户口优先，不限亦可' : 'e.g. Shanghai hukou preferred, open to all'}
            />
          ) : fieldKey === 'additionalPreferences' ? (
            <textarea
              value={profileForm.additionalPreferences}
              onChange={(event) => setProfileForm((current) => ({ ...current, additionalPreferences: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'Any other preferences....' : 'Any other preferences....'}
            />
          ) : fieldKey === 'about' || fieldKey === 'preferences' ? (
            <textarea
              value={profileForm[fieldKey]}
              onChange={(event) => setProfileForm((current) => ({ ...current, [fieldKey]: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={fieldKey === 'about'
                ? (locale === 'zh' ? '填写孩子的整体介绍' : 'Share a short introduction')
                : (locale === 'zh' ? '填写对另一半的期待' : 'State partner preferences')}
            />
          ) : fieldKey === 'traits' ? (
            <textarea
              value={profileForm.traits}
              onChange={(event) => setProfileForm((current) => ({ ...current, traits: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'e.g. 性格开朗活泼，孝顺，工作认真负责，喜欢烹饪和旅游...' : 'e.g. cheerful, filial, responsible, likes cooking and travel...'}
            />
          ) : fieldKey === 'hobbies' ? (
            <input
              value={profileForm.hobbies}
              onChange={(event) => setProfileForm((current) => ({ ...current, hobbies: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? 'e.g. 摄影、爬山、读书、烘焙' : 'e.g. photography, hiking, reading, baking'}
            />
          ) : (
            <input
              value={profileForm[fieldKey] as string}
              onChange={(event) => setProfileForm((current) => ({ ...current, [fieldKey]: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={fieldKey === 'surname'
                ? (locale === 'zh' ? '例如：王' : 'e.g. Wang')
                : fieldKey === 'childAlias'
                  ? (locale === 'zh' ? '例如：晨晨' : 'e.g. Chenchen')
                  : ''}
            />
          )}
        </label>
      );
    }

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader
          copy={copy}
          locale={locale}
          onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
          onSignOut={signOut}
          onLogoClick={() => setScreen('browse')}
          onProfileClick={openOwnProfilePage}
          currentScreen={copy.profileSetup}
        />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <button onClick={() => setScreen('browse')} className="mb-5 inline-flex items-center gap-2 text-sm text-[#5A5248]">
            <ArrowLeft size={16} /> {locale === 'zh' ? '返回列表' : 'Back to list'}
          </button>
          <SectionLabel title={ownProfile ? copy.myProfile : copy.profileSetup} />
          <div className="grid gap-6">
            <Card className="overflow-hidden border-[#D8D0C4] bg-[#FAFAF8]">
              <div className="border-b border-[#EEE9E0] px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? currentSetupStep.title.zh : currentSetupStep.title.en}</div>
                    <div className="mt-0.5 text-xs font-mono text-[#7A6E62]">
                      {locale === 'zh'
                        ? `第 ${setupStep} 步 / 共 ${totalSetupSteps} 步`
                        : `Step ${setupStep} of ${totalSetupSteps}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {PROFILE_SETUP_STEPS.map((stepItem, index) => (
                      <div key={stepItem.title.en} className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${index + 1 <= setupStep ? 'bg-[#B5272A] text-white' : 'border border-[#D8D0C4] bg-white text-[#7A6E62]'}`}>
                          {index + 1}
                        </div>
                        {index < PROFILE_SETUP_STEPS.length - 1 ? <div className={`h-px w-10 ${index + 1 <= setupStep ? 'bg-[#B5272A]' : 'bg-[#D8D0C4]'}`} /> : null}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {PROFILE_SETUP_STEPS.map((stepItem, index) => (
                    <div key={stepItem.title.en} className={`rounded-lg border px-3 py-2 text-xs ${index + 1 === setupStep ? 'border-[#E8D49A] bg-[#FFF9E8] text-[#1A1208]' : 'border-[#EEE9E0] bg-white text-[#7A6E62]'}`}>
                      <div className="font-medium">{locale === 'zh' ? stepItem.title.zh : stepItem.title.en}</div>
                      <div className="mt-0.5 font-mono text-[10px]">{locale === 'zh' ? stepItem.title.en : stepItem.title.zh}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {currentSetupStep.fields.map((fieldKey) => renderProfileField(fieldKey))}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSetupStep((current) => Math.max(1, current - 1))}
                    disabled={setupStep === 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248] disabled:opacity-40"
                  >
                    <ArrowLeft size={16} /> {locale === 'zh' ? '上一步' : 'Previous step'}
                  </button>
                  {setupStep < totalSetupSteps ? (
                    <button
                      onClick={() => setSetupStep((current) => Math.min(totalSetupSteps, current + 1))}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#B5272A] px-5 py-3 text-sm font-medium text-white hover:bg-[#9E2224]"
                    >
                      {locale === 'zh' ? '下一步' : 'Next step'} <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={submitProfile}
                      disabled={profileBusy}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#B5272A] px-5 py-3 text-sm font-medium text-white hover:bg-[#9E2224] disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} /> {ownProfile ? (locale === 'zh' ? '保存修改' : 'Save changes') : (locale === 'zh' ? '提交档案' : 'Submit profile')}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  if (screen === 'detail' && selectedProfile) {
    const detailConnectionState = getProfileConnectionState(selectedProfile.id, connections);
    const detailPendingConnection = getPendingOutgoingConnection(selectedProfile.id, connections);
    const detailRequested = detailConnectionState === 'pending';
    const detailConnected = detailConnectionState === 'connected';

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={() => setScreen('browse')} onProfileClick={openOwnProfilePage} onConnectionsClick={() => setScreen('connections')} currentScreen={copy.browse} />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button onClick={() => setScreen('browse')} className="mb-6 inline-flex items-center gap-2 text-sm text-[#5A5248]">
            <ArrowLeft size={16} /> {locale === 'zh' ? '返回列表' : 'Back to list'}
          </button>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-[#7A6E62]">{selectedProfile.childAlias}</div>
                  <div className="mt-1 text-2xl font-semibold">{selectedProfile.gender}，{formatAge(selectedProfile)}</div>
                </div>
                <ProfilePill profile={selectedProfile} />
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {selectedProfile.traits.map((trait) => <Badge key={trait}>{trait}</Badge>)}
              </div>
              <div className="space-y-3 text-sm text-[#5A5248]">
                <div><strong>{locale === 'zh' ? '城市' : 'City'}：</strong>{selectedProfile.city} / {selectedProfile.hukou}</div>
                <div><strong>{locale === 'zh' ? '学历' : 'Education'}：</strong>{selectedProfile.education} · {selectedProfile.school}</div>
                <div><strong>{locale === 'zh' ? '行业' : 'Industry'}：</strong>{selectedProfile.industry} · {selectedProfile.jobTitle}</div>
                <div><strong>{locale === 'zh' ? '收入' : 'Income'}：</strong>{selectedProfile.income}</div>
                <div><strong>{locale === 'zh' ? '房车' : 'Property & vehicle'}：</strong>{selectedProfile.property} · {selectedProfile.car}</div>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    if (detailConnected) {
                      return;
                    }

                    if (detailPendingConnection) {
                      void cancelRequest(detailPendingConnection.id);
                      return;
                    }

                    void requestConnect(selectedProfile.id);
                  }}
                  disabled={detailConnected}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${detailConnected ? 'bg-[#2C8A4A] text-white' : detailRequested ? 'bg-[#FFF5F5] text-[#B91C1C] border border-[#F5C4C5]' : 'bg-[#B5272A] text-white hover:bg-[#9E2224]'}`}
                >
                  {detailConnected ? <CheckCircle2 size={16} /> : detailRequested ? <X size={16} /> : <Heart size={16} />}
                  {detailConnected ? (locale === 'zh' ? '已连接' : 'Connected') : detailRequested ? (locale === 'zh' ? '取消申请' : 'Cancel request') : copy.requestConnect}
                </button>
                <button onClick={() => setScreen('connections')} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248]">
                  <Users size={16} /> {copy.myConnections}
                </button>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <SectionLabel title={locale === 'zh' ? '父母寄语' : 'Parent note'} />
                <p className="text-sm leading-8 text-[#3A3028]">{selectedProfile.about}</p>
              </Card>
              <Card className="p-5">
                <SectionLabel title={locale === 'zh' ? '择偶要求' : 'Preferences'} />
                <p className="text-sm leading-8 text-[#3A3028]">{selectedProfile.preferences}</p>
              </Card>
            </div>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  if (screen === 'connections') {
    const incoming = connections?.incoming ?? [];
    const outgoing = connections?.outgoing ?? [];
    const connected = connections?.connected ?? [];

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={() => setScreen('browse')} onProfileClick={openOwnProfilePage} onConnectionsClick={() => setScreen('connections')} currentScreen={copy.myConnections} />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button onClick={() => setScreen('browse')} className="mb-4 inline-flex items-center gap-2 text-sm text-[#5A5248]">
            <ArrowLeft size={16} /> {locale === 'zh' ? '返回列表' : 'Back to list'}
          </button>
          <SectionLabel title={copy.myConnections} subtitle={locale === 'zh' ? '收到的申请、发出的申请、已连接' : 'Incoming, outgoing, and connected'} />
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">{copy.incoming}</div>
                <Badge tone="gold">{incoming.length}</Badge>
              </div>
              <div className="space-y-3">
                {incoming.length === 0 ? <EmptyState label={locale === 'zh' ? '暂无申请' : 'No requests yet'} /> : incoming.map((connection) => (
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onViewProfile={openProfile} onApprove={approve} onReject={reject} />
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">{copy.outgoing}</div>
                <Badge tone="default">{outgoing.length}</Badge>
              </div>
              <div className="space-y-3">
                {outgoing.length === 0 ? <EmptyState label={locale === 'zh' ? '还没有发出申请' : 'No outgoing requests'} /> : outgoing.map((connection) => (
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onViewProfile={openProfile} onCancel={cancelRequest} />
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">{copy.connected}</div>
                <Badge tone="green">{connected.length}</Badge>
              </div>
              <div className="space-y-3">
                {connected.length === 0 ? <EmptyState label={locale === 'zh' ? '通过后会显示在这里' : 'Approved matches appear here'} /> : connected.map((connection) => (
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onViewProfile={openProfile} onOpenChat={openChat} />
                ))}
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  if (screen === 'chat' && chat) {
    const otherProfile = chat.connection.otherProfile ?? chat.connection.targetProfile ?? chat.connection.requesterProfile ?? null;

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={() => setScreen('browse')} onProfileClick={openOwnProfilePage} onConnectionsClick={() => setScreen('connections')} currentScreen={copy.chat} />
        <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[320px_1fr]">
          <div className="border-r border-[#D8D0C4] bg-white p-5 overflow-y-auto">
            <button onClick={() => setScreen('connections')} className="mb-5 inline-flex items-center gap-2 text-sm text-[#5A5248]">
              <ArrowLeft size={16} /> {locale === 'zh' ? '返回连接页' : 'Back to connections'}
            </button>
            {otherProfile ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#D8D0C4] bg-[#FAFAF8] p-4">
                  <div className="text-xs font-mono text-[#7A6E62]">{otherProfile.childAlias}</div>
                  <div className="mt-1 text-xl font-semibold">{otherProfile.gender} · {formatAge(otherProfile)}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[#7A6E62]">
                    <span className={`h-2.5 w-2.5 rounded-full ${otherProfile.presence?.status === 'online' ? 'bg-[#2C8A4A]' : 'bg-[#B91C1C]'}`} />
                    <span>
                      {otherProfile.presence?.status === 'online'
                        ? (locale === 'zh' ? '在线' : 'Online now')
                        : otherProfile.presence?.lastSeenAt
                          ? (locale === 'zh' ? `最后在线 ${formatLastSeen(otherProfile.presence.lastSeenAt)}` : `Last seen ${formatLastSeen(otherProfile.presence.lastSeenAt)}`)
                          : (locale === 'zh' ? '离线' : 'Offline')}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ProfilePill profile={otherProfile} />
                    <Badge>{otherProfile.education}</Badge>
                    <Badge>{otherProfile.industry}</Badge>
                  </div>
                </div>
                <div className="space-y-4 rounded-2xl border border-[#D8D0C4] bg-white p-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A6E62]">{locale === 'zh' ? '完整档案' : 'Full profile'}</div>
                    <div className="mt-2 text-sm text-[#5A5248]">{otherProfile.city} · {otherProfile.hukou}</div>
                    <div className="mt-1 text-sm text-[#5A5248]">{otherProfile.education} · {otherProfile.school}</div>
                    <div className="mt-1 text-sm text-[#5A5248]">{otherProfile.industry} · {otherProfile.jobTitle}</div>
                    <div className="mt-1 text-sm text-[#5A5248]">{otherProfile.income}</div>
                    <div className="mt-1 text-sm text-[#5A5248]">{otherProfile.property} · {otherProfile.car}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {otherProfile.traits.map((trait) => <Badge key={trait}>{trait}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '简介' : 'About'}</div>
                    <p className="mt-2 text-sm leading-7 text-[#5A5248]">{otherProfile.about}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '爱好' : 'Hobbies'}</div>
                    <p className="mt-2 text-sm leading-7 text-[#5A5248]">{otherProfile.hobbies}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '择偶要求' : 'Preferences'}</div>
                    <p className="mt-2 text-sm leading-7 text-[#5A5248]">{otherProfile.preferences}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {chat.messages.length === 0 ? <EmptyState label={locale === 'zh' ? '还没有消息，先发第一条吧' : 'No messages yet. Send the first one.'} /> : chat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  mine={message.senderUserId === session?.user.id}
                />
              ))}
            </div>
            <div className="border-t border-[#D8D0C4] bg-white p-4">
              <div className="flex gap-3">
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder={locale === 'zh' ? '输入消息...' : 'Type a message...'}
                    className="flex-1 rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
                />
                <button onClick={sendChatMessage} className="inline-flex items-center gap-2 rounded-xl bg-[#A87C1A] px-5 py-3 text-sm font-medium text-white">
                  <Send size={16} /> {locale === 'zh' ? '发送' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
      <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={() => setScreen('browse')} onProfileClick={openOwnProfilePage} onConnectionsClick={() => setScreen('connections')} currentScreen={copy.browse} />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-[1.5rem] border border-[#D8D0C4] bg-[#FAF3E8]/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={13} className="text-[#5A5248]" />
            <span className="text-xs font-semibold text-[#1A1208]">筛选条件</span>
            <span className="text-[10px] font-mono text-[#8A8070]">Filter</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-6">
            <label className="block lg:col-span-2">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={16} />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-[#D8D0C4] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#B5272A]"
                />
              </div>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Gender / 性别</div>
              <select value={filters.gender} onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value as GenderFilter }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                <option value="all">All</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Age Range / 年龄范围</div>
              <select value={filters.ageRange} onChange={(event) => setFilters((current) => ({ ...current, ageRange: event.target.value }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                {AGE_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Height / 身高</div>
              <select defaultValue="" onChange={() => undefined} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                <option value="">Select...</option>
                <option>160+</option>
                <option>165+</option>
                <option>170+</option>
                <option>175+</option>
                <option>180+</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Min. Education / 最低学历</div>
              <select defaultValue="" onChange={() => undefined} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                <option value="">Select...</option>
                <option>大专</option>
                <option>本科</option>
                <option>硕士</option>
                <option>博士</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">City / 城市</div>
              <select defaultValue="" onChange={() => undefined} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                <option value="">Select...</option>
                <option>上海</option>
                <option>北京</option>
                <option>杭州</option>
                <option>深圳</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Income / 月收入</div>
              <select
                value={filters.salaryRange}
                onChange={(event) => setFilters((current) => ({ ...current, salaryRange: event.target.value }))}
                className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
              >
                {SALARY_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => refreshBrowse(token, filters).catch((error) => showNotice(formatErrorMessage(error)))} className="inline-flex items-center gap-2 rounded-xl bg-[#B5272A] px-5 py-3 text-sm font-medium text-white hover:bg-[#9E2224] transition-colors">
              <Search size={16} /> {locale === 'zh' ? '搜索' : 'Search'}
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">{locale === 'zh' ? '相亲角浏览' : 'Browse profiles'}</div>
            <div className="text-xs font-mono text-[#7A6E62]">{locale === 'zh' ? '浏览其他家长发布的匿名子女档案' : 'Browse anonymous child profiles posted by other parents'}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="gold">{profiles.length} profiles</Badge>
            <Badge tone="green">{incomingCount} {copy.incoming}</Badge>
            <Badge tone="default">{connectedCount} {copy.connected}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedBrowseProfiles.map((profile) => {
            const connectionState = getProfileConnectionState(profile.id, connections);
            const pendingConnection = getPendingOutgoingConnection(profile.id, connections);
            const isPending = connectionState === 'pending';
            const isConnected = connectionState === 'connected';

            return (
              <Card key={profile.id} className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="border-b border-[#EEE9E0] p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{profile.gender} · {formatAge(profile)}</div>
                      <div className="mt-1 text-[10px] font-mono text-[#7A6E62]">{profile.city} · {profile.hukou} · {profile.education}</div>
                    </div>
                    <ProfilePill profile={profile} />
                  </div>
                  <div className="flex flex-wrap gap-2">{profile.traits.map((trait) => <Badge key={trait}>{trait}</Badge>)}</div>
                </div>
                <div className="p-5">
                  <div className="space-y-2 text-sm text-[#5A5248]">
                    <div>{profile.school} · {profile.major}</div>
                    <div>{profile.industry} · {profile.jobTitle}</div>
                    <div>{profile.income}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openProfile(profile.id)} className="flex-1 rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248]">
                      {locale === 'zh' ? '查看详情' : 'View detail'}
                    </button>
                    <button
                      onClick={() => {
                        if (isConnected) {
                          return;
                        }

                        if (pendingConnection) {
                          void cancelRequest(pendingConnection.id);
                          return;
                        }

                        void requestConnect(profile.id);
                      }}
                      disabled={isConnected}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isConnected ? 'bg-[#2C8A4A] text-white' : isPending ? 'border border-[#F5C4C5] bg-[#FFF5F5] text-[#B91C1C]' : 'bg-[#B5272A] text-white hover:bg-[#9E2224]'}`}
                    >
                      {isConnected ? <CheckCircle2 size={16} /> : isPending ? <X size={16} /> : <UserPlus size={16} />}
                      {isConnected ? (locale === 'zh' ? '已连接' : 'Connected') : isPending ? (locale === 'zh' ? '取消申请' : 'Cancel request') : copy.requestConnect}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setBrowsePage(pageNumber)}
              className={`flex h-7 w-7 items-center justify-center rounded border text-xs ${activeBrowsePage === pageNumber ? 'border-[#B5272A] bg-[#B5272A] text-white' : 'border-[#D8D0C4] bg-white text-[#5A5248]'}`}
            >
              {pageNumber}
            </button>
          ))}
          <span className="px-1 text-[#8A8070]">...</span>
          <button
            onClick={() => setBrowsePage(12)}
            className={`flex h-7 w-7 items-center justify-center rounded border text-xs ${activeBrowsePage === 12 ? 'border-[#B5272A] bg-[#B5272A] text-white' : 'border-[#D8D0C4] bg-white text-[#5A5248]'}`}
          >
            12
          </button>
        </div>
      </div>
      {notice ? <Toast notice={notice} /> : null}
    </div>
  );
}

function AppHeader({ copy, locale, onToggleLocale, onSignOut, onLogoClick, onProfileClick, onConnectionsClick, currentScreen }: { copy: Copy; locale: Locale; onToggleLocale: () => void; onSignOut: () => void; onLogoClick?: () => void; onProfileClick?: () => void; onConnectionsClick?: () => void; currentScreen: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#D8D0C4] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {onLogoClick ? (
          <button onClick={onLogoClick} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A87C1A] text-white font-serif text-lg font-bold">缘</div>
            <div>
              <div className="font-semibold">{copy.appName}</div>
              <div className="text-[10px] font-mono text-[#7A6E62]">{currentScreen}</div>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A87C1A] text-white font-serif text-lg font-bold">缘</div>
            <div>
              <div className="font-semibold">{copy.appName}</div>
              <div className="text-[10px] font-mono text-[#7A6E62]">{currentScreen}</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {onConnectionsClick ? (
            <button onClick={onConnectionsClick} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248]">
              {copy.myConnections}
            </button>
          ) : null}
          {onProfileClick ? (
            <button onClick={onProfileClick} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248]">
              {copy.myProfile}
            </button>
          ) : null}
          <button onClick={onToggleLocale} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248]">
            <Globe2 className="mr-2 inline-block" size={14} /> {locale === 'zh' ? 'English' : '中文'}
          </button>
          <button onClick={onSignOut} className="rounded-full border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248]">
            {copy.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}

function Toast({ notice }: { notice: { message: string; tone: 'error' | 'success' } }) {
  const toneClasses = notice.tone === 'success'
    ? 'border-[#9ED6AA] bg-[#1F6B3A] text-white'
    : 'border-[#F5B6B6] bg-[#B91C1C] text-white';

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm shadow-xl transition-all duration-300 ease-out animate-in slide-in-from-top-2">
      <div className={`rounded-xl px-4 py-2 ${toneClasses}`}>
        {notice.message}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-[#D8D0C4] bg-[#FAFAF8] p-4 text-sm text-[#7A6E62]">{label}</div>;
}

function ConnectionItem({ connection, locale, onApprove, onReject, onViewProfile, onCancel, onOpenChat }: { connection: ConnectionRecord; locale: Locale; onApprove?: (id: string) => Promise<void>; onReject?: (id: string) => Promise<void>; onViewProfile?: (id: string) => Promise<void>; onCancel?: (id: string) => Promise<void>; onOpenChat?: (id: string) => Promise<void>; }) {
  const profile = connection.otherProfile ?? connection.targetProfile ?? connection.requesterProfile;
  if (!profile) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{profile.gender} · {profile.age}岁 · {profile.height}cm</div>
          <div className="mt-1 text-[10px] font-mono text-[#7A6E62]">{profile.city} · {profile.education} · {profile.industry}</div>
        </div>
        <Badge tone={connection.status === 'approved' ? 'green' : connection.status === 'rejected' ? 'default' : 'yellow'}>{connection.status === 'approved' ? (locale === 'zh' ? '已通过' : 'Approved') : connection.status === 'rejected' ? (locale === 'zh' ? '已拒绝' : 'Rejected') : (locale === 'zh' ? '待处理' : 'Pending')}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{profile.traits.slice(0, 3).map((trait) => <Badge key={trait}>{trait}</Badge>)}</div>
      <div className="mt-4 flex gap-2">
        {onViewProfile ? <button onClick={() => void onViewProfile(profile.id)} className="flex-1 rounded-lg border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248]">{locale === 'zh' ? '查看完整档案' : 'View full profile'}</button> : null}
        {onApprove ? <button onClick={() => void onApprove(connection.id)} className="flex-1 rounded-lg bg-[#2C8A4A] px-3 py-2 text-xs font-medium text-white">{locale === 'zh' ? '同意' : 'Approve'}</button> : null}
        {onReject ? <button onClick={() => void onReject(connection.id)} className="flex-1 rounded-lg border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248]">{locale === 'zh' ? '拒绝' : 'Reject'}</button> : null}
        {onCancel && connection.direction === 'outgoing' && connection.status === 'pending' ? <button onClick={() => void onCancel(connection.id)} className="flex-1 rounded-lg border border-[#D77A7A] bg-[#FFF5F5] px-3 py-2 text-xs text-[#B91C1C]">{locale === 'zh' ? '取消申请' : 'Cancel request'}</button> : null}
        {onOpenChat ? <button onClick={() => void onOpenChat(connection.id)} className="flex-1 rounded-lg bg-[#A87C1A] px-3 py-2 text-xs font-medium text-white">{locale === 'zh' ? '进入私聊' : 'Open chat'}</button> : null}
      </div>
    </div>
  );
}

function MessageBubble({ message, mine }: { message: MessageRecord; mine: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-7 ${mine ? 'bg-[#A87C1A] text-white' : 'border border-[#D8D0C4] bg-white text-[#1A1208]'}`}>
        {message.text}
      </div>
    </div>
  );
}
