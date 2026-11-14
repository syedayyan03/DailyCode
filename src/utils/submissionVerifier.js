import { formatLocalDate } from './dateUtils.js';
import { validateLeetCodeUrl } from './leetcodeValidator.js';

/**
 * Normalizes title string for lenient comparisons (removes punctuation, spaces, casing).
 * e.g. "Minimum Positive Sum Subarray " -> "minimumpositivesumsubarray"
 * @param {string} str 
 * @returns {string}
 */
export function normalizeTitle(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts problem slug from LeetCode URL or raw slug string.
 * @param {string} urlOrSlug 
 * @returns {string}
 */
export function extractProblemSlug(urlOrSlug) {
  if (!urlOrSlug) return '';
  const trimmed = urlOrSlug.trim();
  if (trimmed.includes('leetcode.com') || trimmed.includes('/problems/')) {
    const val = validateLeetCodeUrl(trimmed);
    return val.slug || '';
  }
  return trimmed.toLowerCase().replace(/^\/|\/$/g, '');
}

/**
 * Verifies if an accepted submission exists for the given problem title/slug and timeframe.
 * Flexible signature supports both (subs, slug, title, date, uploadAt, tolerance, now)
 * and (subs, slug, date, tolerance, now).
 */
export function verifySubmissionMatch(
  submissions = [],
  targetSlug,
  targetTitleOrDate = '',
  challengeDate = '',
  challengeUploadedAt = null,
  toleranceHours = 36,
  currentTimeMs = Date.now()
) {
  let targetTitle = '';
  let effectiveDate = challengeDate;
  let effectiveTolerance = toleranceHours;
  let effectiveNow = currentTimeMs;

  // Flexible argument check: if 3rd arg is YYYY-MM-DD
  if (typeof targetTitleOrDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(targetTitleOrDate.trim())) {
    effectiveDate = targetTitleOrDate.trim();
    if (typeof challengeDate === 'number') {
      effectiveTolerance = challengeDate;
      effectiveNow = challengeUploadedAt || Date.now();
    }
  } else {
    targetTitle = targetTitleOrDate || '';
  }

  if (!targetSlug && !targetTitle) {
    return { matched: false, reason: 'Target challenge title or slug is missing.' };
  }

  const cleanTargetSlug = extractProblemSlug(targetSlug).toLowerCase();
  const normalizedTargetTitle = normalizeTitle(targetTitle);
  const normalizedTargetSlug = normalizeTitle(cleanTargetSlug);

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return { 
      matched: false, 
      reason: 'Please complete the question first. No recent accepted submissions detected on your LeetCode profile.' 
    };
  }

  const toleranceMs = effectiveTolerance * 60 * 60 * 1000;
  const cutoffTime = effectiveNow - toleranceMs;

  let uploadCutoffMs = null;
  if (challengeUploadedAt && typeof challengeUploadedAt !== 'number') {
    const uploadParsed = new Date(challengeUploadedAt).getTime();
    if (!isNaN(uploadParsed)) {
      uploadCutoffMs = uploadParsed - (10 * 60 * 1000);
    }
  }

  for (const sub of submissions) {
    if (!sub) continue;

    const subSlug = (sub.titleSlug || '').toLowerCase().trim();
    const normalizedSubTitle = normalizeTitle(sub.title);
    const normalizedSubSlug = normalizeTitle(subSlug);

    // Title or Slug matching
    const isSlugMatch = cleanTargetSlug && subSlug === cleanTargetSlug;
    const isTitleMatch = normalizedTargetTitle && normalizedSubTitle === normalizedTargetTitle;
    const isCrossSlugMatch = (normalizedTargetTitle && normalizedSubSlug === normalizedTargetTitle) ||
                             (normalizedTargetSlug && normalizedSubTitle === normalizedTargetSlug);

    if (isSlugMatch || isTitleMatch || isCrossSlugMatch) {
      const subTimeMs = Number(sub.timestamp) * 1000;

      const isAfterUpload = uploadCutoffMs ? subTimeMs >= uploadCutoffMs : true;
      const isWithinTolerance = subTimeMs >= cutoffTime && subTimeMs <= effectiveNow + 3600000;

      const subLocalDate = formatLocalDate(new Date(subTimeMs));
      const isSameDate = effectiveDate ? subLocalDate === effectiveDate : false;

      if ((isWithinTolerance || isSameDate) && isAfterUpload) {
        return {
          matched: true,
          matchingSubmission: {
            ...sub,
            formattedDate: subLocalDate,
            submittedAt: new Date(subTimeMs).toISOString()
          }
        };
      }
    }
  }

  return {
    matched: false,
    reason: `Please complete the question first. No accepted code matching "${targetTitle || targetSlug}" was detected on your LeetCode profile for today.`
  };
}
