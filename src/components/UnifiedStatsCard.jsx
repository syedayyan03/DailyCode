import React from 'react';
import StatCard from './StatCard';
import { Flame, Trophy, Target, Crown, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function UnifiedStatsCard({ streakStats, isTodayCompleted }) {
  const currentStreak = streakStats?.currentStreak || 0;
  const longestStreak = streakStats?.longestStreak || 0;
  const totalCompleted = streakStats?.totalCompleted || 0;
  const isStreakAtRisk = Boolean(streakStats?.isStreakAtRisk);

  const currentBadge = isTodayCompleted 
    ? 'Secured' 
    : isStreakAtRisk 
    ? 'At Risk' 
    : currentStreak > 0 
    ? 'Active' 
    : 'Start';

  const currentBadgeStyle = isTodayCompleted
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    : isStreakAtRisk
    ? 'bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/40 animate-pulse'
    : currentStreak > 0
    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
    : 'bg-[#0D111A] text-zinc-400 border-[#1E2638]';

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE VIEW: Single Unified Luxury Card (< 640px)        */}
      {/* ======================================================== */}
      <div className="block sm:hidden w-full">
        <div className="relative glass-card border border-[#D4AF37]/35 rounded-3xl p-4 shadow-glow-gold/15 overflow-hidden group">
          {/* Top Multi-Gradient Luminous Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#D4AF37] via-blue-500 to-purple-500 opacity-90" />
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D4AF37]/10 blur-2xl pointer-events-none" />

          {/* Card Header with Crown & Today's Status */}
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#1E2638]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight font-sans">
                Activity &amp; Streaks
              </span>
            </div>

            {isTodayCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Secured Today</span>
              </span>
            ) : isStreakAtRisk ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/35 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-[#D4AF37]" />
                <span>Solve Today</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-400 bg-[#0D111A] border border-[#1E2638]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Daily Tracker</span>
              </span>
            )}
          </div>

          {/* Unified 3-Column Metrics Row */}
          <div className="grid grid-cols-3 divide-x divide-[#1E2638]">
            
            {/* Metric 1: Current Streak */}
            <div className="flex flex-col items-center text-center px-1">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] flex items-center justify-center mb-1.5 shadow-glow-gold/20">
                <Flame className="w-4 h-4 fill-[#D4AF37]/30 text-[#D4AF37]" />
              </div>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-extrabold text-white font-sans tracking-tight">
                  {currentStreak}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                Current
              </span>
              <span className={`mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold border ${currentBadgeStyle}`}>
                {currentBadge}
              </span>
            </div>

            {/* Metric 2: Longest Streak */}
            <div className="flex flex-col items-center text-center px-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/35 text-purple-300 flex items-center justify-center mb-1.5 shadow-glow-amethyst/20">
                <Trophy className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-extrabold text-white font-sans tracking-tight">
                  {longestStreak}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {longestStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                Longest
              </span>
              <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/40">
                Personal Best
              </span>
            </div>

            {/* Metric 3: Problems Solved */}
            <div className="flex flex-col items-center text-center px-1">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/35 text-blue-300 flex items-center justify-center mb-1.5 shadow-glow-sapphire/20">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-xl font-extrabold text-white font-sans tracking-tight">
                  {totalCompleted}
                </span>
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                Solved
              </span>
              <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/40">
                All-Time
              </span>
            </div>

          </div>

          {/* Subtitle / Footer helper in card */}
          <div className="mt-3.5 pt-2.5 border-t border-[#1E2638] flex items-center justify-center text-center">
            <p className="text-[11px] font-mono text-zinc-400">
              {isTodayCompleted ? (
                <span className="text-emerald-400">✦ Streak safely extended today. Great work!</span>
              ) : isStreakAtRisk ? (
                <span className="text-[#F3E5AB]">⚠️ Solve today before midnight to stay alive.</span>
              ) : (
                <span className="text-zinc-400">✦ Solve today's challenge to maintain your streak.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP & TABLET VIEW: 3 Full Cards in Grid (>= 640px)   */}
      {/* ======================================================== */}
      <section className="hidden sm:grid sm:grid-cols-3 gap-5">
        <StatCard
          title="Current Streak"
          value={`${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`}
          icon={Flame}
          accentColor="gold"
          badge={
            isTodayCompleted 
              ? 'Secured Today' 
              : isStreakAtRisk 
              ? 'Needs Action' 
              : currentStreak > 0 
              ? 'Active' 
              : 'Start Streak'
          }
          badgeType={isTodayCompleted ? 'success' : isStreakAtRisk ? 'warning' : 'neutral'}
          subtitle={
            isTodayCompleted
              ? 'Streak safely secured for today!'
              : isStreakAtRisk
              ? 'Solve today before midnight to stay alive'
              : 'Complete challenges consecutively'
          }
        />

        <StatCard
          title="Longest Streak"
          value={`${longestStreak} ${longestStreak === 1 ? 'Day' : 'Days'}`}
          icon={Trophy}
          accentColor="purple"
          badge="Personal Best"
          badgeType="purple"
          subtitle="Your all-time consecutive record"
        />

        <StatCard
          title="Problems Solved"
          value={totalCompleted}
          icon={Target}
          accentColor="sapphire"
          badge="All-Time Total"
          badgeType="cyan"
          subtitle="Total curated challenges conquered"
        />
      </section>
    </>
  );
}
