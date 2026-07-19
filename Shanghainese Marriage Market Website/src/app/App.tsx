import { useState } from "react";
import {
  MessageSquare,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Send,
  LogIn,
  Filter,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Car,
  Heart,
  Clock,
  Check,
  X,
} from "lucide-react";

type Screen =
  | "landing"
  | "create-profile"
  | "browse"
  | "profile-detail"
  | "connections"
  | "chat";

const SCREENS: { id: Screen; label: string; sublabel: string; locked?: boolean }[] = [
  { id: "landing", label: "① 首页登录", sublabel: "Landing / WeChat Login" },
  { id: "create-profile", label: "② 创建档案", sublabel: "Create Child Profile" },
  { id: "browse", label: "③ 浏览相亲角", sublabel: "Browse the Market" },
  { id: "profile-detail", label: "④ 查看详情", sublabel: "Profile Detail View" },
  { id: "connections", label: "⑤ 我的连接", sublabel: "My Connections" },
  { id: "chat", label: "⑥ 私信房间", sublabel: "Private Chat Room" },
];

// ── Shared Chinese parchment background ─────────────────────────────────────

const PARCHMENT_BG: React.CSSProperties = {
  backgroundColor: "#F7F0E6",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23C8A87A' stroke-width='0.4' opacity='0.35'%3E%3Crect x='5' y='5' width='50' height='50' rx='1'/%3E%3Crect x='12' y='12' width='36' height='36' rx='1'/%3E%3Cline x1='30' y1='5' x2='30' y2='12'/%3E%3Cline x1='30' y1='48' x2='30' y2='55'/%3E%3Cline x1='5' y1='30' x2='12' y2='30'/%3E%3Cline x1='48' y1='30' x2='55' y2='30'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23C8A87A'/%3E%3C/g%3E%3C/svg%3E")`,
};

// ── Shared wireframe primitives ──────────────────────────────────────────────

