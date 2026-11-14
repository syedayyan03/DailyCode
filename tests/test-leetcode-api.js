const qSubmissions = `
query getRecentAcSubmissions($username: String!, $limit: Int!) {
  recentAcSubmissionList(username: $username, limit: $limit) {
    title
    titleSlug
    timestamp
  }
}
`;

async function test(username) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    },
    body: JSON.stringify({
      query: qSubmissions,
      variables: { username, limit: 15 }
    })
  });
  const data = await res.json();
  console.log(`Submissions for ${username}:`, JSON.stringify(data, null, 2));
}

test('syedayyan188');
