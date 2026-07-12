import { motion } from 'framer-motion';
import {
  Scale,
  FileText,
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AnimatedNumber from '../components/AnimatedNumber';
import ProgressBar from '../components/ProgressBar';
import PageHeader from '../components/PageHeader';
import { useGovernanceReport } from '../hooks/useEsgData';
import { mockGovernanceReport } from '../api/mockData';
import { Loader2 } from 'lucide-react';
import type { ESGPolicy, Audit, ComplianceIssue } from '../types';

const severityColor: Record<string, string> = {
  High: '#F87171',
  Medium: '#FBBF24',
  Low: '#52B788',
};

const issueStatusColor: Record<string, string> = {
  Open: '#F87171',
  'In Progress': '#FBBF24',
  Resolved: '#52B788',
};

const auditStatusColor: Record<string, string> = {
  Completed: '#52B788',
  'In Progress': '#FBBF24',
  Scheduled: '#A8B3A2',
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'Completed' || status === 'Compliant' || status === 'Current')
    return <CheckCircle2 size={13} className="text-accent-glow" />;
  if (status === 'In Progress' || status === 'In Review' || status === 'Review Due')
    return <Clock size={13} className="text-yellow-400" />;
  return <XCircle size={13} className="text-mist" />;
};

/**
 * GovernanceModule — Policies, Compliance, Audits, and Issues.
 * Glass cards, not tables. Each section handcrafted with animations.
 */
export default function GovernanceModule() {
  const { data, loading } = useGovernanceReport();
  const governance = data ?? mockGovernanceReport;
  const { policies, audits, issues } = governance;
  const compliance = { score: governance.complianceScore, frameworks: governance.frameworks, trainingCompletion: governance.trainingCompletion, policyReviews: governance.policyReviews };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-20 pt-24 md:pl-24 md:pt-28">
      {loading && (
        <div className="flex justify-center pb-4"><Loader2 className="h-5 w-5 animate-spin text-accent-glow/50" /></div>
      )}
      <PageHeader
        eyebrow="Governance Pillar"
        title="The trunk holds strong"
        description="Policies, compliance, audits and issues — the structural integrity that lets the forest stand."
        icon={<Scale size={14} />}
        accent="#40916C"
      />

      {/* Compliance Score + Frameworks */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center p-7 text-center" glow delay={0.1}>
          <ShieldCheck size={28} className="text-accent-glow" />
          <div className="mt-4 font-display text-5xl font-semibold gradient-text">
            <AnimatedNumber value={compliance.score} decimals={1} />
          </div>
          <span className="mt-1 text-sm text-mist">Compliance Score</span>
          <div className="mt-4 w-full">
            <ProgressBar value={compliance.score} delay={0.3} height={8} showValue={false} />
          </div>
          <div className="mt-4 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-display text-xl text-white">
                <AnimatedNumber value={compliance.trainingCompletion} decimals={1} suffix="%" />
              </div>
              <div className="text-[10px] text-mist">Training</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-display text-xl text-white">
                <AnimatedNumber value={compliance.policyReviews} />
              </div>
              <div className="text-[10px] text-mist">Policy Reviews</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-7 lg:col-span-2" delay={0.15}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-accent-glow" />
            <h3 className="font-display text-lg font-semibold">Compliance Frameworks</h3>
          </div>
          <div className="mt-5 space-y-2">
            {compliance.frameworks.map((f: { name: string; status: string; lastAudit: string }, i: number) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-glow/10">
                  <StatusIcon status={f.status} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">{f.name}</p>
                  <p className="text-[10px] text-mist">Last audit: {f.lastAudit}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    f.status === 'Compliant'
                      ? 'bg-accent-glow/15 text-accent'
                      : 'bg-yellow-400/15 text-yellow-400'
                  }`}
                >
                  {f.status}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Policies */}
      <div className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={18} className="text-accent-glow" />
          <h3 className="font-display text-lg font-semibold">Policies</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((p: ESGPolicy, i: number) => (
            <GlassCard key={p.title} className="p-5" delay={0.2 + i * 0.07}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl glass-accent">
                  <FileText size={18} className="text-accent-glow" />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.status === 'Current'
                      ? 'bg-accent-glow/15 text-accent'
                      : 'bg-yellow-400/15 text-yellow-400'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <h4 className="mt-3 text-sm font-semibold leading-snug text-white/90">{p.title}</h4>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-mist">
                <span className="rounded-full bg-white/5 px-2 py-0.5">{p.category}</span>
                <span>Reviewed {p.reviewed}</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-mist">Coverage</span>
                  <span className="font-mono text-white/80">{(p.coverage ?? 0)}%</span>
                </div>
                <ProgressBar value={p.coverage ?? 0} delay={0.3 + i * 0.07} height={5} showValue={false} />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Audits */}
      <div className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-accent-glow" />
          <h3 className="font-display text-lg font-semibold">Audits</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audits.map((a: Audit, i: number) => (
            <GlassCard key={a.scope} className="p-5" delay={0.3 + i * 0.07}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl glass-accent">
                  <ClipboardCheck size={18} className="text-accent-glow" />
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: `${auditStatusColor[a.status]}22`,
                    color: auditStatusColor[a.status],
                  }}
                >
                  {a.status}
                </span>
              </div>
              <h4 className="mt-3 text-sm font-semibold leading-snug text-white/90">{a.scope}</h4>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-mist">
                <span className="rounded-full bg-white/5 px-2 py-0.5">{a.type}</span>
                <span>{a.date}</span>
              </div>
              {((a.findings ?? 0) > 0) && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] text-yellow-400">
                  <AlertTriangle size={11} /> {a.findings ?? 0} finding{(a.findings ?? 0) > 1 ? 's' : ''}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="mt-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent-glow" />
          <h3 className="font-display text-lg font-semibold">Issues</h3>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {issues.map((issue: ComplianceIssue, i: number) => (
            <GlassCard key={issue.title} className="p-6" delay={0.4 + i * 0.08}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white/90">{issue.title}</h4>
                  <p className="mt-1 text-xs text-mist">Assigned to {issue.assignee} · {issue.age}d open</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: `${severityColor[issue.severity]}22`, color: severityColor[issue.severity] }}
                  >
                    {issue.severity}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: `${issueStatusColor[issue.status]}22`, color: issueStatusColor[issue.status] }}
                  >
                    {issue.status}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
