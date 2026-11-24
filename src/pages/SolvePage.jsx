import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ExternalLink, 
  Crown, 
  Code, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  Layers, 
  Sparkles,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { getTodayString, formatDisplayDate } from '../utils/dateUtils';
import { subscribeToChallenge } from '../services/problemService';
import { useToast } from '../context/ToastContext';

// Supported compiler languages
const LANGUAGES = [
  { id: 'python', name: 'Python', version: 'Python 3.12', ext: '.py' },
  { id: 'javascript', name: 'JavaScript', version: 'Node.js 20', ext: '.js' },
  { id: 'java', name: 'Java', version: 'OpenJDK 21', ext: '.java' },
  { id: 'cpp', name: 'C++', version: 'GCC 13.2', ext: '.cpp' },
  { id: 'c', name: 'C', version: 'GCC 13.2', ext: '.c' }
];

// Generate starter templates
function getDefaultTemplates(challengeTitle = 'Daily Problem') {
  return {
    python: `# ${challengeTitle}
import sys

class Solution:
    def solve(self, *args):
        # Write your algorithmic solution here
        print("Algorithm executed successfully!")
        return True

if __name__ == "__main__":
    sol = Solution()
    # Test your solution with sample inputs
    result = sol.solve()
    print("Execution Result:", result)
`,
    javascript: `/**
 * ${challengeTitle}
 */
function solve(...args) {
    // Write your algorithmic solution here
    console.log("Algorithm executed successfully!");
    return true;
}

// Test your solution with sample inputs
const result = solve();
console.log("Execution Result:", result);
`,
    java: `import java.util.*;

class Solution {
    public static void main(String[] args) {
        // ${challengeTitle}
        System.out.println("Algorithm executed successfully!");
        System.out.println("Execution Result: Complete");
    }
}
`,
    cpp: `// ${challengeTitle}
#include <iostream>
#include <vector>
#include <string>

class Solution {
public:
    void solve() {
        // Write your algorithmic solution here
        std::cout << "Algorithm executed successfully!" << std::endl;
    }
};

int main() {
    Solution sol;
    sol.solve();
    std::cout << "Execution Result: Complete" << std::endl;
    return 0;
}
`,
    c: `// ${challengeTitle}
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your algorithmic solution here
    printf("Algorithm executed successfully!\\n");
    printf("Execution Result: Complete\\n");
    return 0;
}
`
  };
}

