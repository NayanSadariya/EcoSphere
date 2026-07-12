import { Component, type ReactNode, Suspense } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  suspenseFallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary — catches render-phase errors in its children and shows a
 * fallback instead of letting React unmount the entire tree (black screen).
 * Also wraps children in Suspense so lazy-loaded components that throw during
 * import are caught too.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback />;
    }
    return (
      <Suspense fallback={this.props.suspenseFallback ?? <DefaultFallback />}>
        {this.props.children}
      </Suspense>
    );
  }
}

function DefaultFallback() {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative h-32 w-32 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, rgba(82,183,136,0.3) 0%, rgba(45,106,79,0.15) 50%, transparent 100%)',
          boxShadow: '0 0 40px rgba(82,183,136,0.15)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
