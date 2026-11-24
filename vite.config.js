import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

      // 3. Multi-language code compiler & execution endpoint
      const COMPILER_MAP = {
        python: 'cpython-3.12.16',
        javascript: 'nodejs-20.17.0',
        cpp: 'gcc-13.2.0',
        c: 'gcc-13.2.0-c',
        java: 'openjdk-jdk-21+35'
      };

      server.middlewares.use('/api/compile', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { language = 'python', code = '', stdin = '' } = JSON.parse(body || '{}');

            const langKey = language.toLowerCase().trim();
            const compiler = COMPILER_MAP[langKey];

            if (!compiler) {
              res.statusCode = 400;
              return res.end(JSON.stringify({
                success: false,
                error: `Unsupported language: ${language}. Supported: python, javascript, java, cpp, c`
              }));
            }

            let finalCode = code;
            if (langKey === 'java') {
              finalCode = finalCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');
            } else if (langKey === 'python') {
              // Provide natural terminal echo for input("prompt") so print() prints on a new line
              finalCode = `import builtins as _bi; _oi = _bi.input; _bi.input = lambda p='': (_oi(p) if not p else (lambda v: (print(v), v)[1])(_oi(p)))\n` + code;
            } else if (langKey === 'javascript') {
              finalCode = `
let __stdin_buf = "";
function prompt(msg) {
  if (msg !== undefined && msg !== null) process.stdout.write(String(msg));
  try {
    const fs = require('fs');
    if (!__stdin_buf) {
      __stdin_buf = fs.readFileSync(0, 'utf-8');
    }
    const idx = __stdin_buf.indexOf('\\n');
    let res = "";
    if (idx === -1) {
      res = __stdin_buf;
      __stdin_buf = "";
    } else {
      res = __stdin_buf.substring(0, idx);
      __stdin_buf = __stdin_buf.substring(idx + 1);
    }
    res = res.replace(/\\r$/, '');
    if (msg) process.stdout.write(res + '\\n');
    return res;
  } catch (e) {
    return "";
  }
}
const readline = prompt;
` + '\n' + code;
            }

            const startTime = Date.now();
            const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                compiler,
                code: finalCode,
                stdin: stdin || '',
                save: false
              })
            });

            const data = await wandboxRes.json();
            const executionTime = Date.now() - startTime;

            const programOutput = data.program_output || '';
            const compilerError = data.compiler_error || '';
            const programError = data.program_error || '';
            const programMessage = data.program_message || '';
            const exitStatus = data.status;

            const hasError = exitStatus !== '0' && (Boolean(compilerError) || Boolean(programError));

            // Combine stdout and stderr/errors so users see runtime tracebacks (e.g. EOFError, Exceptions)
            let fullOutput = programOutput;
            if (hasError) {
              const errorText = compilerError || programError;
              if (errorText) {
                fullOutput = fullOutput ? `${fullOutput}\n${errorText}` : errorText;
              }
            }
            if (!fullOutput) {
              fullOutput = programMessage || (hasError ? 'Execution failed with error.' : 'Program executed successfully with no output.');
            }

            return res.end(JSON.stringify({
              success: !hasError,
              output: fullOutput,
              compilerError: compilerError || null,
              programError: programError || null,
              executionTime,
              exitCode: exitStatus || (hasError ? '1' : '0'),
              language: langKey
            }));
          } catch (err) {
            console.error('[Compiler Execution Error]:', err);
            res.statusCode = 500;
            return res.end(JSON.stringify({
              success: false,
              error: 'Execution service error: ' + err.message
            }));
          }
        });
      });

      // 4. Live interactive terminal streaming & execution runner
      const liveSessions = new Map();

      function cleanupLiveSession(id) {
        const sess = liveSessions.get(id);
        if (sess) {
          try {
            if (sess.child && !sess.child.killed) {
              sess.child.kill();
            }
          } catch (e) {}
          try {
            if (sess.tmpDir && fs.existsSync(sess.tmpDir)) {
              fs.rmSync(sess.tmpDir, { recursive: true, force: true });
            }
          } catch (e) {}
          if (sess.timer) clearTimeout(sess.timer);
          liveSessions.delete(id);
        }
      }

      server.middlewares.use('/api/live/start', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          let sessionId = 'dc_' + Math.random().toString(36).substring(2, 10);
          const tmpDir = path.join(os.tmpdir(), sessionId);

          try {
            const { language = 'python', code = '' } = JSON.parse(body || '{}');
            const langKey = language.toLowerCase().trim();

            if (!code.trim()) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Code is required' }));
            }

            fs.mkdirSync(tmpDir, { recursive: true });

            res.writeHead(200, {
              'Content-Type': 'application/x-ndjson; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*'
            });

            // Send session start event
            res.write(JSON.stringify({ type: 'session', sessionId }) + '\n');

            let child;

            if (langKey === 'python') {
              const file = path.join(tmpDir, 'prog.py');
              fs.writeFileSync(file, code, 'utf-8');
              child = spawn('python', ['-u', file], { cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
            } else if (langKey === 'javascript') {
              const file = path.join(tmpDir, 'prog.js');
              let jsCode = code;
              if (jsCode.includes('readline')) {
                jsCode = `
try {
  const _rl = require('readline');
  const _origCI = _rl.createInterface;
  _rl.createInterface = function(opts) {
    const inst = _origCI.call(_rl, opts);
    const _origClose = inst.close;
    inst.close = function() {
      _origClose.call(inst);
      if (opts && opts.input && opts.input.pause) opts.input.pause();
      setTimeout(() => process.exit(0), 50);
    };
    return inst;
  };
} catch(e) {}
` + jsCode;
              }
              fs.writeFileSync(file, jsCode, 'utf-8');
              child = spawn('node', [file], { cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
            } else if (langKey === 'c') {
              const cFile = path.join(tmpDir, 'prog.c');
              const exeFile = path.join(tmpDir, 'prog.exe');
              let cCode = code;
              if (cCode.includes('main(') || cCode.includes('main (')) {
                cCode = cCode.replace(/main\s*\(([^)]*)\)\s*\{/, 'main($1) {\n    setvbuf(stdout, NULL, _IONBF, 0);');
              }
              fs.writeFileSync(cFile, cCode, 'utf-8');

              const compileProc = spawn('gcc', ['-O2', '-o', exeFile, cFile], { cwd: tmpDir });
              let compErr = '';
              compileProc.stderr.on('data', d => { compErr += d.toString(); });
              const compCode = await new Promise(r => compileProc.on('close', r));
              if (compCode !== 0) {
                res.write(JSON.stringify({ type: 'stderr', data: compErr || 'Compilation failed.' }) + '\n');
                res.write(JSON.stringify({ type: 'exit', code: compCode }) + '\n');
                return res.end();
              }
              child = spawn(exeFile, [], { cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
            } else if (langKey === 'cpp') {
              const cppFile = path.join(tmpDir, 'prog.cpp');
              const exeFile = path.join(tmpDir, 'prog.exe');
              fs.writeFileSync(cppFile, code, 'utf-8');

              const compileProc = spawn('g++', ['-O2', '-o', exeFile, cppFile], { cwd: tmpDir });
              let compErr = '';
              compileProc.stderr.on('data', d => { compErr += d.toString(); });
              const compCode = await new Promise(r => compileProc.on('close', r));
              if (compCode !== 0) {
                res.write(JSON.stringify({ type: 'stderr', data: compErr || 'Compilation failed.' }) + '\n');
                res.write(JSON.stringify({ type: 'exit', code: compCode }) + '\n');
                return res.end();
              }
              child = spawn(exeFile, [], { cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
            } else if (langKey === 'java') {
              let javaCode = code;
              const classMatch = javaCode.match(/public\s+class\s+([A-Za-z0-9_]+)/) || javaCode.match(/class\s+([A-Za-z0-9_]+)/);
              const className = classMatch ? classMatch[1] : 'Solution';
              const javaFile = path.join(tmpDir, `${className}.java`);
              fs.writeFileSync(javaFile, javaCode, 'utf-8');

              const compileProc = spawn('javac', [javaFile], { cwd: tmpDir });
              let compErr = '';
              compileProc.stderr.on('data', d => { compErr += d.toString(); });
              const compCode = await new Promise(r => compileProc.on('close', r));
              if (compCode !== 0) {
                res.write(JSON.stringify({ type: 'stderr', data: compErr || 'Compilation failed.' }) + '\n');
                res.write(JSON.stringify({ type: 'exit', code: compCode }) + '\n');
                return res.end();
              }
              child = spawn('java', ['-cp', tmpDir, className], { cwd: tmpDir, stdio: ['pipe', 'pipe', 'pipe'] });
            } else {
              res.write(JSON.stringify({ type: 'stderr', data: `Unsupported language: ${language}` }) + '\n');
              res.write(JSON.stringify({ type: 'exit', code: 1 }) + '\n');
              return res.end();
            }

            const timer = setTimeout(() => {
              try {
                if (child && !child.killed) {
                  res.write(JSON.stringify({ type: 'stderr', data: '\n[Execution timed out after 60s]\n' }) + '\n');
                  res.write(JSON.stringify({ type: 'exit', code: 124 }) + '\n');
                  res.end();
                  child.kill();
                }
              } catch(e) {}
            }, 60000);

            liveSessions.set(sessionId, { child, tmpDir, timer });

            child.stdout.on('data', chunk => {
              res.write(JSON.stringify({ type: 'stdout', data: chunk.toString('utf-8') }) + '\n');
            });

            child.stderr.on('data', chunk => {
              res.write(JSON.stringify({ type: 'stderr', data: chunk.toString('utf-8') }) + '\n');
            });

            child.on('close', (code, signal) => {
              res.write(JSON.stringify({ type: 'exit', code: code ?? 0, signal }) + '\n');
              res.end();
              cleanupLiveSession(sessionId);
            });

            res.on('close', () => {
              cleanupLiveSession(sessionId);
            });
          } catch (err) {
            console.error('[Live Run Error]:', err);
            try {
              res.write(JSON.stringify({ type: 'stderr', data: 'Server error: ' + err.message }) + '\n');
              res.write(JSON.stringify({ type: 'exit', code: 1 }) + '\n');
              res.end();
            } catch(e) {}
            cleanupLiveSession(sessionId);
          }
        });
      });

      server.middlewares.use('/api/live/input', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { sessionId, input = '' } = JSON.parse(body || '{}');
            const session = liveSessions.get(sessionId);
            if (!session || !session.child || session.child.killed) {
              return res.end(JSON.stringify({ success: false, error: 'Session not active' }));
            }

            session.child.stdin.write(input + '\n');
            return res.end(JSON.stringify({ success: true }));
          } catch(err) {
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      server.middlewares.use('/api/live/stop', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { sessionId } = JSON.parse(body || '{}');
            cleanupLiveSession(sessionId);
            return res.end(JSON.stringify({ success: true }));
          } catch(err) {
            return res.end(JSON.stringify({ success: false, error: err.message }));
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
