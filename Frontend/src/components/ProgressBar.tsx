import { motion } from 'framer-motion';

type Props = {
  value: number; // 0..100
  label?: string;
  color?: string;
  delay?: number;
  height?: number;
  showValue?: boolean;
  className?: string;
};

/**
 * ProgressBar — an animated horizontal bar that fills from 0 to `value`%.
 * Glows at the leading edge. Used across metric cards.
 */
export default function ProgressBar({
  value,
  label,
  color = '#52B788',
  delay = 0,
  height = 8,
  showValue = true,
  className = '',
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between text-xs">
          {label && <span className="text-mist">{label}</span>}
          {showValue && (
            <span className="font-mono text-white/80">{clamped.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className="relative w-full overflow-hidden rounded-full bg-white/5"
        style={{ height }}
      >
        <motion.div
          className="relative h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="absolute right-0 top-0 h-full w-8 rounded-full blur-sm"
            style={{ background: color, opacity: 0.6 }}
          />
        </motion.div>
      </div>
    </div>
  );
}
