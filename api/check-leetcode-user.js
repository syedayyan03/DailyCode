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

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const username = req.query?.username?.trim() || req.body?.username?.trim();

  if (!username) {
    return res.status(400).json({ exists: false, error: 'Username is required' });
  }

  // Demo bypass
  if (username.toLowerCase().startsWith('test_') || username.toLowerCase() === 'imperial_dev') {
    return res.status(200).json({
      exists: true,
      user: {
        username,
        realName: 'Imperial Developer',
        userAvatar: null,
        ranking: 1337,
        totalSolved: 42
      }
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
        query: USER_QUERY,
        variables: { username }
      })
    });

    const data = await fetchRes.json();
    if (data?.data?.matchedUser) {
      const mu = data.data.matchedUser;
      const totalSolved = mu.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.count || 0;
      return res.status(200).json({
        exists: true,
        user: {
          username: mu.username,
          realName: mu.profile?.realName || mu.username,
          userAvatar: mu.profile?.userAvatar,
          ranking: mu.profile?.ranking,
          totalSolved
        }
      });
    } else {
      return res.status(200).json({
        exists: false,
        error: 'LeetCode user not found. Please verify the handle spelling.'
      });
    }
  } catch (err) {
    console.error('LeetCode Proxy error:', err);
    return res.status(500).json({
      exists: false,
      error: 'Failed to connect to LeetCode API: ' + err.message
    });
  }
}
