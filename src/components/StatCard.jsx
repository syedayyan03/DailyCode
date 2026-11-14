import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  accentColor = 'gold', 
  subtitle, 
  badge,
  badgeType = 'neutral' 
}) {
  const colorStyles = {
    gold: {
      border: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70',
      iconBg: 'bg-[#D4AF37]/10 text-[#F3E5AB] border-[#D4AF37]/35 shadow-glow-gold/30',
      glow: 'hover:shadow-glow-gold',
      accentText: 'text-[#F3E5AB]',
      topLine: 'from-[#D4AF37] via-[#F3E5AB] to-[#997D24]'
    },
    mint: {
      border: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70',
      iconBg: 'bg-[#D4AF37]/10 text-[#F3E5AB] border-[#D4AF37]/35 shadow-glow-gold/30',
      glow: 'hover:shadow-glow-gold',
      accentText: 'text-[#F3E5AB]',
      topLine: 'from-[#D4AF37] via-[#F3E5AB] to-[#997D24]'
    },
    cyan: {
      border: 'border-blue-500/30 hover:border-blue-500/70',
      iconBg: 'bg-blue-500/10 text-blue-300 border-blue-500/35 shadow-glow-sapphire/30',
      glow: 'hover:shadow-glow-sapphire',
      accentText: 'text-blue-300',
      topLine: 'from-blue-500 via-indigo-400 to-blue-700'
    },
    sapphire: {
      border: 'border-blue-500/30 hover:border-blue-500/70',
      iconBg: 'bg-blue-500/10 text-blue-300 border-blue-500/35 shadow-glow-sapphire/30',
      glow: 'hover:shadow-glow-sapphire',
      accentText: 'text-blue-300',
      topLine: 'from-blue-500 via-indigo-400 to-blue-700'
    },
    violet: {
      border: 'border-purple-500/30 hover:border-purple-500/70',
      iconBg: 'bg-purple-500/10 text-purple-300 border-purple-500/35 shadow-glow-amethyst/30',
      glow: 'hover:shadow-glow-amethyst',
      accentText: 'text-purple-300',
      topLine: 'from-purple-500 via-pink-400 to-purple-800'
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/70',
      iconBg: 'bg-purple-500/10 text-purple-300 border-purple-500/35 shadow-glow-amethyst/30',
      glow: 'hover:shadow-glow-amethyst',
      accentText: 'text-purple-300',
      topLine: 'from-purple-500 via-pink-400 to-purple-800'
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/70',
      iconBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/35 shadow-glow-success/30',
      glow: 'hover:shadow-glow-success',
      accentText: 'text-emerald-300',
      topLine: 'from-emerald-400 via-teal-400 to-emerald-700'
    },
    orange: {
      border: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/70',
      iconBg: 'bg-[#D4AF37]/10 text-[#F3E5AB] border-[#D4AF37]/35 shadow-glow-gold/30',
      glow: 'hover:shadow-glow-gold',
      accentText: 'text-[#F3E5AB]',
      topLine: 'from-[#D4AF37] via-[#F3E5AB] to-[#997D24]'
    }
  };

  const style = colorStyles[accentColor] || colorStyles.gold;

  const badgeStyles = {
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm',
    warning: 'bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/40',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    cyan: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    neutral: 'bg-[#0D111A] text-zinc-400 border-[#1E2638]'
  };

  return (
    <div 
      className={`relative glass-card border ${style.border} rounded-3xl p-6 transition-all duration-300 ${style.glow} group overflow-hidden`}
    >
      {/* Decorative top luminous gold line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${style.topLine} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      {/* Subtle ambient corner flare */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-white/[0.02] blur-2xl pointer-events-none group-hover:bg-[#D4AF37]/[0.05] transition-all" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono">
          {title}
        </span>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${style.iconBg} transition-all group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          {value}
        </span>
        {badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${badgeStyles[badgeType] || badgeStyles.neutral}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2.5 text-xs text-zinc-400 flex items-center gap-1.5 font-sans leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 inline-block" />
          {subtitle}
        </p>
      )}
    </div>
  );
}
