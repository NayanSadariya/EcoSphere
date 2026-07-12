import { lazy, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SPLINE_SCENE = 'https://prod.spline.design/xtLNMz3VkPqai6XguoTzK6lj/scene.splinecode';

type Props = {
  className?: string;
};

/**
 * SplineGlobe — lazy-loaded Spline planet scene for the landing hero.
 * Falls back to a glowing animated orb while loading or on error. Responsive
 * via parent container sizing. Wrapped in ErrorBoundary so a render-phase
 * crash never unmounts the app.
 */
export default function SplineGlobe({ className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <ErrorBoundary fallback={<SplineFallback className="absolute inset-0" />}>
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
    return <SplineFallback className="absolute inset-0" />;
  }

  return (
    <Spline
      scene={SPLINE_SCENE}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/** Animated glowing orb shown while the Spline scene loads or if it fails */
function SplineFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative h-48 w-48 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(82,183,136,0.4) 0%, rgba(45,106,79,0.2) 50%, rgba(2,48,32,0.1) 100%)',
          boxShadow: '0 0 60px rgba(82,183,136,0.2), inset 0 0 40px rgba(2,48,32,0.3)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-accent-glow/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: 'rgba(82,183,136,0.4)' }}
        />
      </motion.div>
    </div>
  );
}
