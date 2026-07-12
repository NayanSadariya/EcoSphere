import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Sparkles, Leaf, Users, Scale, Globe } from 'lucide-react';
import PageHeader from './PageHeader';
import MagneticButton from './MagneticButton';

type Props = {
  onBack: () => void;
};

const features = [
  {
    icon: Leaf,
    title: 'Environmental Tracking',
    description: 'Monitor carbon emissions, energy usage, and sustainability goals in real time.',
    color: '#52B788',
  },
  {
    icon: Users,
    title: 'Social Impact',
    description: 'Engage teams through CSR activities, challenges, badges, and community programs.',
    color: '#2D6A4F',
  },
  {
    icon: Scale,
    title: 'Governance & Compliance',
    description: 'Stay ahead with policy management, audit tracking, and ethical governance tools.',
    color: '#40916C',
  },
  {
    icon: Globe,
    title: 'Immersive Experience',
    description: 'Explore ESG performance through a living, interactive forest ecosystem.',
    color: '#52B788',
  },
];

export default function LearnMorePage({ onBack }: Props) {
  return (
    <div className="relative mx-auto min-h-screen max-w-4xl px-6 pb-20 pt-16">
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Home
      </motion.button>

      <PageHeader
        eyebrow="About EcoSphere"
        title="Sustainability, Reimagined"
        description="EcoSphere is an immersive ESG platform that helps organizations measure, manage, and improve their Environmental, Social, and Governance performance — all through a living digital ecosystem."
        icon={<Sparkles size={12} />}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              className="glass rounded-2xl p-5"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${f.color}18` }}
              >
                <Icon size={18} style={{ color: f.color }} />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">{f.description}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-12 glass-strong rounded-3xl p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-light/30 to-accent-glow/20">
            <span className="font-display text-2xl font-bold text-accent-glow">ZL</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white">Created by Zero Labs</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-mist">
            Zero Labs is a creative technology studio building immersive digital experiences
            that bridge sustainability and innovation. EcoSphere is their flagship ESG platform,
            designed to make environmental responsibility tangible and engaging.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-5 py-3">
            <Mail size={16} className="text-accent-glow" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-mist">Contact</div>
              <a
                href="mailto:zerolab.builds@gmail.com"
                className="text-sm font-medium text-white/90 transition-colors hover:text-accent-glow"
              >
                zerolab.builds@gmail.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 flex justify-center"
      >
        <MagneticButton onClick={onBack} icon={<ArrowLeft size={16} />}>
          Return to Home
        </MagneticButton>
      </motion.div>
    </div>
  );
}
