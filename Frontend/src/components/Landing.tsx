import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, Recycle, Trees, Wind, Droplets } from 'lucide-react';
import SplineGlobe from './SplineGlobe';
import MagneticButton from './MagneticButton';

type Props = {
  onEnter: () => void;
};

const floatingIcons = [
  { Icon: Leaf, top: '18%', left: '12%', delay: 0, dur: 8 },
  { Icon: Recycle, top: '28%', left: '82%', delay: 1.2, dur: 9 },
  { Icon: Trees, top: '68%', left: '8%', delay: 0.6, dur: 7.5 },
  { Icon: Wind, top: '72%', left: '88%', delay: 1.8, dur: 10 },
  { Icon: Droplets, top: '45%', left: '90%', delay: 0.9, dur: 8.5 },
  { Icon: Leaf, top: '82%', left: '55%', delay: 2.1, dur: 9.5 },
];

export default function Landing({ onEnter }: Props) {
  const [transitioning, setTransitioning] = useState(false);

  const handleEnter = () => {
    setTransitioning(true);
    setTimeout(onEnter, 1900);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Globe hero */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        {/* Floating recycling / eco icons */}
        {floatingIcons.map(({ Icon, top, left, delay, dur }, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute z-10 text-accent-glow/20"
            style={{ top, left }}
            animate={{ y: [0, -22, 0], rotate: [0, 8, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={28} strokeWidth={1.5} />
          </motion.div>
        ))}

        {/* Spline Globe */}
        <motion.div
          className="relative z-20 h-[60vh] w-full max-w-3xl"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={
            transitioning
              ? { scale: 4.5, opacity: 1 }
              : { scale: 1, opacity: 1 }
          }
          transition={
            transitioning
              ? { duration: 1.7, ease: [0.65, 0, 0.35, 1] }
              : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <SplineGlobe className="h-full w-full" />
        </motion.div>

        {/* Headline + content overlapping globe bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center px-6 pb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={
            transitioning
              ? { opacity: 0, y: 60, scale: 1.4 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={
            transitioning
              ? { duration: 0.6, ease: 'easeIn' }
              : { duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-accent-glow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Sparkles size={14} />
            <span>EcoSphere · Immersive ESG Platform</span>
          </motion.div>

          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            <span className="gradient-text">Where Sustainability</span>
            <br />
            <span className="text-white">Comes Alive</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist md:text-lg">
            Measure, manage and improve Environmental, Social and Governance
            performance through an immersive ESG platform.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <MagneticButton onClick={handleEnter} icon={<ArrowRight size={18} />}>
              Enter Command Center
            </MagneticButton>
            <MagneticButton variant="ghost" icon={<Sparkles size={16} />}>
              Learn More
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      {/* Transition flash overlay — fly through the globe into the forest */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Expanding green portal */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(circle at center, rgba(92,255,135,0.95) 0%, rgba(57,217,138,0.6) 30%, rgba(4,4,4,0) 70%)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 8, opacity: [0, 1, 0] }}
              transition={{ duration: 1.7, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.div
              className="absolute inset-0 bg-ink-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 1.7, times: [0, 0.4, 1] }}
            />
            <motion.div
              className="relative z-10 font-display text-sm tracking-[0.3em] text-accent-glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 1.4] }}
              transition={{ duration: 1.5, times: [0, 0.3, 1] }}
            >
              ENTERING THE FOREST
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
