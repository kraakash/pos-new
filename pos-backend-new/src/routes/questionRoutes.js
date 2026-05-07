const express = require("express");
const { Question, UserSolvedQuestion, Submission } = require("../models");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// @desc    Get all questions (for practice page)
// @route   GET /api/questions
// @access  Public (Optional Auth)
// @details Ye route sabhi questions return karta hai. Agar user logged in hai (optionalAuth), 
//          toh user ke solved questions match karke 'isSolved: true' attach karke bhejta hai, 
//          jisse frontend library me green checkmark dikh sake. Guest user ko fresh list milti hai.
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const questions = await Question.findAll();
    let solvedQuestionIds = [];
    
    if (req.user) {
      const solved = await UserSolvedQuestion.findAll({
        where: { userId: req.user.id, status: "Solved" }
      });
      solvedQuestionIds = solved.map(s => s.questionId);
    }

    const data = questions.map(q => {
      const qJson = q.toJSON();
      qJson.isSolved = solvedQuestionIds.includes(q.id);
      return qJson;
    });

    res.json({
      message: "Questions fetched successfully",
      count: questions.length,
      data
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public (Optional Auth)
// @details Ye route specific question return karta hai. Agar user logged in hai,
//          toh backend database me check karta hai ki us user ne ye question pehle solve kiya hai ya nahi,
//          aur 'isSolved' property uske status ke according add karke bhejega.
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    const qJson = question.toJSON();
    qJson.isSolved = false;

    if (req.user) {
      const solved = await UserSolvedQuestion.findOne({
        where: { userId: req.user.id, questionId: question.id, status: "Solved" }
      });
      if (solved) {
        qJson.isSolved = true;
      }
    }

    res.json({ 
      message: "Question fetched successfully",
      data: qJson 
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit code and save to history (and mark solved if Accepted)
// @route   POST /api/questions/:id/submit
// @access  Private
// @details Ye API user ke code, language aur status ko database (Submission table) me hamesha ke liye save karti hai.
//          Sath hi agar status "Accepted" (isCorrect) hai, toh ye UserSolvedQuestion me bhi progress mark kar deti hai.
router.post("/:id/submit", protect, async (req, res, next) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;
    const { code, language, status } = req.body;

    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 1. Save the code submission in history
    const submission = await Submission.create({
      userId,
      questionId,
      code,
      language,
      status
    });

    // 2. If it is an Accepted solution, also update their progress
    if (status === "Accepted") {
      const [userSolved, created] = await UserSolvedQuestion.findOrCreate({
        where: { userId, questionId },
        defaults: { status: "Solved" }
      });

      if (!created && userSolved.status !== "Solved") {
        userSolved.status = "Solved";
        await userSolved.save();
      }
    }

    res.json({ message: "Submission recorded successfully", data: submission });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all past submissions for a user on a specific question
// @route   GET /api/questions/:id/submissions
// @access  Private
// @details Frontend ke "Submissions" tab me past code list karne ke liye ye saari submissions return karta hai (newest first).
router.get("/:id/submissions", protect, async (req, res, next) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id;

    const submissions = await Submission.findAll({
      where: { userId, questionId },
      order: [['createdAt', 'DESC']] // Latest top pe
    });

    res.json({ message: "Submissions fetched", data: submissions });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
router.post("/", protect, async (req, res, next) => {
  try {
    // Sabhi naye fields ko req.body se extract karo
    const { 
      title, 
      description, 
      difficulty, 
      category,
      expectedTimeComplexity,
      expectedSpaceComplexity,
      constraints,
      examples
    } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newQuestion = await Question.create({
      title,
      description,
      difficulty: difficulty || "Easy",
      category,
      expectedTimeComplexity,
      expectedSpaceComplexity,
      constraints,
      examples
    });

    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Seed demo questions (for testing)
// @route   POST /api/questions/seed
// @access  Private
router.post("/seed", protect, async (req, res, next) => {
  try {
    const existingCount = await Question.count();
    if (existingCount > 0) {
      return res.status(400).json({ message: "Questions are already seeded! Please use the /clear endpoint first if you want to reset." });
    }

    const questions = await Question.bulkCreate([
      {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        category: "Array",
        expectedTimeComplexity: "O(N)",
        expectedSpaceComplexity: "O(N)",
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        examples: [
          { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
          { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "" }
        ]
      },
      {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
        difficulty: "Easy",
        category: "String",
        expectedTimeComplexity: "O(N)",
        expectedSpaceComplexity: "O(1)",
        constraints: [
          "1 <= s.length <= 10^5",
          "s[i] is a printable ascii character."
        ],
        examples: [
          { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ]
      },
      {
        title: "Merge K Sorted Lists",
        description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
        difficulty: "Hard",
        category: "LinkedList",
        expectedTimeComplexity: "O(N log k)",
        expectedSpaceComplexity: "O(1)",
        constraints: [
          "k == lists.length",
          "0 <= k <= 10^4",
          "0 <= lists[i].length <= 500"
        ],
        examples: [
          { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6" }
        ]
      }
    ]);
    res.status(201).json({ message: "Demo questions added", data: questions });
  } catch (error) {
    next(error);
  }
});

// @desc    Clear all questions
// @route   DELETE /api/questions/clear
// @access  Private
router.delete("/clear", protect, async (req, res, next) => {
  try {
    await Question.destroy({ where: {} });
    res.json({ message: "All questions have been deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
