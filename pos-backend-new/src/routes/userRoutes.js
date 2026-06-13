const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { UserSolvedQuestion, LearningNote, Submission, Question, RoadmapProgress } = require("../models");
const { protect } = require("../middleware/authMiddleware");
const roadmapService = require("../services/roadmapService");

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set in environment variables");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Helper to calculate streak based on UserSolvedQuestion dates
const getStreak = async (userId) => {
  try {
    const solvedQuestions = await UserSolvedQuestion.findAll({
      where: { userId, status: "Solved" },
      attributes: ["createdAt"],
      order: [["createdAt", "DESC"]],
    });

    if (solvedQuestions.length === 0) return 0;

    // Convert dates to unique YYYY-MM-DD strings
    const uniqueDates = Array.from(
      new Set(solvedQuestions.map((q) => q.createdAt.toISOString().slice(0, 10)))
    );

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // If neither today nor yesterday has a solved question, streak is 0
    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let currentDate = uniqueDates.includes(todayStr) ? new Date() : yesterday;

    while (true) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
};

// Validation rules
const signupValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").optional().trim().isLength({ max: 80 }).withMessage("Name too long"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post("/signup", signupValidation, handleValidation, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Auto-generate a unique username from email prefix
    const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const user = await User.create({ name, email, password, username });

    res.status(201).json({
      message: `Welcome ${user.name}!`,
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user.id),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginValidation, handleValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        message: `Welcome back, ${user.name}!`,
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: `Welcome to your authenticated dashboard, ${req.user.name}!`,
    user: req.user,
    overview: "This data is only visible to logged in users."
  });
});

router.get("/practice",(req,res)=>{
  res.send("  Practice route is working")
})

