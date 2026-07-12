import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User } from 'lucide-react';
import { useNotifications } from '../hooks/useEsgData';
import { mockNotifications } from '../api/mockData';

type Props = {
  onLogoClick: () => void;
};

/**
 * TopBar — a floating transparent glass bar with search, notifications, and
 * profile. Notifications expand into a glass dropdown on click.
 */
export default function TopBar({ onLogoClick }: Props) {
  const [showNotif, setShowNotif] = useState(false);
  const [query, setQuery] = useState('');
  const { data: notifData } = useNotifications();
  const notifications = notifData ?? mockNotifications;

  const typeColor: Record<string, string> = {
    warning: '#FBBF24',
    info: '#52B788',
    urgent: '#F87171',
    success: '#2D6A4F',
  };

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2"
    >
      <div className="glass flex items-center gap-3 rounded-full px-3 py-2.5">
        {/* Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2 pl-1 pr-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-glow shadow-glow animate-pulse-glow" />
          <span className="font-display text-sm font-semibold tracking-wide text-white">EcoSphere</span>
        </button>

        <div className="h-5 w-px bg-white/10" />

        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the forest…"
            className="w-full rounded-full bg-white/5 px-9 py-1.5 text-sm text-white placeholder:text-mist/60 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-accent-glow/30"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-glow shadow-glow" />
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-80"
              >
                <div className="glass rounded-2xl p-2">
                  <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-mist">
                    Notifications
                  </div>
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.title}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: typeColor[n.notificationType ?? 'info'] ?? typeColor.info, boxShadow: `0 0 6px ${typeColor[n.notificationType ?? 'info'] ?? typeColor.info}` }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white/90">{n.title}</p>
                        <p className="mt-0.5 text-xs text-mist">{n.detail}</p>
                        <p className="mt-0.5 text-[10px] text-mist/60">{n.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-light/40 to-accent-glow/30 text-white ring-1 ring-white/10 transition-transform hover:scale-105">
          <User size={16} />
        </button>
      </div>
    </motion.div>
  );
}
