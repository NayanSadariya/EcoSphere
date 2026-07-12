import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  Sprout,
  Leaf,
  Shield,
  Zap,
  Droplet,
  Award,
  TreePine,
  Trophy,
  Target,
  UserCheck,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AnimatedNumber from '../components/AnimatedNumber';
import ProgressBar from '../components/ProgressBar';
import Sparkline from '../components/Sparkline';
import PageHeader from '../components/PageHeader';
import { useSocialReport } from '../hooks/useEsgData';
import { mockSocialReport } from '../api/mockData';
import { Loader2 } from 'lucide-react';
import type { Challenge, Badge } from '../types';

const badgeIcons: Record<string, typeof Sprout> = {
  sprout: Sprout,
  leaf: Leaf,
  shield: Shield,
  zap: Zap,
  droplet: Droplet,
  award: Award,
  tree: TreePine,
  users: Users,
};

const rarityColor: Record<string, string> = {
  Common: '#A8B3A2',
  Rare: '#2D6A4F',
  Epic: '#52B788',
  Legendary: '#FBBF24',
};

const rankGradient = ['#52B788', '#2D6A4F', '#40916C'];

/**
 * SocialModule — CSR Activities, Employee Participation, Challenges, XP,
 * Badges, and a gamified Leaderboard. All glass cards, no tables.
 */
