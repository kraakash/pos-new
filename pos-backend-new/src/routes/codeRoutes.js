const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ============================================================================
 * HELPER FUNCTION: execPromise
 * ============================================================================
 * Yeh function Node.js ke "child_process" module ka use karta hai 
 * kisi bhi terminal command (jaise 'node script.js') ko background mein run karne ke liye.
 * 
 * Timeout (3000ms): Agar user ke code mein infinite loop ho (ex: while(true)),
 * toh server crash nahi hoga. 3 seconds ke baad process automatically kill ho jayegi.
 */
const execPromise = (command) => {
  return new Promise((resolve) => {
    exec(command, { timeout: 3000 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

/**
 * ============================================================================
 * ROUTE: POST /api/code/run
 * DESCRIPTION: Local Code Execution API
 * ============================================================================
 * Ye route frontend se user ka code receive karta hai, ek temp file banata hai, 
 * uske upar "Hidden Wrapper Code" daalta hai, testcase read karke pass karta hai, 
 * aur final result wapas frontend ko return karta hai.
 */
router.post("/run", protect, async (req, res, next) => {
  try {
    // 1. Frontend se Code, Language, aur Input testcases nikalna
    const { code, language, input = "" } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language required" });
    }

    // 2. Temporary Directories aur Unique IDs Setup karna
    // Har execution request ke liye ek naya unique file name banega taki concurrent users ki files overwrite na hon.
    const uniqueId = Date.now().toString() + Math.floor(Math.random() * 1000);
    const tempDir = path.join(__dirname, "..", "temp");
    
    // Windows paths me "\" hota hai jo execution command me \t (tab space) me convert ho sakta hai. 
    // Isliye forward slash "/" me replace kar rahe hain.
    const safeTempDir = tempDir.replace(/\\/g, '/');

    // Make sure temp directory pehle se bani hui ho
    await fs.mkdir(tempDir, { recursive: true }).catch(() => {});

    let filename;
    let command;

    // 3. Language ke hisaab se execution command prepare karna
    if (language === 'javascript') {
      filename = `script_${uniqueId}.js`;
      command = `node "${safeTempDir}/${filename}"`;
    } else if (language === 'python' || language === 'python3') {
      filename = `script_${uniqueId}.py`;
      command = `python "${safeTempDir}/${filename}"`;
    } else {
      return res.status(400).json({ 
        message: `Local execution for ${language} is not configured yet. Try 'javascript' or 'python'.` 
      });
    }

    // 4. File Paths Define Karna (Jisme user code aur inputs likhe jayenge)
    const filepath = path.join(tempDir, filename);
    const inputFilename = `input_${uniqueId}.txt`;
    const inputFilepath = path.join(tempDir, inputFilename);
    const safeInputFilepath = `${safeTempDir}/${inputFilename}`;

    // ========================================================================
    // 5. HIDDEN WRAPPER CODE INJECTION (Driver Code)
    // ========================================================================
    // User sirf 'twoSum' jaisa ek function likhta hai. 
    // Magar execute hone ke liye usko proper inputs pass karke call karna padta hai.
    // Ye code user ke code ke theek neeche automatically append ho jata hai!
    let finalCode = code;
    
    if (language === 'javascript') {
      finalCode = `
${code}

// ===== HIDDEN DRIVER CODE (DO NOT SHOW TO USER) =====
const fs = require('fs');

try {
  // Command line argument se testcase text file ka path aayega
  const inputFile = process.argv[2];
  
  // Us input file ko theek se read karo 
  const inputString = fs.readFileSync(inputFile, 'utf-8').trim();

  if (inputString) {
    // 1. String ko memory variables me convert karo
    eval("var " + inputString);

    // 2. Input string se dynamic parameters ke naam nikalo
    // Example: "nums = [2,7], target = 9" -> ["nums", "target"]
    const variableNames = inputString.split(',').map(v => v.split('=')[0].trim());
    
    // 3. Un names ko use karke values ki ek array banao
    const args = variableNames.map(name => eval(name));

    // 4. User ke function ko universal "Main" ya "main" name se dhundo
    const userFunc = typeof Main === 'function' ? Main : (typeof main === 'function' ? main : null);

    if (userFunc) {
       // 5. Un dynamic arguments ko spread operator (...) se function me pass kardo!
       const result = userFunc(...args);
       
       // Agar function return karta hai (e.g. Two Sum) toh result print karo
       // Agar function in-place modification karta hai aur kuch return nahi karta (e.g. Reverse String), 
       // toh jo pehla parameter change hua hai usko print kardo.
       if (result !== undefined) {
           console.log(JSON.stringify(result));
       } else {
           console.log(JSON.stringify(args[0]));
       }
    } 
    else {
       console.log("Error: Please name your function 'Main' (e.g., function Main(nums, target) { ... })");
    }
  } else {
    console.log("Error: No input provided to testcase.");
  }
} catch(e) {
  console.error("Execution Error: " + e.message);
}
// ====================================================
`;
    }

    // 6. Final code aur input text dono ko temp files mein Write (Save) karna
    await fs.writeFile(filepath, finalCode);
    await fs.writeFile(inputFilepath, input);

    // 7. Background mein Code Run karna
    // Execution command banega: node script_123.js "temp/input_123.txt"
    const finalCommand = `${command} "${safeInputFilepath}"`;

    const start = process.hrtime();
    const { error, stdout, stderr } = await execPromise(finalCommand);
    const diff = process.hrtime(start);
    const timeTaken = (diff[0] + diff[1] / 1e9).toFixed(3); // Calculate execution time in seconds

    // 8. Security/Cleanup: Temp files ko turant delete kar dena taki disk space full na ho
    await fs.unlink(filepath).catch(() => {});
    await fs.unlink(inputFilepath).catch(() => {});

    // 9. Response Format (Judge0 format me bhej rahe hain taki frontend same design pe chale)
    const result = {
      status: { 
        description: error 
          ? (error.killed ? 'Time Limit Exceeded (Infinite Loop?)' : 'Runtime Error') 
          : 'Accepted' 
      },
      stdout: stdout || null,
      stderr: stderr || (error && !error.killed ? error.message : null),
      compile_output: null,
      time: timeTaken,
      memory: "N/A", // Memory measurements child_process mein strictly locally calculate karna mushkil hai
    };

    res.json({
      message: "Code executed locally",
      data: result,
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
