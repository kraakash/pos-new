const express = require("express");
const { StudyPlan, Question, UserSolvedQuestion } = require("../models");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only guard
const isAdmin = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret && adminSecret === process.env.ADMIN_SECRET) return next();
  return res.status(403).json({ message: 'Forbidden: admin only' });
};

// @desc    Get all study plans (Featured)
// @route   GET /api/study-plans
// @access  Public (Optional Auth)
// @details Ye route study plans (series) return karta hai. 
//          Isme hum calculate karte hain ki specific study plan me total kitne questions hain. 
//          Agar user logged in hai, toh ye bhi calculate karke bhejte hain ki usne is series ke andar 
//          kitne questions already solve (completed) kar liye hain, jisse progress bar sahi show ho.
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const plans = await StudyPlan.findAll({
      include: [{
        model: Question,
        through: { attributes: [] },
        attributes: ['id']
      }]
    });
    
    // Get user solved questions if logged in
    let solvedQuestionIds = [];
    if (req.user) {
      const solved = await UserSolvedQuestion.findAll({
        where: { userId: req.user.id, status: "Solved" }
      });
      solvedQuestionIds = solved.map(s => s.questionId);
    }
    
    // Format response to include totalQuestions count without sending whole array
    const formattedPlans = plans.map(plan => {
      const planJson = plan.toJSON();
      planJson.totalQuestions = planJson.Questions ? planJson.Questions.length : 0;
      
      const planQuestionIds = planJson.Questions ? planJson.Questions.map(q => q.id) : [];
      planJson.completed = planQuestionIds.filter(id => solvedQuestionIds.includes(id)).length;

      delete planJson.Questions; 
      return planJson;
    });

    res.json({ data: formattedPlans });
  } catch (error) {
    next(error);
  }
});

// @desc    Seed demo study plans
// @route   POST /api/study-plans/seed
// @access  Admin only
router.post("/seed", protect, isAdmin, async (req, res, next) => {
  try {
    const existingCount = await StudyPlan.count();
    if (existingCount > 0) {
      return res.status(400).json({ message: "Study Plans already seeded!" });
    }

    const plans = await StudyPlan.bulkCreate([
      { title: "SQL 50", description: "Crack SQL Interview in 50 Qs", themeStartColor: "#0369a1", themeEndColor: "#0ea5e9", isFeatured: true },
      { title: "Top Interview 150", description: "Must-do List for Interview Prep", themeStartColor: "#047857", themeEndColor: "#10b981", isFeatured: true },
      { title: "LeetCode 75", description: "Ace Coding Interview with 75 Qs", themeStartColor: "#1d4ed8", themeEndColor: "#3b82f6", isFeatured: true },
      { title: "Binary Search", description: "8 Patterns, 42 Qs = Master BS", themeStartColor: "#6d28d9", themeEndColor: "#a855f7", isFeatured: true }
    ]);

    res.status(201).json({ message: "Demo Study Plans added", data: plans });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
