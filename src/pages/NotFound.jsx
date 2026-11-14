import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#D4AF37]/30 selection:text-white">
      <div className="max-w-md w-full glass-card border border-[#1E2638] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#3B82F6]" />

        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] flex items-center justify-center mx-auto mb-6 shadow-glow-gold/25">
          <Crown className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-2 font-mono tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-white mb-3">Resource Not Found</h2>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-sans">
          The requested route or challenge index does not exist in the platform registry.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] hover:opacity-95 text-[#07090E] text-sm font-bold transition-all shadow-glow-gold w-full"
        >
          <ArrowLeft className="w-4 h-4 text-[#07090E]" />
          <span>Return to Safety</span>
        </Link>
      </div>
    </div>
  );
}
