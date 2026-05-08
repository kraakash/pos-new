const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProgress,
  updateTopicStatus,
  syncProgress,
  getDailyMission,
  saveDailyMission,
  toggleMission,
  getBadges,
  awardBadge,
  getSummary,
} = require('../controllers/roadmapController');

const router = express.Router();

// All roadmap routes are protected — user must be logged in
router.use(protect);

// ── Summary (across all roadmaps) ────────────────────────────────────────────
// GET /api/roadmap/summary
router.get('/summary', getSummary);

// ── Per-roadmap routes ────────────────────────────────────────────────────────

// Progress
// GET  /api/roadmap/:roadmapId/progress
// POST /api/roadmap/:roadmapId/progress/sync  (bulk sync from localStorage)
// POST /api/roadmap/:roadmapId/topic/:topicId (mark single topic done/undone)
router.get('/:roadmapId/progress', getProgress);
router.post('/:roadmapId/progress/sync', syncProgress);
router.post('/:roadmapId/topic/:topicId', updateTopicStatus);

// Daily Missions
// GET   /api/roadmap/:roadmapId/daily
// POST  /api/roadmap/:roadmapId/daily          (save/replace today's missions)
// PATCH /api/roadmap/:roadmapId/daily/:missionId (toggle one mission)
router.get('/:roadmapId/daily', getDailyMission);
router.post('/:roadmapId/daily', saveDailyMission);
router.patch('/:roadmapId/daily/:missionId', toggleMission);

// Badges
// GET  /api/roadmap/:roadmapId/badges
// POST /api/roadmap/:roadmapId/badges/:badgeId (award a badge)
router.get('/:roadmapId/badges', getBadges);
router.post('/:roadmapId/badges/:badgeId', awardBadge);

module.exports = router;
