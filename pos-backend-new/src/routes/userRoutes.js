const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set in environment variables");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
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

    const user = await User.create({ name, email, password });

    res.status(201).json({
      // We are sending a welcome message directly from the backend
      message: `Welcome ${user.name}!`,
      id: user.id,
      name: user.name,
      email: user.email,
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
        // Send a welcome back message from the backend on successful login
        message: `Welcome back, ${user.name}!`,
        id: user.id,
        name: user.name,
        email: user.email,
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



module.exports = router;
