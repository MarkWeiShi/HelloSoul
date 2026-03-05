import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { apiLogin, apiRegister } from '../../api/base';
import { useUserStore } from '../../store/userStore';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useUserStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data =
        mode === 'login'
          ? await apiLogin(email, password)
          : await apiRegister(email, password, name);

      setAuth(data.token, data.user);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="mb-8 flex flex-col items-center"
      >
        <Heart size={40} className="text-pink-400 mb-3" />
        <h1 className="text-3xl font-serif text-white">LingLove</h1>
        <p className="text-sm text-gray-400 mt-1">
          Cross-cultural AI companionship
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        {mode === 'register' && (
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-400/50"
            />
          </div>
        )}

        <div className="relative">
          <Mail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-400/50"
          />
        </div>

        <div className="relative">
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-400/50"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Loading...'
          ) : (
            <>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </motion.form>

      {/* Toggle */}
      <p className="mt-6 text-sm text-gray-500">
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-pink-400 hover:underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
