import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Heart,
  LogIn,
  MessageSquare,
  Search,
  Send,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { api, type ConnectionRecord, type Locale, type MessageRecord, type ProfileRecord, type SessionRecord } from './lib/api';

type Screen = 'auth' | 'setup' | 'browse' | 'detail' | 'connections' | 'chat';
type AuthMode = 'login' | 'register';
type GenderFilter = 'all' | '男' | '女';
type SortMode = 'latest' | 'age-asc' | 'age-desc' | 'height';

type ProfileFormState = {
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
};

const COPY: Record<Locale, Copy> = {
  zh: {
    appName: '上海相亲角',
    subtitle: 'Shanghai Marriage Weekend Market',
    authTitle: '父母代为托管的相亲平台',
    authDescription: '使用邮箱和密码创建账户或直接登录。首次登录后必须先创建子女档案，才能浏览、发起连接或进入私聊。',
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
    completeProfileNotice: '请先完成子女档案，之后才能浏览其他家长的征婚信息。',
    translationHint: '网站主语言为中文，右上角可切换为英文界面。',
    searchPlaceholder: '搜索年龄、城市、行业、学校、户籍...',
    firstStepTitle: '先创建档案',
    firstStepDescription: '首次登录后必须先创建子女档案，系统才会开放浏览、申请和私信功能。',
  },
  en: {
    appName: 'Shanghai Matchmaking Market',
    subtitle: 'Weekend market for parent-managed marriage profiles',
    authTitle: 'A parent-managed matchmaking platform',
    authDescription: 'Create an account or sign in with email and password. First-time users must complete a child profile before browsing, connecting, or chatting.',
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
    requestConnect: 'Request connection',
    pending: 'Pending',
    approved: 'Approved',
    incoming: 'Incoming requests',
    outgoing: 'Outgoing requests',
    connected: 'Connected',
    completeProfileNotice: 'Complete the child profile first, then browsing and messaging will unlock.',
    translationHint: 'The site is Chinese-first, and you can switch the interface to English from the top right.',
    searchPlaceholder: 'Search by age, city, industry, school, hukou...',
    firstStepTitle: 'Create the profile first',
    firstStepDescription: 'After the first login, the child profile must be completed before browsing, requests, or chat become available.',
  },
};

const defaultProfileForm: ProfileFormState = {
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
  traits: '踏实, 孝顺, 爱运动',
  hobbies: '',
  about: '',
  preferences: '',
};

function getInitialLocale(): Locale {
  const stored = window.localStorage.getItem('gex-locale');
  return stored === 'en' ? 'en' : 'zh';
}

function getInitialToken() {
  return window.localStorage.getItem('gex-token');
}

