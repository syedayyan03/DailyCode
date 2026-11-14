import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  Calendar, 
  Link as LinkIcon, 
  Tag, 
  FileText, 
  Layers, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Zap,
  Crown
} from 'lucide-react';
import { 
  getAllChallenges, 
  saveChallenge, 
  deleteChallenge 
} from '../services/problemService';
import { formatLocalDate, getTodayString, formatDisplayDate } from '../utils/dateUtils';
import { validateLeetCodeUrl, slugToTitle } from '../utils/leetcodeValidator';

const INITIAL_FORM = {
  title: '',
  leetcodeURL: '',
  difficulty: 'Medium',
  topic: 'Arrays & Hashing',
  description: '',
  date: getTodayString()
};

const COMMON_TOPICS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees & Binary Trees',
  'Tries',
  'Backtracking',
  'Heap / Priority Queue',
  'Graphs',
  'Dynamic Programming',
  '1-D Dynamic Programming',
  '2-D Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation'
];

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [urlValidationError, setUrlValidationError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [deleteConfirmDate, setDeleteConfirmDate] = useState(null);

  const todayStr = getTodayString();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const list = await getAllChallenges();
      setChallenges(list);
    } catch (err) {
      showError('Failed to load published challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'leetcodeURL') {
      const val = validateLeetCodeUrl(value);
      if (value.trim() && !val.isValid) {
        setUrlValidationError(val.error);
      } else {
        setUrlValidationError('');
        if (val.isValid && val.slug && !formData.title) {
          setFormData(prev => ({ ...prev, title: slugToTitle(val.slug) }));
        }
      }
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showError('Please provide a problem title.');
      return;
    }
    if (!formData.leetcodeURL.trim()) {
      showError('Please provide a LeetCode problem URL.');
      return;
    }
    const urlValidation = validateLeetCodeUrl(formData.leetcodeURL);
    if (!urlValidation.isValid) {
      showError(urlValidation.error || 'Please enter a valid LeetCode URL.');
      return;
    }
    if (!formData.topic.trim()) {
      showError('Please specify a DSA topic.');
      return;
    }
    if (!formData.description.trim()) {
      showError('Please enter a short description for the problem.');
      return;
    }
    if (!formData.date) {
      showError('Please select a challenge date.');
      return;
    }

    setSubmitting(true);
    try {
      await saveChallenge(formData);
      showSuccess(isEditing ? `Challenge updated for ${formData.date}` : `Daily Challenge published for ${formData.date}!`);
      setIsEditing(false);
      setFormData({
        ...INITIAL_FORM,
        date: getTodayString()
      });
      fetchChallenges();
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to save challenge to Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (challenge) => {
    setFormData({
      title: challenge.title || '',
      leetcodeURL: challenge.leetcodeURL || '',
      difficulty: challenge.difficulty || 'Medium',
      topic: challenge.topic || 'Arrays & Hashing',
      description: challenge.description || '',
      date: challenge.date || getTodayString()
    });
    setIsEditing(true);
    setUrlValidationError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      ...INITIAL_FORM,
      date: getTodayString()
    });
    setUrlValidationError('');
  };

  const handleDelete = async (dateStr) => {
    try {
      await deleteChallenge(dateStr);
      showSuccess(`Deleted challenge for ${dateStr}.`);
      setDeleteConfirmDate(null);
      fetchChallenges();
    } catch (err) {
      console.error(err);
      showError(err.message || 'Failed to delete challenge.');
    }
  };

  const filteredChallenges = challenges.filter(c => {
    const q = filterQuery.toLowerCase();
    return (
      (c.title || '').toLowerCase().includes(q) ||
      (c.topic || '').toLowerCase().includes(q) ||
      (c.date || '').includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-2 shadow-glow-amethyst/20">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>ADMINISTRATOR CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Challenge Management &amp; Publisher
            </h1>
            <p className="text-sm text-zinc-400 font-sans mt-1">
              Create, edit, schedule, or archive daily LeetCode challenges for the community.
            </p>
          </div>

          <button
            onClick={fetchChallenges}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] text-xs font-mono text-zinc-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
            <span>Refresh Challenges</span>
          </button>
        </div>

        {/* Top Section: Challenge Publisher Form */}
        <section className="glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#3B82F6]" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E2638]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-glow-gold/20">
                <PlusCircle className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? `Edit Challenge for ${formData.date}` : 'Publish / Schedule Daily Challenge'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: 'Two Sum',
                      leetcodeURL: 'https://leetcode.com/problems/two-sum/',
                      difficulty: 'Easy',
                      topic: 'Arrays & Hashing',
                      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
                      date: getTodayString()
                    });
                    setUrlValidationError('');
                  }}
                  className="text-xs font-mono text-[#F3E5AB] hover:text-white px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Fill Sample Challenge</span>
                </button>
              )}

              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs font-mono text-zinc-400 hover:text-white px-3.5 py-1.5 rounded-xl border border-[#1E2638] hover:bg-[#0D111A] transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Problem Title */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Problem Title <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two Sum"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-sans"
                  required
                />
              </div>

              {/* Challenge Date */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Challenge Date (YYYY-MM-DD) <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all"
                    required
                  />
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {formData.date === todayStr ? '⭐ Scheduled for Today' : formData.date > todayStr ? '📅 Scheduled for Future Date' : '📜 Past Date Challenge'}
                </span>
              </div>
            </div>

            {/* LeetCode URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  LeetCode Problem URL <span className="text-[#D4AF37]">*</span>
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Format: https://leetcode.com/problems/&lt;slug&gt;/
                </span>
              </div>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/two-sum/"
                  value={formData.leetcodeURL}
                  onChange={(e) => handleInputChange('leetcodeURL', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090D18] border text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    urlValidationError 
                      ? 'border-rose-500/60 focus:ring-rose-500/40' 
                      : 'border-[#1E2638] focus:ring-[#D4AF37]/50'
                  }`}
                  required
                />
              </div>
              {urlValidationError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{urlValidationError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Difficulty <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Easy', 'Medium', 'Hard'].map((diff) => {
                    const isSelected = formData.difficulty === diff;
                    return (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => handleInputChange('difficulty', diff)}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold font-mono border transition-all ${
                          isSelected
                            ? diff === 'Easy'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-glow-success/30'
                              : diff === 'Medium'
                              ? 'bg-[#D4AF37]/25 text-[#F3E5AB] border-[#D4AF37] shadow-glow-gold/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-glow-danger/30'
                            : 'bg-[#090D18] border-[#1E2638] text-zinc-400 hover:text-white hover:border-zinc-600'
                        }`}
                      >
                        ✦ {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DSA Topic */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  DSA Topic <span className="text-[#D4AF37]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="topics-datalist"
                    placeholder="e.g. Arrays & Hashing"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-mono"
                    required
                  />
                  <datalist id="topics-datalist">
                    {COMMON_TOPICS.map(topic => (
                      <option key={topic} value={topic} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Short Description / Intuition Summary <span className="text-[#D4AF37]">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Briefly state the problem statement, constraints, or key intuition..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2638]">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] hover:opacity-95 text-[#07090E] transition-all shadow-glow-gold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#07090E]" />
                    <span>Publishing to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-[#07090E]" />
                    <span>{isEditing ? 'Update Challenge' : 'Publish Challenge'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Bottom Section: Published & Scheduled Challenges Table */}
        <section className="glass-card border border-[#1E2638] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <span>Published &amp; Scheduled Challenges</span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Total: {challenges.length} challenges in database
              </p>
            </div>

            {/* Filter Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title, topic, date..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090D18] border border-[#1E2638] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-mono"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center text-zinc-400 font-mono text-sm">
              Loading challenges from Firestore...
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="py-14 text-center text-zinc-400 font-mono text-sm">
              No challenges found. Create one using the form above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#1E2638] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Problem</th>
                    <th className="py-3.5 px-4">Topic</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]/50 font-sans">
                  {filteredChallenges.map((ch) => {
                    const isToday = ch.date === todayStr;
                    const isFuture = ch.date > todayStr;

                    return (
                      <tr 
                        key={ch.id || ch.date} 
                        className={`hover:bg-[#0D111A]/80 transition-colors ${
                          isToday ? 'bg-[#D4AF37]/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-semibold">{ch.date}</span>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 font-bold font-mono">
                                TODAY
                              </span>
                            )}
                            {isFuture && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                                UPCOMING
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{ch.title}</span>
                            <a
                              href={ch.leetcodeURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-[#D4AF37] transition-colors"
                              title="Open on LeetCode"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-zinc-400 font-mono">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0D111A] text-blue-300 text-xs border border-[#1E2638]">
                            {ch.topic}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            ch.difficulty === 'Easy'
                              ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                              : ch.difficulty === 'Medium'
                              ? 'text-[#F3E5AB] bg-[#D4AF37]/15 border border-[#D4AF37]/35'
                              : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'
                          }`}>
                            {ch.difficulty}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(ch)}
                              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#0D111A] transition-colors"
                              title="Edit Challenge"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {deleteConfirmDate === ch.date ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleDelete(ch.date)}
                                  className="px-2.5 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-glow-danger"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmDate(null)}
                                  className="px-2.5 py-1 rounded-xl bg-[#0D111A] text-zinc-300 text-xs hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmDate(ch.date)}
                                className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete Challenge"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
