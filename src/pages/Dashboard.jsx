import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import DailyChallenge from '../components/DailyChallenge';
import WeeklyActivity from '../components/WeeklyActivity';
import EmptyState from '../components/EmptyState';
import { 
  Flame, 
  Trophy, 
  Target, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Zap,
  TrendingUp,
  Crown
} from 'lucide-react';
import { getTodayString, formatDisplayDate } from '../utils/dateUtils';
import { calculateStreaks } from '../utils/streakCalculator';
import { subscribeToChallenge } from '../services/problemService';
import { 
  subscribeToUserCompletions, 
  markProblemCompleted 
} from '../services/completionService';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [todayChallenge, setTodayChallenge] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadingCompletions, setLoadingCompletions] = useState(true);

  const todayStr = getTodayString();

  // Listen to today's challenge
  useEffect(() => {
    setLoadingChallenge(true);
    const unsubChallenge = subscribeToChallenge(todayStr, (data) => {
      setTodayChallenge(data);
      setLoadingChallenge(false);
    });

    return () => unsubChallenge && unsubChallenge();
  }, [todayStr]);

  // Listen to user's completions
  useEffect(() => {
    if (!currentUser) return;
    setLoadingCompletions(true);
    const unsubCompletions = subscribeToUserCompletions(currentUser.uid, (list) => {
      setCompletions(list);
      setLoadingCompletions(false);
    });

    return () => unsubCompletions && unsubCompletions();
  }, [currentUser]);

  // Calculate streaks and activity
  const streakStats = calculateStreaks(completions);
  const isTodayCompleted = streakStats.completedDatesSet.has(todayStr);

  const handleMarkCompleted = async (problem) => {
    if (!currentUser) return;
    const result = await markProblemCompleted(currentUser.uid, problem);
    return result;
  };

  const displayName = currentUser?.displayName || userProfile?.displayName || 'Developer';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1E2638]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{formatDisplayDate(todayStr)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Keep showing up,{' '}
              <span className="text-gradient">
                {firstName}
              </span>.
            </h1>
          </div>

          {/* Today's quick status badge */}
          <div>
            {isTodayCompleted ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-glow-success/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Today's Challenge Completed</span>
              </div>
            ) : streakStats.isStreakAtRisk ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-mono font-bold animate-pulse shadow-glow-gold/25">
                <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                <span>Solve today to protect your {streakStats.currentStreak}-day streak!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0D111A] border border-[#1E2638] text-zinc-400 text-xs font-mono">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Pending Today's Solution</span>
              </div>
            )}
          </div>
        </section>

        {/* Statistics Cards (Current Streak, Longest Streak, Problems Completed) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Card 1: Current Streak */}
          <StatCard
            title="Current Streak"
            value={`${streakStats.currentStreak} ${streakStats.currentStreak === 1 ? 'Day' : 'Days'}`}
            icon={Flame}
            accentColor="gold"
            badge={
              isTodayCompleted 
                ? 'Secured Today' 
                : streakStats.isStreakAtRisk 
                ? 'Needs Action' 
                : streakStats.currentStreak > 0 
                ? 'Active' 
                : 'Start Streak'
            }
            badgeType={isTodayCompleted ? 'success' : streakStats.isStreakAtRisk ? 'warning' : 'neutral'}
            subtitle={
              isTodayCompleted
                ? 'Streak safely secured for today!'
                : streakStats.isStreakAtRisk
                ? 'Solve today before midnight to stay alive'
                : 'Complete challenges consecutively'
            }
          />

          {/* Card 2: Longest Streak */}
          <StatCard
            title="Longest Streak"
            value={`${streakStats.longestStreak} ${streakStats.longestStreak === 1 ? 'Day' : 'Days'}`}
            icon={Trophy}
            accentColor="purple"
            badge="Personal Best"
            badgeType="purple"
            subtitle="Your all-time consecutive record"
          />

          {/* Card 3: Problems Completed */}
          <StatCard
            title="Problems Solved"
            value={streakStats.totalCompleted}
            icon={Target}
            accentColor="sapphire"
            badge="All-Time Total"
            badgeType="cyan"
            subtitle="Total curated challenges conquered"
          />
        </section>

        {/* Main Content Grid: Daily Challenge + Weekly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols on lg): Daily Challenge Hero */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>Today's Challenge</span>
                <span className="text-xs font-mono font-normal text-zinc-400">
                  ({todayStr})
                </span>
              </h2>
            </div>

            {loadingChallenge ? (
              <div className="glass-card border border-[#1E2638] rounded-3xl p-14 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
                <p className="text-sm text-zinc-400 font-mono">Loading today's challenge...</p>
              </div>
            ) : todayChallenge ? (
              <DailyChallenge
                challenge={todayChallenge}
                isCompleted={isTodayCompleted}
                onMarkCompleted={handleMarkCompleted}
              />
            ) : (
              <EmptyState
                title="No challenge posted yet."
                description="The administrator hasn't published today's LeetCode problem yet. Check back soon or visit your progress page to review completed challenges."
              />
            )}
          </div>

          {/* Right Column: Weekly Activity & Consistency Motivator */}
          <div className="space-y-6">
            {/* Weekly Activity Section */}
            <WeeklyActivity completedDatesSet={streakStats.completedDatesSet} />

            {/* Consistency Quote Card */}
            <div className="glass-card border border-[#1E2638] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#3B82F6]" />
              
              <div className="flex items-center gap-2 text-xs font-mono text-[#E6CA65] uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>The DailyCode Philosophy</span>
              </div>
              <blockquote className="text-sm text-zinc-300 italic leading-relaxed mb-4 font-sans">
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </blockquote>
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-[#1E2638] pt-3">
                <span>Aristotle</span>
                <span className="text-[#F3E5AB] font-bold font-mono">1% Better Every Day</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
