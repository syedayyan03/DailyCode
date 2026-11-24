import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Crown, 
  Flame, 
  TrendingUp, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  ExternalLink,
  Zap,
  Code2,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Successfully signed out.');
      navigate('/');
    } catch (err) {
      showError('Failed to sign out. Please try again.');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2638]/90 bg-[#07090E]/90 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Royal Brand Logo & Live Radar */}
        <div className="flex items-center gap-6">
          <Link 
            to={currentUser ? "/dashboard" : "/"} 
            className="flex items-center gap-3 group focus:outline-none"
          >
            {/* Gilded Imperial Crown Icon */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#997D24] p-[1.5px] shadow-glow-gold transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_35px_-3px_rgba(212,175,55,0.45)]">
              <div className="w-full h-full bg-[#0D111A] rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#D4AF37] group-hover:text-[#F3E5AB] transition-colors" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight font-sans text-white">
                  Daily<span className="text-gradient">Code</span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E6CA65] border border-[#D4AF37]/35 shadow-sm">
                  ROYAL
                </span>
              </div>
            </div>
          </Link>

          {/* Live Golden Streak Active Indicator */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D111A] border border-[#1E2638] text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] beacon-gold inline-block" />
              <span className="text-zinc-300 font-sans">Streak Engine Verified</span>
            </div>
          )}
        </div>

        {/* Center/Right: Desktop Navigation Pills */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[#0D111A]/90 border border-[#1E2638]">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-[#D4AF37]/25 to-[#E6CA65]/15 text-[#F3E5AB] border border-[#D4AF37]/40 shadow-glow-gold/30'
                  : 'text-zinc-400 hover:text-white hover:bg-dark-card-hover'
              }`}
            >
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span>Daily Challenge</span>
            </Link>

            <Link
              to="/progress"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isActive('/progress')
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-500/40 shadow-glow-sapphire/30'
                  : 'text-zinc-400 hover:text-white hover:bg-dark-card-hover'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>My Progress</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-600/25 text-purple-200 border border-purple-500/40 shadow-glow-amethyst/30'
                    : 'text-purple-300/80 hover:text-white hover:bg-purple-950/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>
        )}

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-[#1E2638] bg-[#0D111A] hover:border-[#D4AF37]/50 transition-all focus:outline-none"
                aria-expanded={userDropdownOpen}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#D4AF37]/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37]/25 to-[#997D24]/25 text-[#F3E5AB] flex items-center justify-center font-bold text-xs uppercase border border-[#D4AF37]/40">
                    {(currentUser.displayName || currentUser.email || 'U')[0]}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {currentUser.displayName || 'Developer'}
                  </span>
                  <span className="text-[10px] text-[#E6CA65] font-mono truncate max-w-[120px]">
                    {isAdmin ? '👑 Administrator' : '✦ Royal Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0D111A] border border-[#1E2638] shadow-2xl z-50 p-2 divide-y divide-[#1E2638]">
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-medium text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{currentUser.displayName}</p>
                      <p className="text-xs text-zinc-400 font-mono truncate">{currentUser.email}</p>
                      {isAdmin && (
                        <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          <ShieldCheck className="w-3 h-3 text-purple-400" /> ADMIN PRIVILEGES
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-dark-card-hover transition-colors"
                      >
                        <Zap className="w-4 h-4 text-[#D4AF37]" />
                        <span>Daily Challenge</span>
                      </Link>

                      <Link
                        to="/progress"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-dark-card-hover transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span>Streak Analytics</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-300 hover:text-white hover:bg-purple-950/20 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:bg-[#0D111A] border border-[#1E2638] transition-all"
              >
                <span>Sign In</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#D4AF37] via-[#E6CA65] to-[#B38E22] hover:opacity-95 text-[#07090E] transition-all shadow-glow-gold font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#07090E]" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
