import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Leaf,
  Users,
  Scale,
  Home,
} from 'lucide-react';

export type PageId = 'landing' | 'overview' | 'environmental' | 'social' | 'governance';

const items: { id: PageId; icon: typeof Leaf; label: string }[] = [
  { id: 'overview', icon: LayoutDashboard, label: 'Command Center' },
  { id: 'environmental', icon: Leaf, label: 'Environment' },
  { id: 'social', icon: Users, label: 'Social' },
  { id: 'governance', icon: Scale, label: 'Governance' },
  { id: 'landing', icon: Home, label: 'Exit Forest' },
];

type Props = {
  current: PageId;
  onNavigate: (page: PageId) => void;
};

/**
 * FloatingNav — a vertical glass nav docked left-center. Icons only by
 * default; labels expand into view on hover. Active item glows accent.
 */
export default function FloatingNav({ current, onNavigate }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-5 top-1/2 z-50 -translate-y-1/2"
    >
      <div className="glass rounded-full p-2 flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <div
              key={item.id}
              className="relative flex items-center"
              onPointerEnter={() => setHovered(item.id)}
              onPointerLeave={() => setHovered(null)}
            >
              <AnimatePresence>
                {hovered === item.id && (
                  <motion.span
                    initial={{ opacity: 0, x: -8, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -8, width: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="mr-2 whitespace-nowrap rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                onClick={() => onNavigate(item.id)}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                  active
                    ? 'text-white'
                    : 'text-mist hover:text-white'
                }`}
                aria-label={item.label}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-light to-accent-glow"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
              </button>
            </div>
          );
        })}
      </div>
    </motion.nav>
  );
}
