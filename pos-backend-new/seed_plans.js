require('dotenv').config();
const { StudyPlan } = require('./src/models');

async function seed() {
  try {
    const existingCount = await StudyPlan.count();
    if (existingCount === 0) {
      // await StudyPlan.bulkCreate([
      //   { title: "SQL 50", description: "Crack SQL Interview in 50 Qs", themeStartColor: "#0369a1", themeEndColor: "#0ea5e9", isFeatured: true },
      //   { title: "Top Interview 150", description: "Must-do List for Interview Prep", themeStartColor: "#047857", themeEndColor: "#10b981", isFeatured: true },
      //   { title: "LeetCode 75", description: "Ace Coding Interview with 75 Qs", themeStartColor: "#1d4ed8", themeEndColor: "#3b82f6", isFeatured: true },
      //   { title: "Binary Search", description: "8 Patterns, 42 Qs = Master BS", themeStartColor: "#6d28d9", themeEndColor: "#a855f7", isFeatured: true }
      // ]);
      console.log("Study plans seeded successfully!");
    } else {
      console.log("Study plans already exist.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