export default function SocialModule() {
  const { data, loading } = useSocialReport();
  const social = data ?? mockSocialReport;
  const { csrActivities, participation, challenges, xp, badges, leaderboard } = social;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pl-24 md:pt-28">
      {loading && (
        <div className="flex justify-center pb-4"><Loader2 className="h-5 w-5 animate-spin text-accent-glow/50" /></div>
      )}
      <PageHeader
        eyebrow="Social Pillar"
        title="The roots run deep"
        description="CSR activities, employee participation, challenges, badges and leaderboard — the human ecosystem your organization nourishes."
        icon={<Users size={14} />}
        accent="#2D6A4F"
      />

      {/* XP + Participation */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* XP Card */}
        <GlassCard className="p-7" glow delay={0.1}>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Experience</h3>
          </div>
          <div className="mt-5">
            <div className="text-xs text-mist">Total XP</div>
            <div className="font-display text-4xl font-bold text-white">
              <AnimatedNumber value={xp.total} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full glass-accent px-2.5 py-0.5 text-xs font-semibold text-accent-glow">
                Level {xp.level}
              </span>
              <span className="text-xs text-mist">{xp.rank}</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-mist">Progress to Level {xp.level + 1}</span>
              <span className="font-mono text-white/80">
                {xp.total.toLocaleString()} / {xp.nextLevel.toLocaleString()}
              </span>
            </div>
            <ProgressBar value={(xp.total / xp.nextLevel) * 100} delay={0.3} height={8} showValue={false} />
          </div>
          <div className="mt-4 rounded-2xl bg-white/5 p-3 text-center">
            <div className="font-display text-2xl font-semibold text-accent-glow">
              +<AnimatedNumber value={xp.weekly} />
            </div>
            <div className="text-xs text-mist">XP earned this week</div>
          </div>
        </GlassCard>

        {/* Participation */}
        <GlassCard className="p-7 lg:col-span-2" delay={0.15}>
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Employee Participation</h3>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { label: 'Participation Rate', value: participation.rate, suffix: '%' },
              { label: 'Active Participants', value: participation.activeParticipants, suffix: '' },
              { label: 'Total Employees', value: participation.totalEmployees, suffix: '' },
              { label: 'Avg Hours / Employee', value: participation.avgHoursPerEmployee, suffix: '', decimals: 1 },
              { label: 'CSR Programs', value: csrActivities.length, suffix: '' },
              { label: 'Total Volunteer Hrs', value: csrActivities.reduce((s, a) => s + a.hours, 0), suffix: '' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                <div className="text-xs text-mist">{m.label}</div>
                <div className="mt-1 font-display text-2xl font-semibold text-white">
                  <AnimatedNumber value={m.value} decimals={m.decimals ?? 0} />
                  {m.suffix && <span className="text-sm text-mist"> {m.suffix}</span>}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs text-mist">Participation trend (8 months)</div>
            <Sparkline data={participation.trend} width={520} height={60} color="#2D6A4F" />
          </div>
        </GlassCard>
      </div>

      {/* CSR Activities */}
      <div className="mt-5">
        <h3 className="mb-4 font-display text-lg font-semibold">CSR Activities</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {csrActivities.map((a: { title: string; participants: number; hours: number; impact: string; status: string }, i: number) => (
            <GlassCard key={a.title} className="p-6" delay={0.25 + i * 0.08}>
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl glass-accent">
                  <Heart size={20} className="text-accent-glow" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    a.status === 'Active'
                      ? 'bg-accent-glow/15 text-accent'
                      : 'bg-white/8 text-mist'
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <h4 className="mt-4 font-display text-base font-semibold">{a.title}</h4>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="font-display text-lg font-semibold text-white">
                    <AnimatedNumber value={a.participants} />
                  </div>
                  <div className="text-[10px] text-mist">Participants</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="font-display text-lg font-semibold text-white">
                    <AnimatedNumber value={a.hours} />
                  </div>
                  <div className="text-[10px] text-mist">Hours</div>
                </div>
                <div className="rounded-xl bg-white/5 p-2">
                  <div className="text-xs font-semibold text-accent-glow">{a.impact}</div>
                  <div className="text-[10px] text-mist">Impact</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-accent-glow" />
          <h3 className="font-display text-lg font-semibold">Active Challenges</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {challenges.map((c: Challenge, i: number) => (
            <GlassCard key={c.title} className="p-6" delay={0.3 + i * 0.08}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-display text-base font-semibold">{c.title}</h4>
                  <p className="mt-1 text-xs text-mist">{c.description}</p>
                </div>
                <span className="rounded-full bg-accent-glow/15 px-2 py-0.5 text-xs font-semibold text-accent-glow">
                  +{c.xp_value} XP
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-mist">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {(c.participants ?? 0).toLocaleString()}
                </span>
                <span>{Math.max(1, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000))} days left</span>
              </div>
              <div className="mt-4">
                <ProgressBar value={c.progress ?? 0} delay={0.4 + i * 0.1} height={7} showValue={false} />
                <div className="mt-1 text-right text-[10px] text-mist">{c.progress ?? 0}% complete</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Badges + Leaderboard */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Badges */}
        <GlassCard className="p-7" delay={0.35}>
          <div className="flex items-center gap-2">
            <Award size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Badges</h3>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {badges.map((b: Badge, i: number) => {
              const Icon = badgeIcons[b.icon ?? 'award'] ?? Award;
              return (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-colors ${
                    b.earned ? 'bg-white/5 hover:bg-white/8' : 'bg-white/[0.02] opacity-40 grayscale'
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${rarityColor[b.rarity ?? 'Common']}15`,
                      boxShadow: b.earned ? `0 0 12px ${rarityColor[b.rarity ?? 'Common']}30` : 'none',
                    }}
                  >
                    <Icon size={18} style={{ color: b.earned ? rarityColor[b.rarity ?? 'Common'] : '#A8B3A2' }} />
                  </div>
                  <span className="text-[10px] leading-tight text-white/90">{b.name}</span>
                  <span
                    className="text-[8px] uppercase tracking-wide"
                    style={{ color: rarityColor[b.rarity ?? 'Common'] }}
                  >
                    {b.rarity}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Leaderboard */}
        <GlassCard className="p-7" delay={0.4}>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Leaderboard</h3>
          </div>
          <div className="mt-5 space-y-2">
            {leaderboard.map((p: { rank: number; name: string; dept: string; xp: number; avatar: string }, i: number) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/8"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: i < 3 ? `${rankGradient[i]}25` : 'rgba(255,255,255,0.08)',
                    color: i < 3 ? rankGradient[i] : '#A8B3A2',
                  }}
                >
                  {p.rank}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-light/30 to-accent-glow/20 text-xs font-semibold text-white ring-1 ring-white/10">
                  {p.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">{p.name}</p>
                  <p className="text-[10px] text-mist">{p.dept}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-accent-glow">{p.xp.toLocaleString()}</div>
                  <div className="text-[10px] text-mist">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
