
console.log("nfenfeof")

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
    // @details: Regex use karke hum specifically variable names nikal rahe hain, 
    //           taki arrays ke andar wale commas ki wajah se simple split() command fail na ho
    //           aur code me 'Unexpected token ]' wali runtime error fix ho jaye.
    const regex = /(?:^|,)\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=/g;
    const variableNames = [];
    let match;
    while ((match = regex.exec(inputString)) !== null) {
      variableNames.push(match[1]);
    }
    
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
