import React, { useState } from 'react';
import { 
  Crown, 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Code,
  Award,
  Sparkles
} from 'lucide-react';
import { checkLeetCodeUser, saveLinkedLeetCodeUsername } from '../services/leetcodeService';
import { useToast } from '../context/ToastContext';

export default function LinkLeetCodeModal({ 
  isOpen, 
  onClose, 
  onLinkedSuccess, 
  currentUser 
}) {
  const { showSuccess, showError } = useToast();
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [checkError, setCheckError] = useState('');

  if (!isOpen) return null;

  const handleCheckUser = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setCheckError('Please enter a LeetCode username.');
      return;
    }

    setChecking(true);
    setCheckError('');
    setVerifiedUser(null);

    try {
      const res = await checkLeetCodeUser(username.trim());
      if (res.exists && res.user) {
        setVerifiedUser(res.user);
      } else {
        setCheckError(res.error || 'LeetCode profile not found. Please check spelling.');
      }
    } catch (err) {
      setCheckError('Failed to verify username: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleConfirmLink = async () => {
    const targetUsername = verifiedUser?.username || username.trim();
    if (!targetUsername) return;

    setSaving(true);
    try {
      await saveLinkedLeetCodeUsername(currentUser, targetUsername);
      showSuccess(`LeetCode account @${targetUsername} linked successfully!`);
      if (onLinkedSuccess) {
        onLinkedSuccess(targetUsername);
      }
      onClose();
    } catch (err) {
      showError('Failed to save linked account: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090E]/80 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* Top gold accent rim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#3B82F6]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-glow-gold/30">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight font-sans">
              Link Your LeetCode Account
            </h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Automated Proof-of-Work Verification
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-sans">
          To maintain algorithmic integrity, DailyCode verifies your accepted solution directly on LeetCode before recording daily streak completions.
        </p>

        {/* Username Input Form */}
        <form onSubmit={handleCheckUser} className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              LeetCode Username / Handle
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                  @
                </span>
                <input
                  type="text"
                  placeholder="e.g. lee215 or tourist"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setCheckError('');
                    setVerifiedUser(null);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-mono"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={checking || !username.trim()}
                className="px-4 py-2.5 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-[#D4AF37]/50 text-xs font-mono font-bold text-[#F3E5AB] transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Search className="w-4 h-4" />}
                <span>Check</span>
              </button>
            </div>

            {checkError && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-mono pt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{checkError}</span>
              </p>
            )}
          </div>
        </form>

        {/* Verified User Profile Card */}
        {verifiedUser && (
          <div className="mb-6 p-4 rounded-2xl bg-[#0D111A] border border-emerald-500/40 shadow-glow-success/20 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {verifiedUser.userAvatar ? (
                  <img
                    src={verifiedUser.userAvatar}
                    alt={verifiedUser.username}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm uppercase border border-emerald-500/40">
                    {verifiedUser.username[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">@{verifiedUser.username}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    Ranking: #{verifiedUser.ranking ? verifiedUser.ranking.toLocaleString() : 'Active'} • {verifiedUser.totalSolved} Problems Solved
                  </p>
                </div>
              </div>

              <a
                href={`https://leetcode.com/${verifiedUser.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
                title="View LeetCode Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2638]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={verifiedUser ? handleConfirmLink : handleCheckUser}
            disabled={saving || (!username.trim() && !verifiedUser)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] hover:opacity-95 text-[#07090E] transition-all shadow-glow-gold disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#07090E]" />
                <span>Linking Account...</span>
              </>
            ) : verifiedUser ? (
              <>
                <Sparkles className="w-4 h-4 text-[#07090E]" />
                <span>Link @{verifiedUser.username} &amp; Verify</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-[#07090E]" />
                <span>Verify Profile First</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
