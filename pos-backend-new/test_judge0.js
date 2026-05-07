const source = `
const fs = require('fs');
try {
  const inputString = fs.readFileSync(0, 'utf-8').trim();
  console.log("Read input:", inputString);
} catch (e) {
  console.error(e.message);
}
`;

fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language_id: 93,
    source_code: source,
    stdin: "nums = [2,7,11,15], target = 9"
  })
}).then(res => res.json()).then(console.log);
