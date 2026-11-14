import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-4 selection:bg-[#D4AF37]/30 selection:text-white">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-[#0D111A] border border-[#D4AF37]/40 flex items-center justify-center shadow-glow-gold/40">
            <Crown className="w-7 h-7 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[#D4AF37]/20 blur-xl animate-pulse" />
        </div>
        <p className="mt-4 text-xs text-[#F3E5AB] font-mono tracking-widest uppercase">
          Verifying developer session...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
