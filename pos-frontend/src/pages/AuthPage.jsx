import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { AppShell } from '../components/layout/AppShell';
import { cn } from '../lib/utils';
import { hasCompletedOnboarding } from '../lib/onboarding';
import { dashboardPath } from '../lib/routes';

// Base API URL for authentication routes
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/users`;

/**
 * Text Input with left icon inside Login/Register form.
 * 
 * @param {object} props - Component props
 * @param {React.ElementType} props.icon - Lucide icon class
 * @param {string} props.className - Custom styles
 */
function AuthInput({ icon: Icon, className = '', ...props }) {
  return (
    <label className="relative block">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
      <input
        {...props}
        className={cn(
          'h-12 w-full rounded-2xl border border-white/10 bg-[#252638] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-300/60 focus:ring-4 focus:ring-indigo-400/10',
          className
        )}
      />
    </label>
  );
}

/**
 * AuthPage Component
 * Handles candidate registration and login flow. Toggles display states
 * and updates user store keys on success.
 * 
 * @param {object} props - Component properties
 * @param {boolean} props.locked - Force banner display demanding login to access content
 */
export default function AuthPage({ locked = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = ['register', 'signup'].includes(searchParams.get('mode')) ? 'signup' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const setUser = useAuthStore((s) => s.setUser);

  /**
   * Form submit handler. Calls login/signup backend paths.
   * 
   * @param {React.FormEvent} event - Submit event
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setForgotMessage('');
    const formData = new FormData(event.currentTarget);
    const values = {
      identifier: String(formData.get('identifier') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || ''),
      username: String(formData.get('username') || '').trim(),
      name: String(formData.get('name') || '').trim()
    };

    try {
      if (mode === 'login' && !values.identifier) {
        setError('Enter your email or username');
        return;
      }
      if (!values.password || values.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (mode === 'signup' && (!values.name || values.name.trim().length < 2)) {
        setError('Full name must be at least 2 characters');
        return;
      }
      if (mode === 'signup' && (!values.username || !/^[a-zA-Z0-9_-]{3,24}$/.test(values.username.trim()))) {
        setError('Username must be 3-24 characters and can only contain letters, numbers, hyphens, and underscores');
        return;
      }
      if (mode === 'signup' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        setError('Enter a valid email address');
        return;
      }

      setSubmitting(true);
      const path = mode === 'login' ? '/login' : '/signup';
      
      const payload = mode === 'login'
        ? {
            email: values.identifier,
            password: values.password
          }
        : {
            email: values.email,
            password: values.password,
            username: values.username,
            name: values.name
          };

      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store JWT token for API auth checks
      localStorage.setItem('token', data.token);

      const userObject = {
        id: data.id,
        name: data.name || values.name,
        email: data.email || values.email,
        username: data.username || values.username,
        branch: data.branch,
        year: data.year,
        skillLevel: data.skillLevel,
        targetCompanies: data.targetCompanies,
        placementGoal: data.placementGoal,
        readinessScore: data.readinessScore,
        weakTopics: data.weakTopics
      };

      // Set global store state
      setUser(userObject);

      const next = searchParams.get('next');
      const fallback = hasCompletedOnboarding(userObject) ? dashboardPath(userObject) : '/onboarding';
      navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : fallback);
    } catch (e) {
      setError(e.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell guest>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="relative w-full max-w-md">
          {/* Visual glow background container */}
          <div className="absolute -inset-6 rounded-[2rem] bg-indigo-500/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[#161a24] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white">
                    <span className="h-4 w-4 rounded-full bg-indigo-500" />
                  </span>
                  <div>
                    <p className="text-xl font-black text-white">Placement OS</p>
                    <p className="text-xs font-semibold text-slate-500">Student prep workspace</p>
                  </div>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-400/10 text-indigo-200">
                  <Sparkles size={18} />
                </span>
              </div>

              {locked && (
                <div className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm font-semibold leading-5 text-amber-100">
                  Please login or register to access this content and use platform features.
                </div>
              )}

              {/* Login/Signup Tabs */}
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#252638] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={cn('rounded-xl px-4 py-2.5 text-sm font-black transition', mode === 'login' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white')}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={cn('rounded-xl px-4 py-2.5 text-sm font-black transition', mode === 'signup' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white')}
                >
                  Register
                </button>
              </div>

              {/* Form fields */}
              <form className="space-y-3" onSubmit={onSubmit}>
                {mode === 'signup' && <AuthInput icon={UserRound} name="name" autoComplete="name" placeholder="Full name" />}
                {mode === 'signup' && <AuthInput icon={UserRound} name="username" autoComplete="username" placeholder="Username" />}
                {mode === 'login' ? (
                  <AuthInput icon={Mail} name="identifier" autoComplete="username" placeholder="Email address" />
                ) : (
                  <AuthInput icon={Mail} name="email" type="email" autoComplete="email" placeholder="Email address" />
                )}
                <AuthInput icon={KeyRound} name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Password" />

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMessage('Password reset is not enabled yet. Please contact support.');
                        setError('');
                      }}
                      className="text-xs font-bold text-indigo-200 transition hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && <p className="rounded-xl bg-rose-400/10 p-3 text-sm font-semibold text-rose-200">{error}</p>}
                {forgotMessage && <p className="rounded-xl bg-indigo-400/10 p-3 text-sm font-semibold text-indigo-100">{forgotMessage}</p>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(99,102,241,0.28)] transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#252638] py-3 text-sm font-black text-slate-200 transition cursor-pointer hover:border-indigo-300/40 hover:bg-[#303143]">
                <ShieldCheck size={16} />
                Continue with Google
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
