const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const SUBMISSIONS_QUERY = `
query getRecentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    title
    titleSlug
    timestamp
  }
}
`;

function normalizeTitle(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ verified: false, error: 'Method Not Allowed' });
  }

  const { username, problemSlug, problemTitle, challengeDate, challengeUploadedAt } = req.body || {};

  if (!username || (!problemSlug && !problemTitle)) {
    return res.status(400).json({ verified: false, error: 'Username and problem identifier are required' });
  }

  // Demo bypass
  if (username.toLowerCase().startsWith('test_') || username.toLowerCase() === 'imperial_dev') {
    return res.status(200).json({
      verified: true,
      matchingSubmission: {
        title: problemTitle || 'Demo Challenge Match',
        titleSlug: problemSlug || 'demo-slug',
        timestamp: Math.floor(Date.now() / 1000),
        formattedDate: challengeDate || new Date().toISOString().slice(0, 10)
      },
      message: 'Verified via Testing Profile simulation.'
    });
  }

  try {
    const fetchRes = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        query: SUBMISSIONS_QUERY,
        variables: { username, limit: 20 }
      })
    });

    const data = await fetchRes.json();
    const submissions = data?.data?.recentAcSubmissionList || [];

    const cleanSlug = (problemSlug || '').toLowerCase().trim();
    const normTitle = normalizeTitle(problemTitle);
    const normSlug = normalizeTitle(cleanSlug);

    const nowMs = Date.now();
    const toleranceMs = 36 * 60 * 60 * 1000;
    const cutoffTime = nowMs - toleranceMs;

    let uploadCutoffMs = null;
    if (challengeUploadedAt) {
      const parsed = new Date(challengeUploadedAt).getTime();
      if (!isNaN(parsed)) uploadCutoffMs = parsed - (10 * 60 * 1000);
    }

    const matching = submissions.find(sub => {
      if (!sub) return false;
      const subSlug = (sub.titleSlug || '').toLowerCase().trim();
      const subNormTitle = normalizeTitle(sub.title);
      const subNormSlug = normalizeTitle(subSlug);

      const slugMatch = cleanSlug && subSlug === cleanSlug;
      const titleMatch = normTitle && subNormTitle === normTitle;
      const crossMatch = (normTitle && subNormSlug === normTitle) || (normSlug && subNormTitle === normSlug);

      if (!slugMatch && !titleMatch && !crossMatch) return false;

      const subMs = Number(sub.timestamp) * 1000;
      const isAfterUpload = uploadCutoffMs ? subMs >= uploadCutoffMs : true;
      const isRecent = subMs >= cutoffTime && subMs <= nowMs + 3600000;

      return isRecent && isAfterUpload;
    });

    if (matching) {
      return res.status(200).json({
        verified: true,
        matchingSubmission: matching,
        message: `Verified! Accepted submission found for "${matching.title}".`
      });
    } else {
      return res.status(200).json({
        verified: false,
        recentSubmissions: submissions.slice(0, 5),
        reason: `Please complete the question first. No accepted code found for "${problemTitle || problemSlug}" on LeetCode today.`
      });
    }
  } catch (err) {
    console.error('Verification service error:', err);
    return res.status(500).json({
      verified: false,
      error: 'Verification service error: ' + err.message
    });
  }
}
