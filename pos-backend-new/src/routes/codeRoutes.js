const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ============================================================================
 * ROUTE: POST /api/code/run
 * DESCRIPTION: Secure Code Execution API (Using Judge0 CE)
 * ============================================================================
 * Ye route ab user ke code ko safely Judge0 ke Docker sandboxes mein run karta hai.
 * Local filesystem aur 'child_process' ko hata diya gaya hai security ke liye!
 */
router.post("/run", protect, async (req, res, next) => {
  try {
    const { code, language, input = "" } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language required" });
    }

    if (language !== 'javascript') {
      return res.status(400).json({ 
        message: `Secure execution for ${language} is not configured yet. Try 'javascript'.` 
      });
    }

    // ========================================================================
    // HIDDEN WRAPPER CODE INJECTION (Driver Code)
    // ========================================================================
    const finalCode = `
${code}

// ===== HIDDEN DRIVER CODE (DO NOT SHOW TO USER) =====
const fs = require('fs');

try {
  // Read from standard input (stdin) - Sent by Judge0
  const inputString = fs.readFileSync(0, 'utf-8').trim();

  if (inputString) {
    eval("var " + inputString);
    const regex = /(?:^|,)\\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\\s*=/g;
    const variableNames = [];
    let match;
    while ((match = regex.exec(inputString)) !== null) {
      variableNames.push(match[1]);
    }
    
    const args = variableNames.map(name => eval(name));
    const userFunc = typeof Main === 'function' ? Main : (typeof main === 'function' ? main : null);

    if (userFunc) {
       const result = userFunc(...args);
       if (result !== undefined) {
           console.log(JSON.stringify(result));
       } else {
           console.log(JSON.stringify(args[0]));
       }
    } 
    else {
       console.error("Error: Please name your function 'Main' (e.g., function Main(nums, target) { ... })");
       process.exit(1);
    }
  } else {
    console.error("Error: No input provided to testcase.");
    process.exit(1);
  }
} catch(e) {
  console.error("Execution Error: " + e.message);
  process.exit(1);
}
// ====================================================
`;

    // Secure call to Judge0 Public API
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: 93, // Node.js
        source_code: finalCode,
        stdin: input
      })
    });

    if (!response.ok) {
      throw new Error(`Judge0 API execution error: ${response.status}`);
    }

    const judgeResult = await response.json();

    // Map the Judge0 result directly to the frontend
    res.json({
      message: "Code executed securely via Judge0",
      data: judgeResult,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
