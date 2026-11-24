import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Crown,
  BookOpen, 
  Clock, 
  Award, 
  Sparkles,
  Loader2,
  Copy,
  Check,
  Zap,
  Code,
  Terminal,
  ShieldCheck,
  UserCheck,
  Edit3
} from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  getLinkedLeetCodeUsername, 
  verifyLeetCodeSubmission 
} from '../services/leetcodeService';
import LinkLeetCodeModal from './LinkLeetCodeModal';
import VerificationResultModal from './VerificationResultModal';

export default function DailyChallenge({ 
  challenge, 
  isCompleted, 
  onMarkCompleted 
}) {
  const { currentUser } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedUsername, setLinkedUsername] = useState(() => getLinkedLeetCodeUsername(currentUser));
  
  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // { recentSubmissions, reason }

  useEffect(() => {
    setLinkedUsername(getLinkedLeetCodeUsername(currentUser));
    
    const handleLinkedUpdate = (e) => {
      setLinkedUsername(e.detail?.username || '');
    };

    window.addEventListener('dailycode_leetcode_linked', handleLinkedUpdate);
    return () => window.removeEventListener('dailycode_leetcode_linked', handleLinkedUpdate);
  }, [currentUser]);

  if (!challenge) return null;

  const handleCopyLink = async () => {
    if (!challenge.leetcodeURL) return;
    try {
      await navigator.clipboard.writeText(challenge.leetcodeURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  // Perform the actual verification on LeetCode
  const executeVerification = async (targetUsername) => {
    const usernameToVerify = targetUsername || linkedUsername;
    if (!usernameToVerify) {
      setIsLinkModalOpen(true);
      return;
    }

    setSubmitting(true);
    setVerificationResult(null);

    try {
      const result = await verifyLeetCodeSubmission({
        username: usernameToVerify,
        leetcodeURL: challenge.leetcodeURL,
        problemSlug: challenge.slug,
        problemTitle: challenge.title,
        challengeDate: challenge.date,
        challengeUploadedAt: challenge.createdAt || challenge.updatedAt
      });

      if (result.verified) {
        // Record completion in store/db
        await onMarkCompleted(challenge);

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#D4AF37', '#F3E5AB', '#3B82F6', '#10B981', '#E6CA65']
          });
        } catch (e) {}

        showSuccess(`Verified on LeetCode! Accepted solution found for "${challenge.title}".`);
      } else {
        // Show verification failed dialog with details & recent submissions
        setVerificationResult({
          username: usernameToVerify,
          recentSubmissions: result.recentSubmissions || [],
          reason: result.reason || 'No accepted submission found for today.'
        });
      }
    } catch (err) {
      console.error(err);
      showError(err.message || 'Verification service error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteClick = async () => {
    if (isCompleted || submitting) return;

    // Step 1: If LeetCode account not linked, open linking modal
    if (!linkedUsername) {
      setIsLinkModalOpen(true);
      return;
    }

    // Step 2: If linked, execute verification directly
    await executeVerification(linkedUsername);
  };

  const difficultyStyles = {
    Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-glow-success/20',
    Medium: 'bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/40 shadow-glow-gold/25',
    Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-glow-danger/20'
  };

  const diffBadgeClass = difficultyStyles[challenge.difficulty] || difficultyStyles.Medium;

  return (
    <>
      <div className="relative glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-9 shadow-2xl overflow-hidden group">
        {/* Top luminous imperial gold rim */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#3B82F6]" />
        
        {/* Dynamic ambient gold background glow */}
        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none group-hover:bg-[#D4AF37]/10 transition-all duration-500" />

        {/* Header Meta: Date, Topic & Difficulty */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#0D111A] px-3.5 py-1.5 rounded-xl border border-[#1E2638]">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{formatDisplayDate(challenge.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* DSA Topic Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-blue-950/30 text-blue-300 border border-blue-500/35">
              <Tag className="w-3 h-3 text-blue-400" />
              {challenge.topic}
            </span>

            {/* Difficulty Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${diffBadgeClass}`}>
              ✦ {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Problem Title & Solved Badge */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] uppercase font-mono tracking-widest text-[#E6CA65] font-bold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              Imperial Daily Focus
            </span>

            {/* Linked LeetCode Profile Badge */}
            {linkedUsername ? (
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] text-zinc-300 hover:text-white transition-colors group/user"
                title="Click to change linked LeetCode username"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>LeetCode: <strong className="text-[#F3E5AB]">@{linkedUsername}</strong></span>
                <Edit3 className="w-3 h-3 text-zinc-500 group-hover/user:text-white transition-colors" />
              </button>
            ) : (
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 text-blue-300 transition-colors"
              >
                <span>✦ Link LeetCode Account</span>
              </button>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {challenge.title}
          </h2>
        </div>

        {/* Proof of Work verification notice banner */}
        <div className="mb-6 px-3.5 py-2 rounded-xl bg-[#0D111A] border border-[#1E2638] flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Proof of Work Verification: <strong>LeetCode Live Sync</strong></span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">Requires accepted code submission</span>
        </div>

        {/* Problem Description */}
        <div className="mb-8 p-5 rounded-2xl bg-[#090D18]/90 border border-[#1E2638] relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1E2638]/70 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-[#F3E5AB]">
              <Code className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Problem Objective</span>
            </span>
            <span className="text-zinc-500">DSA Challenge Specification</span>
          </div>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
            {challenge.description}
          </p>
        </div>

        {/* Action Bar: LeetCode Link, Quick Copy, and Completion Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#1E2638]">
          
          {/* LeetCode Links & Copy */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={challenge.leetcodeURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-blue-500/50 text-white text-xs sm:text-sm font-semibold transition-all group/link"
            >
              <Code className="w-4 h-4 text-blue-400" />
              <span>Solve on LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover/link:text-blue-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>

            {/* Solve Here (Interactive In-App Cloud Compiler) */}
            <Link
              to={`/solve?date=${challenge.date || ''}`}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 hover:from-purple-600/35 hover:to-blue-600/35 border border-purple-500/40 hover:border-purple-500/70 text-purple-200 hover:text-white text-xs sm:text-sm font-bold transition-all shadow-glow-amethyst/20"
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Solve Here</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="p-3 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-[#D4AF37]/50 text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Copy LeetCode URL"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[11px] font-mono text-[#F3E5AB]">Copied!</span>
                </>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Completion Action with Proof Verification */}
          <div>
            {isCompleted ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold font-mono shadow-glow-success/30">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Verified &amp; Solved on LeetCode!</span>
              </div>
            ) : (
              <button
                onClick={handleCompleteClick}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] hover:opacity-95 text-[#07090E] font-extrabold text-xs sm:text-sm transition-all shadow-glow-gold disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#07090E]" />
                    <span>Verifying on LeetCode...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#07090E]" />
                    <span>Verify &amp; Mark Completed</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal 1: Link LeetCode Profile */}
      <LinkLeetCodeModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        currentUser={currentUser}
        onLinkedSuccess={(newUsername) => {
          setLinkedUsername(newUsername);
          // Automatically proceed to verification with the newly linked account!
          executeVerification(newUsername);
        }}
      />

      {/* Modal 2: Verification Failed / Not Solved Yet */}
      {verificationResult && (
        <VerificationResultModal
          isOpen={Boolean(verificationResult)}
          onClose={() => setVerificationResult(null)}
          challenge={challenge}
          username={verificationResult.username}
          recentSubmissions={verificationResult.recentSubmissions}
          reason={verificationResult.reason}
          onRetry={() => {
            setVerificationResult(null);
            executeVerification(verificationResult.username);
          }}
          onChangeUsername={() => {
            setVerificationResult(null);
            setIsLinkModalOpen(true);
          }}
        />
      )}
    </>
  );
}
