import { motion } from 'framer-motion';
import { Cloud, TrendingDown, Zap, FileText, Building2, Target, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AnimatedNumber from '../components/AnimatedNumber';
import ProgressBar from '../components/ProgressBar';
import Sparkline from '../components/Sparkline';
import PageHeader from '../components/PageHeader';
import { useEnvironmentalReport } from '../hooks/useEsgData';
import { mockEnvironmentalReport } from '../api/mockData';

const statusColor: Record<string, string> = {
  Ahead: '#52B788',
  'On Track': '#2D6A4F',
  'At Risk': '#FBBF24',
  Published: '#52B788',
  'In Review': '#FBBF24',
  Draft: '#A8B3A2',
};

/**
 * EnvironmentModule — Carbon Emissions, Sustainability Goals, Department
 * Scores, and Environmental Reports. All glass cards, no large tables.
 * Data fetched from the Environmental Report API with mock fallback.
 */
export default function EnvironmentModule() {
  const { data, loading } = useEnvironmentalReport();
  const report = data ?? mockEnvironmentalReport;
  const { scope1, scope2, scope3, offset, net, monthly, renewable, energySources, sustainabilityGoals, departmentScores, reports } = report;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pl-24 md:pt-28">
      {loading && (
        <div className="flex justify-center pb-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent-glow/50" />
        </div>
      )}
      <PageHeader
        eyebrow="Environment Pillar"
        title="The canopy breathes"
        description="Carbon, energy, goals and departmental performance — the living systems your organization tends to."
        icon={<Cloud size={14} />}
        accent="#52B788"
      />

      {/* Carbon Emissions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <GlassCard className="p-7 lg:col-span-2" glow delay={0.1}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud size={18} className="text-accent-glow" />
              <h3 className="font-display text-lg font-semibold">Carbon Emissions</h3>
            </div>
            <span className="rounded-full glass-accent px-3 py-1 text-xs text-accent-glow">Net Negative</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Scope 1', value: scope1 },
              { label: 'Scope 2', value: scope2 },
              { label: 'Scope 3', value: scope3 },
              { label: 'Offset', value: offset },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                <div className="text-xs text-mist">{s.label}</div>
                <div className="mt-1 font-display text-2xl font-semibold text-white">
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="text-xs text-mist">tCO₂e</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-mist">Monthly emissions (ktCO₂e)</span>
              <span className="inline-flex items-center gap-1 text-accent-glow">
                <TrendingDown size={14} /> -56% YoY
              </span>
            </div>
            <Sparkline data={monthly} width={520} height={80} color="#52B788" />
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center p-7 text-center" delay={0.2}>
          <span className="text-xs uppercase tracking-wider text-mist">Net Carbon</span>
          <div className="mt-4 flex items-center gap-2">
            <AnimatedNumber value={Math.abs(net)} className="font-display text-5xl font-semibold gradient-text" />
            <span className="text-lg text-mist">tCO₂e</span>
          </div>
          <span className="mt-2 text-sm text-accent-glow">below baseline</span>
          <div className="mt-6 w-full">
            <ProgressBar label="Journey to Net-Zero" value={84} delay={0.4} />
          </div>
        </GlassCard>
      </div>

      {/* Energy Mix + Sustainability Goals */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="p-7" delay={0.25}>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Energy Mix</h3>
          </div>
          <div className="mt-4 flex items-end gap-1">
            <AnimatedNumber value={renewable} className="font-display text-4xl font-semibold text-white" />
            <span className="mb-1 text-sm text-mist">% renewable</span>
          </div>
          <div className="mt-4 space-y-2">
            {energySources.map((s, i) => (
              <ProgressBar key={s.label} label={s.label} value={s.value} color={s.color} delay={0.3 + i * 0.08} height={6} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-7" delay={0.3}>
          <div className="flex items-center gap-2">
            <Target size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Sustainability Goals</h3>
          </div>
          <div className="mt-4 space-y-3">
            {sustainabilityGoals.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">{g.title}</p>
                    <p className="mt-0.5 text-xs text-mist">
                      Target: {g.target} · Current: {g.current}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: `${statusColor[g.status]}22`, color: statusColor[g.status] }}
                  >
                    {g.status}
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.progress} delay={0.4 + i * 0.08} height={6} showValue={false} color={statusColor[g.status]} />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Department Scores + Reports */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GlassCard className="p-7" delay={0.35}>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Department Scores</h3>
          </div>
          <div className="mt-5 space-y-3">
            {departmentScores.map((d, i) => (
              <motion.div
                key={d.dept}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-white/90">{d.dept}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-accent-glow">+{d.trend}</span>
                    <span className="font-mono text-white/80">{d.score}</span>
                  </div>
                </div>
                <ProgressBar value={d.score} delay={0.45 + i * 0.08} height={6} showValue={false} />
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-7" delay={0.4}>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Environmental Reports</h3>
          </div>
          <div className="mt-5 space-y-3">
            {reports.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="group flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/8"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
                  <FileText size={15} className="text-accent-glow" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">{r.title}</p>
                  <p className="mt-0.5 text-xs text-mist">{r.framework} · {r.date}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: `${statusColor[r.status]}22`, color: statusColor[r.status] }}
                >
                  {r.status}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
