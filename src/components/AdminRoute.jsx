import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Crown, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0D111A] border border-[#D4AF37]/40 flex items-center justify-center shadow-glow-gold/30 animate-pulse">
          <Crown className="w-7 h-7 text-[#D4AF37]" />
        </div>
        <p className="mt-4 text-xs text-zinc-400 font-mono">Verifying imperial administrator privileges...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-5 shadow-glow-danger/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-extrabold text-white mb-2 font-sans">
            Administrator Access Required
          </h2>
          
          <p className="text-xs text-zinc-400 mb-2 font-mono">
            Signed in as: <strong className="text-[#F3E5AB]">{currentUser.email}</strong>
          </p>
          
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-sans">
            This console is restricted to verified platform administrators. To grant admin access to this account, add your email to <code className="text-[#D4AF37] bg-[#0D111A] px-1.5 py-0.5 rounded border border-[#1E2638]">VITE_ADMIN_EMAILS</code> in your environment configuration.
          </p>

          <Link
            to="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] hover:opacity-95 text-[#07090E] text-xs font-bold transition-all shadow-glow-gold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
