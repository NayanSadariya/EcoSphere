import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Sun,
  Award,
  Scale,
  Cloud,
  Users,
  Shield,
  Calendar,
  TreePine,
  Heart,
  Shirt,
  Utensils,
  Trophy,
  Gift,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useRewards, useSocialReport } from '../hooks/useEsgData';
import { useAuth } from '../contexts/AuthContext';
import { mockSocialReport, mockRewards } from '../api/mockData';

const iconMap: Record<string, typeof Sun> = {
  sun: Sun,
  award: Award,
  scale: Scale,
  cloud: Cloud,
  users: Users,
  shield: Shield,
  calendar: Calendar,
  tree: TreePine,
  heart: Heart,
  shirt: Shirt,
  utensils: Utensils,
};

const tagColor: Record<string, string> = {
  Environment: '#52B788',
  Social: '#2D6A4F',
  Governance: '#40916C',
};

type Tab = 'activity' | 'challenges' | 'rewards';

type Props = {
  onLogout: () => void;
};

/**
 * SidePanel — right-side floating glass panel with tabs for Recent Activity,
 * Upcoming Challenges, and the Reward Store. Each section uses floating glass
 * cards with stagger animations.
 */
export default function SidePanel({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('activity');
  const { user } = useAuth();
  const { data: rewardsData } = useRewards();
  const { data: socialData } = useSocialReport();
  const social = socialData ?? mockSocialReport;
  const rewardStore = rewardsData ?? mockRewards;
  const recentActivities = [
    { title: 'Solar farm expansion approved', time: '2h ago', tag: 'Environment', icon: 'sun' },
    { title: 'Maya Chen earned Eco Warrior badge', time: '3h ago', tag: 'Social', icon: 'award' },
    { title: 'Board ethics review completed', time: '5h ago', tag: 'Governance', icon: 'scale' },
    { title: 'Scope 3 emissions audit finalized', time: '8h ago', tag: 'Environment', icon: 'cloud' },
    { title: 'Community grant program launched', time: '1d ago', tag: 'Social', icon: 'users' },
    { title: 'GDPR compliance audit passed', time: '1d ago', tag: 'Governance', icon: 'shield' },
  ];
  const upcomingChallenges = social.challenges.map((c) => ({ title: c.title, daysLeft: Math.max(1, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000)), xp: c.xp_value, participants: c.participants ?? 0 }));

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'GU';

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-4 top-20 z-30 hidden w-72 lg:block lg:w-80"
    >
      <div className="glass rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-glow/15 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name ?? 'Guest User'}</p>
              <p className="truncate text-[11px] text-mist">{user?.organization ?? 'EcoSphere User'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {[
            { id: 'activity' as Tab, label: 'Activity', icon: Activity },
            { id: 'challenges' as Tab, label: 'Challenges', icon: Trophy },
            { id: 'rewards' as Tab, label: 'Rewards', icon: Gift },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-colors ${
                  active ? 'text-white' : 'text-mist hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="side-tab"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-light to-accent-glow"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon size={13} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel content */}
        <div className="mt-4 max-h-[calc(100vh-180px)] space-y-3 overflow-y-auto no-scrollbar pr-1">
          <AnimatePresence mode="wait">
            {tab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {recentActivities.map((a, i) => {
                  const Icon = iconMap[a.icon] ?? Activity;
                  return (
                    <motion.div
                      key={a.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group flex items-start gap-3 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/8"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${tagColor[a.tag]}15` }}
                      >
                        <Icon size={14} style={{ color: tagColor[a.tag] }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs leading-snug text-white/90">{a.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-mist">
                          <span>{a.time}</span>
                          <span
                            className="rounded-full px-1.5 py-0.5"
                            style={{ background: `${tagColor[a.tag]}15`, color: tagColor[a.tag] }}
                          >
                            {a.tag}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {tab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* XP summary */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl glass-accent p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-mist">Your XP</span>
                    <span className="rounded-full bg-accent-glow/20 px-2 py-0.5 text-[10px] font-medium text-accent-glow">
                      {social.xp.rank}
                    </span>
                  </div>
                  <div className="mt-1.5 font-display text-2xl font-bold text-white">
                    {social.xp.total.toLocaleString()}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-light to-accent-glow"
                      initial={{ width: 0 }}
                      animate={{ width: `${(social.xp.total / social.xp.nextLevel) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-mist">
                    Level {social.xp.level} · {social.xp.nextLevel.toLocaleString()} XP to next
                  </div>
                </motion.div>

                {/* Challenge cards */}
                {upcomingChallenges.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl bg-white/5 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white/90">{c.title}</p>
                        <p className="mt-0.5 text-[10px] text-mist">
                          {c.participants.toLocaleString()} joined · {c.daysLeft}d left
                        </p>
                      </div>
                      <span className="rounded-full bg-accent-glow/15 px-2 py-0.5 text-[10px] font-semibold text-accent-glow">
                        +{c.xp} XP
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-accent-glow"
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(100, Math.max(0, social.challenges[Number(i)]?.progress ?? 60))) as number}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {tab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {rewardStore.map((r, i) => {
                  const Icon = iconMap[r.icon ?? 'gift'] ?? Gift;
                  return (
                    <motion.button
                      key={r.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!r.available}
                      className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
                        r.available ? 'bg-white/5 hover:bg-white/8' : 'bg-white/[0.02] opacity-50'
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
                        <Icon size={15} className="text-accent-glow" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white/90">{r.name}</p>
                        <p className="text-[10px] text-accent-glow">{r.points_required.toLocaleString()} XP</p>
                      </div>
                      <ChevronRight size={14} className="text-mist transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
