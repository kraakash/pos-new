const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { InterviewSession } = require("../models");

const router = express.Router();
const MAX_QUESTIONS = 5;
const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

/**
 * Returns a static fallback question based on role, round type, and difficulty.
 * Used if AI generation is skipped or fails.
 * 
 * @param {string} role - The target career role (e.g. SDE Backend)
 * @param {string} type - The round type (DSA, SYSTEM_DESIGN, CORE_CS, BEHAVIORAL)
 * @param {string} difficulty - The round difficulty (EASY, MEDIUM, HARD)
 * @returns {string} - Concise prompt string
 */
function getFallbackQuestion(role, type, difficulty) {
  const bank = {
    DSA: {
      EASY: "How would you solve Two Sum efficiently and explain its time complexity?",
      MEDIUM: "Explain a sliding window approach for finding the longest substring without repeating characters.",
      HARD: "How would you optimize a shortest path problem with multiple dynamic constraints in a graph?"
    },
    SYSTEM_DESIGN: {
      EASY: "Design a simple URL shortening service at high level.",
      MEDIUM: "Design an API rate limiter for a multi-tenant gateway.",
      HARD: "Design a highly available distributed feed generation system with low latency."
    },
    CORE_CS: {
      EASY: "Explain the difference between a process and a thread with examples.",
      MEDIUM: "Explain database isolation levels and common transaction anomalies.",
      HARD: "How do TCP congestion control and flow control mechanisms interact under network congestion?"
    },
    BEHAVIORAL: {
      EASY: "Tell me about a project where you solved a challenging technical bug.",
      MEDIUM: "Describe a conflict you had in a team project and how you resolved it.",
      HARD: "Tell me about a time you had to lead a task under extreme ambiguity with a tight deadline."
    }
  };

  const typed = bank[type] || bank.DSA;
  return typed[difficulty] || `For ${role}, explain your approach for a challenging ${type} problem.`;
}

/**
 * Adjusts the dynamic difficulty index based on candidate score.
 * 
 * @param {string} current - The current difficulty string (EASY, MEDIUM, HARD)
 * @param {number} score - The numerical score evaluated for the last response
 * @returns {string} - The updated difficulty level string
 */
function calculateNextDifficulty(current, score) {
  const index = DIFFICULTY_LEVELS.indexOf(String(current || "MEDIUM").toUpperCase());
  let nextIdx = index >= 0 ? index : 1;

  if (score >= 78) nextIdx = Math.min(nextIdx + 1, DIFFICULTY_LEVELS.length - 1);
  else if (score <= 45) nextIdx = Math.max(nextIdx - 1, 0);

  return DIFFICULTY_LEVELS[nextIdx];
}

/**
 * Generates mock evaluations for candidate answers based on word count and keyword coverage.
 * Provides a robust simulated experience.
 * 
 * @param {string} type - Round type (DSA, SYSTEM_DESIGN, CORE_CS, BEHAVIORAL)
 * @param {string} question - The question asked
 * @param {string} answer - Candidate's text answer
 * @returns {object} - Evaluation breakdown with scores and tips
 */
function mockEvaluate(type, question, answer) {
  const cleanAns = String(answer || "").trim();
  const wordCount = cleanAns.split(/\s+/).filter(Boolean).length;

  if (wordCount < 10) {
    return {
      score: 30,
      correctness: "Answer is too short or empty to evaluate candidate understanding.",
      clarity: "Lacks detail or structural explanation.",
      depth: "Minimal technical depth demonstrated.",
      communication: "Extremely brief response.",
      feedback: "Please provide a more comprehensive explanation of your thoughts and approach.",
      improvements: [
        "Use more technical keywords related to the question.",
        "Structure your response with clear step-by-step logic."
      ]
    };
  }

  // Base score calculation based on word count
  let baseScore = 50 + Math.min(Math.floor(wordCount / 4), 30);

  // Keyword match triggers score bump
  const keywords = ["complexity", "time", "space", "index", "process", "thread", "database", "scale", "cache", "latency", "load", "design", "team", "conflict"];
  let matchedCount = 0;
  keywords.forEach((word) => {
    if (cleanAns.toLowerCase().includes(word)) matchedCount += 1;
  });

  baseScore += Math.min(matchedCount * 3, 15);

  return {
    score: Math.min(baseScore, 100),
    correctness: "Demonstrates a fair understanding of the concepts with relevant keywords.",
    clarity: wordCount > 30 ? "Explanation is structured and reasonably clear." : "The points are clear, but could be expanded.",
    depth: wordCount > 50 ? "Satisfactory coverage of structural trade-offs and edge-cases." : "Solid base description, but lacks advanced deep dive.",
    communication: "Technical vocabulary and professional phrasing are well-maintained.",
    feedback: "Good response. Solid attempt at highlighting critical parameters of the question.",
    improvements: [
      "Detail your time/space complexity analysis explicitly.",
      "Discuss alternative strategies or trade-offs before settling on one approach."
    ]
  };
}

// All endpoints in this router require token authentication
router.use(protect);

