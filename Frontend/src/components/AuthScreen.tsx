import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MagneticButton from './MagneticButton';

type Props = {
  onSuccess: () => void;
  onBack: () => void;
};

export default function AuthScreen({ onSuccess, onBack }: Props) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email, password, remember });
      } else {
        await signup({ name, email, password });
      }
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <button
        onClick={onBack}
        className="absolute left-6 top-6 z-20 flex items-center gap-1.5 text-sm text-mist transition-colors hover:text-white"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <motion.div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl glass-accent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={22} className="text-accent-glow" />
            </motion.div>
            <h1 className="font-display text-2xl font-semibold">
              {mode === 'login' ? 'Welcome Back' : 'Join the Forest'}
            </h1>
            <p className="mt-1 text-sm text-mist">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Create your EcoSphere account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <InputField
                    icon={<User size={16} />}
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={setName}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              icon={<Mail size={16} />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
              required
            />

            <InputField
              icon={<Lock size={16} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              required
            />

            {mode === 'login' && (
              <label className="flex items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-glow"
                />
                Remember me
              </label>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}

            <MagneticButton
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="w-full"
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={18} />}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Enter the Forest' : 'Create Account'}
            </MagneticButton>
          </form>

          {/* Mode switch */}
          <div className="mt-6 text-center text-sm text-mist">
            {mode === 'login' ? (
              <>
                New to EcoSphere?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-accent-glow transition-colors hover:text-accent-light"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-accent-glow transition-colors hover:text-accent-light"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mist">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl bg-white/5 px-11 py-3.5 text-sm text-white placeholder:text-mist/60 transition-colors focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-accent-glow/30"
      />
    </div>
  );
}
