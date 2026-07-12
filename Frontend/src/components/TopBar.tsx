import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNotifications } from '../hooks/useEsgData';
import { useAuth } from '../contexts/AuthContext';
import { mockNotifications } from '../api/mockData';
import ProfilePanel from './ProfilePanel';

type Props = {
  onLogoClick: () => void;
  onLogout: () => void;
};

const AVATAR_STORAGE_KEY = 'ecosphere_avatar';

function getStoredAvatar(): string | undefined {
  try {
    return localStorage.getItem(AVATAR_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * TopBar — floating glass navigation bar. Logo on the left, notifications in
 * the center-right, and a premium profile button on the right that opens the
 * ProfilePanel. No search bar — that space is used by the profile section.
 */
export default function TopBar({ onLogoClick, onLogout }: Props) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();
  const { data: notifData } = useNotifications();
  const notifications = notifData ?? mockNotifications;
  const [avatar, setAvatar] = useState<string | undefined>(getStoredAvatar());

  // Sync avatar when ProfilePanel updates it
  useEffect(() => {
    const check = () => setAvatar(getStoredAvatar());
    window.addEventListener('storage', check);
    const id = setInterval(check, 2000);
    return () => {
      window.removeEventListener('storage', check);
      clearInterval(id);
    };
  }, []);

  const typeColor: Record<string, string> = {
    warning: '#FBBF24',
    info: '#52B788',
    urgent: '#F87171',
    success: '#2D6A4F',
  };

  const closeAll = useCallback(() => {
    setShowNotif(false);
    setShowProfile(false);
  }, []);

  const handleLogoClick = useCallback(() => {
    closeAll();
    onLogoClick();
  }, [closeAll, onLogoClick]);

  const handleLogout = useCallback(() => {
    closeAll();
    onLogout();
  }, [closeAll, onLogout]);

  const name = user?.name ?? 'Guest';

  return (
    <>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2"
      >
        <div className="glass flex items-center gap-3 rounded-full px-3 py-2.5">
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 pl-1 pr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-glow shadow-glow animate-pulse-glow" />
            <span className="font-display text-sm font-semibold tracking-wide text-white">EcoSphere</span>
          </button>

          <div className="h-5 w-px bg-white/10" />

          {/* Spacer (was search bar — now profile space) */}
          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif((v) => !v);
                setShowProfile(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Notifications"
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
                          style={{
                            background: typeColor[n.notificationType ?? 'info'] ?? typeColor.info,
                            boxShadow: `0 0 6px ${typeColor[n.notificationType ?? 'info'] ?? typeColor.info}`,
                          }}
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

          {/* Profile Button */}
          <button
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotif(false);
            }}
            className="group flex items-center gap-2.5 rounded-full bg-white/5 py-1.5 pl-1.5 pr-3 transition-all duration-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent-glow/40"
            aria-label="Open profile"
            aria-expanded={showProfile}
          >
            {/* Avatar */}
            <div className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-white/10 transition-shadow duration-300 group-hover:ring-accent-glow/40 group-hover:shadow-glow">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-light/50 to-accent-glow/30 font-display text-xs font-bold text-white">
                  {getInitials(name)}
                </div>
              )}
            </div>
            {/* Name (hidden on small screens) */}
            <span className="hidden text-sm font-medium text-white/90 sm:inline max-w-[120px] truncate">
              {name.split(' ')[0]}
            </span>
            {/* Chevron */}
            <motion.span
              animate={{ rotate: showProfile ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-mist"
            >
              <ChevronDown size={15} />
            </motion.span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </motion.div>

      <ProfilePanel
        open={showProfile}
        onClose={() => setShowProfile(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
