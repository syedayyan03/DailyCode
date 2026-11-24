import React from 'react';
import StatCard from './StatCard';
import { Flame, Trophy, Target } from 'lucide-react';

export default function UnifiedStatsCard({ streakStats, isTodayCompleted }) {
  const currentStreak = streakStats?.currentStreak || 0;
  const longestStreak = streakStats?.longestStreak || 0;
  const totalCompleted = streakStats?.totalCompleted || 0;
  const isStreakAtRisk = Boolean(streakStats?.isStreakAtRisk);

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE VIEW: Sleek Balanced Unified Card (< 640px)       */}
      {/* ======================================================== */}
      <div className="block sm:hidden w-full">
        <div className="glass-card border border-[#1E2638] rounded-2xl p-3.5 shadow-xl relative overflow-hidden">
          
          {/* Minimal Status Header */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-400">
              Your Stats
            </span>
            {isTodayCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Today Solved</span>
              </span>
            ) : isStreakAtRisk ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#F3E5AB]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                <span>Streak at Risk</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Active</span>
              </span>
            )}
          </div>

          {/* 3 Perfectly Symmetrical Inset Metric Cards */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Metric 1: Current Streak */}
            <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl bg-[#07090E]/90 border border-[#D4AF37]/35 text-center shadow-glow-gold/10">
              <div className="flex items-center justify-center gap-1 text-[#D4AF37] mb-1">
                <Flame className="w-3.5 h-3.5 fill-[#D4AF37] flex-shrink-0" />
                <span className="text-[11px] font-semibold text-zinc-300 font-sans">
                  Streak
                </span>
              </div>
              <div className="text-2xl font-black text-white font-sans tracking-tight">
                {currentStreak}
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* Metric 2: Longest Streak */}
            <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl bg-[#07090E]/90 border border-purple-500/35 text-center shadow-glow-amethyst/10">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-zinc-300 font-sans">
                  Record
                </span>
              </div>
              <div className="text-2xl font-black text-white font-sans tracking-tight">
                {longestStreak}
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                {longestStreak === 1 ? 'day best' : 'days best'}
              </span>
            </div>

            {/* Metric 3: Problems Solved */}
            <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl bg-[#07090E]/90 border border-blue-500/35 text-center shadow-glow-sapphire/10">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Target className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-zinc-300 font-sans">
                  Solved
                </span>
              </div>
              <div className="text-2xl font-black text-white font-sans tracking-tight">
                {totalCompleted}
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                total
              </span>
            </div>

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
