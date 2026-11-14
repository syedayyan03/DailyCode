import React from 'react';
import { CalendarClock, Sparkles, BookOpen, Clock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  title = "No challenge posted yet.", 
  description = "The administrator hasn't published today's LeetCode problem yet. Check back soon to keep your streak burning!",
  showHistoryLink = true
}) {
  return (
    <div className="glass-card border border-[#1E2638] rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 via-blue-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        {/* Royal Crown Illustration */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-[#0D111A] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-glow-gold/25">
            <Crown className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#F3E5AB] beacon-gold">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 font-sans">
          {description}
        </p>

        {/* Action Link */}
        {showHistoryLink && (
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover text-[#F3E5AB] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-xs sm:text-sm font-semibold transition-all shadow-glow-gold/20"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span>Browse Past Completed Challenges</span>
          </Link>
        )}
      </div>
    </div>
  );
}
