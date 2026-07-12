import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
  strength?: number;
};

/**
 * MagneticButton — a button that subtly attracts toward the pointer and
 * glows on hover. Primary variant uses the accent gradient; ghost is glass.
 */
export default function MagneticButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  icon,
  strength = 18,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 12 });
  const sy = useSpring(y, { stiffness: 200, damping: 12 });

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set((dx / rect.width) * strength);
    y.set((dy / rect.height) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    'group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 select-none';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-accent-light to-accent-glow text-white shadow-glow hover:shadow-glow-lg'
      : 'glass text-white hover:bg-white/10';

  return (
    <motion.button
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${styles} ${className}`}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-r from-accent-light to-accent-glow" />
      )}
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        {children}
      </span>
    </motion.button>
  );
}
