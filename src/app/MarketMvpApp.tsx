import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Globe2,
  Heart,
  LogIn,
  Filter,
  ImagePlus,
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
import { ImageWithFallback } from './components/figma/ImageWithFallback';

type Screen = 'auth' | 'forgot-password' | 'reset-password' | 'setup' | 'me' | 'browse' | 'detail' | 'connections' | 'chat';
type AuthMode = 'login' | 'register';
type GenderFilter = 'all' | '男' | '女';
type SortMode = 'latest' | 'age-asc' | 'age-desc' | 'height-asc' | 'height-desc';

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
  forgotPassword: string;
  requestOtp: string;
  otpCode: string;
  verifyOtp: string;
  otpSent: string;
  resendOtp: string;
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  forgotPasswordSubmit: string;
  forgotPasswordBack: string;
  forgotPasswordSuccess: string;
  resetPasswordTitle: string;
  resetPasswordDescription: string;
  resetPasswordSubmit: string;
  resetPasswordSuccess: string;
  newPassword: string;
  confirmPassword: string;
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
  removeConnection: string;
  cancel: string;
  continue: string;
  finalConfirmRemove: string;
  removeWarningTitle: string;
  removeWarningBody: string;
  removeWarningFinal: string;
};

const COPY: Record<Locale, Copy> = {
  zh: {
    appName: '上海人民公园相亲角',
    subtitle: '线上网站',
    authTitle: '尽为父母之责，为子女择良缘',
    authDescription: '本平台不是替代人民公园相亲角，而是其线上延展：延续同样的征婚格式与家长主导方式，在更大范围内完成更充分的比较与选择。',
    register: '注册',
    login: '登录',
    email: '邮箱',
    password: '密码',
    signIn: '登录 / 注册',
    createAccount: '注册',
    forgotPassword: '忘记密码？',
    requestOtp: '发送邮箱验证码',
    otpCode: '验证码',
    verifyOtp: '验证并创建账号',
    otpSent: '验证码已发送到邮箱，请输入 6 位数字完成验证。',
    resendOtp: '重新发送验证码',
    forgotPasswordTitle: '重置账户密码',
    forgotPasswordDescription: '输入注册邮箱，我们会发送一封重置密码邮件。点击邮件中的链接后即可设置新密码。',
    forgotPasswordSubmit: '发送重置邮件',
    forgotPasswordBack: '返回登录',
    forgotPasswordSuccess: '成功：如果账号存在，重置邮件已发送。',
    resetPasswordTitle: '设置新密码',
    resetPasswordDescription: '请输入新密码。密码至少 8 位，包含 1 个大写字母和 1 个特殊字符。',
    resetPasswordSubmit: '更新密码',
    resetPasswordSuccess: '成功：密码已更新，请重新登录。',
    newPassword: '新密码',
    confirmPassword: '确认新密码',
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
    removeConnection: '移除连接',
    cancel: '取消',
    continue: '继续',
    finalConfirmRemove: '确认移除',
    removeWarningTitle: '移除连接确认',
    removeWarningBody: '警告：你将要移除这条连接。移除后，双方将不再是已连接状态。',
    removeWarningFinal: '请再次确认：移除后不可直接恢复，需要重新发送连接申请。',
  },
  en: {
    appName: 'Shanghai People’s Park Marriage Market',
    subtitle: 'Online website',
    authTitle: 'Fulfill Parental Duty, Secure a Good Match',
    authDescription: 'This platform is not a replacement for the weekend market. It is an extension of the weekend market at a larger and accessible scale.',
    register: 'Register',
    login: 'Sign in',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in / Register',
    createAccount: 'Create account',
    forgotPassword: 'Forgot password?',
    requestOtp: 'Send email OTP',
    otpCode: 'OTP code',
    verifyOtp: 'Verify and create account',
    otpSent: 'Verification code sent. Enter the 6-digit OTP to continue.',
    resendOtp: 'Resend code',
    forgotPasswordTitle: 'Reset your password',
    forgotPasswordDescription: 'Enter the account email and we will send a password reset link. Open the link in the email to choose a new password.',
    forgotPasswordSubmit: 'Send reset email',
    forgotPasswordBack: 'Back to sign in',
    forgotPasswordSuccess: 'Success! Reset email sent if the account exists.',
    resetPasswordTitle: 'Choose a new password',
    resetPasswordDescription: 'Your new password must be at least 8 characters long and include 1 uppercase letter and 1 special character.',
    resetPasswordSubmit: 'Update password',
    resetPasswordSuccess: 'Success! Password updated. Please sign in again.',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
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
    removeConnection: 'Remove connection',
    cancel: 'Cancel',
    continue: 'Continue',
    finalConfirmRemove: 'Confirm remove',
    removeWarningTitle: 'Remove connection',
    removeWarningBody: 'Warning: you are about to remove this connection. Once removed, you are no longer connected.',
    removeWarningFinal: 'Please confirm again. After removal, you cannot restore it directly and must send a new request.',
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

const PREFERRED_AGE_OPTIONS = [
  { label: 'No preference / 不限', value: '' },
  { label: '20-24', value: '20-24' },
  { label: '24-26', value: '24-26' },
  { label: '26-28', value: '26-28' },
  { label: '28-30', value: '28-30' },
  { label: '30-32', value: '30-32' },
  { label: '32-35', value: '32-35' },
  { label: '35-40', value: '35-40' },
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

const HEIGHT_RANGE_OPTIONS = [
  { label: 'Any height', value: 'all' },
  { label: '160+', value: '160+' },
  { label: '165+', value: '165+' },
  { label: '170+', value: '170+' },
  { label: '175+', value: '175+' },
  { label: '180+', value: '180+' },
];

const PREFERRED_HEIGHT_OPTIONS = [
  { label: 'No preference / 不限', value: '' },
  { label: '155-160 cm', value: '155-160 cm' },
  { label: '160-165 cm', value: '160-165 cm' },
  { label: '165-170 cm', value: '165-170 cm' },
  { label: '170-175 cm', value: '170-175 cm' },
  { label: '175-180 cm', value: '175-180 cm' },
  { label: '180+ cm', value: '180+ cm' },
];

const HUKOU_PREFERENCE_OPTIONS = [
  { label: 'No preference / 不限', value: '' },
  { label: 'Shanghai hukou preferred / 上海户籍优先', value: 'Shanghai hukou preferred' },
  { label: 'Shanghai hukou only / 仅限上海户籍', value: 'Shanghai hukou only' },
  { label: 'Open to non-Shanghai hukou / 接受非上海户籍', value: 'Open to non-Shanghai hukou' },
];

const EDUCATION_OPTIONS = [
  { zh: '高中及以下', en: 'High School or Below', value: '高中及以下' },
  { zh: '大专', en: "Associate's Degree", value: '大专' },
  { zh: '本科', en: "Bachelor's Degree", value: '本科' },
  { zh: '硕士', en: "Master's Degree", value: '硕士' },
  { zh: '博士', en: 'Doctorate (PhD)', value: '博士' },
];

const PROPERTY_OPTIONS = [
  { zh: '有房', en: 'Own Property', value: '有房' },
  { zh: '无房', en: 'No Property', value: '无房' },
];

const CAR_OPTIONS = [
  { zh: '有车', en: 'Own Car', value: '有车' },
  { zh: '无车', en: 'No Car', value: '无车' },
];

function bilingualLabel(option: { zh: string; en: string }, locale: string) {
  return locale === 'zh' ? option.zh : option.en;
}

// Translate a stored Chinese value to English using a bilingual options list
function translateStored(value: string | undefined | null, options: { zh: string; en: string; value: string }[], locale: string) {
  if (!value || locale === 'zh') return value ?? '';
  return options.find((o) => o.value === value)?.en ?? value;
}

function formatIncome(value: string | undefined | null, locale: Locale) {
  if (!value || locale === 'zh') {
    return value ?? '';
  }

  const range = value.match(/^(\d+)-(\d+)万\/月$/);
  if (range) {
    return `¥${Number(range[1]) * 10}k–${Number(range[2]) * 10}k/month`;
  }

  const minimum = value.match(/^(\d+)万\/月以上$/);
  if (minimum) {
    return `¥${Number(minimum[1]) * 10}k+/month`;
  }

  return value.replaceAll('月', 'month');
}

const EDUCATION_LEVEL_OPTIONS = [
  { label: 'Any education', value: 'all' },
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
];

const EDUCATION_RANK: Record<string, number> = {
  大专: 1,
  专科: 1,
  本科: 2,
  学士: 2,
  硕士: 3,
  研究生: 3,
  博士: 4,
  博士后: 5,
};

const SEARCH_ALIASES: Record<string, string[]> = {
  上海: ['shanghai'],
  北京: ['beijing'],
  杭州: ['hangzhou'],
  深圳: ['shenzhen'],
  江苏: ['jiangsu'],
  浙江: ['zhejiang'],
  互联网: ['internet', 'tech', 'technology'],
  金融: ['finance', 'financial'],
  教育: ['education'],
  建筑: ['construction'],
  医疗: ['medical', 'healthcare'],
  硕士: ['master', 'masters', 'graduate'],
  本科: ['bachelor', 'bachelors', 'undergraduate'],
  博士: ['phd', 'doctorate'],
  大专: ['college', 'associate'],
  有房: ['own house', 'house'],
  无房: ['no house'],
  有车: ['own car', 'car'],
  无车: ['no car'],
};

function normalizeSearchCorpus(profile: ProfileRecord) {
  const baseValues = [
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
    String(profile.age),
    String(profile.height),
    'city',
    'hukou',
    'school',
    'industry',
    'education',
    'income',
    'height',
  ].filter(Boolean);

  const aliases = baseValues.flatMap((value) => SEARCH_ALIASES[value] ?? []);
  return [...baseValues, ...aliases].join(' ').toLowerCase();
}

function getEducationRank(value?: string | null) {
  if (!value) {
    return 0;
  }

  const normalized = value.trim();
  if (normalized in EDUCATION_RANK) {
    return EDUCATION_RANK[normalized];
  }

  const matched = Object.entries(EDUCATION_RANK).find(([key]) => normalized.includes(key));
  return matched ? matched[1] : 0;
}

function parseHeightFloor(value: string) {
  if (!value || value === 'all') {
    return null;
  }

  const match = value.match(/(\d+)/);
  const minimum = match ? Number(match[1]) : Number.NaN;
  return Number.isFinite(minimum) ? minimum : null;
}

function buildPaginationItems(totalPages: number, currentPage: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, '…', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, '…', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', totalPages];
}

const BIRTH_YEARS = Array.from({ length: 2026 - 1940 + 1 }, (_, index) => String(2026 - index));
const CURRENT_YEAR = new Date().getFullYear();

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
    fields: ['traits', 'hobbies', 'preferredAgeRange', 'preferredHeightRange', 'minEducationLevel', 'hukouPreference', 'additionalPreferences', 'about'],
  },
];

const PROFILE_FIELD_LABELS: Record<keyof ProfileFormState, { zh: string; en: string }> = {
  honorific: { zh: '称呼', en: 'Title' },
  surname: { zh: '姓氏', en: 'Surname' },
  childAlias: { zh: '子女称呼', en: 'Alias' },
  gender: { zh: '性别', en: 'Gender' },
  birthYear: { zh: '出生年份', en: 'Birth year' },
  age: { zh: '年龄', en: 'Age' },
  height: { zh: '身高（厘米）', en: 'Height (cm)' },
  weight: { zh: '体重（公斤）', en: 'Weight (kg)' },
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
  traits: { zh: '性格描述', en: 'Personality' },
  hobbies: { zh: '兴趣爱好', en: 'Hobbies & Interests' },
  preferredAgeRange: { zh: '期望年龄范围', en: 'Preferred Age Range' },
  preferredHeightRange: { zh: '期望身高范围（厘米）', en: 'Preferred Height (cm)' },
  minEducationLevel: { zh: '最低学历要求', en: 'Min. Education Level' },
  hukouPreference: { zh: '户籍偏好', en: 'Hukou Preference' },
  additionalPreferences: { zh: '其他要求', en: 'Additional Preferences' },
  about: { zh: '父母寄语', en: 'Parent note' },
  preferences: { zh: '择偶要求', en: 'Preferences' },
};

function getInitialLocale(): Locale {
  const stored = window.localStorage.getItem('gex-locale');
  return stored === 'en' ? 'en' : 'zh';
}

function getInitialToken() {
  return window.localStorage.getItem('gex-token');
}

function calculateAgeFromBirthYear(birthYear: string) {
  const year = Number(birthYear);
  if (!Number.isFinite(year) || year <= 0) {
    return '';
  }

  return String(Math.max(0, CURRENT_YEAR - year));
}

function getPreferenceParts(preferences = '') {
  return preferences
    .split(/[·;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPreferenceDetails(profile?: ProfileRecord | null) {
  const fallbackParts = getPreferenceParts(profile?.preferences ?? '');

  return {
    preferredAgeRange: profile?.preferredAgeRange ?? fallbackParts[0] ?? '',
    preferredHeightRange: profile?.preferredHeightRange ?? fallbackParts[1] ?? '',
    minEducationLevel: profile?.minEducationLevel ?? fallbackParts[2] ?? '',
    hukouPreference: profile?.hukouPreference ?? fallbackParts[3] ?? '',
    additionalPreferences: profile?.additionalPreferences ?? fallbackParts[4] ?? '',
  };
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

function Tag({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'red' | 'green' | 'gold' }) {
  const colors = {
    default: 'bg-[#EEE9E0] text-[#5A5248] border border-[#D8D0C4]',
    red: 'bg-[#FEF0F0] text-[#B5272A] border border-[#F5C4C5]',
    green: 'bg-[#EBF5EE] text-[#2C8A4A] border border-[#B8DAC4]',
    gold: 'bg-[#FDF6E3] text-[#9A6F1A] border border-[#E8D49A]',
  };

  return <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] ${colors[color]}`}>{children}</span>;
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

  if (sort === 'height-asc') {
    return cloned.sort((left, right) => left.height - right.height);
  }

  if (sort === 'height-desc') {
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

function formatLastSeenHours(lastSeenAt?: string | null) {
  if (!lastSeenAt) {
    return '';
  }

  const deltaMs = Date.now() - new Date(lastSeenAt).getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return 'just now';
  }

  const hours = Math.max(1, Math.ceil(deltaMs / 3600000));
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

function ProfilePill({ profile }: { profile: ProfileRecord }) {
  return <Badge tone={profile.hukou === '上海' ? 'gold' : 'default'}>{profile.hukou === '上海' ? '户籍: 上海' : `户籍: ${profile.hukou}`}</Badge>;
}

function getProfileConnectionState(
  profileId: string,
  connections: { ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null,
) {
  const pending = connections?.outgoing.some((connection) => connection.targetProfileId === profileId && connection.status === 'pending') ?? false;
  if (pending) {
    return 'pending' as const;
  }

  const incoming = connections?.incoming.some((connection) => connection.requesterProfileId === profileId && connection.status === 'pending') ?? false;
  if (incoming) {
    return 'incoming' as const;
  }

  const connected = connections?.connected.some((connection) => {
    const relatedProfileId = connection.otherProfile?.id ?? connection.targetProfileId ?? connection.requesterProfileId;
    return relatedProfileId === profileId;
  }) ?? false;

  return connected ? 'connected' as const : 'none' as const;
}

function getApprovedConnection(
  profileId: string,
  connections: { ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null,
) {
  return connections?.connected.find((connection) => {
    const relatedProfileId = connection.otherProfile?.id ?? connection.targetProfileId ?? connection.requesterProfileId;
    return relatedProfileId === profileId;
  }) ?? null;
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
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [browsePage, setBrowsePage] = useState(1);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileRecord | null>(null);
  const [connections, setConnections] = useState<{ ownProfile: ProfileRecord | null; incoming: ConnectionRecord[]; outgoing: ConnectionRecord[]; connected: ConnectionRecord[] } | null>(null);
  const [chat, setChat] = useState<{ connection: ConnectionRecord; messages: MessageRecord[]; typingUserIds?: string[] } | null>(null);
  const [messageText, setMessageText] = useState('');
  const chatTypingActiveRef = useRef(false);
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);
  const [pendingImageName, setPendingImageName] = useState('');
  const [messageContextMenu, setMessageContextMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: 'error' | 'success' } | null>(null);
  const [marketingStats, setMarketingStats] = useState({ activeParents: 0, connectionsToday: 0, newProfiles24h: 0 });
  const [removeConnectionConfirm, setRemoveConnectionConfirm] = useState<{ connectionId: string; step: 1 | 2 } | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    gender: 'all' as GenderFilter,
    ageRange: 'all',
    heightRange: 'all',
    minEducation: 'all',
    salaryRange: 'all',
    sort: 'latest' as SortMode,
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>(defaultProfileForm);

  const copy = COPY[locale];
  const ownProfile = session?.profile ?? null;

  function requireChildProfile(targetScreen: 'browse' | 'connections') {
    if (ownProfile) {
      return true;
    }

    showNotice(copy.completeProfileNotice);
    setScreen('setup');
    return false;
  }

  function goToBrowse() {
    if (!requireChildProfile('browse')) {
      return;
    }

    setScreen('browse');
  }

  function goToConnections() {
    if (!requireChildProfile('connections')) {
      return;
    }

    setScreen('connections');
  }

  function showNotice(message: string, tone: 'error' | 'success' = 'error') {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice((current) => (current?.message === message ? null : current)), 2800);
  }

  function isDigitsOnly(value: string) {
    return /^\d+$/.test(value.trim());
  }

  function updateNumericProfileField(fieldKey: 'height' | 'weight', nextValue: string) {
    if (nextValue === '' || /^\d+$/.test(nextValue)) {
      setProfileForm((current) => ({ ...current, [fieldKey]: nextValue }));
      return;
    }

    showNotice(formatErrorMessage(new Error(fieldKey === 'height' ? 'HEIGHT_INVALID' : 'WEIGHT_INVALID')));
  }

  function formatErrorMessage(error: unknown) {
    const code = String((error as { message?: string } | null)?.message ?? error ?? 'REQUEST_FAILED');
    const mappedZh: Record<string, string> = {
      EMAIL_REQUIRED: '错误：请输入邮箱。',
      EMAIL_INVALID: '错误：邮箱格式不正确。',
      EMAIL_EXISTS: '错误：档案已存在。',
      OTP_REQUIRED: '错误：请先获取并填写验证码。',
      OTP_NOT_VERIFIED: '错误：请先完成邮箱验证码验证。',
      OTP_INVALID: '错误：验证码不正确。',
      OTP_EXPIRED: '错误：验证码已过期，请重新获取。',
      OTP_TOO_MANY_ATTEMPTS: '错误：验证码尝试次数过多，请重新获取。',
      INVALID_CREDENTIALS: '错误：邮箱或密码错误。',
      PASSWORD_TOO_WEAK: '错误：密码至少 8 位，需包含 1 个大写字母和 1 个特殊字符。',
      PASSWORD_MISMATCH: '错误：两次密码输入不一致。',
      RESET_TOKEN_REQUIRED: '错误：缺少重置链接参数。',
      RESET_TOKEN_INVALID: '错误：重置链接无效。',
      RESET_TOKEN_EXPIRED: '错误：重置链接已过期，请重新申请。',
      CANCEL_NOT_ALLOWED: '错误：仅可取消待处理申请。',
      CONNECTION_NOT_PENDING: '错误：该申请已被处理，请刷新后重试。',
      REMOVE_NOT_ALLOWED: '错误：仅可移除已通过的连接。',
      SELF_CONNECTION_NOT_ALLOWED: '错误：不能向自己的档案发送连接申请。',
      PROFILE_EXISTS: '错误：档案已存在。',
      PROFILE_NOT_FOUND: '错误：未找到档案。',
      PROFILE_REQUIRED: '错误：请补全必填项。',
      PROFILE_INVALID: '错误：档案内容格式不正确。',
      HEIGHT_INVALID: '错误：身高只能输入数字。',
      WEIGHT_INVALID: '错误：体重只能输入数字。',
      MESSAGE_EMPTY: '错误：请输入消息或上传图片后再发送。',
      MESSAGE_IMAGE_INVALID: '错误：图片格式无效。',
      MESSAGE_IMAGE_TOO_LARGE: '错误：图片过大，请控制在约 1.8MB 以内。',
      MESSAGE_NOT_FOUND: '错误：消息不存在或已删除。',
      MESSAGE_DELETE_FORBIDDEN: '错误：只能为双方删除自己发送的消息。',
      UNAUTHORIZED: '错误：登录状态已失效，请重新登录。',
      REQUEST_FAILED: '错误：请求失败，请稍后重试。',
      NOT_FOUND: '错误：请求地址不存在。',
    };

    const mappedEn: Record<string, string> = {
      EMAIL_REQUIRED: 'Error! Email is required!',
      EMAIL_INVALID: 'Error! Email must include @!',
      EMAIL_EXISTS: 'Error! Profile exists!',
      OTP_REQUIRED: 'Error! Please request and enter your OTP code!',
      OTP_NOT_VERIFIED: 'Error! Verify email with OTP before creating account!',
      OTP_INVALID: 'Error! Invalid OTP code!',
      OTP_EXPIRED: 'Error! OTP expired. Please request a new code!',
      OTP_TOO_MANY_ATTEMPTS: 'Error! Too many OTP attempts. Request a new code!',
      INVALID_CREDENTIALS: 'Error! Wrong password or email!',
      PASSWORD_TOO_WEAK: 'Error! Password needs 8 characters, one uppercase letter, and one special character!',
      PASSWORD_MISMATCH: 'Error! Passwords do not match!',
      RESET_TOKEN_REQUIRED: 'Error! Reset link is missing!',
      RESET_TOKEN_INVALID: 'Error! Reset link is invalid!',
      RESET_TOKEN_EXPIRED: 'Error! Reset link expired! Request a new one.',
      CANCEL_NOT_ALLOWED: 'Error! Only pending requests can be cancelled!',
      CONNECTION_NOT_PENDING: 'Error! This request was already handled. Please refresh.',
      REMOVE_NOT_ALLOWED: 'Error! Only approved connections can be removed!',
      SELF_CONNECTION_NOT_ALLOWED: 'Error! You cannot connect to your own profile!',
      PROFILE_EXISTS: 'Error! Profile already exists!',
      PROFILE_NOT_FOUND: 'Error! Profile not found!',
      PROFILE_REQUIRED: 'Error! Missing Fields!',
      PROFILE_INVALID: 'Error! Some profile values are invalid!',
      HEIGHT_INVALID: 'Error! Height must contain digits only!',
      WEIGHT_INVALID: 'Error! Weight must contain digits only!',
      MESSAGE_EMPTY: 'Error! Enter text or attach an image before sending!',
      MESSAGE_IMAGE_INVALID: 'Error! Invalid image format!',
      MESSAGE_IMAGE_TOO_LARGE: 'Error! Image is too large! Keep it under about 1.8MB.',
      MESSAGE_NOT_FOUND: 'Error! Message not found or already deleted.',
      MESSAGE_DELETE_FORBIDDEN: 'Error! You can only delete your own messages for both participants.',
      UNAUTHORIZED: 'Error! Please sign in again!',
      REQUEST_FAILED: 'Error! Request failed!',
      NOT_FOUND: 'Error! Not found!',
    };

    const mapped = locale === 'zh' ? mappedZh : mappedEn;
    return mapped[code] ?? (locale === 'zh' ? `错误：${code.replaceAll('_', ' ')}` : `Error! ${code.replaceAll('_', ' ')}`);
  }

  function populateProfileForm(profile?: ProfileRecord | null) {
    const preferenceDetails = getPreferenceDetails(profile);

    setProfileForm({
      honorific: profile?.honorific ?? 'Mr',
      surname: profile?.surname ?? '',
      childAlias: profile?.childAlias ?? '',
      gender: profile?.gender ?? '男',
      birthYear: String(profile?.birthYear ?? 1995),
      age: calculateAgeFromBirthYear(String(profile?.birthYear ?? 1995)),
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
      preferredAgeRange: preferenceDetails.preferredAgeRange,
      preferredHeightRange: preferenceDetails.preferredHeightRange,
      minEducationLevel: preferenceDetails.minEducationLevel,
      hukouPreference: preferenceDetails.hukouPreference,
      additionalPreferences: preferenceDetails.additionalPreferences,
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
    const calculatedAge = calculateAgeFromBirthYear(profileForm.birthYear);
    setProfileForm((current) => (current.age === calculatedAge ? current : { ...current, age: calculatedAge }));
  }, [profileForm.birthYear]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('resetToken');

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setScreen('reset-password');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  useEffect(() => {
    setBrowsePage(1);
  }, [filters.search, filters.gender, filters.ageRange, filters.heightRange, filters.minEducation, filters.salaryRange, filters.sort]);

  useEffect(() => {
    let disposed = false;

    async function pullMetrics() {
      try {
        const response = await fetch('/api/metrics/public');
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (disposed) {
          return;
        }

        setMarketingStats({
          activeParents: Number(payload.activeParents ?? 0),
          connectionsToday: Number(payload.connectionsToday ?? 0),
          newProfiles24h: Number(payload.newProfiles24h ?? 0),
        });
      } catch {
        // Keep last known metrics if polling fails.
      }
    }

    void pullMetrics();
    const timer = window.setInterval(() => {
      void pullMetrics();
    }, 10000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'chat' || !token || !chat) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshOpenChat(token);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [screen, token, chat?.connection.id]);

  useEffect(() => {
    if (!token || !chat || screen !== 'chat') {
      return;
    }

    const shouldBroadcastTyping = messageText.trim().length > 0;
    if (shouldBroadcastTyping === chatTypingActiveRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      chatTypingActiveRef.current = shouldBroadcastTyping;
      void api.setTyping(token, chat.connection.id, shouldBroadcastTyping).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [messageText, token, chat?.connection.id, screen]);

  useEffect(() => {
    if (!token || !chat || screen === 'chat' || !chatTypingActiveRef.current) {
      return;
    }

    chatTypingActiveRef.current = false;
    void api.setTyping(token, chat.connection.id, false).catch(() => undefined);
  }, [screen, token, chat?.connection.id]);

  useEffect(() => {
    if (!token || ownProfile || (screen !== 'browse' && screen !== 'connections' && screen !== 'detail' && screen !== 'chat')) {
      return;
    }

    setScreen('setup');
  }, [ownProfile, screen, token]);

  async function submitAuth() {
    try {
      setAuthBusy(true);
      let payload: SessionRecord;

      if (authMode === 'login') {
        payload = await api.login({ email: authEmail, password: authPassword });
      } else {
        payload = await api.register({ email: authEmail, password: authPassword, language: locale });
      }

      window.localStorage.setItem('gex-token', payload.token);
      setToken(payload.token);
      setSession(payload);
      setLocale(payload.user.language);
      populateProfileForm(payload.profile ?? null);
      setSetupStep(1);
      setScreen(payload.profile ? 'browse' : 'setup');
      if (payload.profile) {
        await Promise.all([refreshBrowse(payload.token), refreshConnections(payload.token)]);
      }

      showNotice(authMode === 'login'
        ? (locale === 'zh' ? '成功：登录成功。' : 'Success! Logged in.')
        : (locale === 'zh' ? '成功：账号创建成功。' : 'Success! Account created.'), 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function submitForgotPassword() {
    try {
      setForgotBusy(true);
      await api.requestPasswordReset({ email: forgotEmail });
      showNotice(copy.forgotPasswordSuccess, 'success');
      setScreen('auth');
      setAuthMode('login');
      setAuthEmail(forgotEmail.trim());
    } catch (error) {
      showNotice(formatErrorMessage(error));
    } finally {
      setForgotBusy(false);
    }
  }

  async function submitPasswordReset() {
    try {
      if (resetPasswordValue !== resetPasswordConfirm) {
        throw new Error('PASSWORD_MISMATCH');
      }

      setResetBusy(true);
      await api.resetPassword({ token: resetToken, password: resetPasswordValue });
      setResetToken('');
      setResetPasswordValue('');
      setResetPasswordConfirm('');
      setAuthPassword('');
      setAuthPasswordVisible(false);
      setScreen('auth');
      setAuthMode('login');
      showNotice(copy.resetPasswordSuccess, 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    } finally {
      setResetBusy(false);
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

      if (!isDigitsOnly(profileForm.height)) {
        throw new Error('HEIGHT_INVALID');
      }

      if (!isDigitsOnly(profileForm.weight)) {
        throw new Error('WEIGHT_INVALID');
      }

      const payload = {
        ...profileForm,
        age: Number(profileForm.age),
        birthYear: Number(profileForm.birthYear),
        height: Number(profileForm.height),
        weight: Number(profileForm.weight),
        traits: toTraits(profileForm.traits),
        about: profileForm.about,
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

  function getMissingFieldForStep(stepNumber: number) {
    const stepConfig = PROFILE_SETUP_STEPS[stepNumber - 1];
    if (!stepConfig) {
      return null;
    }

    return stepConfig.fields.find((fieldKey) => {
      if (!REQUIRED_PROFILE_FIELDS.includes(fieldKey)) {
        return false;
      }

      const value = profileForm[fieldKey];
      return typeof value === 'string' ? !value.trim() : false;
    }) ?? null;
  }

  function goToNextSetupStep() {
    const missingField = getMissingFieldForStep(setupStep);
    if (missingField) {
      const fieldLabel = PROFILE_FIELD_LABELS[missingField];
      const label = locale === 'zh' ? fieldLabel.zh : fieldLabel.en;
      showNotice(`${locale === 'zh' ? '错误：请先填写：' : 'Error! Please fill:'} ${label}`);
      return;
    }

    setSetupStep((current) => Math.min(PROFILE_SETUP_STEPS.length, current + 1));
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

  function promptRemoveConnection(connectionId: string) {
    setRemoveConnectionConfirm({ connectionId, step: 1 });
  }

  async function executeRemoveConnection() {
    if (!token || !removeConnectionConfirm) {
      return;
    }

    const connectionId = removeConnectionConfirm.connectionId;

    try {
      await api.removeConnection(token, connectionId);
      setRemoveConnectionConfirm(null);

      if (chat?.connection.id === connectionId) {
        setChat(null);
        setScreen('connections');
      }

      await refreshConnections(token);
      showNotice(locale === 'zh' ? 'Success! 已移除连接。' : 'Success! Connection removed.', 'success');
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
      setPendingImageDataUrl(null);
      setPendingImageName('');
      chatTypingActiveRef.current = false;
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function sendChatMessage() {
    if (!token || !chat || (!messageText.trim() && !pendingImageDataUrl)) {
      return;
    }

    const text = messageText.trim();
    const imageDataUrl = pendingImageDataUrl;

    // Clear UI immediately so the send feels instant
    setMessageText('');
    setPendingImageDataUrl(null);
    setPendingImageName('');
    chatTypingActiveRef.current = false;
    void api.setTyping(token, chat.connection.id, false).catch(() => undefined);

    try {
      const { message } = await api.sendMessage(token, chat.connection.id, {
        text,
        imageDataUrl,
      });
      // Append the returned message directly — no second loadChat round-trip needed
      setChat((current) => current ? { ...current, messages: [...current.messages, message] } : current);
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function refreshOpenChat(activeToken = token) {
    if (!activeToken || !chat) {
      return;
    }

    try {
      const payload = await api.loadChat(activeToken, chat.connection.id);
      setChat(payload);
    } catch {
      // Keep the current chat view stable during transient polling failures.
    }
  }

  async function deleteChatMessage(messageId: string) {
    if (!token || !chat) {
      return;
    }

    try {
      await api.deleteMessage(token, chat.connection.id, messageId);
      const payload = await api.loadChat(token, chat.connection.id);
      setChat(payload);
      setMessageContextMenu(null);
      showNotice(locale === 'zh' ? '成功：消息已删除。' : 'Success! Message deleted.', 'success');
    } catch (error) {
      const code = String((error as { message?: string } | null)?.message ?? 'REQUEST_FAILED');
      if (code === 'NOT_FOUND') {
        showNotice(locale === 'zh' ? '错误：当前服务未加载删除接口，请重启后端。' : 'Error! Delete API not loaded. Please restart backend server.');
        return;
      }

      showNotice(formatErrorMessage(error));
    }
  }

  async function hideChatMessageForSelf(messageId: string) {
    if (!token || !chat) {
      return;
    }

    try {
      await api.hideMessageForSelf(token, chat.connection.id, messageId);
      const payload = await api.loadChat(token, chat.connection.id);
      setChat(payload);
      setMessageContextMenu(null);
      showNotice(locale === 'zh' ? '成功：已仅对你删除消息。' : 'Success! Message deleted for you.', 'success');
    } catch (error) {
      showNotice(formatErrorMessage(error));
    }
  }

  async function attachImageToMessage(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showNotice(locale === 'zh' ? '错误：仅支持图片文件。' : 'Error! Only image files are supported.');
      return;
    }

    if (file.size > 1_800_000) {
      showNotice(locale === 'zh' ? '错误：图片过大，请选择小于 1.8MB 的图片。' : 'Error! Image too large. Choose one smaller than 1.8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        showNotice(locale === 'zh' ? '错误：图片读取失败。' : 'Error! Failed to read image.');
        return;
      }

      setPendingImageDataUrl(result);
      setPendingImageName(file.name);
    };
    reader.onerror = () => showNotice(locale === 'zh' ? '错误：图片读取失败。' : 'Error! Failed to read image.');
    reader.readAsDataURL(file);
  }

  async function signOut() {
    window.localStorage.removeItem('gex-token');
    setToken(null);
    setSession(null);
    setConnections(null);
    setProfiles([]);
    setChat(null);
    setSelectedProfile(null);
    // Clear any in-progress/previous user's profile draft so the next sign-in starts clean
    populateProfileForm(null);
    setSetupStep(1);
    setScreen('auth');
  }

  function openOwnProfilePage() {
    if (!ownProfile) {
      showNotice(locale === 'zh' ? '请先创建个人档案。' : 'Please create a profile first.');
      // Stay on setup without resetting form or step — user may be mid-creation
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

    const minimumHeight = parseHeightFloor(filters.heightRange);
    const minimumEducation = getEducationRank(filters.minEducation);

    const filtered = profiles.filter((profile) => {
      const matchesGender = filters.gender === 'all' || profile.gender === filters.gender;
      const corpus = normalizeSearchCorpus(profile);

      const matchesSearch = searchTokens.length === 0 || searchTokens.every((token) => corpus.includes(token));

      const ageRange = parseAgeRange(filters.ageRange);
      const salaryRange = filters.salaryRange === 'all' ? null : parseSalaryValue(filters.salaryRange);
      const profileSalary = parseSalaryValue(profile.income);
      const matchesHeight = minimumHeight === null || profile.height >= minimumHeight;
      const matchesEducation = minimumEducation === 0 || getEducationRank(profile.education) >= minimumEducation;

      const matchesAge = !ageRange || (profile.age >= ageRange.min && profile.age <= ageRange.max);
      const matchesSalary = !salaryRange || (profileSalary ? profileSalary.max >= salaryRange.min && profileSalary.min <= salaryRange.max : false);

      return matchesGender && matchesSearch && matchesAge && matchesHeight && matchesEducation && matchesSalary;
    });
    return sortProfiles(filtered, filters.sort);
  }, [filters.ageRange, filters.gender, filters.heightRange, filters.minEducation, filters.salaryRange, filters.search, filters.sort, profiles]);

  const browsableProfiles = filteredProfiles.filter((profile) => !ownProfile || profile.id !== ownProfile.id);
  const browsePageCount = Math.max(1, Math.ceil(browsableProfiles.length / 6));
  const activeBrowsePage = Math.min(browsePage, browsePageCount);
  const pagedBrowseProfiles = browsableProfiles.slice((activeBrowsePage - 1) * 6, activeBrowsePage * 6);

  const primaryButtonClass = 'flex w-full items-center justify-center gap-2 rounded-lg bg-[#B5272A] px-4 py-3 text-base font-medium text-white hover:bg-[#9E2224] disabled:opacity-60';
  const inputClass = 'w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-base outline-none focus:border-[#A87C1A]';
  const passwordInputClass = `${inputClass} pr-12`;

  function renderAuthScaffold(cardContent: ReactNode, heading = copy.authTitle, description = copy.authDescription, mode: 'default' | 'signup-ad' = 'default') {
    const isSignupAd = mode === 'signup-ad';

    return (
      <div className="relative min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <button
          onClick={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}
          className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248] shadow-sm hover:bg-[#FFF3D0]"
        >
          <Globe2 size={14} /> {copy.language}
        </button>
        <div className="mx-auto grid min-h-screen max-w-6xl gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden border-r border-[#D8D0C4] bg-white px-8 py-10 lg:px-12">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5272A] text-white font-serif text-lg font-bold">缘</div>
                <div>
                  <div className="font-serif text-2xl font-semibold leading-tight">{copy.appName}</div>
                  <div className="mt-0.5 text-sm font-mono text-[#7A6E62]">{copy.subtitle}</div>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <h1 className="font-serif text-5xl font-semibold leading-tight">{heading}</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#5A5248]">{description}</p>

              {isSignupAd ? (
                <>
                  <div className="mt-6 text-sm font-semibold text-[#1A1208]">
                    {locale === 'zh' ? '核心价值汇聚于一处' : 'All these benefits in one place.'}
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Card className="border-[#E8D49A] bg-[#FFF9E8] p-4">
                      <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? '家庭稳定' : 'Family Stability'}</div>
                      <div className="mt-1 text-sm leading-7 text-[#5A5248]">
                        {locale === 'zh'
                          ? '匹配度更高的婚配关系更有利于长期家庭秩序与日常协作。'
                          : 'A better spouse match supports long-term household stability and stronger daily cooperation.'}
                      </div>
                    </Card>
                    <Card className="border-[#E8D49A] bg-[#FFF9E8] p-4">
                      <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? '代际互助' : 'Intergenerational Support'}</div>
                      <div className="mt-1 text-sm leading-7 text-[#5A5248]">
                        {locale === 'zh'
                          ? '合适伴侣带来的家庭融合，有助于父母与子女在关键阶段形成互助网络。'
                          : 'The right marriage strengthens family cohesion and improves support across generations.'}
                      </div>
                    </Card>
                    <Card className="border-[#E8D49A] bg-[#FFF9E8] p-4">
                      <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? '长期连续性' : 'Long-term Continuity'}</div>
                      <div className="mt-1 text-sm leading-7 text-[#5A5248]">
                        {locale === 'zh'
                          ? '稳健婚配为后续家庭发展、育儿与照护安排奠定更可持续的基础。'
                          : 'A strong spouse match supports durable planning for future caregiving and child-rearing needs.'}
                      </div>
                    </Card>
                    <Card className="border-[#E8D49A] bg-[#FFF9E8] p-4">
                      <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? '共同成长' : 'Mutual Growth'}</div>
                      <div className="mt-1 text-sm leading-7 text-[#5A5248]">
                        {locale === 'zh'
                          ? '价值观更契合的婚配关系，往往带来更稳定的情绪支持与人生协同。'
                          : 'Value-aligned marriages often produce stronger emotional support and better long-term life alignment.'}
                      </div>
                    </Card>
                  </div>

                  <div className="mt-7 rounded-xl border border-[#F5C4C5] bg-[#FEF0F0] px-4 py-3">
                    <div className="text-sm font-semibold text-[#8F1010]">
                      {locale === 'zh'
                          ? `目前有 ${marketingStats.activeParents} 位家长在线 · 今日配对 ${marketingStats.connectionsToday} 位用户 · 每 24 小时新增 ${marketingStats.newProfiles24h} 个新用户资料`
                        : `${marketingStats.activeParents} active ${marketingStats.activeParents === 1 ? 'parent' : 'parents'} · ${marketingStats.connectionsToday} ${marketingStats.connectionsToday === 1 ? 'connection' : 'connections'} today · ${marketingStats.newProfiles24h} new ${marketingStats.newProfiles24h === 1 ? 'profile' : 'profiles'} in 24h.`}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-[#E8D49A] bg-white">
                    <ImageWithFallback
                      src="/live-ticker-family.jpg"
                      alt={locale === 'zh' ? '家庭合影' : 'family portrait'}
                      className="h-56 w-full object-cover sm:h-64"
                    />
                  </div>
                </>
              ) : (
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
                        <Icon className="mb-3 text-[#B5272A]" size={18} />
                        <div className="text-base font-semibold">{item.title}</div>
                        <div className="mt-1 text-sm leading-7 text-[#5A5248]">{item.body}</div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 lg:px-10">
            <Card className="w-full max-w-md p-6 shadow-sm">
              {cardContent}
            </Card>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
        {removeConnectionConfirm ? (
          <ConfirmModal
            title={copy.removeWarningTitle}
            description={removeConnectionConfirm.step === 1 ? copy.removeWarningBody : copy.removeWarningFinal}
            cancelLabel={copy.cancel}
            confirmLabel={removeConnectionConfirm.step === 1 ? copy.continue : copy.finalConfirmRemove}
            onCancel={() => setRemoveConnectionConfirm(null)}
            onConfirm={() => {
              if (removeConnectionConfirm.step === 1) {
                setRemoveConnectionConfirm((current) => (current ? { ...current, step: 2 } : current));
                return;
              }

              void executeRemoveConnection();
            }}
          />
        ) : null}
      </div>
    );
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F4EF] text-[#5A5248]">Loading...</div>;
  }

  if (screen === 'auth') {
    return renderAuthScaffold(
      <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#1A1208]">{authMode === 'login' ? copy.login : copy.register}</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-full border border-[#E8D49A] bg-[#FFF9E8] p-1">
                <button
                  onClick={() => {
                    setAuthMode('register');
                  }}
                  className={`rounded-full px-3 py-2 text-base ${authMode === 'register' ? 'bg-[#B5272A] text-white' : 'text-[#5A5248]'}`}
                >
                  {copy.createAccount}
                </button>
                <button
                  onClick={() => {
                    setAuthMode('login');
                  }}
                  className={`rounded-full px-3 py-2 text-base ${authMode === 'login' ? 'bg-[#B5272A] text-white' : 'text-[#5A5248]'}`}
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
                    className={inputClass}
                    placeholder="example@qq.com"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.password}</div>
                  <div className="relative">
                    <input
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      type={authPasswordVisible ? 'text' : 'password'}
                      className={passwordInputClass}
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
                {authMode === 'login' ? (
                  null
                ) : null}
                <button
                  onClick={submitAuth}
                  disabled={authBusy}
                  className={primaryButtonClass}
                >
                  <LogIn size={16} /> {authMode === 'register' ? copy.createAccount : copy.signIn}
                </button>
              </div>
      </>,
      copy.authTitle,
      copy.authDescription,
      'signup-ad',
    );
  }

  if (screen === 'forgot-password') {
    return renderAuthScaffold(
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-[#1A1208]">{copy.forgotPasswordTitle}</div>
          <p className="mt-2 text-sm leading-7 text-[#5A5248]">{copy.forgotPasswordDescription}</p>
        </div>

        <label className="block">
          <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.email}</div>
          <input
            value={forgotEmail}
            onChange={(event) => setForgotEmail(event.target.value)}
            type="email"
            className={inputClass}
            placeholder="example@qq.com"
          />
        </label>

        <button onClick={submitForgotPassword} disabled={forgotBusy} className={primaryButtonClass}>
          <Send size={16} /> {copy.forgotPasswordSubmit}
        </button>

        <button
          type="button"
          onClick={() => setScreen('auth')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A5248] hover:text-[#1A1208]"
        >
          <ArrowLeft size={16} /> {copy.forgotPasswordBack}
        </button>
      </div>,
      copy.forgotPasswordTitle,
      copy.forgotPasswordDescription,
    );
  }

  if (screen === 'reset-password') {
    return renderAuthScaffold(
      <div className="space-y-5">
        <div>
          <div className="text-sm font-semibold text-[#1A1208]">{copy.resetPasswordTitle}</div>
          <p className="mt-2 text-sm leading-7 text-[#5A5248]">{copy.resetPasswordDescription}</p>
        </div>

        <label className="block">
          <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.newPassword}</div>
          <div className="relative">
            <input
              value={resetPasswordValue}
              onChange={(event) => setResetPasswordValue(event.target.value)}
              type={resetPasswordVisible ? 'text' : 'password'}
              className={passwordInputClass}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setResetPasswordVisible((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7A6E62]"
              aria-label={resetPasswordVisible ? (locale === 'zh' ? '隐藏密码' : 'Hide password') : (locale === 'zh' ? '显示密码' : 'Show password')}
            >
              {resetPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium text-[#1A1208]">{copy.confirmPassword}</div>
          <div className="relative">
            <input
              value={resetPasswordConfirm}
              onChange={(event) => setResetPasswordConfirm(event.target.value)}
              type={resetConfirmVisible ? 'text' : 'password'}
              className={passwordInputClass}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setResetConfirmVisible((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#7A6E62]"
              aria-label={resetConfirmVisible ? (locale === 'zh' ? '隐藏密码' : 'Hide password') : (locale === 'zh' ? '显示密码' : 'Show password')}
            >
              {resetConfirmVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button onClick={submitPasswordReset} disabled={resetBusy} className={primaryButtonClass}>
          <CheckCircle2 size={16} /> {copy.resetPasswordSubmit}
        </button>

        <button
          type="button"
          onClick={() => {
            setResetToken('');
            setScreen('forgot-password');
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A5248] hover:text-[#1A1208]"
        >
          <ArrowLeft size={16} /> {copy.forgotPasswordBack}
        </button>
      </div>,
      copy.resetPasswordTitle,
      copy.resetPasswordDescription,
    );
  }

  if (screen === 'setup') {
    const currentSetupStep = PROFILE_SETUP_STEPS[setupStep - 1];
    const totalSetupSteps = PROFILE_SETUP_STEPS.length;

    function renderProfileField(fieldKey: keyof ProfileFormState) {
      const fieldLabel = PROFILE_FIELD_LABELS[fieldKey];
      const isWideField = fieldKey === 'gender' || fieldKey === 'traits' || fieldKey === 'hobbies' || fieldKey === 'about' || fieldKey === 'preferredAgeRange' || fieldKey === 'preferredHeightRange' || fieldKey === 'hukouPreference' || fieldKey === 'additionalPreferences';
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
                  type="button"
                  key={gender}
                  onClick={() => setProfileForm((current) => ({ ...current, gender: gender as '男' | '女' }))}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 hover:border-[#C7962B] hover:bg-gradient-to-r hover:from-[#FFF4DD] hover:via-[#FDE7E7] hover:to-[#F9E8C8] hover:text-[#8F5C12] ${profileForm.gender === gender ? 'border-[#A87C1A] bg-[#FEF0F0] text-[#A87C1A]' : 'border-[#D8D0C4] bg-white text-[#5A5248]'}`}
                >
                  {gender} / {gender === '男' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          ) : fieldKey === 'birthYear' ? (
            <select
              value={profileForm.birthYear}
              onChange={(event) => setProfileForm((current) => ({ ...current, birthYear: event.target.value, age: calculateAgeFromBirthYear(event.target.value) }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {BIRTH_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          ) : fieldKey === 'age' ? (
            <input
              value={profileForm.age}
              readOnly
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#F1ECE3] px-4 py-3 text-sm text-[#5A5248] outline-none"
              placeholder={locale === 'zh' ? '根据出生年份自动计算' : 'Auto-filled from birth year'}
            />
          ) : fieldKey === 'honorific' ? (
            <select
              value={profileForm.honorific}
              onChange={(event) => setProfileForm((current) => ({ ...current, honorific: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {HONORIFIC_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : fieldKey === 'education' ? (
            <select
              value={profileForm.education}
              onChange={(event) => setProfileForm((current) => ({ ...current, education: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {EDUCATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{bilingualLabel(option, locale)}</option>)}
            </select>
          ) : fieldKey === 'income' ? (
            <select
              value={profileForm.income}
              onChange={(event) => setProfileForm((current) => ({ ...current, income: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {INCOME_OPTIONS.map((option) => <option key={option} value={option}>{formatIncome(option, locale)}</option>)}
            </select>
          ) : fieldKey === 'property' ? (
            <select
              value={profileForm.property}
              onChange={(event) => setProfileForm((current) => ({ ...current, property: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {PROPERTY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{bilingualLabel(option, locale)}</option>)}
            </select>
          ) : fieldKey === 'car' ? (
            <select
              value={profileForm.car}
              onChange={(event) => setProfileForm((current) => ({ ...current, car: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {CAR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{bilingualLabel(option, locale)}</option>)}
            </select>
          ) : fieldKey === 'preferredAgeRange' ? (
            <select
              value={profileForm.preferredAgeRange}
              onChange={(event) => setProfileForm((current) => ({ ...current, preferredAgeRange: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {PREFERRED_AGE_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          ) : fieldKey === 'preferredHeightRange' ? (
            <select
              value={profileForm.preferredHeightRange}
              onChange={(event) => setProfileForm((current) => ({ ...current, preferredHeightRange: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {PREFERRED_HEIGHT_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          ) : fieldKey === 'minEducationLevel' ? (
            <select
              value={profileForm.minEducationLevel}
              onChange={(event) => setProfileForm((current) => ({ ...current, minEducationLevel: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              <option value="">{locale === 'zh' ? '不限' : 'No preference'}</option>
              {EDUCATION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{bilingualLabel(option, locale)}</option>)}
            </select>
          ) : fieldKey === 'hukouPreference' ? (
            <select
              value={profileForm.hukouPreference}
              onChange={(event) => setProfileForm((current) => ({ ...current, hukouPreference: event.target.value }))}
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
            >
              {HUKOU_PREFERENCE_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          ) : fieldKey === 'additionalPreferences' ? (
            <textarea
              value={profileForm.additionalPreferences}
              onChange={(event) => setProfileForm((current) => ({ ...current, additionalPreferences: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={locale === 'zh' ? '补充其他要求，例如性格、生活方式、家庭观念等' : 'Add any other preferences such as personality, lifestyle, or family values'}
            />
          ) : fieldKey === 'about' || fieldKey === 'preferences' ? (
            <textarea
              value={profileForm[fieldKey]}
              onChange={(event) => setProfileForm((current) => ({ ...current, [fieldKey]: event.target.value }))}
              className="min-h-24 w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={fieldKey === 'about'
                ? (locale === 'zh' ? '填写整体介绍' : 'Share a short introduction')
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
          ) : fieldKey === 'height' || fieldKey === 'weight' ? (
            <input
              value={profileForm[fieldKey] as string}
              onChange={(event) => updateNumericProfileField(fieldKey, event.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded-lg border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
              placeholder={fieldKey === 'height'
                ? (locale === 'zh' ? '例如：175 厘米' : 'e.g. 175 cm')
                : (locale === 'zh' ? '例如：65 公斤' : 'e.g. 65 kg')}
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
          onLogoClick={goToBrowse}
          onProfileClick={openOwnProfilePage}
          onConnectionsClick={goToConnections}
          currentScreen={copy.profileSetup}
        />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <button onClick={goToBrowse} className="mb-5 inline-flex items-center gap-2 text-sm text-[#5A5248]">
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
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248] hover:bg-[#F7F4EF] disabled:opacity-40"
                  >
                    <ArrowLeft size={16} /> {locale === 'zh' ? '上一步' : 'Previous step'}
                  </button>
                  {setupStep < totalSetupSteps ? (
                    <button
                      onClick={goToNextSetupStep}
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
    const detailApprovedConnection = getApprovedConnection(selectedProfile.id, connections);
    const detailRequested = detailConnectionState === 'pending';
    const detailIncoming = detailConnectionState === 'incoming';
    const detailConnected = detailApprovedConnection !== null && detailConnectionState === 'connected';
    const preferenceDetails = getPreferenceDetails(selectedProfile);

    return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={goToBrowse} onProfileClick={openOwnProfilePage} onConnectionsClick={goToConnections} currentScreen={copy.browse} />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button onClick={goToBrowse} className="mb-6 inline-flex items-center gap-2 text-sm text-[#5A5248]">
            <ArrowLeft size={16} /> {locale === 'zh' ? '返回列表' : 'Back to list'}
          </button>
          <div className="space-y-6">
            <SectionLabel title={locale === 'zh' ? '概要' : 'Summary'} />
            <div className="space-y-4">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono text-[#7A6E62]">{selectedProfile.childAlias}</div>
                    <div className="mt-1 text-2xl font-semibold">{selectedProfile.gender}，{formatAge(selectedProfile)}</div>
                  </div>
                  <ProfilePill profile={selectedProfile} />
                </div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {selectedProfile.traits.map((trait) => <Badge key={trait}>{trait}</Badge>)}
                </div>

                <div className="mb-5 space-y-2">
                  <button
                    onClick={() => {
                      if (detailConnected) {
                        return;
                      }

                      if (detailIncoming) {
                        goToConnections();
                        return;
                      }

                      if (detailPendingConnection) {
                        void cancelRequest(detailPendingConnection.id);
                        return;
                      }

                      void requestConnect(selectedProfile.id);
                    }}
                    disabled={detailConnected}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${detailConnected ? 'bg-[#2C8A4A] text-white' : detailRequested ? 'border border-[#F5C4C5] bg-[#FFF5F5] text-[#B91C1C]' : detailIncoming ? 'border border-[#E8D49A] bg-[#FFF9E8] text-[#8A6500]' : 'bg-[#B5272A] text-white hover:bg-[#9E2224]'}`}
                  >
                    {detailConnected ? <CheckCircle2 size={16} /> : detailRequested ? <X size={16} /> : detailIncoming ? <Users size={16} /> : <Heart size={16} />}
                    {detailConnected ? (locale === 'zh' ? '已连接' : 'Connected') : detailRequested ? (locale === 'zh' ? '取消申请' : 'Cancel request') : detailIncoming ? (locale === 'zh' ? '处理收到的申请' : 'Review incoming request') : copy.requestConnect}
                  </button>
                  {detailConnected && detailApprovedConnection ? (
                    <button
                      onClick={() => {
                        void openChat(detailApprovedConnection.id);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0F766E]"
                    >
                      <MessageSquare size={16} /> {locale === 'zh' ? '打开聊天' : 'Open chat'}
                    </button>
                  ) : null}
                  <button onClick={goToConnections} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248] hover:bg-[#F7F4EF]">
                    <Users size={16} /> {copy.myConnections}
                  </button>
                </div>

                <div className="rounded-2xl border border-[#D8D0C4] bg-white overflow-hidden">
                  {[
                    { label: locale === 'zh' ? '地区' : 'Location', value: locale === 'zh' ? `城市: ${selectedProfile.city} · 户籍: ${selectedProfile.hukou}` : `City: ${selectedProfile.city} · Hukou: ${selectedProfile.hukou}` },
                    { label: locale === 'zh' ? '学历' : 'Education', value: locale === 'zh' ? `学历: ${selectedProfile.education} · 学校: ${selectedProfile.school}` : `Education: ${translateStored(selectedProfile.education, EDUCATION_OPTIONS, locale)} · School: ${selectedProfile.school}` },
                    { label: locale === 'zh' ? '职业' : 'Work', value: locale === 'zh' ? `行业: ${selectedProfile.industry} · 职位: ${selectedProfile.jobTitle}` : `Industry: ${selectedProfile.industry} · Job: ${selectedProfile.jobTitle}` },
                    { label: locale === 'zh' ? '收入' : 'Income', value: locale === 'zh' ? `月收入: ${selectedProfile.income}` : `Monthly income: ${formatIncome(selectedProfile.income, locale)}` },
                    { label: locale === 'zh' ? '房产' : 'Property', value: translateStored(selectedProfile.property, PROPERTY_OPTIONS, locale) },
                    { label: locale === 'zh' ? '车辆' : 'Vehicle', value: translateStored(selectedProfile.car, CAR_OPTIONS, locale) },
                  ].map((item, index) => (
                    <div key={item.label} className={`flex items-center gap-3 px-4 py-2.5 ${index < 5 ? 'border-b border-[#EEE9E0]' : ''}`}>
                      <span className="text-[10px] font-mono text-[#7A6E62] w-12 flex-shrink-0">{item.label}</span>
                      <span className="text-xs text-[#1A1208]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <SectionLabel title={locale === 'zh' ? '详细资料' : 'In Detail'} />
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="border-b border-[#EEE9E0] bg-[#FAFAF8] px-5 py-3">
                  <span className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '基本资料' : 'Basic Info'}</span>
                </div>
                <div className="divide-y divide-[#F0EBE1]">
                  {[
                    [locale === 'zh' ? '出生年份' : 'Birth Year', `${selectedProfile.birthYear}年（${selectedProfile.age}岁）`],
                    [locale === 'zh' ? '性别' : 'Gender', selectedProfile.gender],
                    [locale === 'zh' ? '身高' : 'Height', `${selectedProfile.height} cm`],
                    [locale === 'zh' ? '体重' : 'Weight', selectedProfile.weight ? `${selectedProfile.weight} kg` : '—'],
                    [locale === 'zh' ? '现居城市' : 'Current city', selectedProfile.city],
                    [locale === 'zh' ? '户籍' : 'Hukou', selectedProfile.hukou],
                    [locale === 'zh' ? '老家' : 'Hometown', selectedProfile.hometown],
                  ].map(([label, value]) => (
                    <div key={label} className="flex px-5 py-2.5">
                      <span className="text-[11px] font-mono text-[#7A6E62] w-28 flex-shrink-0">{label}</span>
                      <span className="text-xs text-[#1A1208]">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-[#EEE9E0] bg-[#FAFAF8] px-5 py-3">
                  <span className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '学历与职业' : 'Education & Career'}</span>
                </div>
                <div className="divide-y divide-[#F0EBE1]">
                  {[
                    [locale === 'zh' ? '最高学历' : 'Highest education', translateStored(selectedProfile.education, EDUCATION_OPTIONS, locale)],
                    [locale === 'zh' ? '大学 / 学校' : 'University / School', selectedProfile.school],
                    [locale === 'zh' ? '所学专业' : 'Major / Field of Study', selectedProfile.major],
                    [locale === 'zh' ? '职业行业' : 'Industry', selectedProfile.industry],
                    [locale === 'zh' ? '职位' : 'Job title', selectedProfile.jobTitle],
                    [locale === 'zh' ? '月收入' : 'Monthly income', formatIncome(selectedProfile.income, locale)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex px-5 py-2.5">
                      <span className="text-[11px] font-mono text-[#7A6E62] w-28 flex-shrink-0">{label}</span>
                      <span className="text-xs text-[#1A1208]">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-[#EEE9E0] bg-[#FAFAF8] px-5 py-3">
                  <span className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '择偶要求' : 'Partner Preferences'}</span>
                </div>
                <div className="divide-y divide-[#F0EBE1]">
                  {[
                    [locale === 'zh' ? '期望年龄范围' : 'Preferred age range', preferenceDetails.preferredAgeRange || '—'],
                    [locale === 'zh' ? '期望身高范围' : 'Preferred height (cm)', preferenceDetails.preferredHeightRange || '—'],
                    [locale === 'zh' ? '最低学历要求' : 'Min. education level', preferenceDetails.minEducationLevel || '—'],
                    [locale === 'zh' ? '户籍偏好' : 'Hukou preference', preferenceDetails.hukouPreference || '—'],
                    [locale === 'zh' ? '其他要求' : 'Additional preferences', preferenceDetails.additionalPreferences || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex px-5 py-2.5">
                      <span className="text-[11px] font-mono text-[#7A6E62] w-28 flex-shrink-0">{label}</span>
                      <span className="text-xs text-[#1A1208]">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <SectionLabel title={locale === 'zh' ? '父母寄语' : "Parent's Note"} />
                <p className="text-sm leading-8 text-[#3A3028] font-serif">{selectedProfile.about || '—'}</p>
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
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={goToBrowse} onProfileClick={openOwnProfilePage} onConnectionsClick={goToConnections} currentScreen={copy.myConnections} />
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button onClick={goToBrowse} className="mb-4 inline-flex items-center gap-2 text-sm text-[#5A5248]">
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
                  <ConnectionItem key={connection.id} connection={connection} locale={locale} onViewProfile={openProfile} onOpenChat={openChat} onRemoveConnection={promptRemoveConnection} />
                ))}
              </div>
            </Card>
          </div>
        </div>
        {notice ? <Toast notice={notice} /> : null}
        {removeConnectionConfirm ? (
          <ConfirmModal
            title={copy.removeWarningTitle}
            description={removeConnectionConfirm.step === 1 ? copy.removeWarningBody : copy.removeWarningFinal}
            cancelLabel={copy.cancel}
            confirmLabel={removeConnectionConfirm.step === 1 ? copy.continue : copy.finalConfirmRemove}
            onCancel={() => setRemoveConnectionConfirm(null)}
            onConfirm={() => {
              if (removeConnectionConfirm.step === 1) {
                setRemoveConnectionConfirm((current) => (current ? { ...current, step: 2 } : current));
                return;
              }

              void executeRemoveConnection();
            }}
          />
        ) : null}
      </div>
    );
  }

  if (screen === 'chat' && chat) {
    const otherProfile = chat.connection.otherProfile ?? chat.connection.targetProfile ?? chat.connection.requesterProfile ?? null;
    const isOnline = otherProfile?.presence?.status === 'online';
    const lastSeenHours = formatLastSeenHours(otherProfile?.presence?.lastSeenAt);
    const contextMessageIsMine = messageContextMenu
      ? chat.messages.some((message) => message.id === messageContextMenu.messageId && message.senderUserId === session?.user.id)
      : false;

    return (
      <div className="h-screen overflow-hidden bg-[#F7F4EF] text-[#1A1208]" onClick={() => setMessageContextMenu(null)}>
        <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={goToBrowse} onProfileClick={openOwnProfilePage} onConnectionsClick={goToConnections} currentScreen={copy.chat} />
        <div className="grid h-[calc(100vh-72px)] overflow-hidden lg:grid-cols-[320px_1fr]">
          <div className="min-h-0 overflow-y-auto border-r border-[#D8D0C4] bg-white p-5">
            <button onClick={goToConnections} className="mb-5 inline-flex items-center gap-2 text-sm text-[#5A5248]">
              <ArrowLeft size={16} /> {locale === 'zh' ? '返回连接页' : 'Back to connections'}
            </button>
            {otherProfile ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#D8D0C4] bg-[#FAFAF8] p-4">
                  <div className="text-sm font-semibold text-[#1A1208]">{locale === 'zh' ? '对方档案' : 'Profile'}</div>
                  <div className="mt-1 flex items-end gap-2">
                    <div className="text-xl font-semibold">{otherProfile.gender}</div>
                    <div className="text-2xl font-semibold text-[#1A1208]">{otherProfile.childAlias || '—'}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#2C8A4A]' : 'bg-[#B91C1C]'}`} />
                    <span className={`text-xs font-semibold uppercase ${isOnline ? 'text-[#2C8A4A]' : 'text-[#B91C1C]'}`}>
                      {isOnline ? (locale === 'zh' ? '在线' : 'online') : (locale === 'zh' ? '离线' : 'offline')}
                    </span>
                    {!isOnline && lastSeenHours ? (
                      <span className="text-[11px] text-[#7A6E62]">
                        {locale === 'zh' ? `最后在线 ${lastSeenHours}` : `Last seen ${lastSeenHours}`}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 divide-y divide-[#EEE9E0] overflow-hidden rounded-2xl border border-[#D8D0C4] bg-white">
                    {[
                      [locale === 'zh' ? '年龄' : 'Age', `${otherProfile.age}岁`],
                      [locale === 'zh' ? '身高' : 'Height', `${otherProfile.height}cm`],
                      [locale === 'zh' ? '城市' : 'City', otherProfile.city],
                      [locale === 'zh' ? '户籍' : 'Hukou', otherProfile.hukou],
                      [locale === 'zh' ? '学历' : 'Education', translateStored(otherProfile.education, EDUCATION_OPTIONS, locale)],
                      [locale === 'zh' ? '行业' : 'Industry', otherProfile.industry],
                      [locale === 'zh' ? '收入' : 'Income', formatIncome(otherProfile.income, locale)],
                      [locale === 'zh' ? '房产' : 'Property', translateStored(otherProfile.property, PROPERTY_OPTIONS, locale)],
                      [locale === 'zh' ? '车辆' : 'Vehicle', translateStored(otherProfile.car, CAR_OPTIONS, locale)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <span className="text-[11px] font-mono text-[#7A6E62]">{label}</span>
                        <span className="text-xs text-[#1A1208]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-[#D8D0C4] bg-white p-4">
                    <div className="text-xs font-semibold text-[#1A1208]">{locale === 'zh' ? '父母寄语' : 'Parent note'}</div>
                    <p className="mt-2 text-sm leading-7 text-[#5A5248]">{otherProfile.about || '—'}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {(chat.typingUserIds?.length ?? 0) > 0 ? (
                <div className="text-xs text-[#7A6E62]">
                  {locale === 'zh' ? '对方正在输入…' : 'The other person is typing...'}
                </div>
              ) : null}
              {chat.messages.length === 0 ? <EmptyState label={locale === 'zh' ? '还没有消息，先发第一条吧' : 'No messages yet. Send the first one.'} /> : chat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  mine={message.senderUserId === session?.user.id}
                  locale={locale}
                  onContextMenu={(event, id) => {
                    event.preventDefault();
                    setMessageContextMenu({ messageId: id, x: event.clientX, y: event.clientY });
                  }}
                />
              ))}
            </div>
            <div className="border-t border-[#D8D0C4] bg-white p-4">
              {pendingImageDataUrl ? (
                <div className="mb-3 flex items-start gap-3 rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] p-3">
                  <img src={pendingImageDataUrl} alt={pendingImageName || 'attachment'} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-[#1A1208]">{pendingImageName || (locale === 'zh' ? '待发送图片' : 'Image to send')}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingImageDataUrl(null);
                        setPendingImageName('');
                      }}
                      className="mt-1 text-xs text-[#B5272A]"
                    >
                      {locale === 'zh' ? '移除图片' : 'Remove image'}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-3">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] px-3 py-3 text-[#5A5248] hover:bg-[#F2EDE4]">
                  <ImagePlus size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void attachImageToMessage(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendChatMessage();
                    }
                  }}
                  placeholder={locale === 'zh' ? '输入消息...' : 'Type a message...'}
                  className="flex-1 rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#A87C1A]"
                />
                <button onClick={sendChatMessage} className="inline-flex items-center gap-2 rounded-xl bg-[#B5272A] px-5 py-3 text-sm font-medium text-white hover:bg-[#9E2224]">
                  <Send size={16} /> {locale === 'zh' ? '发送' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {messageContextMenu ? (
          <div
            className="fixed z-50 min-w-40 rounded-lg border border-[#D8D0C4] bg-white p-1 shadow-xl"
            style={{ left: messageContextMenu.x, top: messageContextMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            {contextMessageIsMine ? (
              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm text-[#B91C1C] hover:bg-[#FFF5F5]"
                onClick={() => void deleteChatMessage(messageContextMenu.messageId)}
              >
                {locale === 'zh' ? '删除消息（双方）' : 'Delete message (for both)'}
              </button>
            ) : null}
            <button
              type="button"
              className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-[#5A5248] hover:bg-[#F7F4EF]"
              onClick={() => void hideChatMessageForSelf(messageContextMenu.messageId)}
            >
              {locale === 'zh' ? '仅对我删除' : 'Delete message (for myself)'}
            </button>
          </div>
        ) : null}
        {notice ? <Toast notice={notice} /> : null}
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F7F4EF] text-[#1A1208]">
      <AppHeader copy={copy} locale={locale} onToggleLocale={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))} onSignOut={signOut} onLogoClick={goToBrowse} onProfileClick={openOwnProfilePage} onConnectionsClick={goToConnections} currentScreen={copy.browse} />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-[1.5rem] border border-[#D8D0C4] bg-[#FAF3E8]/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={13} className="text-[#5A5248]" />
            <span className="text-xs font-semibold text-[#1A1208]">筛选条件</span>
            <span className="text-[10px] font-mono text-[#8A8070]">Filter</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-6">
            <label className="block lg:col-span-2">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Search / 搜索</div>
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
                <option value="all">{locale === 'zh' ? '不限性别' : 'Any gender'}</option>
                <option value="男">{locale === 'zh' ? '男' : 'Male'}</option>
                <option value="女">{locale === 'zh' ? '女' : 'Female'}</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Age Range / 年龄范围</div>
              <select value={filters.ageRange} onChange={(event) => setFilters((current) => ({ ...current, ageRange: event.target.value }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                {AGE_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.value === 'all' && locale === 'zh' ? '不限年龄' : option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Height / 身高</div>
              <select value={filters.heightRange} onChange={(event) => setFilters((current) => ({ ...current, heightRange: event.target.value }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                {HEIGHT_RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.value === 'all' && locale === 'zh' ? '不限身高' : option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Min. Education / 最低学历</div>
              <select value={filters.minEducation} onChange={(event) => setFilters((current) => ({ ...current, minEducation: event.target.value }))} className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]">
                {[
                { label: locale === 'zh' ? '不限学历' : 'Any education', value: 'all' },
                ...EDUCATION_OPTIONS.map((o) => ({ label: bilingualLabel(o, locale), value: o.value })),
              ].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-mono text-[#7A6E62]">Income / 月收入</div>
              <select
                value={filters.salaryRange}
                onChange={(event) => setFilters((current) => ({ ...current, salaryRange: event.target.value }))}
                className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm outline-none focus:border-[#B5272A]"
              >
                {SALARY_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value === 'all' ? (locale === 'zh' ? '不限收入' : 'Any income') : formatIncome(option.value, locale)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-[#7A6E62]">
                {locale === 'zh' ? '排序' : 'Sort'}
                <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as SortMode }))} className="rounded-xl border border-[#D8D0C4] bg-white px-3 py-2 text-xs outline-none focus:border-[#B5272A]">
                  <option value="latest">{locale === 'zh' ? '最新发布' : 'Latest'}</option>
                  <option value="age-asc">{locale === 'zh' ? '年龄升序' : 'Age asc'}</option>
                  <option value="age-desc">{locale === 'zh' ? '年龄降序' : 'Age desc'}</option>
                  <option value="height-asc">{locale === 'zh' ? '身高升序' : 'Height asc'}</option>
                  <option value="height-desc">{locale === 'zh' ? '身高降序' : 'Height desc'}</option>
                </select>
              </label>
              <button onClick={() => refreshBrowse(token, filters).catch((error) => showNotice(formatErrorMessage(error)))} className="inline-flex items-center gap-2 rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 text-sm text-[#5A5248] hover:bg-[#F7F4EF] transition-colors">
              <Search size={16} /> {locale === 'zh' ? '搜索' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">{locale === 'zh' ? '相亲角浏览' : 'Browse profiles'}</div>
            <div className="text-xs font-mono text-[#7A6E62]">{locale === 'zh' ? '浏览其他家长发布的匿名子女档案' : 'Browse anonymous child profiles posted by other parents'}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="gold">{profiles.length} {locale === 'zh' ? '个档案' : (profiles.length === 1 ? 'profile' : 'profiles')}</Badge>
            <Badge tone="green">{incomingCount} {locale === 'zh' ? copy.incoming : (incomingCount === 1 ? 'Incoming request' : 'Incoming requests')}</Badge>
            <Badge tone="default">{connectedCount} {copy.connected}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pagedBrowseProfiles.map((profile) => {
            const connectionState = getProfileConnectionState(profile.id, connections);
            const pendingConnection = getPendingOutgoingConnection(profile.id, connections);
            const isPending = connectionState === 'pending';
            const isIncoming = connectionState === 'incoming';
            const isConnected = connectionState === 'connected';

            return (
              <Card key={profile.id} className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="border-b border-[#EEE9E0] p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{profile.gender} · {formatAge(profile)}</div>
                      <div className="mt-1 text-sm font-semibold text-[#5A5248]">
                        {locale === 'zh'
                          ? `城市: ${profile.city} · 户籍: ${profile.hukou} · 学历: ${profile.education}`
                          : `City: ${profile.city} · Hukou: ${profile.hukou} · Education: ${profile.education}`}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm font-semibold text-[#5A5248]">{locale === 'zh' ? '性格标签' : 'Traits'}</div>
                  <div className="flex flex-wrap gap-2">{profile.traits.map((trait) => <Badge key={trait}>{trait}</Badge>)}</div>
                </div>
                <div className="p-5">
                  <div className="space-y-2 text-sm text-[#5A5248]">
                    <div>{locale === 'zh' ? `学校/专业: ${profile.school} · ${profile.major}` : `School/Major: ${profile.school} · ${profile.major}`}</div>
                    <div>{locale === 'zh' ? `行业/职业: ${profile.industry} · ${profile.jobTitle}` : `Industry/Job: ${profile.industry} · ${profile.jobTitle}`}</div>
                    <div>{locale === 'zh' ? `月收入: ${profile.income}` : `Monthly income: ${formatIncome(profile.income, locale)}`}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openProfile(profile.id)} className="flex-1 rounded-xl border border-[#D8D0C4] bg-white px-4 py-3 text-sm text-[#5A5248] hover:bg-[#F7F4EF] transition-colors">
                      {locale === 'zh' ? '查看详情' : 'View detail'}
                    </button>
                    <button
                      onClick={() => {
                        if (isConnected) {
                          return;
                        }

                        if (isIncoming) {
                          goToConnections();
                          return;
                        }

                        if (pendingConnection) {
                          void cancelRequest(pendingConnection.id);
                          return;
                        }

                        void requestConnect(profile.id);
                      }}
                      disabled={isConnected}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isConnected ? 'bg-[#2C8A4A] text-white' : isPending ? 'border border-[#F5C4C5] bg-[#FFF5F5] text-[#B91C1C]' : isIncoming ? 'border border-[#E8D49A] bg-[#FFF9E8] text-[#8A6500]' : 'bg-[#B5272A] text-white hover:bg-[#9E2224]'}`}
                    >
                      {isConnected ? <CheckCircle2 size={16} /> : isPending ? <X size={16} /> : isIncoming ? <Users size={16} /> : <UserPlus size={16} />}
                      {isConnected ? (locale === 'zh' ? '已连接' : 'Connected') : isPending ? (locale === 'zh' ? '取消申请' : 'Cancel request') : isIncoming ? (locale === 'zh' ? '处理申请' : 'Review request') : copy.requestConnect}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setBrowsePage(Math.max(1, activeBrowsePage - 1))}
            disabled={activeBrowsePage === 1}
            aria-label={locale === 'zh' ? '上一页' : 'Previous page'}
            title={locale === 'zh' ? '上一页' : 'Previous page'}
            className="flex h-8 min-w-8 items-center justify-center rounded border border-[#D77A7A] bg-[#FFF5F5] px-2 text-[#B91C1C] disabled:cursor-not-allowed disabled:border-[#D8D0C4] disabled:bg-[#F5F2ED] disabled:text-[#AAA197]"
          >
            <ChevronLeft size={16} />
          </button>
          {buildPaginationItems(browsePageCount, activeBrowsePage).map((item, index) => (
            typeof item === 'number' ? (
              <button
                key={`${item}-${index}`}
                onClick={() => setBrowsePage(item)}
                className={`flex h-8 min-w-8 items-center justify-center rounded border px-2 text-xs ${activeBrowsePage === item ? 'border-[#B91C1C] bg-[#FDECEC] text-[#8F1010] font-bold shadow-sm ring-1 ring-[#F5C4C5]' : 'border-[#D77A7A] bg-[#FFF5F5] text-[#B91C1C]'}`}
              >
                {item}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-1 text-[#8A8070]">{item}</span>
            )
          ))}
          <button
            type="button"
            onClick={() => setBrowsePage(Math.min(browsePageCount, activeBrowsePage + 1))}
            disabled={activeBrowsePage === browsePageCount}
            aria-label={locale === 'zh' ? '下一页' : 'Next page'}
            title={locale === 'zh' ? '下一页' : 'Next page'}
            className="flex h-8 min-w-8 items-center justify-center rounded border border-[#D77A7A] bg-[#FFF5F5] px-2 text-[#B91C1C] disabled:cursor-not-allowed disabled:border-[#D8D0C4] disabled:bg-[#F5F2ED] disabled:text-[#AAA197]"
          >
            <ChevronRight size={16} />
          </button>
          <span className="ml-1 text-[11px] text-[#7A6E62]">
            {locale === 'zh' ? `第 ${activeBrowsePage} / ${browsePageCount} 页` : `Page ${activeBrowsePage} of ${browsePageCount}`}
          </span>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5272A] text-white font-serif text-lg font-bold">缘</div>
            <div>
              <div className="font-semibold">{copy.appName}</div>
              <div className="text-[10px] font-mono text-[#7A6E62]">{currentScreen}</div>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B5272A] text-white font-serif text-lg font-bold">缘</div>
            <div>
              <div className="font-semibold">{copy.appName}</div>
              <div className="text-[10px] font-mono text-[#7A6E62]">{currentScreen}</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {onConnectionsClick ? (
            <button onClick={onConnectionsClick} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248] hover:bg-[#FFF3D0]">
              {copy.myConnections}
            </button>
          ) : null}
          {onProfileClick ? (
            <button onClick={onProfileClick} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248] hover:bg-[#FFF3D0]">
              {copy.myProfile}
            </button>
          ) : null}
          <button onClick={onToggleLocale} className="rounded-full border border-[#E8D49A] bg-[#FFF9E8] px-3 py-2 text-xs text-[#5A5248] hover:bg-[#FFF3D0]">
            <Globe2 className="mr-2 inline-block" size={14} /> {locale === 'zh' ? 'English' : '中文'}
          </button>
          <button onClick={onSignOut} className="rounded-full border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248] hover:bg-[#F7F4EF]">
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
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 text-sm transition-all duration-300 ease-out animate-in slide-in-from-top-2">
      <div className={`rounded-xl border px-4 py-2 shadow-xl ${toneClasses}`}>
        {notice.message}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-[#D8D0C4] bg-[#FAFAF8] p-4 text-sm text-[#7A6E62]">{label}</div>;
}

function ConnectionItem({ connection, locale, onApprove, onReject, onViewProfile, onCancel, onOpenChat, onRemoveConnection }: { connection: ConnectionRecord; locale: Locale; onApprove?: (id: string) => Promise<void>; onReject?: (id: string) => Promise<void>; onViewProfile?: (id: string) => Promise<void>; onCancel?: (id: string) => Promise<void>; onOpenChat?: (id: string) => Promise<void>; onRemoveConnection?: (id: string) => void; }) {
  const profile = connection.otherProfile ?? connection.targetProfile ?? connection.requesterProfile;
  if (!profile) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#D8D0C4] bg-[#FAFAF8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{profile.gender} · {profile.age}岁 · {profile.height}cm</div>
          <div className="mt-1 text-[10px] font-mono text-[#7A6E62]">
            {locale === 'zh'
              ? `城市: ${profile.city} · 学历: ${profile.education} · 行业: ${profile.industry}`
              : `City: ${profile.city} · Education: ${profile.education} · Industry: ${profile.industry}`}
          </div>
        </div>
        <Badge tone={connection.status === 'approved' ? 'green' : connection.status === 'rejected' ? 'default' : 'yellow'}>{connection.status === 'approved' ? (locale === 'zh' ? '已通过' : 'Approved') : connection.status === 'rejected' ? (locale === 'zh' ? '已拒绝' : 'Rejected') : (locale === 'zh' ? '待处理' : 'Pending')}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{profile.traits.slice(0, 3).map((trait) => <Badge key={trait}>{trait}</Badge>)}</div>
      <div className="mt-4 flex gap-2">
        {onViewProfile ? <button onClick={() => void onViewProfile(profile.id)} className="flex-1 rounded-lg border border-[#D8D0C4] bg-white px-3 py-2 text-xs text-[#5A5248] hover:bg-[#F7F4EF]">{locale === 'zh' ? '查看完整档案' : 'View full profile'}</button> : null}
        {onApprove ? <button onClick={() => void onApprove(connection.id)} className="flex-1 rounded-lg bg-[#2C8A4A] px-3 py-2 text-xs font-medium text-white hover:bg-[#256F3C]">{locale === 'zh' ? '同意' : 'Approve'}</button> : null}
        {onReject ? <button onClick={() => void onReject(connection.id)} className="flex-1 rounded-lg bg-[#B5272A] px-3 py-2 text-xs font-medium text-white hover:bg-[#9E2224]">{locale === 'zh' ? '拒绝' : 'Reject'}</button> : null}
        {onCancel && connection.direction === 'outgoing' && connection.status === 'pending' ? <button onClick={() => void onCancel(connection.id)} className="flex-1 rounded-lg border border-[#D77A7A] bg-[#FFF5F5] px-3 py-2 text-xs text-[#B91C1C] hover:bg-[#FFECEC]">{locale === 'zh' ? '取消申请' : 'Cancel request'}</button> : null}
        {onOpenChat ? <button onClick={() => void onOpenChat(connection.id)} className="flex-1 rounded-lg bg-[#2C8A4A] px-3 py-2 text-xs font-medium text-white hover:bg-[#256F3C]">{locale === 'zh' ? '进入私聊' : 'Open chat'}</button> : null}
        {onRemoveConnection && connection.status === 'approved' ? <button onClick={() => onRemoveConnection(connection.id)} className="flex-1 rounded-lg bg-[#B5272A] px-3 py-2 text-xs font-medium text-white hover:bg-[#9E2224]">{locale === 'zh' ? '移除连接' : 'Remove connection'}</button> : null}
      </div>
    </div>
  );
}

function ConfirmModal({ title, description, cancelLabel, confirmLabel, onCancel, onConfirm }: { title: string; description: string; cancelLabel: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#D8D0C4] bg-white p-5 shadow-xl">
        <div className="text-base font-semibold text-[#1A1208]">{title}</div>
        <p className="mt-2 text-sm leading-7 text-[#5A5248]">{description}</p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-[#D8D0C4] bg-white px-4 py-2.5 text-sm font-medium text-[#5A5248] hover:bg-[#F7F4EF]">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-[#B5272A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#9E2224]">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatMessageTimestamp(createdAt: string, locale: Locale) {
  const date = new Date(createdAt);
  if (!Number.isFinite(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function MessageBubble({ message, mine, locale, onContextMenu }: { message: MessageRecord; mine: boolean; locale: Locale; onContextMenu: (event: MouseEvent<HTMLDivElement>, messageId: string) => void }) {
  const timestamp = formatMessageTimestamp(message.createdAt, locale);

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-7 ${mine ? 'bg-[#A87C1A] text-white' : 'border border-[#D8D0C4] bg-white text-[#1A1208]'}`}
        title={timestamp}
        onContextMenu={(event) => onContextMenu(event, message.id)}
      >
        {message.messageType === 'image' && message.imageDataUrl ? (
          <a href={message.imageDataUrl} target="_blank" rel="noreferrer">
            <img src={message.imageDataUrl} alt="chat attachment" className="mb-2 max-h-72 rounded-xl object-cover" />
          </a>
        ) : null}
        {message.text ? <div>{message.text}</div> : null}
        <div className={`mt-1 text-[10px] ${mine ? 'text-[#F3E6C7]' : 'text-[#8A8070]'} opacity-0 transition-opacity hover:opacity-100`}>
          {timestamp}
        </div>
      </div>
    </div>
  );
}
