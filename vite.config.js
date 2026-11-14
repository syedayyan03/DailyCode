import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const USER_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
`;

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

function leetcodeDevProxyPlugin() {
  return {
    name: 'leetcode-dev-proxy',
    configureServer(server) {
      // 1. Check user endpoint
      server.middlewares.use('/api/check-leetcode-user', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        const url = new URL(req.url, 'http://localhost');
        const username = url.searchParams.get('username')?.trim();

        if (!username) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ exists: false, error: 'Username is required' }));
        }

        // Test/Demo bypass
        if (username.toLowerCase().startsWith('test_') || username.toLowerCase() === 'imperial_dev') {
          return res.end(JSON.stringify({
            exists: true,
            user: {
              username,
              realName: 'Imperial Developer',
              userAvatar: null,
              ranking: 1337,
              totalSolved: 42
            }
          }));
        }

        try {
          const fetchRes = await fetch(LEETCODE_GRAPHQL_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
              query: USER_QUERY,
              variables: { username }
            })
          });

          const data = await fetchRes.json();
          if (data?.data?.matchedUser) {
            const mu = data.data.matchedUser;
            const totalSolved = mu.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.count || 0;
            return res.end(JSON.stringify({
              exists: true,
              user: {
                username: mu.username,
                realName: mu.profile?.realName || mu.username,
                userAvatar: mu.profile?.userAvatar,
                ranking: mu.profile?.ranking,
                totalSolved
              }
            }));
          } else {
            return res.end(JSON.stringify({
              exists: false,
              error: 'LeetCode user not found. Please verify the handle spelling.'
            }));
          }
        } catch (err) {
          console.error('[LeetCode Proxy Error]:', err);
          return res.end(JSON.stringify({
            exists: false,
            error: 'Failed to connect to LeetCode API: ' + err.message
          }));
        }
      });

      // 2. Verify submission endpoint with Title & Slug & Upload time matching
      server.middlewares.use('/api/verify-leetcode', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ verified: false, error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { username, problemSlug, problemTitle, challengeDate, challengeUploadedAt } = JSON.parse(body || '{}');

            if (!username || (!problemSlug && !problemTitle)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ verified: false, error: 'Username and problem identifier are required' }));
            }

            // Test/Demo bypass mode
            if (username.toLowerCase().startsWith('test_') || username.toLowerCase() === 'imperial_dev') {
              return res.end(JSON.stringify({
                verified: true,
                matchingSubmission: {
                  title: problemTitle || 'Demo Challenge Match',
                  titleSlug: problemSlug || 'demo-slug',
                  timestamp: Math.floor(Date.now() / 1000),
                  formattedDate: challengeDate || new Date().toISOString().slice(0, 10)
                },
                message: 'Verified via Testing Profile simulation.'
              }));
            }

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

            // Find matching accepted code by Title OR Slug
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
              return res.end(JSON.stringify({
                verified: true,
                matchingSubmission: matching,
                message: `Verified! Accepted submission found for "${matching.title}".`
              }));
            } else {
              return res.end(JSON.stringify({
                verified: false,
                recentSubmissions: submissions.slice(0, 5),
                reason: `Please complete the question first. No accepted code found for "${problemTitle || problemSlug}" on LeetCode today.`
              }));
            }
          } catch (err) {
            console.error('[LeetCode Verification Error]:', err);
            res.statusCode = 500;
            return res.end(JSON.stringify({
              verified: false,
              error: 'Verification service error: ' + err.message
            }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), leetcodeDevProxyPlugin()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
});
