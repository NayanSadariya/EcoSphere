import { lazy, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SPLINE_SCENE = 'https://prod.spline.design/zVF0KaKRo4WokAMAYGwCrHx6/scene.splinecode';

type Props = {
  className?: string;
};

/**
 * SplineForest — lazy-loaded Spline forest scene for the dashboard center.
 * The UI floats around it with glassmorphism. Falls back to an animated
 * gradient glade while loading. Wrapped in ErrorBoundary so a render-phase
 * crash never unmounts the app.
 */
export default function SplineForest({ className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary fallback={<ForestFallback className="absolute inset-0" />}>
        <SplineInner />
      </ErrorBoundary>
    </div>
  );
}

function SplineInner() {
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (error || !mounted) {
    return <ForestFallback className="absolute inset-0" />;
  }

  return (
    <Spline
      scene={SPLINE_SCENE}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/** Animated forest glade fallback shown while loading or on error */
function ForestFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <motion.div
        className="relative h-64 w-64"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(82,183,136,0.15) 0%, rgba(45,106,79,0.08) 40%, transparent 70%)',
          borderRadius: '50%',
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${15 + i * 18}%` }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="40" height="80" viewBox="0 0 40 80">
              <path d="M20 80 L18 50 L22 50 L20 80 Z" fill="#1B4332" />
              <ellipse cx="20" cy="30" rx="18" ry="24" fill="#2D6A4F" opacity="0.4" />
            </svg>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
