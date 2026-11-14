import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Crown, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  // If already logged in, navigate straight to dashboard
  if (currentUser) {
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setErrorMessage('');
    try {
      await loginWithGoogle();
      showSuccess('Welcome back to DailyCode!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in with Google.');
      showError(err.message || 'Google sign-in failed');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoadingEmail(true);
    setErrorMessage('');
    try {
      await loginWithEmail(email, password);
      showSuccess('Successfully signed in!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
      showError(err.message || 'Sign in failed');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoadingEmail(true);
    setErrorMessage('');
    try {
      await loginWithEmail(demoEmail, demoPassword);
      showSuccess(`Signed in as ${demoEmail.includes('admin') ? 'Administrator' : 'Royal Member'}`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Background Royal Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-[#D4AF37]/10 via-blue-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#D4AF37]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#997D24] p-[1.5px] shadow-glow-gold transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0D111A] rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
            <div className="text-left">
              <span className="font-extrabold text-2xl tracking-tight text-white block">
                Daily<span className="text-gradient">Code</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#E6CA65] block uppercase">
                Imperial Challenge Platform
              </span>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Welcome Back
          </h2>
          <p className="text-sm text-zinc-400 mt-1 font-sans">
            Sign in to continue your streak and verify today's challenge
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Google OAuth One-Click Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingEmail}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-[#D4AF37]/50 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-glow-gold/20 disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#1E2638]"></div>
            <span className="px-3 text-xs text-zinc-500 font-mono uppercase tracking-wider">
              Or continue with email
            </span>
            <div className="flex-1 border-t border-[#1E2638]"></div>
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D111A] border border-[#1E2638] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 text-white placeholder-zinc-500 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300 font-sans">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D111A] border border-[#1E2638] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 text-white placeholder-zinc-500 text-sm transition-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingEmail || loadingGoogle}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] text-[#07090E] font-extrabold text-sm transition-all duration-200 shadow-glow-gold hover:shadow-[0_0_25px_-3px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loadingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#07090E]" />
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-[#1E2638]">
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2.5 text-center">
              ⚡ Instant One-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@dailycode.dev', 'password123')}
                disabled={loadingEmail || loadingGoogle}
                className="px-3 py-2 rounded-xl bg-[#0D111A] hover:bg-dark-card-hover border border-purple-500/30 hover:border-purple-500/60 text-purple-300 text-xs font-medium transition-all text-left flex items-center gap-2"
              >
                <Crown className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span className="truncate">Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('member@dailycode.dev', 'password123')}
                disabled={loadingEmail || loadingGoogle}
                className="px-3 py-2 rounded-xl bg-[#0D111A] hover:bg-dark-card-hover border border-blue-500/30 hover:border-blue-500/60 text-blue-300 text-xs font-medium transition-all text-left flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Member Demo</span>
              </button>
            </div>
          </div>

          {/* Switch to Sign Up */}
          <div className="mt-6 text-center text-xs text-zinc-400 font-sans">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-[#D4AF37] hover:text-[#F3E5AB] font-semibold underline-offset-4 hover:underline transition-colors">
              Create Account
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