function WireBox({ className = "", label = "" }: { className?: string; label?: string }) {
  return (
    <div
      className={`bg-[#EEE9E0] border border-[#C8C0B0] flex items-center justify-center ${className}`}
    >
      {label && (
        <span className="text-[10px] font-mono text-[#8A8070] uppercase tracking-widest px-1 text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}

function Tag({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "red" | "green" | "gold" }) {
  const colors = {
    default: "bg-[#EEE9E0] text-[#5A5248] border border-[#C8C0B0]",
    red: "bg-[#FEF0F0] text-[#B5272A] border border-[#F5C4C5]",
    green: "bg-[#EBF5EE] text-[#2C8A4A] border border-[#B8DAC4]",
    gold: "bg-[#FDF6E3] text-[#9A6F1A] border border-[#E8D49A]",
  };
  return (
    <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-sm ${colors[color]}`}>
      {children}
    </span>
  );
}

function Annotation({ children, side = "right" }: { children: React.ReactNode; side?: "right" | "left" }) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 ${
        side === "right" ? "left-[calc(100%+12px)]" : "right-[calc(100%+12px)] flex-row-reverse"
      }`}
    >
      <div className="w-6 h-px bg-[#B5272A] opacity-50" />
      <span className="text-[10px] font-mono text-[#B5272A] whitespace-nowrap bg-white/80 px-1 rounded">
        {children}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#B5272A] rounded-full" />
      <span className="text-[11px] font-mono text-[#5A5248] uppercase tracking-widest">{children}</span>
    </div>
  );
}

// ── Screen 1: Landing / WeChat Login ────────────────────────────────────────

function LandingScreen() {
  return (
    <div className="min-h-full flex flex-col" style={PARCHMENT_BG}>
      {/* Nav */}
      <div className="border-b border-[#D8B87A]/40 bg-[#FAF3E8]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <div>
            <div className="font-serif text-[#1A1208] text-sm font-semibold leading-none">上海相亲角</div>
            <div className="text-[10px] font-mono text-[#7A6E62] leading-none mt-0.5">Shanghai Matchmaking Market</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag color="default">关于我们</Tag>
          <Tag color="default">隐私政策</Tag>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#D8D0C4]">
        <div className="grid grid-cols-2 min-h-[340px]">
          <div className="px-12 py-12 flex flex-col justify-center relative">
            {/* Plum blossom corner ornament */}
            <svg className="absolute top-5 right-6 opacity-10" width="70" height="70" viewBox="0 0 70 70">
              {[0,72,144,216,288].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 35 + 18 * Math.cos(rad);
                const cy = 35 + 18 * Math.sin(rad);
                return <circle key={i} cx={cx} cy={cy} r="9" fill="#B5272A"/>;
              })}
              <circle cx="35" cy="35" r="6" fill="#B5272A"/>
            </svg>
            {/* Bottom-left cloud scroll */}
            <svg className="absolute bottom-4 left-4 opacity-10" width="80" height="40" viewBox="0 0 80 40">
              <path d="M4,28 Q4,14 16,14 Q16,4 28,7 Q32,1 40,5 Q52,1 56,10 Q66,10 66,20 Q66,28 56,28 Z" fill="#9A6F1A"/>
              <path d="M20,36 Q20,26 30,26 Q30,18 40,21 Q44,16 50,20 Q58,17 60,24 Q68,24 68,32 Q68,38 60,38 Z" fill="#9A6F1A" opacity="0.6"/>
            </svg>
            <div className="text-[10px] font-mono text-[#B5272A] uppercase tracking-[0.2em] mb-4">
              Digital People's Park · 人民公园数字相亲角
            </div>
            <h1 className="font-serif text-[#1A1208] text-3xl font-semibold leading-tight mb-4">
              为您的子女<br />找到命中注定
            </h1>
            <p className="text-sm text-[#5A5248] leading-relaxed mb-8 max-w-xs">
              传承自人民公园相亲角的传统，为全球沪籍家长搭建的线上红娘平台。父母代子女发布、浏览征婚信息。
            </p>

            {/* WeChat Login CTA */}
            <div className="relative inline-flex flex-col gap-3 max-w-xs">
              <button className="flex items-center justify-center gap-3 bg-[#2C8A4A] text-white px-6 py-3.5 rounded text-sm font-medium shadow-sm hover:bg-[#247A40] transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.11.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553 6.11 6.11 0 0 0 2.5-4.618c.02-3.426-3.059-6.003-6.058-6.126zm-2.44 2.596c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                </svg>
                使用微信登录
              </button>
              <p className="text-[10px] font-mono text-[#8A8070] text-center">
                登录即同意《用户协议》及《隐私政策》
              </p>
            </div>
          </div>  {/* end left hero panel */}

          {/* Hero visual — Chinese elements */}
          <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #8B1A1A 0%, #C0392B 40%, #9A2020 100%)" }}>
            {/* Window lattice background pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="lattice" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="40" height="40" fill="none" stroke="#fff" strokeWidth="0.8"/>
                  <rect x="8" y="8" width="24" height="24" fill="none" stroke="#fff" strokeWidth="0.5"/>
                  <line x1="20" y1="0" x2="20" y2="8" stroke="#fff" strokeWidth="0.5"/>
                  <line x1="20" y1="32" x2="20" y2="40" stroke="#fff" strokeWidth="0.5"/>
                  <line x1="0" y1="20" x2="8" y2="20" stroke="#fff" strokeWidth="0.5"/>
                  <line x1="32" y1="20" x2="40" y2="20" stroke="#fff" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lattice)"/>
            </svg>

            {/* Auspicious cloud motifs */}
            <svg className="absolute top-4 left-6 opacity-20" width="60" height="30" viewBox="0 0 60 30">
              <path d="M5,20 Q5,10 15,10 Q15,2 25,5 Q28,0 35,4 Q45,0 48,8 Q55,8 55,16 Q55,22 48,22 L12,22 Q5,22 5,16 Z" fill="#FFD700"/>
            </svg>
            <svg className="absolute bottom-8 right-8 opacity-20 scale-x-[-1]" width="60" height="30" viewBox="0 0 60 30">
              <path d="M5,20 Q5,10 15,10 Q15,2 25,5 Q28,0 35,4 Q45,0 48,8 Q55,8 55,16 Q55,22 48,22 L12,22 Q5,22 5,16 Z" fill="#FFD700"/>
            </svg>

            {/* Left lantern */}
            <g style={{ position: "absolute", left: "18%", top: 0 }}>
              <svg width="54" height="120" viewBox="0 0 54 120" style={{ position: "absolute", left: "18%", top: 0 }}>
                {/* String */}
                <line x1="27" y1="0" x2="27" y2="14" stroke="#FFD700" strokeWidth="1.5"/>
                {/* Top cap */}
                <rect x="14" y="12" width="26" height="7" rx="2" fill="#8B1500"/>
                <rect x="17" y="10" width="20" height="4" rx="1" fill="#FFD700"/>
                {/* Body */}
                <ellipse cx="27" cy="58" rx="20" ry="34" fill="#CC2200"/>
                <ellipse cx="27" cy="58" rx="20" ry="34" fill="url(#lg1)" opacity="0.6"/>
                {/* Ribs */}
                {[-14,-7,0,7,14].map((x, i) => (
                  <line key={i} x1={27+x} y1="24" x2={27+x} y2="92" stroke="#8B1500" strokeWidth="0.8" opacity="0.7"/>
                ))}
                {/* 囍 character */}
                <text x="27" y="65" textAnchor="middle" fill="#FFD700" fontSize="18" fontFamily="serif" fontWeight="bold">囍</text>
                {/* Bottom cap */}
                <rect x="14" y="90" width="26" height="7" rx="2" fill="#8B1500"/>
                <rect x="17" y="95" width="20" height="4" rx="1" fill="#FFD700"/>
                {/* Tassel */}
                <line x1="27" y1="99" x2="27" y2="112" stroke="#FFD700" strokeWidth="1.5"/>
                <ellipse cx="27" cy="113" rx="3" ry="2" fill="#FFD700"/>
                {["-4","0","4"].map((dx, i) => (
                  <line key={i} x1={27 + parseInt(dx)} y1="115" x2={27 + parseInt(dx) + (i-1)*1} y2="120" stroke="#FFD700" strokeWidth="0.8"/>
                ))}
                <defs>
                  <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6644" stopOpacity="0.4"/>
                    <stop offset="50%" stopColor="#FFAA00" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#FF6644" stopOpacity="0.4"/>
                  </linearGradient>
                </defs>
              </svg>
            </g>

            {/* Right lantern (slightly larger, offset) */}
            <svg width="62" height="130" viewBox="0 0 62 130" style={{ position: "absolute", right: "14%", top: "10px" }}>
              <line x1="31" y1="0" x2="31" y2="14" stroke="#FFD700" strokeWidth="1.5"/>
              <rect x="16" y="12" width="30" height="8" rx="2" fill="#8B1500"/>
              <rect x="19" y="10" width="24" height="4" rx="1" fill="#FFD700"/>
              <ellipse cx="31" cy="65" rx="23" ry="38" fill="#CC2200"/>
              <ellipse cx="31" cy="65" rx="23" ry="38" fill="url(#lg2)" opacity="0.5"/>
              {[-16,-8,0,8,16].map((x, i) => (
                <line key={i} x1={31+x} y1="27" x2={31+x} y2="103" stroke="#8B1500" strokeWidth="0.8" opacity="0.7"/>
              ))}
              <text x="31" y="72" textAnchor="middle" fill="#FFD700" fontSize="20" fontFamily="serif" fontWeight="bold">囍</text>
              <rect x="16" y="101" width="30" height="8" rx="2" fill="#8B1500"/>
              <rect x="19" y="107" width="24" height="4" rx="1" fill="#FFD700"/>
              <line x1="31" y1="111" x2="31" y2="124" stroke="#FFD700" strokeWidth="1.5"/>
              <ellipse cx="31" cy="125" rx="3.5" ry="2.5" fill="#FFD700"/>
              {["-5","0","5"].map((dx, i) => (
                <line key={i} x1={31 + parseInt(dx)} y1="127" x2={31 + parseInt(dx) + (i-1)*1.5} y2="130" stroke="#FFD700" strokeWidth="0.8"/>
              ))}
              <defs>
                <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF8844" stopOpacity="0.4"/>
                  <stop offset="50%" stopColor="#FFCC00" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#FF8844" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
            </svg>

            {/* Central 囍 ornament */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="text-[72px] font-serif leading-none select-none" style={{ color: "#FFD700", textShadow: "0 0 30px rgba(255,180,0,0.4), 0 2px 4px rgba(0,0,0,0.4)" }}>
                  囍
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-8 h-px bg-yellow-300"/>
                  <span className="text-yellow-200 text-[10px] font-mono tracking-[0.3em]">天作之合</span>
                  <div className="w-8 h-px bg-yellow-300"/>
                </div>
              </div>
            </div>

            {/* Corner ornaments — traditional diamond knot shapes */}
            <svg className="absolute top-3 right-3 opacity-40" width="28" height="28" viewBox="0 0 28 28">
              <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#FFD700" strokeWidth="1.2"/>
              <polygon points="14,6 22,14 14,22 6,14" fill="none" stroke="#FFD700" strokeWidth="0.8"/>
              <circle cx="14" cy="14" r="2" fill="#FFD700"/>
            </svg>
            <svg className="absolute bottom-3 left-3 opacity-40" width="28" height="28" viewBox="0 0 28 28">
              <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#FFD700" strokeWidth="1.2"/>
              <polygon points="14,6 22,14 14,22 6,14" fill="none" stroke="#FFD700" strokeWidth="0.8"/>
              <circle cx="14" cy="14" r="2" fill="#FFD700"/>
            </svg>

          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-12 py-10">
        <SectionLabel>使用流程 · How It Works</SectionLabel>
        <div className="grid grid-cols-3 gap-6">
          {[
            { step: "01", title: "微信登录", en: "WeChat Login", desc: "父母使用微信账号一键授权登录，无需注册。" },
            { step: "02", title: "创建子女档案", en: "Create Child Profile", desc: "填写子女的基本信息、学历、职业、择偶要求。审核通过后方可浏览。" },
            { step: "03", title: "发出心动申请", en: "Send Connection Request", desc: "对感兴趣的档案发送连接申请，双方同意后即可私信交流。" },
          ].map((item) => (
            <div key={item.step} className="bg-[#FAF3E8]/80 border border-[#D8B87A]/50 rounded p-5 relative overflow-hidden">
              {/* Subtle coin motif watermark */}
              <svg className="absolute -bottom-3 -right-3 opacity-5" width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="22" fill="none" stroke="#9A6F1A" strokeWidth="3"/>
                <circle cx="25" cy="25" r="14" fill="none" stroke="#9A6F1A" strokeWidth="2"/>
                <rect x="21" y="21" width="8" height="8" fill="none" stroke="#9A6F1A" strokeWidth="2"/>
              </svg>
              <div className="text-[11px] font-mono text-[#B5272A] mb-2">{item.step}</div>
              <div className="font-serif text-[#1A1208] text-base font-semibold mb-1">{item.title}</div>
              <div className="text-[10px] font-mono text-[#7A6E62] mb-2">{item.en}</div>
              <p className="text-xs text-[#5A5248] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#D8B87A]/40 bg-[#FAF3E8]/60 px-12 py-4 flex justify-between items-center">
        <span className="text-[10px] font-mono text-[#8A8070]">© 2025 上海相亲角数字平台 · 沪ICP备XXXXXXXX号</span>
        <div className="flex gap-3">
          <Tag>帮助中心</Tag>
          <Tag>联系我们</Tag>
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: Create Child Profile ──────────────────────────────────────────

function CreateProfileScreen() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const formFields = {
    1: [
      {
        section: "基本信息 · Basic Info",
        fields: [
          { label: "出生年份", en: "Birth Year", type: "select", hint: "e.g. 1995", required: true },
          { label: "性别", en: "Gender", type: "radio", options: ["男 Male", "女 Female"], required: true },
          { label: "身高 (cm)", en: "Height", type: "number", hint: "e.g. 172", required: true },
          { label: "体重 (kg)", en: "Weight", type: "number", hint: "e.g. 60 · Optional", required: false },
          { label: "现居城市", en: "Current City", type: "text", hint: "e.g. 上海", required: true },
          { label: "户籍 (Hukou)", en: "Hukou Location", type: "text", hint: "e.g. 上海 / 江苏苏州", required: true },
          { label: "老家 (Hometown)", en: "Hometown", type: "text", hint: "e.g. 浙江宁波", required: false },
        ],
      },
    ],
    2: [
      {
        section: "学历与职业 · Education & Career",
        fields: [
          { label: "最高学历", en: "Highest Education", type: "select", hint: "Select...", required: true },
          { label: "毕业学校", en: "University / School", type: "text", hint: "e.g. 复旦大学 · Optional", required: false },
          { label: "所学专业", en: "Major / Field of Study", type: "text", hint: "e.g. 金融学", required: false },
          { label: "职业行业", en: "Industry", type: "select", hint: "Select...", required: true },
          { label: "工作职位", en: "Job Title", type: "text", hint: "e.g. 产品经理 · Optional", required: false },
          { label: "月收入范围", en: "Monthly Income (¥)", type: "select", hint: "Select range...", required: true },
        ],
      },
      {
        section: "房产与车辆 · Property & Vehicle",
        fields: [
          { label: "是否有房", en: "Owns Property", type: "select", hint: "Select...", required: true },
          { label: "是否有车", en: "Owns Vehicle", type: "radio", options: ["是 Yes", "否 No"], required: true },
        ],
      },
    ],
    3: [
      {
        section: "个人描述 · Parent's Note",
        fields: [
          {
            label: "孩子性格描述",
            en: "Personality (written by parent)",
            type: "textarea",
            hint: "e.g. 性格开朗活泼，孝顺，工作认真负责，喜欢烹饪和旅游...",
            required: true,
          },
          {
            label: "兴趣爱好",
            en: "Hobbies & Interests",
            type: "text",
            hint: "e.g. 摄影、爬山、读书、烘焙",
            required: false,
          },
        ],
      },
      {
        section: "择偶要求 · Partner Preferences",
        fields: [
          { label: "期望年龄范围", en: "Preferred Age Range", type: "text", hint: "e.g. 28–35岁", required: true },
          { label: "期望身高范围", en: "Preferred Height (cm)", type: "text", hint: "e.g. 170cm以上", required: false },
          { label: "最低学历要求", en: "Min. Education Level", type: "select", hint: "Select...", required: false },
          { label: "户籍偏好", en: "Hukou Preference", type: "text", hint: "e.g. 上海户口优先，不限亦可", required: false },
          { label: "其他要求", en: "Additional Preferences", type: "textarea", hint: "Any other preferences...", required: false },
        ],
      },
    ],
  };

  const currentSections = formFields[step as 1 | 2 | 3];

  return (
    <div className="min-h-full" style={PARCHMENT_BG}>
      {/* Header */}
      <div className="border-b border-[#D8B87A]/40 bg-[#FAF3E8]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <span className="font-serif text-[#1A1208] text-sm font-semibold">上海相亲角</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EEE9E0] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#5A5248]">父</span>
          </div>
          <span className="text-xs text-[#5A5248]">王妈妈</span>
        </div>
      </div>

      {/* Gate notice */}
      <div className="bg-[#FDF6E3] border-b border-[#E8D49A] px-8 py-3 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-[#9A6F1A] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[8px] font-bold">!</span>
        </div>
        <p className="text-xs text-[#7A5A10] font-mono">
          请先完成子女档案，方可浏览其他家长的征婚信息。
          <span className="ml-1 text-[#9A6F1A] font-semibold">Please complete the profile to unlock browsing.</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-serif text-[#1A1208] text-xl font-semibold">创建子女征婚档案</h2>
            <span className="text-[11px] font-mono text-[#7A6E62]">Step {step} of {totalSteps}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-[#B5272A]" : "bg-[#D8D0C4]"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {["基本信息", "学历职业", "描述与要求"].map((label, i) => (
              <span
                key={i}
                className={`text-[10px] font-mono ${i + 1 <= step ? "text-[#B5272A]" : "text-[#8A8070]"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-white border border-[#D8D0C4] rounded p-4 mb-6 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EEE9E0] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[#5A5248] text-xs">🔒</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1A1208] mb-1">隐私保护说明</div>
            <p className="text-[11px] text-[#5A5248] leading-relaxed">
              档案中<strong>不包含姓名及照片</strong>。仅在双方互相同意连接后，才可进入私信房间进一步交流。所有信息经平台审核后方可展示。
            </p>
          </div>
        </div>

        {/* Form sections */}
        {currentSections.map((section) => (
          <div key={section.section} className="mb-6">
            <SectionLabel>{section.section}</SectionLabel>
            <div className="bg-white border border-[#D8D0C4] rounded divide-y divide-[#EEE9E0]">
              {section.fields.map((field) => (
                <div key={field.label} className="px-5 py-3.5 flex items-start gap-4">
                  <div className="w-36 flex-shrink-0 pt-0.5">
                    <div className="text-xs text-[#1A1208] font-medium">
                      {field.label}
                      {field.required && <span className="text-[#B5272A] ml-0.5">*</span>}
                    </div>
                    <div className="text-[10px] font-mono text-[#8A8070]">{field.en}</div>
                  </div>
                  <div className="flex-1">
                    {field.type === "radio" ? (
                      <div className="flex gap-3 pt-1">
                        {field.options?.map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                            <div className="w-3.5 h-3.5 rounded-full border border-[#C8C0B0] bg-[#F7F4EF]" />
                            <span className="text-xs text-[#5A5248]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "textarea" ? (
                      <div className="w-full h-16 bg-[#F7F4EF] border border-[#D8D0C4] rounded px-3 py-2 flex items-start">
                        <span className="text-[11px] font-mono text-[#B0A898]">{field.hint}</span>
                      </div>
                    ) : (
                      <div className="w-full h-8 bg-[#F7F4EF] border border-[#D8D0C4] rounded px-3 flex items-center">
                        <span className="text-[11px] font-mono text-[#B0A898]">{field.hint}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-sm text-[#5A5248] disabled:opacity-30 px-4 py-2 border border-[#D8D0C4] rounded bg-white hover:bg-[#F7F4EF] transition-colors"
          >
            <ArrowLeft size={14} /> 上一步
          </button>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm border border-[#D8D0C4] rounded bg-white text-[#5A5248] hover:bg-[#F7F4EF] transition-colors">
              保存草稿
            </button>
            {step < totalSteps ? (
              <button
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#B5272A] text-white text-sm rounded hover:bg-[#9E2224] transition-colors"
              >
                下一步 <ChevronRight size={14} />
              </button>
            ) : (
              <button className="flex items-center gap-1.5 px-5 py-2 bg-[#B5272A] text-white text-sm rounded hover:bg-[#9E2224] transition-colors">
                <CheckCircle size={14} /> 提交审核
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Browse Market ──────────────────────────────────────────────────

const SAMPLE_PROFILES = [
  {
    id: 1, gender: "男", age: 30, height: 178, city: "上海", hukou: "上海", edu: "硕士", school: "同济大学",
    industry: "互联网", income: "3–5万/月", property: "有房", car: "有车",
    traits: ["阳光开朗", "孝顺", "爱运动"],
  },
  {
    id: 2, gender: "女", age: 27, height: 163, city: "上海", hukou: "浙江", edu: "本科", school: "上海财经大学",
    industry: "金融", income: "1.5–3万/月", property: "无房", car: "无车",
    traits: ["温柔体贴", "独立", "爱烹饪"],
  },
  {
    id: 3, gender: "男", age: 33, height: 175, city: "北京", hukou: "上海", edu: "博士", school: "复旦大学",
    industry: "医疗", income: "2–3万/月", property: "有房", car: "有车",
    traits: ["稳重", "博学", "顾家"],
  },
  {
    id: 4, gender: "女", age: 29, height: 167, city: "上海", hukou: "上海", edu: "本科", school: "华东师范大学",
    industry: "教育", income: "8千–1.5万/月", property: "有房", car: "无车",
    traits: ["活泼", "热情", "爱旅游"],
  },
  {
    id: 5, gender: "男", age: 28, height: 180, city: "上海", hukou: "江苏", edu: "硕士", school: "上海交通大学",
    industry: "建筑", income: "1.5–3万/月", property: "无房", car: "有车",
    traits: ["踏实", "上进", "爱音乐"],
  },
  {
    id: 6, gender: "女", age: 31, height: 161, city: "杭州", hukou: "浙江", edu: "硕士", school: "浙江大学",
    industry: "互联网", income: "3–5万/月", property: "有房", car: "有车",
    traits: ["干练", "独立", "爱阅读"],
  },
];

function ProfileCard({ profile, onClick }: { profile: typeof SAMPLE_PROFILES[0]; onClick: () => void }) {
  return (
    <div
      className="bg-white border border-[#D8D0C4] rounded hover:border-[#B5272A] hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Card header */}
      <div className="p-4 border-b border-[#EEE9E0]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif ${
                profile.gender === "男"
                  ? "bg-[#EBF5EE] text-[#2C8A4A]"
                  : "bg-[#FEF0F0] text-[#B5272A]"
              }`}
            >
              {profile.gender}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1A1208]">
                {profile.age}岁 · {profile.height}cm
              </div>
              <div className="text-[10px] font-mono text-[#7A6E62] flex items-center gap-1 mt-0.5">
                <MapPin size={9} /> {profile.city}
                {profile.hukou !== profile.city && (
                  <span className="opacity-60">· 户籍{profile.hukou}</span>
                )}
              </div>
            </div>
          </div>
          <Tag color={profile.hukou === "上海" ? "red" : "default"}>
            {profile.hukou === "上海" ? "沪籍" : "非沪"}
          </Tag>
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.traits.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <GraduationCap size={11} className="text-[#8A8070]" />
          <span className="text-[11px] text-[#5A5248]">{profile.edu} · {profile.school}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase size={11} className="text-[#8A8070]" />
          <span className="text-[11px] text-[#5A5248]">{profile.industry}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#8A8070]">¥</span>
          <span className="text-[11px] text-[#5A5248]">{profile.income}</span>
        </div>
        <div className="flex items-center gap-2">
          <Home size={11} className={profile.property === "有房" ? "text-[#2C8A4A]" : "text-[#8A8070]"} />
          <span className="text-[11px] text-[#5A5248]">{profile.property}</span>
          <Car size={11} className={profile.car === "有车" ? "text-[#2C8A4A]" : "text-[#8A8070]"} />
          <span className="text-[11px] text-[#5A5248]">{profile.car}</span>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="w-full py-2 text-xs bg-[#B5272A] text-white rounded hover:bg-[#9E2224] transition-colors flex items-center justify-center gap-1.5"
        >
          <Heart size={12} /> 发出连接申请
        </button>
      </div>
    </div>
  );
}

function BrowseScreen({ onProfileClick }: { onProfileClick: () => void }) {
  return (
    <div className="min-h-full" style={PARCHMENT_BG}>
      {/* Header */}
      <div className="border-b border-[#D8D0C4] bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <span className="font-serif text-[#1A1208] text-sm font-semibold">上海相亲角</span>
        </div>
        <nav className="flex items-center gap-1">
          {["浏览相亲角", "我的连接", "设置"].map((item, i) => (
            <button
              key={item}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${
                i === 0
                  ? "bg-[#FEF0F0] text-[#B5272A] font-medium"
                  : "text-[#5A5248] hover:bg-[#EEE9E0]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EEE9E0] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#5A5248]">父</span>
          </div>
          <span className="text-xs text-[#5A5248]">王妈妈</span>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filter bar */}
        <div className="bg-white border border-[#D8D0C4] rounded p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} className="text-[#5A5248]" />
            <span className="text-xs font-semibold text-[#1A1208]">筛选条件</span>
            <span className="text-[10px] font-mono text-[#8A8070]">Filter</span>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "性别", en: "Gender" },
              { label: "年龄范围", en: "Age Range" },
              { label: "身高", en: "Height" },
              { label: "最低学历", en: "Min. Education" },
              { label: "城市", en: "City" },
              { label: "月收入", en: "Income" },
            ].map((filter) => (
              <div key={filter.label}>
                <div className="text-[10px] font-mono text-[#7A6E62] mb-1">{filter.en}</div>
                <div className="h-7 bg-[#F7F4EF] border border-[#D8D0C4] rounded px-2 flex items-center justify-between">
                  <span className="text-[10px] text-[#B0A898]">{filter.label}</span>
                  <ChevronRight size={10} className="text-[#B0A898] rotate-90" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm font-serif font-semibold text-[#1A1208]">共找到 </span>
            <span className="text-sm font-serif font-bold text-[#B5272A]">247</span>
            <span className="text-sm font-serif font-semibold text-[#1A1208]"> 位待嫁/待娶</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7A6E62]">排序：</span>
            <Tag>最新发布</Tag>
            <Tag>年龄</Tag>
          </div>
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-3 gap-4">
          {SAMPLE_PROFILES.map((p) => (
            <ProfileCard key={p.id} profile={p} onClick={onProfileClick} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {[1, 2, 3, "...", 12].map((p, i) => (
            <button
              key={i}
              className={`w-7 h-7 text-xs rounded flex items-center justify-center ${
                p === 1 ? "bg-[#B5272A] text-white" : "bg-white border border-[#D8D0C4] text-[#5A5248]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 4: Profile Detail ─────────────────────────────────────────────────

function ProfileDetailScreen({ onBack }: { onBack: () => void }) {
  const profile = SAMPLE_PROFILES[0];
  return (
    <div className="min-h-full" style={PARCHMENT_BG}>
      {/* Header */}
      <div className="border-b border-[#D8B87A]/40 bg-[#FAF3E8]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#5A5248] hover:text-[#1A1208]">
          <ArrowLeft size={14} /> 返回浏览
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <span className="font-serif text-[#1A1208] text-sm font-semibold">上海相亲角</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          {/* Anonymous avatar */}
          <div className="bg-white border border-[#D8D0C4] rounded p-6 mb-4 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#EEE9E0] border-2 border-dashed border-[#C8C0B0] flex flex-col items-center justify-center mb-3">
              <span className="text-2xl font-serif text-[#C8C0B0]">男</span>
            </div>
            <div className="text-[10px] font-mono text-[#8A8070] text-center mb-4">
              No photo · 隐私保护
            </div>
            <div className="w-full space-y-2">
              <button className="w-full py-2.5 bg-[#B5272A] text-white text-sm rounded hover:bg-[#9E2224] transition-colors flex items-center justify-center gap-2">
                <Heart size={14} /> 发出连接申请
              </button>
              <button className="w-full py-2 bg-white border border-[#D8D0C4] text-[#5A5248] text-sm rounded hover:bg-[#F7F4EF] transition-colors flex items-center justify-center gap-2">
                <X size={13} /> 不感兴趣
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white border border-[#D8D0C4] rounded overflow-hidden">
            {[
              { icon: <MapPin size={12} />, label: "城市", value: `${profile.city} · 户籍${profile.hukou}` },
              { icon: <GraduationCap size={12} />, label: "学历", value: `${profile.edu} · ${profile.school}` },
              { icon: <Briefcase size={12} />, label: "行业", value: profile.industry },
              { icon: <span className="text-[10px] font-mono">¥</span>, label: "月收入", value: profile.income },
              { icon: <Home size={12} />, label: "房产", value: profile.property },
              { icon: <Car size={12} />, label: "车辆", value: profile.car },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#EEE9E0] last:border-0">
                <span className="text-[#8A8070] w-3">{item.icon}</span>
                <span className="text-[10px] font-mono text-[#7A6E62] w-10 flex-shrink-0">{item.label}</span>
                <span className="text-xs text-[#1A1208]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-2 space-y-4">
          {/* Title */}
          <div>
            <div className="text-[10px] font-mono text-[#B5272A] mb-1">档案编号 #2024-SH-001847</div>
            <h2 className="font-serif text-[#1A1208] text-2xl font-semibold mb-1">
              {profile.gender}，{profile.age}岁，{profile.height}cm
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Tag color="red">沪籍</Tag>
              <Tag color="green">{profile.property}</Tag>
              <Tag color="green">{profile.car}</Tag>
              {profile.traits.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>

          {/* Parent's note */}
          <div className="bg-white border border-[#D8D0C4] rounded p-5">
            <SectionLabel>父母寄语 · Parent's Note</SectionLabel>
            <p className="text-sm text-[#3A3028] leading-relaxed font-serif">
              "我家儿子在上海某互联网公司担任高级产品经理，工作三年有余，为人踏实上进，孝顺父母。平日喜欢打篮球、摄影和旅游。上海本地人，有自购房一套，无贷款。希望找到一位温柔贤淑、有上进心的伴侣，年龄在26–32岁之间，学历本科以上。"
            </p>
          </div>

          {/* Detailed info */}
          {[
            {
              title: "基本资料 · Basic Info",
              items: [
                ["出生年份", "1994年（30岁）"], ["性别", "男"], ["身高", "178 cm"], ["体重", "75 kg"],
                ["现居城市", "上海"], ["户籍", "上海"], ["老家", "上海本地"],
              ],
            },
            {
              title: "学历与职业 · Education & Career",
              items: [
                ["最高学历", "硕士研究生"], ["毕业学校", "同济大学"], ["专业", "软件工程"],
                ["职业行业", "互联网 / 科技"], ["职位", "高级产品经理"], ["月收入", "3–5万/月"],
              ],
            },
            {
              title: "择偶要求 · Partner Preferences",
              items: [
                ["期望年龄", "26–32岁"], ["期望身高", "158cm以上"], ["学历要求", "本科及以上"],
                ["户籍偏好", "上海户口优先，不限亦可"], ["其他", "希望性格开朗，家庭观念较强"],
              ],
            },
          ].map((section) => (
            <div key={section.title} className="bg-white border border-[#D8D0C4] rounded overflow-hidden">
              <div className="px-5 py-3 border-b border-[#EEE9E0] bg-[#FAFAF8]">
                <span className="text-xs font-semibold text-[#1A1208]">{section.title}</span>
              </div>
              <div className="divide-y divide-[#F0EBE1]">
                {section.items.map(([label, value]) => (
                  <div key={label} className="flex px-5 py-2.5">
                    <span className="text-[11px] font-mono text-[#7A6E62] w-24 flex-shrink-0">{label}</span>
                    <span className="text-xs text-[#1A1208]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 5: Connections ────────────────────────────────────────────────────

function ConnectionsScreen({ onChatClick }: { onChatClick: () => void }) {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "connected">("received");

  const received = [
    { id: 1, summary: "女，28岁，168cm，上海，硕士，金融行业，3–5万/月", hukou: "上海", time: "2小时前" },
    { id: 2, summary: "女，26岁，162cm，上海，本科，教育行业，8千–1.5万/月", hukou: "浙江", time: "1天前" },
  ];
  const sent = [
    { id: 3, summary: "女，29岁，165cm，上海，硕士，互联网，3–5万/月", status: "待回复", time: "3小时前" },
    { id: 4, summary: "女，31岁，170cm，杭州，博士，科研，2–3万/月", status: "已拒绝", time: "2天前" },
  ];
  const connected = [
    { id: 5, summary: "女，27岁，163cm，上海，本科，金融，1.5–3万/月", lastMsg: "您好，我们家孩子也很喜欢旅游...", time: "刚刚" },
  ];

  return (
    <div className="min-h-full" style={PARCHMENT_BG}>
      {/* Header */}
      <div className="border-b border-[#D8B87A]/40 bg-[#FAF3E8]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <span className="font-serif text-[#1A1208] text-sm font-semibold">上海相亲角</span>
        </div>
        <nav className="flex items-center gap-1">
          {["浏览相亲角", "我的连接", "设置"].map((item, i) => (
            <button
              key={item}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${
                i === 1
                  ? "bg-[#FEF0F0] text-[#B5272A] font-medium"
                  : "text-[#5A5248] hover:bg-[#EEE9E0]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#EEE9E0] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#5A5248]">父</span>
          </div>
          <span className="text-xs text-[#5A5248]">王妈妈</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="font-serif text-[#1A1208] text-xl font-semibold mb-6">我的连接申请</h2>

        {/* Tabs */}
        <div className="flex border border-[#D8D0C4] rounded overflow-hidden mb-6 bg-white">
          {[
            { id: "received" as const, label: "收到的申请", count: received.length },
            { id: "sent" as const, label: "我发出的申请", count: sent.length },
            { id: "connected" as const, label: "已连接", count: connected.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 transition-colors border-r border-[#D8D0C4] last:border-0 ${
                activeTab === tab.id
                  ? "bg-[#B5272A] text-white"
                  : "text-[#5A5248] hover:bg-[#F7F4EF]"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#EEE9E0] text-[#5A5248]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Received requests */}
        {activeTab === "received" && (
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-[#7A6E62] mb-4">
              以下家长对您的子女档案感兴趣，请决定是否同意连接。同意后双方可进入私信房间。
            </div>
            {received.map((req) => (
              <div key={req.id} className="bg-white border border-[#D8D0C4] rounded p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEE9E0] flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-sm text-[#5A5248]">女</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1A1208] mb-1">{req.summary}</div>
                  <div className="flex gap-2">
                    <Tag color={req.hukou === "上海" ? "red" : "default"}>
                      户籍{req.hukou}
                    </Tag>
                  </div>
                  <div className="text-[10px] font-mono text-[#8A8070] mt-1.5 flex items-center gap-1">
                    <Clock size={9} /> {req.time}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-[#2C8A4A] text-white text-xs rounded hover:bg-[#247A40] transition-colors">
                    <Check size={12} /> 同意
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D8D0C4] text-[#5A5248] text-xs rounded hover:bg-[#F7F4EF] transition-colors">
                    <X size={12} /> 拒绝
  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sent requests */}
        {activeTab === "sent" && (
          <div className="space-y-3">
            {sent.map((req) => (
              <div key={req.id} className="bg-white border border-[#D8D0C4] rounded p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEE9E0] flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-sm text-[#5A5248]">女</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1A1208] mb-1">{req.summary}</div>
                  <div className="text-[10px] font-mono text-[#8A8070] mt-1 flex items-center gap-1">
                    <Clock size={9} /> {req.time}
                  </div>
                </div>
                <Tag color={req.status === "待回复" ? "gold" : "default"}>
                  {req.status}
                </Tag>
              </div>
            ))}
          </div>
        )}

        {/* Connected */}
        {activeTab === "connected" && (
          <div className="space-y-3">
            {connected.map((conn) => (
              <div key={conn.id} className="bg-white border border-[#D8D0C4] rounded p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EEE9E0] flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-sm text-[#5A5248]">女</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1A1208] mb-1">{conn.summary}</div>
                  <div className="text-xs text-[#7A6E62] italic truncate">"{conn.lastMsg}"</div>
                  <div className="text-[10px] font-mono text-[#8A8070] mt-1 flex items-center gap-1">
                    <Clock size={9} /> {conn.time}
                  </div>
                </div>
                <button
                  onClick={onChatClick}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#B5272A] text-white text-xs rounded hover:bg-[#9E2224] transition-colors flex-shrink-0"
                >
                  <MessageSquare size={12} /> 进入私信
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screen 6: Private Chat Room ──────────────────────────────────────────────

const CHAT_MESSAGES = [
  { from: "them", text: "您好！看到贵家公子的档案，我们很感兴趣。我女儿在金融行业工作，也很孝顺。", time: "14:03" },
  { from: "me", text: "您好！我也看到令媛的档案了，条件很好。请问她目前在哪家公司任职呢？", time: "14:07" },
  { from: "them", text: "她在某银行的私人银行部门，从事财富管理工作已有三年了。您家孩子平时有什么爱好呢？", time: "14:10" },
  { from: "me", text: "他喜欢打篮球和摄影，周末偶尔也会做饭。请问令媛是否有上海户口？", time: "14:15" },
  { from: "them", text: "有的，我们全家都是上海户口。如果双方都有意向，是否可以安排孩子们见个面？", time: "14:18" },
];

function ChatScreen() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-full flex flex-col" style={PARCHMENT_BG}>
      {/* Header */}
      <div className="border-b border-[#D8B87A]/40 bg-[#FAF3E8]/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B5272A] rounded-sm flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">缘</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1A1208]">私信房间 · Private Room</div>
            <div className="text-[10px] font-mono text-[#7A6E62]">#2024-SH-001847 × #2024-SH-002319</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag color="green">已连接</Tag>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100% - 65px)" }}>
        {/* Profile sidebar */}
        <div className="w-56 border-r border-[#D8D0C4] bg-white flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <div className="text-[10px] font-mono text-[#7A6E62] uppercase tracking-wider mb-3">对方档案</div>

            {/* Anonymous profile */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-[#EEE9E0] border-2 border-dashed border-[#C8C0B0] flex items-center justify-center mb-2">
                <span className="font-serif text-lg text-[#C8C0B0]">女</span>
              </div>
              <div className="text-[10px] font-mono text-[#8A8070]">No photo · 隐私保护</div>
            </div>

            {[
              ["年龄", "27岁"], ["身高", "163cm"], ["城市", "上海"],
              ["户籍", "上海"], ["学历", "本科"], ["行业", "金融"],
              ["收入", "1.5–3万/月"], ["房产", "无房"], ["车辆", "无车"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-[#F0EBE1] last:border-0">
                <span className="text-[10px] font-mono text-[#7A6E62]">{label}</span>
                <span className="text-[10px] text-[#1A1208]">{value}</span>
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-[#D8D0C4]">
              <div className="text-[10px] font-mono text-[#7A6E62] mb-2">父母寄语</div>
              <p className="text-[11px] text-[#5A5248] leading-relaxed italic">
                "女儿温柔体贴，独立上进，爱好烹饪旅游..."
              </p>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Privacy notice */}
          <div className="bg-[#FDF6E3] border-b border-[#E8D49A] px-6 py-2 flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-mono text-[#7A5A10]">
              🔒 本对话仅限双方家长可见，平台不会向第三方披露。请勿在聊天中透露子女姓名及联系方式，直至双方决定线下见面。
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-mono text-[#8A8070] bg-[#EEE9E0] px-3 py-1 rounded-full">
                连接成功 · 今天 14:00
              </span>
            </div>

            {CHAT_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.from === "me" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="w-7 h-7 rounded-full bg-[#EEE9E0] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-serif text-[#5A5248]">{msg.from === "me" ? "父" : "母"}</span>
                </div>
                <div className={`max-w-xs ${msg.from === "me" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-lg text-xs leading-relaxed ${
                      msg.from === "me"
                        ? "bg-[#B5272A] text-white rounded-br-sm"
                        : "bg-white border border-[#D8D0C4] text-[#1A1208] rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-mono text-[#8A8070] mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#D8D0C4] bg-white px-6 py-4 flex items-center gap-3 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 bg-[#F7F4EF] border border-[#D8D0C4] rounded px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#B0A898] outline-none focus:border-[#B5272A] transition-colors"
            />
            <button className="px-5 py-2.5 bg-[#B5272A] text-white rounded text-sm hover:bg-[#9E2224] transition-colors flex items-center gap-2">
              <Send size={13} /> 发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>("landing");

  const renderScreen = () => {
    switch (activeScreen) {
      case "landing":
        return <LandingScreen />;
      case "create-profile":
        return <CreateProfileScreen />;
      case "browse":
        return <BrowseScreen onProfileClick={() => setActiveScreen("profile-detail")} />;
      case "profile-detail":
        return <ProfileDetailScreen onBack={() => setActiveScreen("browse")} />;
      case "connections":
        return <ConnectionsScreen onChatClick={() => setActiveScreen("chat")} />;
      case "chat":
        return <ChatScreen />;
    }
  };

  return (
    <div className="size-full flex overflow-hidden" style={{
      fontFamily: "'Noto Sans SC', sans-serif",
      backgroundColor: "#2A2218",
    }}>
      {/* Wireframe navigator sidebar */}
      <div className="w-52 flex-shrink-0 bg-[#1A1208] flex flex-col overflow-y-auto">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="text-[10px] font-mono text-[#C8A878] uppercase tracking-[0.2em] mb-1">Wireframes</div>
          <div className="text-xs font-mono text-white/50">上海相亲角 Platform</div>
        </div>

        <nav className="flex-1 py-3">
          {SCREENS.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                activeScreen === screen.id
                  ? "border-[#B5272A] bg-[#B5272A]/10"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <div
                className={`text-[11px] font-medium leading-tight mb-0.5 ${
                  activeScreen === screen.id ? "text-[#F5C4C5]" : "text-white/70"
                }`}
              >
                {screen.label}
              </div>
              <div className="text-[9px] font-mono text-white/35 leading-tight">{screen.sublabel}</div>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-[9px] font-mono text-white/30 leading-relaxed">
            Click screens to navigate the wireframe prototype
          </div>
        </div>
      </div>

      {/* Screen canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas label bar */}
        <div className="bg-[#231C12] border-b border-white/10 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="text-[11px] font-mono text-white/40">
              {SCREENS.find((s) => s.id === activeScreen)?.label} —{" "}
              {SCREENS.find((s) => s.id === activeScreen)?.sublabel}
            </div>
          </div>
          <div className="flex gap-2">
            {SCREENS.map((screen, i) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(screen.id)}
                className={`w-5 h-5 rounded text-[9px] font-mono transition-colors ${
                  activeScreen === screen.id
                    ? "bg-[#B5272A] text-white"
                    : "bg-white/10 text-white/40 hover:bg-white/20"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Screen content */}
        <div className="flex-1 overflow-auto" style={PARCHMENT_BG}>{renderScreen()}</div>
      </div>
    </div>
  );
}
