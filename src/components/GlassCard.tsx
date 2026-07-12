import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

type Props = {
  children: ReactNode;
  className?: string;
  /** tilt strength in degrees */
  tilt?: number;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
};

/**
 * GlassCard — glassmorphic surface that floats and tilts toward the pointer
 * on hover, with a soft accent glow. Built on framer-motion springs.
 */
export default function GlassCard({
  children,
  className = '',
  tilt = 6,
  glow = false,
  onClick,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [tilt, -tilt]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-tilt, tilt]), { stiffness: 150, damping: 15 });
  const sy = useSpring(1, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleEnter = () => sy.set(1.015);
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
    sy.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onClick={onClick}
      style={{ rotateX: rx, rotateY: ry, scale: sy, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-3xl ${glow ? 'accent-glow' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
