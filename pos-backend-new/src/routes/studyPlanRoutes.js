const express = require("express");
const { StudyPlan, Question } = require("../models");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @desc    Get all study plans (Featured)
// @route   GET /api/study-plans
// @access  Private
router.get("/", protect, async (req, res, next) => {
  try {
    const plans = await StudyPlan.findAll({
      include: [{
        model: Question,
        through: { attributes: [] },
        attributes: ['id']
      }]
    });
    
    // Format response to include totalQuestions count without sending whole array
    const formattedPlans = plans.map(plan => {
      const planJson = plan.toJSON();
      planJson.totalQuestions = planJson.Questions ? planJson.Questions.length : 0;
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
// @access  Private
router.post("/seed", protect, async (req, res, next) => {
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
