import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Code2, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Zap, 
  Crown,
  Loader2, 
  AlertTriangle,
  Award,
  Layers,
  Check
} from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/config';

export default function LandingPage() {
  const { currentUser, loginWithGoogle, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [signingIn, setSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState('javascript');
  const navigate = useNavigate();

  // If already logged in, redirect straight to user dashboard
  if (!loading && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await loginWithGoogle();
      showSuccess('Welcome back to DailyCode!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to sign in with Google.');
    } finally {
      setSigningIn(false);
    }
  };

  const codeSnippets = {
    javascript: `// DailyCode Algorithmic Momentum Engine
const streak = new DailyStreak({
  user: "developer@dailycode",
  curatedProblem: "Two Sum II - Input Array Is Sorted",
  difficulty: "Medium",
  topic: "Two Pointers"
});

// Execute solution & sync with cloud
await streak.recordCompletion();
console.log("👑 Verified! Current streak extended to 15 days.");`,
    python: `# DailyCode Algorithmic Momentum Engine
streak = DailyStreak(
    user="developer@dailycode",
    curated_problem="Two Sum II - Input Array Is Sorted",
    difficulty="Medium",
    topic="Two Pointers"
)

# Execute solution & sync with cloud
await streak.record_completion()
print("👑 Verified! Current streak extended to 15 days.")`,
    cpp: `// DailyCode Algorithmic Momentum Engine
DailyStreak streak({
    .user = "developer@dailycode",
    .curatedProblem = "Two Sum II - Input Array Is Sorted",
    .difficulty = Difficulty::Medium,
    .topic = "Two Pointers"
});

// Execute solution & sync with cloud
co_await streak.recordCompletion();
std::cout << "👑 Verified! Current streak extended to 15 days.\\n";`
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37]/30 selection:text-white relative overflow-hidden">
      
      {/* Background Subtle Royal Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#D4AF37]/10 via-blue-600/10 to-transparent blur-[150px] rounded-full" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#D4AF37]/10 blur-[160px] rounded-full" />
      </div>

      {/* Live Firebase Configuration Notice if unconfigured */}
      {!isFirebaseConfigured && (
        <div className="relative z-30 w-full bg-[#D4AF37]/10 border-b border-[#D4AF37]/30 text-[#F3E5AB] px-4 py-2.5 text-xs font-mono flex items-center justify-center gap-2 text-center backdrop-blur-md">
          <AlertTriangle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span>
            <strong className="text-[#F3E5AB] font-semibold">Firebase Live Sync:</strong> To activate Google OAuth &amp; Cloud Firestore, supply your keys in <code className="bg-[#0D111A] px-1.5 py-0.5 rounded text-[#D4AF37] border border-[#1E2638]">.env</code>.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="relative z-10 w-full border-b border-[#1E2638]/90 bg-[#07090E]/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#997D24] p-[1.5px] shadow-glow-gold/40">
              <div className="w-full h-full bg-[#0D111A] rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Daily<span className="text-gradient">Code</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-[#D4AF37]/50 text-white transition-all shadow-sm focus:outline-none"
            >
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] text-[#07090E] transition-all shadow-glow-gold hover:shadow-glow-gold/40 focus:outline-none"
            >
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 flex flex-col items-center justify-center text-center">
        
        {/* Royal Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0D111A]/90 border border-[#D4AF37]/35 text-[#F3E5AB] text-xs font-mono mb-8 shadow-glow-gold/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] beacon-gold" />
          <span>Curated Daily LeetCode Challenges • Built for Engineers</span>
        </div>

        {/* Hero Title with Gilded Gradients */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] mb-6 font-sans">
          One Problem a Day.{' '}
          <span className="text-gradient">
            One Step Closer to Mastery.
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Eliminate decision fatigue. Receive one handpicked DSA challenge every morning, stay accountable with consecutive streak tracking, and prepare for top-tier engineering interviews.
        </p>

        {/* Primary Luxury CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] text-[#07090E] font-extrabold text-sm sm:text-base transition-all duration-300 shadow-glow-gold hover:shadow-[0_0_40px_-5px_rgba(212,175,55,0.45)] transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#07090E]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#07090E"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#07090E"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#07090E"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#07090E"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Start with Google</span>
            <ArrowRight className="w-5 h-5 text-[#07090E] group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-[#D4AF37]/50 text-white font-semibold text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-glow-gold/10"
          >
            <span>Continue with Email</span>
          </Link>
        </div>

        {/* Interactive Holographic Code Terminal Preview */}
        <div className="w-full max-w-3xl glass-card border border-[#1E2638] rounded-3xl shadow-2xl p-5 sm:p-7 text-left relative overflow-hidden mb-20">
          {/* Top terminal chrome */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1E2638] gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
              
              {/* Language Switcher Tabs */}
              <div className="ml-4 flex items-center gap-1 p-1 bg-[#07090E]/90 rounded-xl border border-[#1E2638]">
                {['javascript', 'python', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all ${
                      activeTab === lang
                        ? 'bg-[#D4AF37]/20 text-[#F3E5AB] font-bold border border-[#D4AF37]/40 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Streak Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#F3E5AB] text-xs font-mono">
              <Flame className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
              <span>Current Streak: 15 Days</span>
            </div>
          </div>

          {/* Syntax Code Display */}
          <pre className="font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto leading-relaxed p-3 bg-[#07090E]/80 rounded-2xl border border-[#1E2638]">
            <code>
              {codeSnippets[activeTab]}
            </code>
          </pre>

          {/* Live Telemetry Bar */}
          <div className="mt-4 pt-3 border-t border-[#1E2638] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block" />
              <span>LeetCode Direct Sync: Verified</span>
            </div>
            <div className="text-[#F3E5AB]">
              Runtime: 42ms (Beats 98.4%)
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Feature 1 */}
          <div className="glass-card border border-[#1E2638] hover:border-[#D4AF37]/50 rounded-3xl p-7 transition-all duration-300 group hover:shadow-glow-gold/25">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-5 group-hover:scale-110 transition-transform">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans flex items-center gap-2">
              <span>Curated Daily Challenges</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Hand-selected LeetCode problems covering core DSA patterns—Two Pointers, Sliding Windows, Graphs, and Dynamic Programming.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card border border-[#1E2638] hover:border-blue-500/50 rounded-3xl p-7 transition-all duration-300 group hover:shadow-glow-sapphire/25">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-blue-400 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans flex items-center gap-2">
              <span>Anti-Cheat Streak Engine</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Consecutive calendar tracking with timezone-safe grace periods preserving yesterday's streak until midnight.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card border border-[#1E2638] hover:border-purple-500/50 rounded-3xl p-7 transition-all duration-300 group hover:shadow-glow-amethyst/25">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans flex items-center gap-2">
              <span>Velocity &amp; Momentum Matrix</span>
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              7-day circular velocity matrix and searchable completion history to measure your engineering consistency.
            </p>
          </div>

        </div>
      </main>

      {/* Royal Footer */}
      <footer className="relative z-10 border-t border-[#1E2638] py-8 bg-[#07090E]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-semibold">DailyCode</span>
            <span>•</span>
            <span>One problem a day. One step closer to mastery.</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Powered by React 18 &amp; Cloud Firestore</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
