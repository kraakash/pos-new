const { RoadmapProgress, DailyMissionLog, UserBadge } = require('../models');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: get today's date as YYYY-MM-DD string (UTC-safe)
// ─────────────────────────────────────────────────────────────────────────────
const todayString = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all topic progress for a user in a roadmap
// @route   GET /api/roadmap/:roadmapId/progress
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const rows = await RoadmapProgress.findAll({
      where: { userId, roadmapId },
      attributes: ['topicId', 'status', 'completedAt'],
      order: [['completedAt', 'ASC']],
    });

    res.json({
      roadmapId,
      userId,
      progress: rows,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark (or unmark) a topic as complete for a user
// @route   POST /api/roadmap/:roadmapId/topic/:topicId
// @body    { status: 'completed' | 'not_started' }
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateTopicStatus = async (req, res, next) => {
  try {
    const { roadmapId, topicId } = req.params;
    const userId = req.user.id;
    const { status = 'completed' } = req.body;

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Upsert: create or update in one query (idempotent)
    const [row, created] = await RoadmapProgress.upsert(
      {
        userId,
        roadmapId,
        topicId,
        status,
        completedAt: status === 'completed' ? new Date() : null,
      },
      {
        conflictFields: ['userId', 'roadmapId', 'topicId'],
        returning: true,
      }
    );

    res.json({
      success: true,
      topicId,
      roadmapId,
      status: row.status,
      completedAt: row.completedAt,
      created,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Bulk update multiple topics at once (for sync from localStorage)
// @route   POST /api/roadmap/:roadmapId/progress/sync
// @body    { progress: [{ topicId, status }] }
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const syncProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const { progress = [] } = req.body;

    if (!Array.isArray(progress) || progress.length === 0) {
      return res.status(400).json({ message: 'progress must be a non-empty array' });
    }

    // Upsert all at once
    const rows = progress.map(({ topicId, status = 'completed' }) => ({
      userId,
      roadmapId,
      topicId,
      status,
      completedAt: status === 'completed' ? new Date() : null,
    }));

    await Promise.all(
      rows.map((row) =>
        RoadmapProgress.upsert(row, {
          conflictFields: ['userId', 'roadmapId', 'topicId'],
        })
      )
    );

    res.json({ success: true, synced: rows.length });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get today's daily mission log (or 404 if none yet)
// @route   GET /api/roadmap/:roadmapId/daily
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getDailyMission = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const today = todayString();

    const log = await DailyMissionLog.findOne({
      where: { userId, roadmapId, missionDate: today },
    });

    if (!log) {
      // Return 200 with empty missions — frontend will generate and then save
      return res.json({ roadmapId, date: today, missions: [] });
    }

    res.json({ roadmapId, date: today, missions: log.missions });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Save or update today's daily missions
// @route   POST /api/roadmap/:roadmapId/daily
// @body    { missions: [...] }
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const saveDailyMission = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const { missions } = req.body;
    const today = todayString();

    if (!Array.isArray(missions)) {
      return res.status(400).json({ message: 'missions must be an array' });
    }

    const [log] = await DailyMissionLog.upsert(
      { userId, roadmapId, missionDate: today, missions },
      { conflictFields: ['userId', 'roadmapId', 'missionDate'], returning: true }
    );

    res.json({ success: true, date: today, missions: log.missions });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle a single mission's completed status inside today's log
// @route   PATCH /api/roadmap/:roadmapId/daily/:missionId
// @body    { completed: true | false }
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleMission = async (req, res, next) => {
  try {
    const { roadmapId, missionId } = req.params;
    const userId = req.user.id;
    const { completed } = req.body;
    const today = todayString();

    const log = await DailyMissionLog.findOne({
      where: { userId, roadmapId, missionDate: today },
    });

    if (!log) {
      return res.status(404).json({ message: 'No daily mission log found for today' });
    }

    // Update the specific mission inside the JSONB array
    const updated = log.missions.map((m) =>
      m.id === missionId ? { ...m, completed: !!completed } : m
    );

    await log.update({ missions: updated });

    res.json({ success: true, missionId, completed: !!completed });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all badges earned by user in a roadmap
// @route   GET /api/roadmap/:roadmapId/badges
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getBadges = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;

    const badges = await UserBadge.findAll({
      where: { userId, roadmapId },
      attributes: ['badgeId', 'earnedAt'],
      order: [['earnedAt', 'ASC']],
    });

    res.json({ roadmapId, badges });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Award a badge to a user (called automatically or manually)
// @route   POST /api/roadmap/:roadmapId/badges/:badgeId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const awardBadge = async (req, res, next) => {
  try {
    const { roadmapId, badgeId } = req.params;
    const userId = req.user.id;

    const [badge, created] = await UserBadge.findOrCreate({
      where: { userId, roadmapId, badgeId },
      defaults: { userId, roadmapId, badgeId, earnedAt: new Date() },
    });

    res.json({
      success: true,
      badgeId,
      alreadyEarned: !created,
      earnedAt: badge.earnedAt,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get summary stats across ALL roadmaps for a user (for dashboard)
// @route   GET /api/roadmap/summary
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Count completed topics per roadmap
    const progressRows = await RoadmapProgress.findAll({
      where: { userId, status: 'completed' },
      attributes: ['roadmapId'],
    });

    const countByRoadmap = {};
    progressRows.forEach(({ roadmapId }) => {
      countByRoadmap[roadmapId] = (countByRoadmap[roadmapId] || 0) + 1;
    });

    // Count badges per roadmap
    const badgeRows = await UserBadge.findAll({
      where: { userId },
      attributes: ['roadmapId'],
    });

    const badgesByRoadmap = {};
    badgeRows.forEach(({ roadmapId }) => {
      badgesByRoadmap[roadmapId] = (badgesByRoadmap[roadmapId] || 0) + 1;
    });

    res.json({
      userId,
      completedTopics: countByRoadmap,
      earnedBadges: badgesByRoadmap,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProgress,
  updateTopicStatus,
  syncProgress,
  getDailyMission,
  saveDailyMission,
  toggleMission,
  getBadges,
  awardBadge,
  getSummary,
};
