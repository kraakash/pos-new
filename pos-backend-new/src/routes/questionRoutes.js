const express = require("express");
const { Question } = require("../models");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @desc    Get all questions (for practice page)
// @route   GET /api/questions
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const questions = await Question.findAll();
    res.json({
      message: "Questions fetched successfully",
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ data: question });
  } catch (error) {
    next(error);
  }
});

// @desc    Get one question
// @route   GET /api/questions/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question fetched successfully",
      data: question
    });
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
