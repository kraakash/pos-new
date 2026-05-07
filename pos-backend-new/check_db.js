require('dotenv').config();
const { Submission, UserSolvedQuestion } = require('./src/models');

async function check() {
  const subs = await Submission.findAll({ raw: true });
  console.log("Submissions:");
  console.log(subs);
  
  const solved = await UserSolvedQuestion.findAll({ raw: true });
  console.log("Solved:");
  console.log(solved);
  process.exit(0);
}
check();
