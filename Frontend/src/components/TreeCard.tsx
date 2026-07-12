import { useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  subtitle: string;
  score: number;
  color: string;
  treeVariant: 'environment' | 'social' | 'governance';
  onClick: () => void;
  delay?: number;
  children?: ReactNode;
};

/**
 * TreeCard — a stylized glassmorphic tree card for each ESG pillar.
 * Gently floats, tilts on hover, with animated leaves swirling and a glowing
 * border. Each variant gets a unique mini-tree SVG.
 */
export default function TreeCard({ title, subtitle, score, color, treeVariant, onClick, delay = 0, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${mx * 8}deg) rotateX(${-my * 8}deg) translateY(-6px)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onClick={onClick}
        className="relative cursor-pointer rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-[20px] transition-all duration-300 hover:border-white/20"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Glowing border on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `0 0 40px ${color}40, inset 0 0 30px ${color}10` }}
        />

        {/* Floating animation wrapper */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5 + delay * 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Mini tree SVG */}
          <div className="flex items-center justify-center" style={{ height: 120 }}>
            <svg viewBox="0 0 100 120" className="h-full w-auto" style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}>
              {/* Trunk */}
              <path d="M48 115 L47 75 L53 75 L52 115 Z" fill="#2d4a36" />
              {/* Branches */}
              <g stroke="#2d4a36" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M50 82 Q40 70 32 60" />
                <path d="M50 78 Q60 66 68 56" />
                <path d="M50 72 Q45 60 40 50" />
                <path d="M50 70 Q55 58 60 48" />
              </g>
              {/* Canopy — different shape per variant */}
              {treeVariant === 'environment' && (
                <g>
                  <circle cx="50" cy="45" r="24" fill={color} opacity="0.15" />
                  <circle cx="36" cy="55" r="16" fill={color} opacity="0.12" />
                  <circle cx="64" cy="53" r="18" fill={color} opacity="0.12" />
                  <circle cx="50" cy="35" r="14" fill={color} opacity="0.1" />
                </g>
              )}
              {treeVariant === 'social' && (
                <g>
                  <ellipse cx="50" cy="48" rx="28" ry="22" fill={color} opacity="0.15" />
                  <ellipse cx="38" cy="40" rx="14" ry="12" fill={color} opacity="0.1" />
                  <ellipse cx="62" cy="42" rx="14" ry="12" fill={color} opacity="0.1" />
                </g>
              )}
              {treeVariant === 'governance' && (
                <g>
                  <path d="M50 20 L26 55 L74 55 Z" fill={color} opacity="0.15" />
                  <path d="M50 35 L32 62 L68 62 Z" fill={color} opacity="0.12" />
                  <circle cx="50" cy="25" r="8" fill={color} opacity="0.1" />
                </g>
              )}
              {/* Glowing dots */}
              {[
                { cx: 50, cy: 38 },
                { cx: 38, cy: 52 },
                { cx: 62, cy: 50 },
                { cx: 45, cy: 30 },
              ].map((d, i) => (
                <motion.circle
                  key={i}
                  cx={d.cx}
                  cy={d.cy}
                  r="1.8"
                  fill={color}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                />
              ))}
            </svg>
          </div>

          {/* Label + score */}
          <div className="mt-4 text-center">
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-mist">{subtitle}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-display text-3xl font-bold" style={{ color }}>
                {score}
              </span>
              <span className="text-sm text-mist">/ 100</span>
            </div>
          </div>

          {children}
        </motion.div>

        {/* Swirling leaves on hover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(5)].map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, Math.cos(angle) * 100, Math.cos(angle) * 120],
                  y: [0, Math.sin(angle) * 80, Math.sin(angle) * 100 + 20],
                  opacity: [0, 0.7, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                style={{ display: 'none' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <ellipse cx="5" cy="5" rx="5" ry="2.5" fill={color} opacity="0.6" />
                </svg>
              </motion.div>
            );
          })}
        </div>

        {/* Particle dots on hover */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`p-${i}`}
              className="absolute h-1 w-1 rounded-full"
              style={{
                background: color,
                left: `${15 + (i * 10) % 70}%`,
                top: `${20 + (i * 13) % 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + i * 0.2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
