import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

type TreeVariant = 'environment' | 'social' | 'governance';

type Props = {
  title: string;
  subtitle: string;
  score: number;
  color: string;
  treeVariant: TreeVariant;
  onClick: () => void;
  delay?: number;
};

/**
 * TreeCard — a glassmorphic pillar card with a stylized SVG tree that
 * represents one ESG pillar (Environment, Social, Governance). On hover the
 * card lifts, the tree sways, and an accent glow blooms behind it. The score
 * counts up on mount.
 */
export default function TreeCard({ title, subtitle, score, color, treeVariant, onClick, delay = 0 }: Props) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-3xl glass p-6 text-left transition-shadow duration-500 hover:shadow-glow-lg"
      style={{ willChange: 'transform' }}
    >
      {/* Hover glow bloom */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${color}25 0%, transparent 60%)`,
        }}
      />

      {/* Top border accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-30 transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-mist">{subtitle}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
          style={{ background: `${color}18` }}
        >
          <TreeIcon variant={treeVariant} color={color} />
        </div>
      </div>

      {/* Tree visual */}
      <div className="relative mt-4 flex h-28 items-end justify-center">
        <motion.div
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <svg width="100" height="110" viewBox="0 0 100 110">
            <defs>
              <radialGradient id={`canopy-${treeVariant}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                <stop offset="70%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.1" />
              </radialGradient>
            </defs>
            {/* Trunk */}
            <path d="M48 110 L46 70 L54 70 L52 110 Z" fill="#1B4332" />
            {/* Canopy */}
            <ellipse cx="50" cy="45" rx="38" ry="34" fill={`url(#canopy-${treeVariant})`} />
            <ellipse cx="32" cy="32" rx="22" ry="18" fill={`url(#canopy-${treeVariant})`} opacity="0.8" />
            <ellipse cx="68" cy="35" rx="20" ry="17" fill={`url(#canopy-${treeVariant})`} opacity="0.8" />
            {/* Accent dots */}
            <circle cx="25" cy="20" r="2" fill={color} opacity="0.5" />
            <circle cx="75" cy="18" r="1.5" fill={color} opacity="0.4" />
          </svg>
        </motion.div>
      </div>

      {/* Score */}
      <div className="relative z-10 mt-4 flex items-end justify-between">
        <div>
          <div className="text-xs text-mist">Score</div>
          <div className="font-display text-3xl font-bold" style={{ color }}>
            <AnimatedNumber value={score} />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, score)}%` }}
              transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function TreeIcon({ variant, color }: { variant: TreeVariant; color: string }) {
  if (variant === 'environment') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8 8h3v4H7l5 8 5-8h-4V8h3z" fill={color} fillOpacity="0.3" />
      </svg>
    );
  }
  if (variant === 'social') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" fill={color} fillOpacity="0.3" />
        <circle cx="17" cy="10" r="2.5" fill={color} fillOpacity="0.3" />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
        <path d="M14 20c0-2 2-3.5 5-3.5s5 1.5 5 3.5" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M4 7l8-4 8 4M4 7v10l8 4 8-4V7" fill={color} fillOpacity="0.2" />
    </svg>
  );
}
