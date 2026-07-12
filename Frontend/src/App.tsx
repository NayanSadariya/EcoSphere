import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import AmbientForest from './components/AmbientForest';
import FloatingNav, { type PageId } from './components/FloatingNav';
import Landing from './components/Landing';
import TopBar from './components/TopBar';
import SidePanel from './components/SidePanel';
import MotherTree from './components/MotherTree';
import TreeCard from './components/TreeCard';
import SplineForest from './components/SplineForest';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import { useOrgEsgScore } from './hooks/useEsgData';
import ErrorBoundary from './components/ErrorBoundary';

const EnvironmentModule = lazy(() => import('./pages/EnvironmentModule'));
const SocialModule = lazy(() => import('./pages/SocialModule'));
const GovernanceModule = lazy(() => import('./pages/GovernanceModule'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent-glow" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppInner() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [page, setPage] = useState<PageId | 'auth'>('landing');
  const [showNav, setShowNav] = useState(false);
  const [esgScore, setEsgScore] = useState(78);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleEnter = () => {
    if (isAuthenticated) {
      setShowNav(true);
      setPage('overview');
    } else {
      setShowNav(true);
      setPage('auth');
    }
  };

  const handleNavigate = (p: PageId) => {
    if (p === 'landing') {
      setShowNav(false);
      setPage('landing');
    } else {
      setShowNav(true);
      setPage(p);
    }
  };

  const handleAuthSuccess = () => {
    setPage('overview');
  };

  const handleLogout = () => {
    logout();
    setShowNav(false);
    setPage('auth');
  };

  const isLanding = page === 'landing';

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-base">
        <Loader2 className="h-10 w-10 animate-spin text-accent-glow" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-base text-white">
      <AmbientForest
        density={isLanding ? 1.2 : 0.7}
        showLeaves
        showRays
        showButterflies={!isLanding}
        showFog={!isLanding}
        esgScore={esgScore}
      />

      {!isLanding && (
        <>
          <div className="pointer-events-none fixed inset-0 z-0 grid-bg opacity-30" />
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(82,183,136,0.08) 0%, transparent 55%)' }}
          />
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(45,106,79,0.05) 0%, transparent 50%)' }}
          />
        </>
      )}

      <AnimatePresence>
        {showNav && (page as string) !== 'auth' && <FloatingNav current={(page === 'auth' ? 'overview' : page) as PageId} onNavigate={handleNavigate} />}
      </AnimatePresence>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === 'landing' && <Landing onEnter={handleEnter} />}
            {page === 'auth' && <AuthScreen onSuccess={handleAuthSuccess} onBack={() => handleNavigate('landing')} />}
            {page === 'overview' && <CommandCenter onNavigate={handleNavigate} onScore={setEsgScore} />}
            {page === 'environmental' && (
              <ErrorBoundary fallback={<PageLoader />}><Suspense fallback={<PageLoader />}><EnvironmentModule /></Suspense></ErrorBoundary>
            )}
            {page === 'social' && (
              <ErrorBoundary fallback={<PageLoader />}><Suspense fallback={<PageLoader />}><SocialModule /></Suspense></ErrorBoundary>
            )}
            {page === 'governance' && (
              <ErrorBoundary fallback={<PageLoader />}><Suspense fallback={<PageLoader />}><GovernanceModule /></Suspense></ErrorBoundary>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!isLanding && (page as string) !== 'auth' && (
        <>
          <TopBar onLogoClick={() => handleNavigate('overview')} onLogout={handleLogout} />
          {page === 'overview' && <SidePanel />}
        </>
      )}
    </div>
  );
}

/* ---------- Command Center (Mother Tree + Spline Forest) ---------- */

function CommandCenter({ onNavigate, onScore }: { onNavigate: (p: PageId) => void; onScore: (n: number) => void }) {
  const { data: esgScore, loading } = useOrgEsgScore();

  const score = esgScore?.total_score ?? 78.4;
  const grade = esgScore?.grade ?? 'A-';
  const trend = esgScore?.trend ?? 3.2;
  const rank = esgScore?.rank ?? 'Top 8%';

  useEffect(() => {
    if (esgScore) onScore(esgScore.total_score);
  }, [esgScore, onScore]);

  const pillarConfig = [
    { name: 'Environment', score: esgScore?.environmental_score ?? 82, color: '#52B788', variant: 'environment' as const, page: 'environmental' as PageId, subtitle: 'Carbon · Energy · Goals' },
    { name: 'Social', score: esgScore?.social_score ?? 74, color: '#2D6A4F', variant: 'social' as const, page: 'social' as PageId, subtitle: 'CSR · Challenges · Badges' },
    { name: 'Governance', score: esgScore?.governance_score ?? 79, color: '#40916C', variant: 'governance' as const, page: 'governance' as PageId, subtitle: 'Policies · Audits · Issues' },
  ];

  return (
    <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 md:pl-24 md:pr-[22rem] md:pt-28">
      {/* Spline Forest as visual centerpiece — behind the UI */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <SplineForest className="h-[70vh] w-full max-w-4xl opacity-60" />
      </div>

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-2 flex items-center justify-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-accent-glow">
          <Sparkles size={12} />
          ESG Command Center
        </span>
      </motion.div>

      {/* Mother Tree centerpiece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <MotherTree score={score} grade={grade} trend={trend} />
      </motion.div>

      {/* Pillar trees */}
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {pillarConfig.map((p, i) => (
          <TreeCard
            key={p.name}
            title={p.name}
            subtitle={p.subtitle}
            score={p.score}
            color={p.color}
            treeVariant={p.variant}
            onClick={() => onNavigate(p.page)}
            delay={0.3 + i * 0.15}
          />
        ))}
      </div>

      {/* Bottom summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-6 text-center"
      >
        <div className="flex items-center gap-2 text-sm text-mist">
          <TrendingUp size={16} className="text-accent-glow" />
          <span className="text-white/90">+{trend}%</span> vs last quarter
        </div>
        <div className="hidden h-4 w-px bg-white/10 sm:block" />
        <div className="text-sm text-mist">
          Ranked <span className="text-white/90">{rank}</span> in sector
        </div>
        <div className="hidden h-4 w-px bg-white/10 sm:block" />
        <button
          onClick={() => onNavigate('environmental')}
          className="inline-flex items-center gap-1.5 text-sm text-accent-glow transition-colors hover:text-accent-light"
        >
          Explore pillars <ArrowLeft size={14} className="rotate-180" />
        </button>
      </motion.div>

      {loading && (
        <div className="relative z-10 mt-4 flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-accent-glow/50" />
        </div>
      )}
    </div>
  );
}
