/**
 * Serverless API endpoint for code compilation and execution across multiple languages:
 * Python, JavaScript, Java, C++, and C using Wandbox API.
 */

const LANGUAGE_CONFIGS = {
  python: {
    compiler: 'cpython-3.12.16',
    defaultExtension: 'py'
  },
  javascript: {
    compiler: 'nodejs-20.17.0',
    defaultExtension: 'js'
  },
  cpp: {
    compiler: 'gcc-13.2.0',
    defaultExtension: 'cpp'
  },
  c: {
    compiler: 'gcc-13.2.0-c',
    defaultExtension: 'c'
  },
  java: {
    compiler: 'openjdk-jdk-21+35',
    defaultExtension: 'java'
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { language = 'python', code, stdin = '' } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'Source code is required' });
  }

  const langKey = language.toLowerCase().trim();
  const langConfig = LANGUAGE_CONFIGS[langKey];

  if (!langConfig) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}. Supported languages: python, javascript, java, cpp, c`
    });
  }

  // Pre-process code based on language
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

  try {
    const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: langConfig.compiler,
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

    return res.status(200).json({
      success: !hasError,
      output: fullOutput,
      compilerError: compilerError || null,
      programError: programError || null,
      executionTime,
      exitCode: exitStatus || (hasError ? '1' : '0'),
      language: langKey
    });
  } catch (err) {
    console.error('Code execution error:', err);
    return res.status(500).json({
      success: false,
      error: 'Code execution service error: ' + err.message
    });
  }
}
