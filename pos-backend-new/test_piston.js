fetch('https://emkc.org/api/v2/piston/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'javascript',
    version: '18.15.0',
    files: [{ content: 'console.log("Hello Piston");' }]
  })
}).then(res => res.json()).then(console.log);