export default function SolvePage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const todayStr = dateParam || getTodayString();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [challenge, setChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [selectedLang, setSelectedLang] = useState('python');
  const [codeMap, setCodeMap] = useState({});
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'problem' or 'editor'

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [exitCode, setExitCode] = useState(null);
  const [isSuccess, setIsSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [sessionInputs, setSessionInputs] = useState([]);

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const terminalRef = useRef(null);
  const editorCardRef = useRef(null);
  const stdinRef = useRef(null);
  const terminalInputRef = useRef(null);
  const liveSessionIdRef = useRef(null);

  // Helper to detect if code uses standard input functions
  const detectNeedsInput = (code, lang) => {
    if (!code) return false;
    switch (lang) {
      case 'python':
        return /\b(input\s*\(|sys\.stdin)/.test(code);
      case 'javascript':
        return /\b(prompt\s*\(|readline\s*\(|readFileSync\s*\(\s*0\b)/.test(code);
      case 'cpp':
        return /\b(cin\b|getline\s*\(\s*cin)/.test(code);
      case 'c':
        return /\b(scanf\s*\(|getchar\s*\(|fgets\s*\(|gets\s*\()/.test(code);
      case 'java':
        return /\b(Scanner\b|System\.in\b|BufferedReader\b)/.test(code);
      default:
        return false;
    }
  };

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Subscribe to challenge
  useEffect(() => {
    setLoadingChallenge(true);
    const unsub = subscribeToChallenge(todayStr, (data) => {
      setChallenge(data);
      setLoadingChallenge(false);

      // Initialize default templates if not set
      const defaultTemplates = getDefaultTemplates(data?.title || 'Daily Problem');
      setCodeMap(prev => ({
        python: prev.python || defaultTemplates.python,
        javascript: prev.javascript || defaultTemplates.javascript,
        java: prev.java || defaultTemplates.java,
        cpp: prev.cpp || defaultTemplates.cpp,
        c: prev.c || defaultTemplates.c
      }));
    });

    return () => unsub && unsub();
  }, [todayStr]);

  const currentCode = codeMap[selectedLang] || '';

  const handleCodeChange = (newCode) => {
    setCodeMap(prev => ({
      ...prev,
      [selectedLang]: newCode
    }));
  };

  // Smart code editor key handler: Auto-indentation, auto-closing brackets/quotes, tab navigation
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const code = currentCode;

    const PAIRS = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    const CLOSING_CHARS = new Set([')', '}', ']', '"', "'", '`']);

    // 1. Selection wrapping with pairs
    if (start !== end && PAIRS[e.key]) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = PAIRS[openChar];
      const selected = code.substring(start, end);
      const updated = code.substring(0, start) + openChar + selected + closeChar + code.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
      }, 0);
      return;
    }

    // 2. Overtyping existing closing brackets or quotes
    if (start === end && CLOSING_CHARS.has(e.key) && code[start] === e.key) {
      if (['"', "'", '`'].includes(e.key) && start > 0 && code[start - 1] === '\\') {
        // Escaped quote, proceed normally
      } else {
        e.preventDefault();
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
        return;
      }
    }

    // 3. Auto-close opening brackets / quotes when no selection
    if (start === end && PAIRS[e.key]) {
      const openChar = e.key;
      const closeChar = PAIRS[openChar];

      // For quotes, don't auto-close if preceded by an alphanumeric character
      if (['"', "'", '`'].includes(openChar)) {
        const prevChar = start > 0 ? code[start - 1] : '';
        if (/[a-zA-Z0-9_]/.test(prevChar)) {
          return;
        }
      }

      e.preventDefault();
      const updated = code.substring(0, start) + openChar + closeChar + code.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 4. Backspace: delete matching empty pair or 4-space indentation
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = code[start - 1];
      const nextChar = code[start];

      // Case A: Deleting an empty pair: (), {}, [], "", '', ``
      if (PAIRS[prevChar] === nextChar) {
        e.preventDefault();
        const updated = code.substring(0, start - 1) + code.substring(start + 1);
        handleCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
        return;
      }

      // Case B: 4-space indentation deletion
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const col = start - lineStart;
      const lineBeforeCursor = code.substring(lineStart, start);
      if (col >= 4 && lineBeforeCursor.endsWith('    ') && /^\s*$/.test(lineBeforeCursor)) {
        e.preventDefault();
        const updated = code.substring(0, start - 4) + code.substring(start);
        handleCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 4;
        }, 0);
        return;
      }
    }

    // 5. Enter key: Auto-indentation & expanding brace blocks
    if (e.key === 'Enter') {
      e.preventDefault();

      const prevChar = start > 0 ? code[start - 1] : '';
      const nextChar = start < code.length ? code[start] : '';

      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.substring(lineStart, start);
      const match = currentLine.match(/^(\s*)/);
      const currentIndent = match ? match[1] : '';

      // Case A: Expanding between { and }, or ( and ), or [ and ]
      if (
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '[' && nextChar === ']')
      ) {
        const extraIndent = currentIndent + '    ';
        const insertText = '\n' + extraIndent + '\n' + currentIndent;
        const updated = code.substring(0, start) + insertText + code.substring(end);
        handleCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + extraIndent.length + 1;
        }, 0);
        return;
      }

      // Case B: Regular Enter with automatic indentation persistence & increase after : or { or (
      let newIndent = currentIndent;
      const trimmedLine = currentLine.trimEnd();
      if (
        trimmedLine.endsWith('{') || 
        trimmedLine.endsWith(':') || 
        trimmedLine.endsWith('(') || 
        trimmedLine.endsWith('[')
      ) {
        newIndent += '    ';
      }

      const insertText = '\n' + newIndent;
      const updated = code.substring(0, start) + insertText + code.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
      }, 0);
      return;
    }

    // 6. Tab / Shift+Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();

      // Multi-line selection indent/unindent
      if (start !== end && code.substring(start, end).includes('\n')) {
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = code.indexOf('\n', end);
        const actualEnd = lineEnd === -1 ? code.length : lineEnd;
        const selectedBlock = code.substring(lineStart, actualEnd);
        const lines = selectedBlock.split('\n');

        let modifiedLines;
        if (e.shiftKey) {
          // Unindent: remove up to 4 leading spaces
          modifiedLines = lines.map(line => line.replace(/^( {1,4}|\t)/, ''));
        } else {
          // Indent: add 4 leading spaces
          modifiedLines = lines.map(line => '    ' + line);
        }

        const newBlock = modifiedLines.join('\n');
        const updated = code.substring(0, lineStart) + newBlock + code.substring(actualEnd);
        handleCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = lineStart;
          textarea.selectionEnd = lineStart + newBlock.length;
        }, 0);
        return;
      }

      // Single line Shift+Tab unindent
      if (e.shiftKey) {
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const line = code.substring(lineStart);
        const spaceMatch = line.match(/^( {1,4}|\t)/);
        if (spaceMatch) {
          const removedCount = spaceMatch[0].length;
          const updated = code.substring(0, lineStart) + code.substring(lineStart + removedCount);
          handleCodeChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - removedCount);
          }, 0);
        }
        return;
      }

      // Normal Tab: insert 4 spaces
      const spaces = '    ';
      const updated = code.substring(0, start) + spaces + code.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
      return;
    }
  };

  const handleStopRun = async () => {
    if (liveSessionIdRef.current) {
      try {
        await fetch('/api/live/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: liveSessionIdRef.current })
        });
      } catch (e) {}
    }
    setRunning(false);
    liveSessionIdRef.current = null;
  };

  const handleReset = () => {
    handleStopRun();
    const defaultTemplates = getDefaultTemplates(challenge?.title || 'Daily Problem');
    handleCodeChange(defaultTemplates[selectedLang]);
    setOutput('');
    setExecutionTime(null);
    setIsSuccess(null);
    setSessionInputs([]);
    setStdin('');
    showSuccess(`Reset ${selectedLang.toUpperCase()} code to starter template.`);
  };

  const handleRunCode = async () => {
    if (!currentCode.trim()) {
      showError('Please write some code before running.');
      return;
    }

    if (running && liveSessionIdRef.current) {
      handleStopRun();
    }

    setRunning(true);
    setOutput('');
    setExecutionTime(null);
    setIsSuccess(null);
    setExitCode(null);
    setTerminalInput('');
    setSessionInputs([]);

    // Automatically bring the terminal smoothly into view
    setTimeout(() => {
      terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      terminalInputRef.current?.focus();
    }, 60);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          code: currentCode
        })
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'session') {
              liveSessionIdRef.current = msg.sessionId;
            } else if (msg.type === 'stdout' || msg.type === 'stderr') {
              setOutput(prev => prev + msg.data);
              setTimeout(() => {
                terminalInputRef.current?.focus();
              }, 20);
            } else if (msg.type === 'exit') {
              setExecutionTime(Date.now() - startTime);
              setExitCode(msg.code);
              setIsSuccess(msg.code === 0);
              setRunning(false);
              liveSessionIdRef.current = null;
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      setRunning(false);
      setIsSuccess(false);
      setOutput(prev => prev + `\nExecution Error: ${err.message}`);
    }
  };

  const handleSendTerminalInput = async (e) => {
    if (e) e.preventDefault();
    const inputToSend = terminalInput;
    setTerminalInput('');

    // Echo input into the terminal output stream just like a real terminal!
    setOutput(prev => prev + inputToSend + '\n');

    if (liveSessionIdRef.current) {
      try {
        await fetch('/api/live/input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: liveSessionIdRef.current,
            input: inputToSend
          })
        });
      } catch (err) {
        console.error('Failed to send terminal input:', err);
      }
    }
  };

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate line numbers
  const linesCount = Math.max(currentCode.split('\n').length, 12);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-glow-success/20',
    Medium: 'bg-[#D4AF37]/15 text-[#F3E5AB] border-[#D4AF37]/40 shadow-glow-gold/20',
    Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-glow-danger/20'
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col selection:bg-[#D4AF37]/30 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E2638] bg-[#07090E]/95 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Back button & Problem title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] text-zinc-300 hover:text-white text-xs font-semibold transition-all group flex-shrink-0"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#B38E22] p-[1px] flex-shrink-0">
                <div className="w-full h-full bg-[#0D111A] rounded-[11px] flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate">
                {challenge?.title || 'Interactive Compiler'}
              </h1>
              {challenge?.difficulty && (
                <span className={`hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${difficultyColors[challenge.difficulty] || difficultyColors.Medium}`}>
                  {challenge.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Right: LeetCode External Link & Action */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {challenge?.leetcodeURL && (
              <a
                href={challenge.leetcodeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D111A] hover:bg-dark-card-hover border border-[#1E2638] hover:border-blue-500/50 text-blue-300 text-xs font-medium transition-all"
              >
                <Code className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Open on LeetCode</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Tab Switcher (< lg) */}
      <div className="lg:hidden flex border-b border-[#1E2638] bg-[#0D111A] px-4 py-2 gap-2">
        <button
          onClick={() => setMobileTab('problem')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'problem'
              ? 'bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Problem Description</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'editor'
              ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Code Editor &amp; Output</span>
        </button>
      </div>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Problem Details (5 Cols on lg)               */}
        {/* ======================================================== */}
        <section className={`lg:col-span-5 space-y-5 ${mobileTab === 'problem' ? 'block' : 'hidden lg:block'}`}>
          <div className="glass-card border border-[#1E2638] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-blue-500 to-purple-500" />

            {/* Problem Header Info */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {challenge?.difficulty && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${difficultyColors[challenge.difficulty] || difficultyColors.Medium}`}>
                  {challenge.difficulty}
                </span>
              )}
              {challenge?.topic && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0D111A] border border-[#1E2638] text-zinc-300">
                  {challenge.topic}
                </span>
              )}
              <span className="text-xs font-mono text-zinc-500">
                {formatDisplayDate(todayStr, false)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-4">
              {challenge?.title || 'Daily Algorithmic Challenge'}
            </h2>

            {/* Problem Statement */}
            <div className="mb-6 pb-6 border-b border-[#1E2638]">
              <h3 className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                <span>Problem Description</span>
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {challenge?.description || 'Loading challenge details...'}
              </p>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-[#07090E]/80 border border-[#1E2638] space-y-2 text-xs font-sans text-zinc-400">
              <div className="flex items-center gap-2 text-[#F3E5AB] font-semibold text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Compiler Workflow</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 leading-relaxed">
                <li>Select your language (Python, JavaScript, Java, C++, C).</li>
                <li>Write your solution or test logic in the editor.</li>
                <li>Click <strong className="text-white">"Run Code"</strong> to execute your code on live cloud compilers.</li>
                <li>Verify your logic, then submit on LeetCode to claim your streak!</li>
              </ul>
            </div>

            {/* Direct LeetCode Callout */}
            {challenge?.leetcodeURL && (
              <div className="mt-5 pt-4 border-t border-[#1E2638] flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-400">Ready to submit?</span>
                <a
                  href={challenge.leetcodeURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-glow-sapphire/20"
                >
                  <span>Submit on LeetCode</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Code Editor & Execution Panel (7 Cols on lg)*/}
        {/* ======================================================== */}
        <section className={`lg:col-span-7 space-y-4 ${mobileTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          <div ref={editorCardRef} className="glass-card border border-[#1E2638] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Editor Top Toolbar: Language Selector + Actions */}
            <div className="px-4 py-3 bg-[#0D111A] border-b border-[#1E2638] flex flex-wrap items-center justify-between gap-3">
              
              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 font-medium">Language:</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#07090E] border border-[#1E2638] focus:border-[#D4AF37] text-white text-xs font-mono font-bold focus:outline-none transition-colors cursor-pointer"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.version})
                    </option>
                  ))}
                </select>
              </div>

              {/* Execution Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#07090E] hover:bg-dark-card-hover border border-[#1E2638] text-zinc-400 hover:text-white text-xs font-mono transition-colors"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowStdin(!showStdin);
                    if (!showStdin) setTimeout(() => stdinRef.current?.focus(), 50);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                    showStdin 
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/50' 
                      : detectNeedsInput(currentCode, selectedLang) && !stdin.trim()
                        ? 'bg-[#D4AF37]/20 text-[#F3E5AB] border-[#D4AF37]/60 shadow-glow-gold/20'
                        : 'bg-[#07090E] text-zinc-400 hover:text-white border-[#1E2638]'
                  }`}
                  title="Toggle custom stdin input"
                >
                  <span>Stdin</span>
                  {detectNeedsInput(currentCode, selectedLang) && !stdin.trim() && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#07090E] hover:bg-dark-card-hover border border-[#1E2638] text-zinc-400 hover:text-white text-xs font-mono transition-colors"
                  title="Scroll down to console terminal"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Console</span>
                </button>

                {running ? (
                  <button
                    type="button"
                    onClick={handleStopRun}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs sm:text-sm transition-all shadow-glow-danger/20"
                    title="Stop running program"
                  >
                    <span className="w-2 h-2 rounded-sm bg-rose-400 animate-pulse" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRunCode()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#B38E22] text-[#07090E] font-black text-xs sm:text-sm transition-all shadow-glow-gold hover:shadow-glow-gold/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Play className="w-4 h-4 fill-[#07090E] text-[#07090E]" />
                    <span>Run Code</span>
                  </button>
                )}
              </div>

            </div>

            {/* Optional Custom Input (Stdin) Box */}
            {showStdin && (
              <div className="p-3.5 bg-[#090D18] border-b border-[#1E2638] text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Standard Input (Stdin):</span>
                    {detectNeedsInput(currentCode, selectedLang) && !stdin.trim() && (
                      <span className="text-[10px] text-[#D4AF37] font-sans font-bold bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                        Input Required by Code
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500">Passed line-by-line to input() / cin / scanf</span>
                </div>
                <textarea
                  ref={stdinRef}
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here (e.g. John on line 1, 25 on line 2)..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#07090E] border border-[#1E2638] focus:border-[#D4AF37]/60 text-white placeholder-zinc-600 font-mono text-xs focus:outline-none resize-y"
                />
              </div>
            )}

            {/* Code Editor Window with Line Numbers (Fixed Height & Internal Scrolling) */}
            <div className="relative flex bg-[#07090E] h-[340px] sm:h-[400px] overflow-hidden">
              
              {/* Line Numbers Gutter (Synced with editor scroll) */}
              <div 
                ref={lineNumbersRef}
                onWheel={(e) => {
                  if (textareaRef.current) {
                    textareaRef.current.scrollTop += e.deltaY;
                  }
                }}
                className="w-12 h-full py-4 pb-24 select-none bg-[#090D18] border-r border-[#1E2638]/70 text-right pr-3 font-mono text-xs text-zinc-600 leading-6 overflow-hidden flex-shrink-0"
              >
                {lineNumbers.map(n => (
                  <div key={n}>{n}</div>
                ))}
              </div>

              {/* Code Textarea with Independent Internal Scroll */}
              <div className="flex-1 h-full min-h-0 min-w-0 relative">
                <textarea
                  ref={textareaRef}
                  value={currentCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  spellCheck="false"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="// Write your solution here..."
                  className="w-full h-full p-4 pb-24 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none overflow-y-auto overflow-x-auto whitespace-pre selection:bg-[#D4AF37]/30 selection:text-white"
                  style={{ tabSize: 4 }}
                />
              </div>

            </div>

            {/* Output / Console Terminal Section (Pinned directly below editor) */}
            <div ref={terminalRef} className="border-t border-[#1E2638] bg-[#090D18] flex flex-col flex-shrink-0">
              
              {/* Terminal Title Bar */}
              <div className="px-4 py-2.5 border-b border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-zinc-300 font-semibold">Console Output</span>
                  {executionTime !== null && (
                    <span className="text-[11px] text-zinc-500 font-mono">
                      ({executionTime} ms)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => editorCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#07090E] hover:bg-dark-card-hover border border-[#1E2638] text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                    title="Scroll up to code editor"
                  >
                    <Code className="w-3 h-3 text-[#D4AF37]" />
                    <span className="hidden sm:inline">Editor</span>
                  </button>

                  {isSuccess === true && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Success (Exit 0)</span>
                    </span>
                  )}
                  {isSuccess === false && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 font-bold">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Error (Exit {exitCode || '1'})</span>
                    </span>
                  )}

                  {output && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSessionInputs([]);
                          setStdin('');
                          setOutput('');
                          setIsSuccess(null);
                        }}
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1E2638] transition-colors"
                        title="Clear output and reset inputs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyOutput}
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1E2638] transition-colors"
                        title="Copy output"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Terminal Output Body (Internal Scroll) */}
              <div className="p-4 font-mono text-xs sm:text-sm leading-relaxed h-52 sm:h-56 overflow-y-auto bg-[#07090E]/95">
                {output ? (
                  <pre className={`whitespace-pre-wrap ${isSuccess === true ? 'text-emerald-300' : isSuccess === false ? 'text-rose-300' : 'text-zinc-200'}`}>
                    {output}
                    {running && <span className="inline-block w-2 h-4 ml-0.5 bg-[#D4AF37] animate-pulse align-middle" />}
                  </pre>
                ) : running ? (
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling and executing code...</span>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">
                    Click "Run Code" above to compile and execute your code. Standard output, prompts, and test results will stream live here.
                  </p>
                )}
              </div>

              {/* Persistent Bottom Terminal Input Bar */}
              <form onSubmit={handleSendTerminalInput} className="px-4 py-2.5 bg-[#0D111A] border-t border-[#1E2638] flex items-center gap-2">
                <span className="text-xs font-mono text-[#D4AF37] flex items-center gap-1 flex-shrink-0 font-bold select-none">
                  <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Input:</span>
                </span>
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder={running ? "Type input into terminal and press Enter ↵..." : "Type input into terminal..."}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#07090E] border border-[#1E2638] focus:border-[#D4AF37]/70 text-white placeholder-zinc-600 font-mono text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!terminalInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#F3E5AB] font-mono text-xs font-bold transition-all disabled:opacity-40"
                >
                  Send ↵
                </button>
              </form>

            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
