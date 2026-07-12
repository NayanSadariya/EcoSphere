import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, X, LogOut, Pencil, Save, Mail, Building2, Briefcase, CalendarDays,
  Award, Trophy, Gift, Leaf, Users, BarChart3, Eye, MousePointerClick,
  Clock, FileText, Bell, TrendingUp, Zap, Target, Globe, Linkedin, Github,
  Phone, User as UserIcon, Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrgEsgScore, useSocialReport } from '../hooks/useEsgData';
import { mockSocialReport, mockOrgEsgScore } from '../api/mockData';
import AnimatedNumber from './AnimatedNumber';
import ProgressBar from './ProgressBar';

type Props = {
  onClose: () => void;
  onLogout: () => void;
};

const AVATAR_STORAGE_KEY = 'ecosphere_avatar';

function getStoredAvatar(): string | undefined {
  try {
    return localStorage.getItem(AVATAR_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function storeAvatar(dataUrl: string): void {
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

function clearStoredAvatar(): void {
  try {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  } catch {
    /* noop */
  }
}

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatSession(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/* ---------------------------------- Stats ---------------------------------- */

const profileStats = [
  { key: 'profileViews', label: 'Profile Views', icon: Eye, value: 1284, color: '#52B788' },
  { key: 'dashboardVisits', label: 'Dashboard Visits', icon: MousePointerClick, value: 392, color: '#40916C' },
  { key: 'totalLogins', label: 'Total Logins', icon: UserIcon, value: 87, color: '#2D6A4F' },
  { key: 'reportsViewed', label: 'Reports Viewed', icon: FileText, value: 56, color: '#52B788' },
  { key: 'achievements', label: 'Achievements', icon: Target, value: 24, color: '#40916C' },
  { key: 'notifications', label: 'Notifications', icon: Bell, value: 13, color: '#2D6A4F' },
] as const;

/* ------------------------------- Stat Card --------------------------------- */

function StatCard({
  icon: Icon, label, value, color, delay, suffix, decimals,
}: {
  icon: typeof Eye; label: string; value: number; color: string;
  delay: number; suffix?: string; decimals?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl glass p-4 transition-shadow duration-300 hover:shadow-glow"
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: color }}
      />
      <div className="relative flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}18` }}
        >
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-mist">{label}</span>
      </div>
      <div className="relative mt-2 font-display text-2xl font-bold text-white">
        <AnimatedNumber value={value} delay={delay} suffix={suffix} decimals={decimals} />
      </div>
    </motion.div>
  );
}

/* ------------------------------ Profile Field ------------------------------ */

function Field({
  icon: Icon, label, value,
}: {
  icon: typeof Mail; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
        <Icon size={14} className="text-accent-glow" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-mist">{label}</div>
        <div className="truncate text-sm text-white/90">{value}</div>
      </div>
    </div>
  );
}

function EditField({
  icon: Icon, label, value, onChange, placeholder, type = 'text',
}: {
  icon: typeof Mail; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
        <Icon size={14} className="text-accent-glow" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-mist">{label}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-sm text-white/90 outline-none placeholder:text-mist/40 focus:text-white"
        />
      </div>
    </div>
  );
}

/* =============================== Main Panel ================================ */

export default function ProfilePanel({ onClose, onLogout }: Props) {
  const { user, updateUser } = useAuth();
  const { data: esgData } = useOrgEsgScore();
  const { data: socialData } = useSocialReport();
  const esg = esgData ?? mockOrgEsgScore;
  const social = socialData ?? mockSocialReport;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(getStoredAvatar());
  const [sessionStart] = useState(() => Date.now());
  const [sessionTime, setSessionTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name ?? '',
    organization: user?.organization ?? '',
    department: user?.department ?? '',
    bio: user?.bio ?? '',
    website: user?.website ?? '',
    linkedin: user?.linkedin ?? '',
    github: user?.github ?? '',
    phone: user?.phone ?? '',
  });

  // Session timer
  useEffect(() => {
    const id = setInterval(() => setSessionTime(Date.now() - sessionStart), 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, onClose]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      storeAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      updateUser({
        name: editForm.name,
        organization: editForm.organization,
        department: editForm.department,
        bio: editForm.bio,
        website: editForm.website,
        linkedin: editForm.linkedin,
        github: editForm.github,
        phone: editForm.phone,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [editForm, updateUser]);

  const handleLogout = useCallback(() => {
    clearStoredAvatar();
    onLogout();
  }, [onLogout]);

  const profileCompletion = [
    user?.name, user?.email, user?.organization, user?.department,
    user?.bio, user?.website, user?.linkedin, user?.github, user?.phone, avatar,
  ].filter(Boolean).length;
  const completionPct = Math.round((profileCompletion / 10) * 100);

  const esgLevel = social.xp.level;
  const esgScore = esg.total_score ?? 78.4;
  const currentXp = user?.xp_total ?? social.xp.total;
  const currentRank = esg.rank ?? 'Top 8%';
  const badgesEarned = social.badges.filter((b) => b.earned).length;
  const challengesCompleted = social.challenges.length;
  const rewardsRedeemed = 3;
  const carbonSaved = 1247;
  const csrJoined = social.csrActivities.length;

  const name = user?.name ?? 'User';
  const email = user?.email ?? '—';
  const org = user?.organization ?? '—';
  const role = user?.role ?? 'member';
  const dept = user?.department ?? '—';

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[90]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{ background: 'rgba(4,4,4,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.96, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -24, scale: 0.96, filter: 'blur(8px)' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-6 z-[100] flex max-h-[calc(100vh-3rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col"
      >
        <div className="glass-strong flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl">
          {/* Header */}
          <div className="relative shrink-0 overflow-hidden p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(82,183,136,0.15) 0%, transparent 70%)' }}
            />
            <div className="relative flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">
                {editing ? 'Edit Profile' : 'Profile'}
              </h2>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-white/5 px-3 text-xs font-medium text-mist transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-light to-accent-glow px-3 text-xs font-medium text-white shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
                    >
                      {saving ? <Check size={13} /> : <Save size={13} />}
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-white/5 px-3 text-xs font-medium text-mist transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-mist transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-6 pb-6">
            {/* Profile header: avatar + name + completion */}
            <div className="flex flex-col items-center gap-3 pb-6">
              <div className="group relative">
                <motion.div
                  className="absolute -inset-1 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(82,183,136,0.3) 0%, transparent 70%)' }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/10 transition-shadow duration-300 group-hover:ring-accent-glow/40 group-hover:shadow-glow">
                  {avatar ? (
                    <img src={avatar} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-light/40 to-accent-glow/30 font-display text-2xl font-bold text-white">
                      {getInitials(name)}
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent-glow text-white shadow-glow ring-2 ring-ink-base transition-transform hover:scale-110"
                  >
                    <Camera size={14} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <h3 className="font-display text-xl font-semibold text-white">{name}</h3>
                <p className="mt-0.5 text-sm text-mist">{email}</p>
              </div>

              {/* Profile completion bar */}
              <div className="w-full max-w-xs">
                <div className="mb-1 flex items-center justify-between text-[10px] text-mist">
                  <span>Profile Completion</span>
                  <span className="font-mono text-white/80">{completionPct}%</span>
                </div>
                <ProgressBar value={completionPct} height={5} showValue={false} delay={0.3} />
              </div>
            </div>

            {/* ESG summary strip */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'ESG Level', value: esgLevel, icon: Zap, color: '#52B788' },
                { label: 'ESG Score', value: esgScore, icon: BarChart3, color: '#40916C', decimals: 1 },
                { label: 'Current XP', value: currentXp, icon: Trophy, color: '#2D6A4F' },
                { label: 'Rank', value: currentRank, icon: TrendingUp, color: '#52B788', isText: true },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="rounded-2xl bg-white/[0.03] p-3 text-center"
                  >
                    <Icon size={14} className="mx-auto mb-1.5" style={{ color: s.color }} />
                    <div className="font-display text-lg font-bold text-white">
                      {s.isText ? s.value : <AnimatedNumber value={s.value as number} decimals={s.decimals ?? 0} delay={0.2 + i * 0.06} />}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-mist">{s.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Personal info / Edit form */}
            {editing ? (
              <div className="mb-6 space-y-2.5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist">Personal Information</h4>
                <EditField icon={UserIcon} label="Name" value={editForm.name} onChange={(v) => setEditForm((p) => ({ ...p, name: v }))} placeholder="Your name" />
                <EditField icon={Building2} label="Organization" value={editForm.organization} onChange={(v) => setEditForm((p) => ({ ...p, organization: v }))} placeholder="Organization name" />
                <EditField icon={Briefcase} label="Department" value={editForm.department} onChange={(v) => setEditForm((p) => ({ ...p, department: v }))} placeholder="Department" />
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
                    <UserIcon size={14} className="text-accent-glow" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-mist">Bio</div>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us about yourself"
                      rows={2}
                      className="mt-0.5 w-full resize-none bg-transparent text-sm text-white/90 outline-none placeholder:text-mist/40 focus:text-white"
                    />
                  </div>
                </div>
                <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-mist">Contact & Social</h4>
                <EditField icon={Globe} label="Website" value={editForm.website} onChange={(v) => setEditForm((p) => ({ ...p, website: v }))} placeholder="https://…" />
                <EditField icon={Linkedin} label="LinkedIn" value={editForm.linkedin} onChange={(v) => setEditForm((p) => ({ ...p, linkedin: v }))} placeholder="https://linkedin.com/in/…" />
                <EditField icon={Github} label="GitHub" value={editForm.github} onChange={(v) => setEditForm((p) => ({ ...p, github: v }))} placeholder="https://github.com/…" />
                <EditField icon={Phone} label="Phone" value={editForm.phone} onChange={(v) => setEditForm((p) => ({ ...p, phone: v }))} placeholder="+1 (555) …" type="tel" />
              </div>
            ) : (
              <div className="mb-6 space-y-2.5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-mist">Personal Information</h4>
                <Field icon={Building2} label="Organization" value={org} />
                <Field icon={Briefcase} label="Role" value={role.charAt(0).toUpperCase() + role.slice(1)} />
                <Field icon={UserIcon} label="Department" value={dept} />
                <Field icon={CalendarDays} label="Member Since" value={formatDate(user?.memberSince)} />
                {user?.bio && (
                  <div className="rounded-2xl bg-white/[0.03] p-3">
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-mist">Bio</div>
                    <p className="text-sm leading-relaxed text-white/80">{user.bio}</p>
                  </div>
                )}
                {(user?.website || user?.linkedin || user?.github || user?.phone) && (
                  <>
                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-mist">Contact & Social</h4>
                    {user?.website && <Field icon={Globe} label="Website" value={user.website} />}
                    {user?.linkedin && <Field icon={Linkedin} label="LinkedIn" value={user.linkedin} />}
                    {user?.github && <Field icon={Github} label="GitHub" value={user.github} />}
                    {user?.phone && <Field icon={Phone} label="Phone" value={user.phone} />}
                  </>
                )}
              </div>
            )}

            {/* Activity metrics */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mist">Activity & Impact</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Badges Earned', value: badgesEarned, icon: Award, color: '#52B788' },
                  { label: 'Challenges Done', value: challengesCompleted, icon: Check, color: '#40916C' },
                  { label: 'Rewards Redeemed', value: rewardsRedeemed, icon: Gift, color: '#2D6A4F' },
                  { label: 'Carbon Saved', value: carbonSaved, icon: Leaf, color: '#52B788', suffix: ' kg' },
                  { label: 'CSR Joined', value: csrJoined, icon: Users, color: '#40916C' },
                  { label: 'Achievements', value: 24, icon: Target, color: '#2D6A4F' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="rounded-2xl bg-white/[0.03] p-3 text-center"
                    >
                      <Icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                      <div className="font-display text-xl font-bold text-white">
                        <AnimatedNumber value={s.value} delay={0.2 + i * 0.05} suffix={s.suffix ?? ''} />
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-mist">{s.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Website statistics */}
            <div className="mb-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mist">Website Statistics</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {profileStats.map((s, i) => (
                  <StatCard
                    key={s.key}
                    icon={s.icon}
                    label={s.label}
                    value={s.value}
                    color={s.color}
                    delay={0.2 + i * 0.06}
                  />
                ))}
                {/* Session time — live */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + profileStats.length * 0.06, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl glass p-4 transition-shadow duration-300 hover:shadow-glow"
                >
                  <div
                    className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10"
                    style={{ background: '#52B788' }}
                  />
                  <div className="relative flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: '#52B78818' }}>
                      <Clock size={13} style={{ color: '#52B788' }} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-mist">Session</span>
                  </div>
                  <div className="relative mt-2 font-mono text-xl font-bold text-white tabular-nums">
                    {formatSession(sessionTime)}
                  </div>
                </motion.div>

                {/* Leaderboard rank */}
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + (profileStats.length + 1) * 0.06, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl glass p-4 transition-shadow duration-300 hover:shadow-glow"
                >
                  <div
                    className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-10"
                    style={{ background: '#40916C' }}
                  />
                  <div className="relative flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: '#40916C18' }}>
                      <TrendingUp size={13} style={{ color: '#40916C' }} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-mist">Leaderboard</span>
                  </div>
                  <div className="relative mt-2 font-display text-xl font-bold text-white">{currentRank}</div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Footer: Logout */}
          <div className="shrink-0 border-t border-white/5 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
