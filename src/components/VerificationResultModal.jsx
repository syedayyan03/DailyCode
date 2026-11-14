import React from 'react';
import { 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Edit3, 
  X, 
  Code,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils';

export default function VerificationResultModal({
  isOpen,
  onClose,
  challenge,
  username,
  recentSubmissions = [],
  reason,
  onRetry,
  onChangeUsername
}) {
  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/85 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg glass-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* Top amber accent rim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-[#D4AF37] to-rose-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight font-sans">
              Complete the Question First
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              No matching accepted code found on LeetCode for this challenge
            </p>
          </div>
        </div>

        {/* Diagnostic Box */}
        <div className="p-4 rounded-2xl bg-[#090D18] border border-[#1E2638] mb-5 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Target Challenge:</span>
            <span className="text-white font-bold">{challenge.title}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>LeetCode Handle:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#F3E5AB] font-bold">@{username}</span>
              {onChangeUsername && (
                <button
                  onClick={onChangeUsername}
                  className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <Edit3 className="w-3 h-3" /> Change
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Verification Status:</span>
            <span className="text-amber-400 font-semibold">Incomplete on LeetCode</span>
          </div>
        </div>

        {/* Recent Submissions Detected on LeetCode */}
        {recentSubmissions && recentSubmissions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Recent Submissions Found on @{username}:
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {recentSubmissions.map((sub, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D111A] border border-[#1E2638] text-xs font-mono"
                >
                  <span className="text-zinc-300 truncate max-w-[240px]">
                    {sub.title}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {sub.timestamp ? new Date(Number(sub.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-sans">
          Your LeetCode code must match the uploaded challenge title (<strong className="text-white">{challenge.title}</strong>). Please solve it on LeetCode first, ensure it is marked <strong className="text-emerald-400">Accepted</strong>, and then click <strong>Re-Verify</strong>.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1E2638]">
          <a
            href={challenge.leetcodeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-blue-500/50 text-white text-xs font-semibold transition-all"
          >
            <Code className="w-4 h-4 text-blue-400" />
            <span>Open Problem on LeetCode</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
            >
              Dismiss
            </button>

            <button
              onClick={onRetry}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] to-[#E6CA65] text-[#07090E] transition-all shadow-glow-gold hover:opacity-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Verify Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
