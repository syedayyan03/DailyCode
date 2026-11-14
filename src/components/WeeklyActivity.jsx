import React from 'react';
import { Check, Flame, CalendarDays, Crown, Award } from 'lucide-react';
import { getCurrentWeekDates } from '../utils/dateUtils';

export default function WeeklyActivity({ completedDatesSet = new Set() }) {
  const weekDays = getCurrentWeekDates();

  const completedCountInWeek = weekDays.filter(day => completedDatesSet.has(day.dateStr)).length;
  const percentage = Math.round((completedCountInWeek / 7) * 100);

  return (
    <div className="glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
      {/* Header with Momentum & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-glow-gold/20">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Weekly Velocity Matrix</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F3E5AB] border border-[#D4AF37]/35">
                {percentage}% Consistency
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Active Momentum: {completedCountInWeek} of 7 days completed this week
            </p>
          </div>
        </div>

        {/* Mini gold percentage progress bar */}
        <div className="w-full sm:w-48 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono text-zinc-400">
            <span>Weekly Target</span>
            <span className="text-[#F3E5AB] font-bold">{completedCountInWeek}/7</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#07090E] border border-[#1E2638] overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] transition-all duration-500 shadow-glow-gold"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7 Days Grid with royal capsule cards */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3.5">
        {weekDays.map((day) => {
          const isDone = completedDatesSet.has(day.dateStr);

          return (
            <div 
              key={day.dateStr} 
              className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 ${
                day.isToday 
                  ? 'border-[#D4AF37]/70 bg-[#D4AF37]/10 shadow-glow-gold/30 scale-[1.03] z-10' 
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500/70'
                  : 'border-[#1E2638] bg-[#0D111A]/80 hover:bg-[#0D111A]'
              }`}
            >
              {/* Day abbreviation */}
              <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                day.isToday ? 'text-[#F3E5AB] font-bold' : isDone ? 'text-emerald-300' : 'text-zinc-500'
              }`}>
                {day.dayAbbr}
              </span>

              {/* Day number */}
              <span className={`text-xs font-mono my-1.5 ${
                day.isToday ? 'text-white font-extrabold' : 'text-zinc-400'
              }`}>
                {day.dayNumber}
              </span>

              {/* Status Circle Indicator */}
              <div 
                className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-[#07090E] font-extrabold shadow-glow-success'
                    : day.isToday
                    ? 'border-2 border-dashed border-[#D4AF37]/80 text-[#D4AF37] bg-[#D4AF37]/10'
                    : 'bg-[#07090E] border border-[#1E2638] text-zinc-600'
                }`}
                title={`${day.dayName}: ${isDone ? 'Completed' : 'Pending'}`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3] text-[#07090E]" />
                ) : day.isToday ? (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] beacon-gold" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                )}
              </div>

              {day.isToday && (
                <span className="mt-1.5 text-[9px] font-mono font-bold tracking-widest text-[#F3E5AB] uppercase">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