// @desc    Start a new mock interview session and return opening question
// @route   POST /api/interview/start
// @access  Private
router.post("/start", async (req, res, next) => {
  try {
    const { role, type, difficulty = "MEDIUM" } = req.body;
    
    if (!role || !type) {
      return res.status(400).json({ message: "Role and interview type are required." });
    }

    const startDiff = String(difficulty).toUpperCase();
    const openingQuestion = getFallbackQuestion(role, type, startDiff);

    const initialTranscript = [{
      role: "interviewer",
      content: openingQuestion,
      createdAt: new Date().toISOString(),
      meta: { index: 1, type, difficulty: startDiff }
    }];

    const session = await InterviewSession.create({
      userId: req.user.id,
      title: req.body.title || `${role} ${type} Mock Interview`,
      role,
      transcript: initialTranscript,
      evaluation: {
        role,
        type,
        initialDifficulty: startDiff,
        currentDifficulty: startDiff,
        questionCount: 1,
        responses: [],
        overallScore: 0
      },
      status: "ACTIVE"
    });

    res.json({
      sessionId: session.id,
      question: openingQuestion,
      role,
      type,
      difficulty: startDiff,
      questionNumber: 1
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit candidate response, evaluate it, and get next follow-up
// @route   POST /api/interview/respond
// @access  Private
router.post("/respond", async (req, res, next) => {
  try {
    const { sessionId, answer, elapsedSeconds, endInterview = false } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    const session = await InterviewSession.findOne({
      where: { id: sessionId, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    const transcript = [...session.transcript];
    const evalState = { ...session.evaluation };
    const responses = Array.isArray(evalState.responses) ? [...evalState.responses] : [];
    
    const role = session.role;
    const type = evalState.type || "DSA";
    const currentDiff = evalState.currentDifficulty || "MEDIUM";

    // Extract the latest asked question
    const lastQuestionTurn = [...transcript].reverse().find((t) => t.role === "interviewer");
    const askedQuestion = lastQuestionTurn?.content || "Explain your technical approach.";

    // Save candidate response
    transcript.push({
      role: "candidate",
      content: answer,
      createdAt: new Date().toISOString()
    });

    // Evaluate response
    const evaluationResult = mockEvaluate(type, askedQuestion, answer);

    responses.push({
      question: askedQuestion,
      answer,
      score: evaluationResult.score,
      aiAvailable: true,
      correctness: evaluationResult.correctness,
      clarity: evaluationResult.clarity,
      depth: evaluationResult.depth,
      communication: evaluationResult.communication,
      feedback: evaluationResult.feedback,
      improvements: evaluationResult.improvements,
      elapsedSeconds: elapsedSeconds || 0,
      createdAt: new Date().toISOString()
    });

    // Check round progress limit
    const nextDiff = calculateNextDifficulty(currentDiff, evaluationResult.score);
    const shouldFinish = endInterview || responses.length >= MAX_QUESTIONS;

    let nextQuestionText = null;
    if (!shouldFinish) {
      nextQuestionText = getFallbackQuestion(role, type, nextDiff);
      // Append follow-up turn to transcript
      transcript.push({
        role: "interviewer",
        content: nextQuestionText,
        createdAt: new Date().toISOString(),
        meta: { index: responses.length + 1, type, difficulty: nextDiff, followUp: true }
      });
    }

    // Calculate aggregated overall score
    const totalScoreSum = responses.reduce((sum, r) => sum + r.score, 0);
    const overallScore = Number((totalScoreSum / responses.length).toFixed(1));

    // Update database
    await session.update({
      transcript,
      status: shouldFinish ? "COMPLETED" : "ACTIVE",
      evaluation: {
        ...evalState,
        role,
        type,
        currentDifficulty: nextDiff,
        questionCount: responses.length,
        responses,
        overallScore
      }
    });

    res.json({
      sessionId: session.id,
      nextQuestion: nextQuestionText,
      status: session.status,
      aiAvailable: true,
      score: evaluationResult.score,
      feedback: {
        correctness: evaluationResult.correctness,
        clarity: evaluationResult.clarity,
        depth: evaluationResult.depth,
        communication: evaluationResult.communication,
        summary: evaluationResult.feedback
      },
      improvements: evaluationResult.improvements,
      difficulty: nextDiff,
      questionNumber: responses.length + (shouldFinish ? 0 : 1),
      done: shouldFinish
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get summary report of a completed session
// @route   GET /api/interview/report/:id
// @access  Private
router.get("/report/:id", async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    const evalData = session.evaluation || {};
    const responses = evalData.responses || [];

    const strengths = [];
    const weaknesses = [];
    const improvementsSet = new Set();

    responses.forEach((resp) => {
      if (resp.score >= 75) strengths.push(resp.question);
      if (resp.score < 55) weaknesses.push(resp.question);
      (resp.improvements || []).forEach((tip) => improvementsSet.add(tip));
    });

    res.json({
      sessionId: session.id,
      role: session.role,
      type: evalData.type || "DSA",
      initialDifficulty: evalData.initialDifficulty || "MEDIUM",
      finalDifficulty: evalData.currentDifficulty || "MEDIUM",
      status: session.status,
      questionCount: responses.length,
      scoredCount: responses.length,
      overallScore: evalData.overallScore || 0,
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 4),
      improvementSuggestions: [...improvementsSet].slice(0, 6),
      responses
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
