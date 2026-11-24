async function testWithStdin() {
  const tests = [
    {
      lang: 'python',
      compiler: 'cpython-3.12.16',
      code: 'import sys\nname = sys.stdin.read().strip()\nprint(f"Hello, {name}!")',
      stdin: 'LeetCoder'
    },
    {
      lang: 'cpp',
      compiler: 'gcc-13.2.0',
      code: '#include <iostream>\n#include <string>\nint main() { std::string s; std::cin >> s; std::cout << "Hello, " << s << "!" << std::endl; return 0; }',
      stdin: 'LeetCoder'
    },
    {
      lang: 'c',
      compiler: 'gcc-13.2.0-c',
      code: '#include <stdio.h>\nint main() { char s[100]; if (scanf("%99s", s) == 1) { printf("Hello, %s!\\n", s); } return 0; }',
      stdin: 'LeetCoder'
    },
    {
      lang: 'java',
      compiler: 'openjdk-jdk-21+35',
      code: 'import java.util.Scanner;\nclass Solution { public static void main(String[] args) { Scanner sc = new Scanner(System.in); if (sc.hasNext()) { System.out.println("Hello, " + sc.next() + "!"); } } }',
      stdin: 'LeetCoder'
    },
    {
      lang: 'javascript',
      compiler: 'nodejs-20.17.0',
      code: 'const fs = require("fs"); const input = fs.readFileSync(0, "utf-8").trim(); console.log(`Hello, ${input}!`);',
      stdin: 'LeetCoder'
    }
  ];

  console.log('Testing all 5 languages with stdin...');
  for (const t of tests) {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: t.compiler,
        code: t.code,
        stdin: t.stdin
      })
    });
    const data = await res.json();
    const out = (data.program_output || data.program_message || data.compiler_error || '').trim();
    console.log(`${t.lang.toUpperCase()} with stdin: ${out}`);
  }
}

testWithStdin();