// @desc    Get current user profile & stats
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const questionsSolvedCount = await UserSolvedQuestion.count({
      where: { userId: user.id, status: "Solved" }
    });

    const currentStreak = await getStreak(user.id);

    // Calculate dynamic calendar solved activity (solvedDates)
    const solvedList = await UserSolvedQuestion.findAll({
      where: { userId: user.id, status: "Solved" },
      attributes: ["createdAt"],
    });
    const solvedDates = solvedList.reduce((acc, q) => {
      const dateStr = q.createdAt.toISOString().slice(0, 10);
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    // Calculate active roadmaps progress
    const activeRoadmaps = await RoadmapProgress.findAll({
      where: { userId: user.id, status: "completed" },
      attributes: ["roadmapId"],
      group: ["roadmapId"]
    });

    const roadmapProgress = [];
    let progressTotalPct = 0;
    for (const rm of activeRoadmaps) {
      const completed = await RoadmapProgress.count({
        where: { userId: user.id, roadmapId: rm.roadmapId, status: "completed" }
      });
      let total = 20;
      if (rm.roadmapId === "sde") total = 28;
      else if (rm.roadmapId === "frontend") total = 18;
      else if (rm.roadmapId === "backend") total = 22;

      const pct = Math.round((completed / total) * 100);
      progressTotalPct += pct;

      roadmapProgress.push({
        roadmapId: rm.roadmapId,
        completedCount: completed,
        totalCount: total,
        percent: pct
      });
    }
    const averageProgressPct = activeRoadmaps.length > 0 ? Math.round(progressTotalPct / activeRoadmaps.length) : 0;

    res.json({
      id: user.id,
      email: user.email,
      username: user.username || "",
      fullName: user.name || "",
      profile: {
        branch: user.branch || "",
        year: user.year || 1,
        skillLevel: user.skillLevel || "BEGINNER",
        placementGoal: user.placementGoal || "",
        contactNo: user.contactNo || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        location: user.location || "",
        collegeName: user.collegeName || "",
        leetcodeUrl: user.leetcodeUrl || "",
        codeforcesUrl: user.codeforcesUrl || "",
        codechefUrl: user.codechefUrl || "",
        hackerrankUrl: user.hackerrankUrl || ""
      },
      stats: {
        questionsSolved: questionsSolvedCount,
        mockInterviews: 0,
        resumeAtsScore: 78,
        currentStreak: currentStreak,
        solvedDates,
        roadmapProgress,
        averageRoadmapProgress: averageProgressPct
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
router.patch("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      fullName,
      username,
      email,
      branch,
      year,
      skillLevel,
      placementGoal,
      contactNo,
      linkedinUrl,
      githubUrl,
      location,
      collegeName,
      leetcodeUrl,
      codeforcesUrl,
      codechefUrl,
      hackerrankUrl
    } = req.body;

    if (username && username !== user.username) {
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (fullName !== undefined) user.name = fullName;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = Number(year);
    if (skillLevel !== undefined) user.skillLevel = skillLevel;
    if (placementGoal !== undefined) user.placementGoal = placementGoal;
    if (contactNo !== undefined) user.contactNo = contactNo;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (location !== undefined) user.location = location;
    if (collegeName !== undefined) user.collegeName = collegeName;
    if (leetcodeUrl !== undefined) user.leetcodeUrl = leetcodeUrl;
    if (codeforcesUrl !== undefined) user.codeforcesUrl = codeforcesUrl;
    if (codechefUrl !== undefined) user.codechefUrl = codechefUrl;
    if (hackerrankUrl !== undefined) user.hackerrankUrl = hackerrankUrl;

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      profile: {
        branch: user.branch || "",
        year: user.year || 1,
        skillLevel: user.skillLevel || "BEGINNER",
        placementGoal: user.placementGoal || "",
        contactNo: user.contactNo || "",
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        location: user.location || "",
        collegeName: user.collegeName || "",
        leetcodeUrl: user.leetcodeUrl || "",
        codeforcesUrl: user.codeforcesUrl || "",
        codechefUrl: user.codechefUrl || "",
        hackerrankUrl: user.hackerrankUrl || ""
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get public profile by username
// @route   GET /api/users/public/:username
// @access  Public
router.get("/public/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const questionsSolvedCount = await UserSolvedQuestion.count({
      where: { userId: user.id, status: "Solved" }
    });

    const currentStreak = await getStreak(user.id);

    res.json({
      username: user.username,
      fullName: user.name || "",
      profile: {
        branch: user.branch || "",
        year: user.year || 1,
        skillLevel: user.skillLevel || "BEGINNER",
        placementGoal: user.placementGoal || "",
        contactNo: "", // Keep contact number private on public profiles
        linkedinUrl: user.linkedinUrl || "",
        githubUrl: user.githubUrl || "",
        location: user.location || "",
        collegeName: user.collegeName || "",
        leetcodeUrl: user.leetcodeUrl || "",
        codeforcesUrl: user.codeforcesUrl || "",
        codechefUrl: user.codechefUrl || "",
        hackerrankUrl: user.hackerrankUrl || ""
      },
      stats: {
        questionsSolved: questionsSolvedCount,
        mockInterviews: 0,
        resumeAtsScore: 78,
        currentStreak: currentStreak
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get recent submissions of current user
// @route   GET /api/users/submissions
// @access  Private
router.get("/submissions", protect, async (req, res, next) => {
  try {
    const submissions = await Submission.findAll({
      where: { userId: req.user.id },
      include: [{ model: Question, attributes: ["title", "difficulty"] }],
      order: [["createdAt", "DESC"]],
      limit: 10
    });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user learning notes
// @route   GET /api/users/notes
// @access  Private
router.get("/notes", protect, async (req, res, next) => {
  try {
    const notes = await LearningNote.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// @desc    Save new learning note
// @route   POST /api/users/notes
// @access  Private
router.post("/notes", protect, async (req, res, next) => {
  try {
    const { topic, content } = req.body;
    if (!topic || !content) {
      return res.status(400).json({ message: "Topic and content are required" });
    }
    const note = await LearningNote.create({
      userId: req.user.id,
      topic,
      content
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

/**
 * Calculates the student's initial placement readiness score based on skill level, college year, and selected companies.
 * 
 * @param {string} skillLevel - Candidate's self-assessed skill level ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
 * @param {number} year - Candidate's current college year (1-5)
 * @param {number} targetCount - Number of target companies chosen
 * @returns {number} - Placement readiness score capped between 0 and 100
 */
function calculateReadiness(skillLevel, year, targetCount) {
  const skillWeight = skillLevel === 'BEGINNER' ? 35 : skillLevel === 'INTERMEDIATE' ? 60 : 80;
  const yearWeight = Math.min(year * 5, 20);
  const goalWeight = Math.min(targetCount * 2, 10);
  return Math.min(skillWeight + yearWeight + goalWeight, 100);
}

/**
 * Provides a list of default weak topics for new users based on their self-assessed skill level.
 * 
 * @param {string} skillLevel - Candidate's self-assessed skill level ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
 * @returns {string[]} - Array of default weak topic strings
 */
function initialWeakTopics(skillLevel) {
  if (skillLevel === 'ADVANCED') return ['System Design', 'Competitive Edge'];
  if (skillLevel === 'INTERMEDIATE') return ['Graphs', 'Dynamic Programming', 'Binary Search'];
  return ['Arrays', 'Recursion', 'Dynamic Programming', 'Trees'];
}

// @desc    Submit user onboarding details and generate readiness stats
// @route   POST /api/users/onboarding
// @access  Private
router.post("/onboarding", protect, async (req, res, next) => {
  try {
    const { branch, year, skillLevel, targetCompanies, placementGoal } = req.body;
    
    if (!branch || !year || !skillLevel) {
      return res.status(400).json({ message: "Branch, year, and skill level are required." });
    }

    const targets = Array.isArray(targetCompanies) ? targetCompanies : [];
    const score = calculateReadiness(skillLevel, year, targets.length);
    const weakTopics = initialWeakTopics(skillLevel);

    const user = req.user;
    await user.update({
      branch,
      year: parseInt(year, 10),
      skillLevel,
      targetCompanies: targets,
      placementGoal,
      readinessScore: score,
      weakTopics
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc    Mock roadmap generation endpoint
// @route   POST /api/users/roadmap/generate
// @access  Private
router.post("/roadmap/generate", protect, async (req, res, next) => {
  try {
    const data = await roadmapService.generateRoadmap(req.user.id);
    res.json({ success: true, message: "Roadmap generated successfully.", data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
