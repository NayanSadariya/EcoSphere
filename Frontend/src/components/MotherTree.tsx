import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

type Props = {
  score: number;
  grade: string;
  trend: number;
};

/**
 * MotherTree — an SVG-rendered ancient tree representing the overall ESG score.
 * Glowing canopy rings pulse gently, the score floats in the center, and
 * ambient particles drift around it. The roots anchor three pillars below.
 */
export default function MotherTree({ score, grade, trend }: Props) {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 360, height: 360 }}>
      {/* Ambient glow behind tree */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(92,255,135,0.25) 0%, rgba(57,217,138,0.08) 40%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Orbiting score ring */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 360 360" className="h-full w-full">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#52B788" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2D6A4F" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#52B788" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <circle
            cx="180" cy="180" r="168"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="1.5"
            strokeDasharray="2 8"
          />
        </svg>
      </motion.div>

      {/* Counter-rotating inner ring */}
      <motion.div
        className="absolute inset-6"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 312 312" className="h-full w-full">
          <circle
            cx="156" cy="156" r="148"
            fill="none"
            stroke="rgba(92,255,135,0.15)"
            strokeWidth="1"
            strokeDasharray="40 20"
          />
        </svg>
      </motion.div>

      {/* The tree SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <defs>
          <radialGradient id="canopyGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#52B788" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#2D6A4F" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1B4332" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a2b1f" />
            <stop offset="50%" stopColor="#2d4a36" />
            <stop offset="100%" stopColor="#1a2b1f" />
          </linearGradient>
          <filter id="treeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Roots */}
        <g stroke="url(#trunkGrad)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M100 165 Q90 175 80 185" />
          <path d="M100 165 Q100 178 100 190" />
          <path d="M100 165 Q110 175 120 185" />
          <path d="M100 165 Q75 172 65 180" />
          <path d="M100 165 Q125 172 135 180" />
        </g>

        {/* Trunk */}
        <path
          d="M95 165 L93 110 L107 110 L105 165 Z"
          fill="url(#trunkGrad)"
        />
        {/* Trunk highlight */}
        <path d="M98 160 L97 115 L102 115 L103 160 Z" fill="rgba(92,255,135,0.08)" />

        {/* Branches */}
        <g stroke="url(#trunkGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M100 120 Q80 100 65 85" />
          <path d="M100 115 Q120 95 135 82" />
          <path d="M100 108 Q85 88 72 70" />
          <path d="M100 105 Q115 85 128 68" />
          <path d="M100 100 Q100 80 100 62" />
        </g>

        {/* Canopy layers — pulsing glow circles */}
        <motion.g
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          filter="url(#treeGlow)"
        >
          <circle cx="100" cy="60" r="42" fill="url(#canopyGrad)" />
          <circle cx="72" cy="78" r="28" fill="url(#canopyGrad)" />
          <circle cx="130" cy="76" r="30" fill="url(#canopyGrad)" />
          <circle cx="100" cy="85" r="25" fill="url(#canopyGrad)" opacity="0.6" />
        </motion.g>

        {/* Glowing dots on canopy (like fruit/lights) */}
        {[
          { cx: 100, cy: 38 },
          { cx: 78, cy: 55 },
          { cx: 125, cy: 52 },
          { cx: 62, cy: 72 },
          { cx: 138, cy: 70 },
          { cx: 95, cy: 75 },
          { cx: 115, cy: 82 },
        ].map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r="2.5"
            fill="#52B788"
            animate={{ opacity: [0.3, 1, 0.3], r: [2, 3.5, 2] }}
            transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.svg>

      {/* Floating score readout */}
      <motion.div
        className="absolute top-[42%] flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="font-display text-5xl font-bold gradient-text text-glow">
          <AnimatedNumber value={score} decimals={1} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full glass-accent px-2.5 py-0.5 text-xs font-semibold text-accent-glow">{grade}</span>
          <span className="text-xs text-accent-glow">+{trend}%</span>
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-widest text-mist">ESG Score</div>
      </motion.div>

      {/* Drifting particles around tree */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-accent-glow"
          style={{ left: `${50}%`, top: `${50}%` }}
          animate={{
            x: [0, Math.cos((i / 6) * Math.PI * 2) * 140, 0],
            y: [0, Math.sin((i / 6) * Math.PI * 2) * 140, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
