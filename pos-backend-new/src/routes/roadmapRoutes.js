const express = require('express');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  getRoadmap,
  getPublicRoadmap,
  getPublicSection,
  generateRoadmap,
  getSection,
  getModule,
  getRoadmapProgress,
  updateRoadmap,

  // Legacy
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

// ── New Database-driven Layout Routes ────────────────────────────────────────

// Public / Optional Auth endpoints (guests can see public roadmap template)
router.get('/', optionalAuth, getRoadmap);
router.get('/public', getPublicRoadmap);
router.get('/public/section/:id', getPublicSection);

// Protected endpoints
router.post('/generate', protect, generateRoadmap);
router.get('/section/:id', protect, getSection);
router.get('/module/:id', protect, getModule);
router.get('/progress', protect, getRoadmapProgress);
router.post('/update', protect, updateRoadmap);

// ── Legacy / Compatibility Routes (Protected) ────────────────────────────────
router.get('/summary', protect, getSummary);
router.get('/:roadmapId/progress', protect, getProgress);
router.post('/:roadmapId/progress/sync', protect, syncProgress);
router.post('/:roadmapId/topic/:topicId', protect, updateTopicStatus);
router.get('/:roadmapId/daily', protect, getDailyMission);
router.post('/:roadmapId/daily', protect, saveDailyMission);
router.patch('/:roadmapId/daily/:missionId', protect, toggleMission);
router.get('/:roadmapId/badges', protect, getBadges);
router.post('/:roadmapId/badges/:badgeId', protect, awardBadge);

module.exports = router;