function badgeClass(type: 'default' | 'red' | 'green' | 'gold' = 'default') {
  const styles = {
    default: 'bg-[#EEE9E0] text-[#5A5248] border border-[#D8D0C4]',
    red: 'bg-[#FEF0F0] text-[#B5272A] border border-[#F5C4C5]',
    green: 'bg-[#EBF5EE] text-[#2C8A4A] border border-[#B8DAC4]',
    gold: 'bg-[#FDF6E3] text-[#9A6F1A] border border-[#E8D49A]',
  };
  return styles[type];
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'red' | 'green' | 'gold' }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ${badgeClass(tone)}`}>{children}</span>;
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <div className="text-xs font-semibold text-[#1A1208]">{title}</div>
        {subtitle ? <div className="mt-0.5 text-[10px] font-mono text-[#7A6E62]">{subtitle}</div> : null}
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

function ProfilePill({ profile }: { profile: ProfileRecord }) {
  return <Badge tone={profile.hukou === '上海' ? 'red' : 'default'}>{profile.hukou === '上海' ? '沪籍' : profile.hukou}</Badge>;
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
  const [authBusy, setAuthBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [connections, setConnections] = useState<{ ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null>(null);
  const [chat, setChat] = useState<{ connection: ConnectionRecord; messages: MessageRecord[] } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', gender: 'all' as GenderFilter, sort: 'latest' as SortMode });
  const [profileForm, setProfileForm] = useState<ProfileFormState>(defaultProfileForm);

  const copy = COPY[locale];
  const ownProfile = session?.profile ?? null;

  function showNotice(value: string) {
    setNotice(value);
    window.setTimeout(() => setNotice((current) => (current === value ? null : current)), 3000);
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
      showNotice(String(error.message || error));
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
      refreshBrowse(token, filters).catch((error) => showNotice(String(error.message || error)));
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
      showNotice(authMode === 'login' ? '登录成功' : '账户已创建');
    } catch (error) {
      showNotice(String(error.message || error));
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
      const payload = {
        ...profileForm,
        age: Number(profileForm.age),
        birthYear: Number(profileForm.birthYear),
        height: Number(profileForm.height),
        weight: Number(profileForm.weight),
        traits: toTraits(profileForm.traits),
      };
      await api.createProfile(token, payload);
      await refreshSession(token);
      showNotice(locale === 'zh' ? '档案已提交' : 'Profile submitted');
    } catch (error) {
      showNotice(String(error.message || error));
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
      showNotice(String(error.message || error));
    }
  }

  async function requestConnect(profileId: string) {
    if (!token) {
      return;
    }

    try {
      await api.requestConnection(token, profileId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? '连接申请已发送' : 'Connection request sent');
    } catch (error) {
      showNotice(String(error.message || error));
    }
  }

  async function approve(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      await api.approveConnection(token, connectionId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? '已同意连接' : 'Connection approved');
    } catch (error) {
      showNotice(String(error.message || error));
    }
  }

  async function reject(connectionId: string) {
    if (!token) {
      return;
    }

    try {
      await api.rejectConnection(token, connectionId);
      await refreshConnections(token);
      showNotice(locale === 'zh' ? '已拒绝连接' : 'Connection rejected');
    } catch (error) {
      showNotice(String(error.message || error));
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
      showNotice(String(error.message || error));
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
      showNotice(String(error.message || error));
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

  const incomingCount = connections?.incoming.length ?? 0;
  const connectedCount = connections?.connected.length ?? 0;
  const outgoingCount = connections?.outgoing.length ?? 0;

  const filteredProfiles = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return profiles.filter((profile) => {
      const matchesGender = filters.gender === 'all' || profile.gender === filters.gender;
      const matchesSearch = !search || [profile.city, profile.hukou, profile.education, profile.school, profile.industry, profile.jobTitle, profile.about, profile.preferences]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
      return matchesGender && matchesSearch;
    });
  }, [filters.gender, filters.search, profiles]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F4EF] text-[#5A5248]">Loading...</div>;
  }

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <div className="mx-auto grid min-h-screen max-w-6xl gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden border-r border-[#D8D0C4] bg-white px-8 py-10 lg:px-12">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5272A] text-white font-serif text-lg font-bold">缘</div>
                <div>
                  <div className="font-serif text-lg font-semibold">{copy.appName}</div>
                  <div className="text-[10px] font-mono text-[#7A6E62]">{copy.subtitle}</div>
                </div>
              </div>
              <button
                onClick={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
                className="inline-flex items-center gap-2 rounded-full border border-[#D8D0C4] bg-[#FAFAF8] px-3 py-2 text-xs text-[#5A5248]"
              >
                <Globe2 size={14} /> {copy.language}
              </button>
            </div>

            <div className="max-w-xl">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#B5272A]">
                <Sparkles size={14} /> Shanghai parent-managed matchmaking
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-tight">{copy.authTitle}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5A5248]">{copy.authDescription}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                  <Shield className="mb-3 text-[#B5272A]" size={18} />
                  <div className="text-sm font-semibold">匿名与隐私</div>
                  <div className="mt-1 text-[12px] leading-6 text-[#5A5248]">档案默认不公开姓名与联系方式，连接成功后才开放聊天。</div>
                </Card>
                <Card className="p-4">
                  <Users className="mb-3 text-[#B5272A]" size={18} />
                  <div className="text-sm font-semibold">上海相亲角</div>
                  <div className="mt-1 text-[12px] leading-6 text-[#5A5248]">先浏览、再申请连接，最后进入双方私密房间。</div>
                </Card>
                <Card className="p-4">
                  <Bell className="mb-3 text-[#B5272A]" size={18} />
                  <div className="text-sm font-semibold">英文切换</div>
                  <div className="mt-1 text-[12px] leading-6 text-[#5A5248]">右上角可以切换英文界面，便于海外家庭使用。</div>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 lg:px-10">
            <Card className="w-full max-w-md p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#1A1208]">{authMode === 'login' ? copy.login : copy.register}</div>
                  <div className="text-[10px] font-mono text-[#7A6E62]">{copy.translationHint}</div>
                </div>
                <button
                  onClick={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
                  className="rounded-full bg-[#F7F4EF] px-3 py-1 text-[11px] text-[#5A5248]"
                >
                  {locale === 'zh' ? 'English' : '中文'}
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-full border border-[#D8D0C4] bg-[#FAFAF8] p-1">
                <button
                  onClick={() => setAuthMode('register')}
                  className={`rounded-full px-3 py-2 text-sm ${authMode === 'register' ? 'bg-[#B5272A] text-white' : 'text-[#5A5248]'}`}
                >
                  {copy.createAccount}
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`rounded-full px-3 py-2 text-sm ${authMode === 'login' ? 'bg-[#B5272A] text-white' : 'text-[#5A5248]'}`}
                >
                  {copy.login}
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{copy.email}</div>
                  <input
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    type="email"
                    className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                    placeholder="parent@example.com"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{copy.password}</div>
                  <input
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    type="password"
                    className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                    placeholder="********"
                  />
                </label>
                <button
                  onClick={submitAuth}
                  disabled={authBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5272A] px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  <LogIn size={16} /> {copy.signIn}
                </button>
              </div>

              <div className="mt-5 rounded-lg border border-[#E8D49A] bg-[#FDF6E3] px-4 py-3 text-xs leading-6 text-[#7A5A10]">
                {copy.firstStepTitle}：{copy.firstStepDescription}
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast message={notice} /> : null}
      </div>
    );
  }

  if (screen === 'setup') {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader
          copy={copy}
          locale={locale}
          onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
          onSignOut={signOut}
          currentScreen={copy.profileSetup}
        />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Card className="mb-6 border-[#E8D49A] bg-[#FDF6E3] p-4 text-sm text-[#7A5A10]">{copy.completeProfileNotice}</Card>
          <SectionLabel title={copy.profileSetup} subtitle={copy.firstStepDescription} />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries({
                  childAlias: '子女称呼 / Alias',
                  birthYear: '出生年份 / Birth year',
                  age: '年龄 / Age',
                  height: '身高 / Height',
                  weight: '体重 / Weight',
                  city: '现居城市 / City',
                  hukou: '户籍 / Hukou',
                  hometown: '老家 / Hometown',
                  education: '学历 / Education',
                  school: '学校 / School',
                  major: '专业 / Major',
                  industry: '行业 / Industry',
                  jobTitle: '职业 / Job title',
                  income: '收入 / Income',
                  property: '房产 / Property',
                  car: '车辆 / Car',
                }).map(([key, label]) => (
                  <label key={key} className="block">
                    <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{label}</div>
                    <input
                      value={profileForm[key as keyof ProfileFormState] as string}
                      onChange={(event) => setProfileForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                    />
                  </label>
                ))}

                <label className="block md:col-span-2">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">Gender / 性别</div>
                  <div className="flex gap-3">
                    {['男', '女'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setProfileForm((current) => ({ ...current, gender: gender as '男' | '女' }))}
                        className={`rounded-full border px-4 py-2 text-sm ${profileForm.gender === gender ? 'border-[#B5272A] bg-[#FEF0F0] text-[#B5272A]' : 'border-[#D8D0C4] bg-white text-[#5A5248]'}`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">Traits / 性格标签</div>
                  <input
                    value={profileForm.traits}
                    onChange={(event) => setProfileForm((current) => ({ ...current, traits: event.target.value }))}
                    className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                    placeholder="踏实, 孝顺, 爱运动"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">Hobbies / 爱好</div>
                  <input
                    value={profileForm.hobbies}
                    onChange={(event) => setProfileForm((current) => ({ ...current, hobbies: event.target.value }))}
                    className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">About / 简介</div>
                  <textarea
                    value={profileForm.about}
                    onChange={(event) => setProfileForm((current) => ({ ...current, about: event.target.value }))}
                    className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                  />
                </label>
                <label className="block md:col-span-2">
                  <div className="mb-1 text-[11px] font-medium text-[#1A1208]">Preferences / 择偶要求</div>
                  <textarea
                    value={profileForm.preferences}
                    onChange={(event) => setProfileForm((current) => ({ ...current, preferences: event.target.value }))}
                    className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={submitProfile}
                  disabled={profileBusy}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#B5272A] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  <CheckCircle2 size={16} /> {locale === 'zh' ? '提交档案' : 'Submit profile'}
                </button>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <SectionLabel title={locale === 'zh' ? '匿名规则' : 'Privacy rules'} />
                <p className="text-sm leading-7 text-[#5A5248]">
                  {locale === 'zh'
                    ? '网站不会公开真实姓名和联系方式。档案创建后，系统才允许浏览其他人的详情。'
                    : 'The site does not expose real names or contact details. After profile creation, browsing and connections unlock.'}
                </p>
              </Card>
              <Card className="p-5">
                <SectionLabel title={locale === 'zh' ? '当前步骤' : 'Current step'} />
                <div className="space-y-3 text-sm text-[#5A5248]">
                  <div className="flex items-center gap-2"><Check className="text-[#2C8A4A]" size={16} /> {locale === 'zh' ? '创建账号 / 登录' : 'Create account / sign in'}</div>
                  <div className="flex items-center gap-2"><Users className="text-[#B5272A]" size={16} /> {locale === 'zh' ? '创建子女档案' : 'Create child profile'}</div>
                  <div className="flex items-center gap-2 opacity-50"><MessageSquare size={16} /> {locale === 'zh' ? '浏览、申请、聊天' : 'Browse, request, and chat'}</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        {notice ? <Toast message={notice} /> : null}
      </div>
    );
  }

  if (screen === 'detail' && selectedProfile) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} currentScreen={copy.browse} />
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
                  onClick={() => requestConnect(selectedProfile.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5272A] px-4 py-3 text-sm font-medium text-white"
                >
                  <Heart size={16} /> {copy.requestConnect}
                </button>
                <button onClick={() => setScreen('connections')} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248]">
                  <Users size={16} /> {copy.connections}
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
        {notice ? <Toast message={notice} /> : null}
      </div>
    );
  }

  if (screen === 'connections') {
    const incoming = connections?.incoming ?? [];
    const outgoing = connections?.outgoing ?? [];
    const connected = connections?.connected ?? [];

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} currentScreen={copy.connections} />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <SectionLabel title={copy.connections} subtitle={locale === 'zh' ? '收到的申请、发出的申请、已连接' : 'Incoming, outgoing, and connected'} />
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold">{copy.incoming}</div>
                <Badge tone="gold">{incoming.length}</Badge>
              </div>
              <div className="space-y-3">
                {incoming.length === 0 ? <EmptyState label={locale === 'zh' ? '暂无申请' : 'No requests yet'} /> : incoming.map((connection) => (
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onApprove={approve} onReject={reject} />
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
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} />
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
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onOpenChat={openChat} />
                ))}
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast message={notice} /> : null}
      </div>
    );
  }

  if (screen === 'chat' && chat) {
    const otherProfile = chat.connection.otherProfile ?? chat.connection.targetProfile ?? chat.connection.requesterProfile ?? null;

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} currentScreen={copy.chat} />
        <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[320px_1fr]">
          <div className="border-r border-[#D8D0C4] bg-white p-5">
            <button onClick={() => setScreen('connections')} className="mb-5 inline-flex items-center gap-2 text-sm text-[#5A5248]">
              <ArrowLeft size={16} /> {locale === 'zh' ? '返回连接页' : 'Back to connections'}
            </button>
            {otherProfile ? (
              <>
                <div className="mb-4 rounded-2xl border border-[#D8D0C4] bg-[#FAFAF8] p-4">
                  <div className="text-xs font-mono text-[#7A6E62]">{otherProfile.childAlias}</div>
                  <div className="mt-1 text-xl font-semibold">{otherProfile.gender} · {formatAge(otherProfile)}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <ProfilePill profile={otherProfile} />
                    <Badge>{otherProfile.education}</Badge>
                    <Badge>{otherProfile.industry}</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-[#5A5248]">
                  <div>{otherProfile.school}</div>
                  <div>{otherProfile.jobTitle}</div>
                  <div>{otherProfile.preferences}</div>
                </div>
              </>
            ) : null}
          </div>
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-[#D8D0C4] bg-[#FDF6E3] px-6 py-3 text-xs text-[#7A5A10]">{locale === 'zh' ? '连接成功后才能进入私聊。请勿在这里泄露真实姓名和联系方式。' : 'Chat unlocks only after approval. Please avoid sharing real names or contact details here.'}</div>
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
                  className="flex-1 rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
                />
                <button onClick={sendChatMessage} className="inline-flex items-center gap-2 rounded-xl bg-[#B5272A] px-5 py-3 text-sm font-medium text-white">
                  <Send size={16} /> {locale === 'zh' ? '发送' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {notice ? <Toast message={notice} /> : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
      <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} currentScreen={copy.browse} />
      <div className="mx-auto max-w-7xl px-6 py-8">
        {ownProfile ? null : <Card className="mb-6 border-[#E8D49A] bg-[#FDF6E3] p-4 text-sm text-[#7A5A10]">{copy.completeProfileNotice}</Card>}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_180px_180px_160px]">
          <label className="block lg:col-span-1">
            <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{locale === 'zh' ? '搜索' : 'Search'}</div>
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
            <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{locale === 'zh' ? '性别' : 'Gender'}</div>
            <select value={filters.gender} onChange={(event) => setFilters((current) => ({ ...current, gender: event.target.value as GenderFilter }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
              <option value="all">All</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-[11px] font-medium text-[#1A1208]">{locale === 'zh' ? '排序' : 'Sort'}</div>
            <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as SortMode }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
              <option value="latest">Latest</option>
              <option value="age-asc">Age asc</option>
              <option value="age-desc">Age desc</option>
              <option value="height">Height</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button onClick={() => refreshBrowse(token, filters).catch((error) => showNotice(String(error.message || error)))} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5272A] px-4 py-3 text-sm font-medium text-white">
              <Search size={16} /> {locale === 'zh' ? '刷新' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{locale === 'zh' ? '相亲角浏览' : 'Browse profiles'}</div>
            <div className="text-[10px] font-mono text-[#7A6E62]">{locale === 'zh' ? '浏览其他家长发布的匿名子女档案' : 'Browse anonymous child profiles posted by other parents'}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="red">{profiles.length} profiles</Badge>
            <Badge tone="green">{incomingCount} {copy.incoming}</Badge>
            <Badge tone="default">{connectedCount} {copy.connected}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
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
                  <button onClick={() => requestConnect(profile.id)} className="inline-flex items-center justify-center rounded-xl bg-[#B5272A] px-4 py-3 text-sm font-medium text-white">
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {notice ? <Toast message={notice} /> : null}
    </div>
  );
}

function AppHeader({ copy, locale, onToggleLocale, onSignOut, currentScreen }: { copy: Copy; locale: Locale; onToggleLocale: () => void; onSignOut: () => void; currentScreen: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#D8D0C4] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5272A] text-white font-serif text-lg font-bold">缘</div>
          <div>
            <div className="font-semibold">{copy.appName}</div>
            <div className="text-[10px] font-mono text-[#7A6E62]">{currentScreen}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleLocale} className="rounded-full border border-[#D8D0C4] bg-[#FAFAF8] px-3 py-2 text-xs text-[#5A5248]">
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

function Toast({ message }: { message: string }) {
  return <div className="fixed bottom-6 right-6 rounded-xl bg-[#1A1208] px-4 py-3 text-sm text-white shadow-lg">{message}</div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-[#D8D0C4] bg-[#FAFAF8] p-4 text-sm text-[#7A6E62]">{label}</div>;
}

function ConnectionItem({ connection, locale, onApprove, onReject, onOpenChat }: { connection: ConnectionRecord; locale: Locale; onApprove?: (id: string) => Promise<void>; onReject?: (id: string) => Promise<void>; onOpenChat?: (id: string) => Promise<void>; }) {
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
        <Badge tone={connection.status === 'approved' ? 'green' : connection.status === 'rejected' ? 'default' : 'gold'}>{connection.status === 'approved' ? (locale === 'zh' ? '已通过' : 'Approved') : connection.status === 'rejected' ? (locale === 'zh' ? '已拒绝' : 'Rejected') : (locale === 'zh' ? '待处理' : 'Pending')}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{profile.traits.slice(0, 3).map((trait) => <Badge key={trait}>{trait}</Badge>)}</div>
      <div className="mt-4 flex gap-2">
        {onApprove ? <button onClick={() => void onApprove(connection.id)} className="flex-1 rounded-lg bg-[#2C8A4A] px-3 py-2 text-xs font-medium text-white">{locale === 'zh' ? '同意' : 'Approve'}</button> : null}
        {onReject ? <button onClick={() => void onReject(connection.id)} className="flex-1 rounded-lg border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248]">{locale === 'zh' ? '拒绝' : 'Reject'}</button> : null}
        {onOpenChat ? <button onClick={() => void onOpenChat(connection.id)} className="flex-1 rounded-lg bg-[#B5272A] px-3 py-2 text-xs font-medium text-white">{locale === 'zh' ? '进入私聊' : 'Open chat'}</button> : null}
      </div>
    </div>
  );
}

function MessageBubble({ message, mine }: { message: MessageRecord; mine: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-7 ${mine ? 'bg-[#B5272A] text-white' : 'border border-[#D8D0C4] bg-white text-[#1A1208]'}`}>
        {message.text}
      </div>
    </div>
  );
}
