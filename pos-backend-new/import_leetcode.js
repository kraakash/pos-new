const { Sequelize, DataTypes } = require('sequelize');

// Connect DIRECTLY to Production DB
const NEON_DB_URL = "postgresql://neondb_owner:npg_2ZhuAYOQk9zW@ep-raspy-flower-ap1psnxf.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sequelize = new Sequelize(NEON_DB_URL, {
  dialect: "postgres",
  logging: false,
});

const Question = sequelize.define("Question", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  difficulty: { type: DataTypes.ENUM("Easy", "Medium", "Hard"), defaultValue: "Easy" },
  category: { type: DataTypes.STRING },
  expectedTimeComplexity: { type: DataTypes.STRING },
  expectedSpaceComplexity: { type: DataTypes.STRING },
  constraints: { type: DataTypes.JSON },
  examples: { type: DataTypes.JSON },
});

function parseExample(text) {
  const inputMatch = text.match(/Input:\s*(.*?)(?=\nOutput:)/s);
  const outputMatch = text.match(/Output:\s*(.*?)(?=\nExplanation:|$)/s);
  const expMatch = text.match(/Explanation:\s*(.*)$/s);
  
  return {
    input: inputMatch ? inputMatch[1].trim() : "",
    output: outputMatch ? outputMatch[1].trim() : "",
    explanation: expMatch ? expMatch[1].trim() : ""
  };
}

async function importQuestions() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Production Neon DB.");
    
    // Sync table just in case
    await Question.sync({ alter: true });

    console.log("Fetching questions from GitHub...");
    const res = await fetch("https://raw.githubusercontent.com/neenza/leetcode-problems/refs/heads/master/merged_problems.json");
    const data = await res.json();
    
    // Process first 50 questions
    const rawQuestions = data.questions.slice(0, 50);
    const formattedQuestions = [];

    for (const q of rawQuestions) {
      // Parse Examples
      const parsedExamples = q.examples.map(ex => parseExample(ex.example_text));

      formattedQuestions.push({
        title: q.title,
        description: q.description,
        difficulty: q.difficulty || "Easy",
        category: q.topics && q.topics.length > 0 ? q.topics[0] : "General",
        expectedTimeComplexity: "O(N)", // Default approximation
        expectedSpaceComplexity: "O(1)",
        constraints: q.constraints || [],
        examples: parsedExamples
      });
    }

    console.log(`Inserting ${formattedQuestions.length} questions to DB...`);
    await Question.bulkCreate(formattedQuestions);
    
    console.log("✅ Successfully imported questions to Production!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing:", error);
    process.exit(1);
  }
}

importQuestions();
