import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: string;
};

/**
 * PageHeader — consistent animated header for interior pages. Eyebrow tag,
 * large display title, and optional description. Forest atmosphere preserved.
 */
export default function PageHeader({ eyebrow, title, description, icon, accent = '#52B788' }: Props) {
  return (
    <div className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-mist"
      >
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <span>{eyebrow}</span>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-3 max-w-2xl text-base leading-relaxed text-mist"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
