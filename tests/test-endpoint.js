async function testEndpoint() {
  const cases = [
    { language: 'python', code: 'print("Python endpoint: 10 + 20 =", 10 + 20)' },
    { language: 'javascript', code: 'console.log("JavaScript endpoint: [1,2,3].map(x=>x*2):", [1,2,3].map(x=>x*2));' },
    { language: 'cpp', code: '#include <iostream>\nint main(){ std::cout << "C++ endpoint OK" << std::endl; return 0; }' },
    { language: 'c', code: '#include <stdio.h>\nint main(){ printf("C endpoint OK\\n"); return 0; }' },
    { language: 'java', code: 'public class Solution { public static void main(String[] args){ System.out.println("Java endpoint OK"); } }' }
  ];

  for (const c of cases) {
    try {
      const res = await fetch('http://localhost:5173/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      const data = await res.json();
      console.log(`[${c.language.toUpperCase().padEnd(10)}] Result:`, data.output ? data.output.trim() : data);
    } catch (err) {
      console.error(`[${c.language.toUpperCase()}] Error:`, err.message);
    }
  }
}

testEndpoint();
