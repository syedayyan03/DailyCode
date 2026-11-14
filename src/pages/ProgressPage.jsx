import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Trophy, 
  Target, 
  Search, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Crown,
  BookOpen, 
  ArrowRight, 
  Filter,
  Zap,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { subscribeToUserCompletions } from '../services/completionService';
import { calculateStreaks } from '../utils/streakCalculator';
import { formatDisplayDate, getTodayString } from '../utils/dateUtils';
import { Link } from 'react-router-dom';

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsub = subscribeToUserCompletions(currentUser.uid, (list) => {
      setCompletions(list);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [currentUser]);

  const streakStats = calculateStreaks(completions);
  const todayStr = getTodayString();
  const isTodayCompleted = streakStats.completedDatesSet.has(todayStr);

  const filteredCompletions = completions.filter((c) => {
    const title = (c.problemTitle || '').toLowerCase();
    const date = (c.date || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || date.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-1.5">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Algorithmic Telemetry &amp; Streak Metrics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>My Progress &amp; Streaks</span>
            </h1>
            <p className="text-sm text-zinc-400 font-sans mt-1">
              Analyze your daily problem-solving momentum, active streaks, and all verified completion records.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] hover:opacity-95 text-[#07090E] text-xs sm:text-sm font-extrabold transition-all shadow-glow-gold"
          >
            <Zap className="w-4 h-4 text-[#07090E]" />
            <span>Today's Challenge</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Current Streak"
            value={`${streakStats.currentStreak} ${streakStats.currentStreak === 1 ? 'Day' : 'Days'}`}
            icon={Flame}
            accentColor="gold"
            badge={isTodayCompleted ? 'Completed Today' : streakStats.isStreakAtRisk ? 'At Risk' : 'Active'}
            badgeType={isTodayCompleted ? 'success' : streakStats.isStreakAtRisk ? 'warning' : 'neutral'}
            subtitle={isTodayCompleted ? 'Safely kept alive for today' : 'Solve today to extend your streak'}
          />

          <StatCard
            title="Longest Streak"
            value={`${streakStats.longestStreak} ${streakStats.longestStreak === 1 ? 'Day' : 'Days'}`}
            icon={Trophy}
            accentColor="purple"
            badge="Record High"
            badgeType="purple"
            subtitle="Maximum consecutive days achieved"
          />

          <StatCard
            title="Total Solved"
            value={streakStats.totalCompleted}
            icon={Target}
            accentColor="sapphire"
            badge="Milestone"
            badgeType="cyan"
            subtitle="Total verified completed challenges"
          />
        </section>

        {/* Completions Log Table / List */}
        <section className="glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Completed Challenges History</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0D111A] border border-[#1E2638] text-[#F3E5AB]">
                  {completions.length} Solved
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Showing {filteredCompletions.length} of {completions.length} completed records
              </p>
            </div>

            {/* Search filter with royal gold focus ring */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search problem title or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-mono"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-zinc-400 font-mono text-sm">
              Loading your completion history...
            </div>
          ) : filteredCompletions.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-3xl bg-[#0D111A] border border-[#1E2638] flex items-center justify-center text-[#D4AF37] mx-auto mb-4 shadow-glow-gold/20">
                <Target className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {searchQuery ? 'No matching completions' : 'No challenges completed yet'}
              </h3>
              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                {searchQuery 
                  ? 'Try searching with another keyword or date format.' 
                  : 'Start your streak today by solving and marking your first daily challenge!'}
              </p>
              {!searchQuery && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] text-[#07090E] text-xs font-bold transition-all shadow-glow-gold"
                >
                  <span>Go to Today's Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#1E2638] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Completion Date</th>
                    <th className="py-3.5 px-4">Challenge Title</th>
                    <th className="py-3.5 px-4">Verification</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]/50 font-sans">
                  {filteredCompletions.map((comp) => {
                    return (
                      <tr key={comp.id || comp.date} className="hover:bg-[#0D111A]/80 transition-colors group">
                        <td className="py-4 px-4 font-mono text-zinc-300">
                          <span className="px-2.5 py-1 rounded-xl bg-[#0D111A] border border-[#1E2638] text-xs">
                            {formatDisplayDate(comp.date, false)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white group-hover:text-[#F3E5AB] transition-colors">
                          {comp.problemTitle}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-glow-success/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-white font-mono transition-colors"
                          >
                            <span>Dashboard</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
