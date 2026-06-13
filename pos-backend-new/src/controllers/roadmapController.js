const { RoadmapProgress, DailyMissionLog, UserBadge } = require('../models');
const roadmapService = require('../services/roadmapService');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: get today's date as YYYY-MM-DD string (UTC-safe)
// ─────────────────────────────────────────────────────────────────────────────
const todayString = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
// NEW DATABASE-DRIVEN ROADMAP ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the active user's roadmap (or public roadmap if guest).
 */
const getRoadmap = async (req, res, next) => {
  try {
    if (req.user) {
      res.json(await roadmapService.getRoadmap(req.user.id));
    } else {
      res.json(roadmapService.getPublicRoadmap());
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Get public roadmap dashboard template.
 */
const getPublicRoadmap = async (req, res, next) => {
  try {
    res.json(roadmapService.getPublicRoadmap());
  } catch (err) {
    next(err);
  }
};

/**
 * Get public section.
 */
const getPublicSection = async (req, res, next) => {
  try {
    res.json(roadmapService.getPublicSection(req.params.id));
  } catch (err) {
    next(err);
  }
};

/**
 * Explicitly generate or regenerate user roadmap.
 */
const generateRoadmap = async (req, res, next) => {
  try {
    res.json(await roadmapService.generateRoadmap(req.user.id));
  } catch (err) {
    next(err);
  }
};

/**
 * Get user section detail.
 */
const getSection = async (req, res, next) => {
  try {
    res.json(await roadmapService.getSection(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
};

/**
 * Get user module detail.
 */
const getModule = async (req, res, next) => {
  try {
    res.json(await roadmapService.getModule(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
};

/**
 * Get roadmap overall progress analytics.
 */
const getRoadmapProgress = async (req, res, next) => {
  try {
    res.json(await roadmapService.getRoadmapProgress(req.user.id));
  } catch (err) {
    next(err);
  }
};

/**
 * Update module progress.
 */
const updateRoadmap = async (req, res, next) => {
  try {
    const { moduleId, type, verdict, timeTaken, pasteRatio } = req.body;
    res.json(await roadmapService.updateRoadmap(req.user.id, {
      moduleId,
      type,
      verdict,
      timeTaken,
      pasteRatio
    }));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY / COMPATIBILITY ROADMAP ENDPOINTS
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

const updateTopicStatus = async (req, res, next) => {
  try {
    const { roadmapId, topicId } = req.params;
    const userId = req.user.id;
    const { status = 'completed' } = req.body;

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

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

const syncProgress = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const { progress = [] } = req.body;

    if (!Array.isArray(progress) || progress.length === 0) {
      return res.status(400).json({ message: 'progress must be a non-empty array' });
    }

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

const getDailyMission = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user.id;
    const today = todayString();

    const log = await DailyMissionLog.findOne({
      where: { userId, roadmapId, missionDate: today },
    });

    if (!log) {
      return res.json({ roadmapId, date: today, missions: [] });
    }

    res.json({ roadmapId, date: today, missions: log.missions });
  } catch (err) {
    next(err);
  }
};

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

    const updated = log.missions.map((m) =>
      m.id === missionId ? { ...m, completed: !!completed } : m
    );

    await log.update({ missions: updated });

    res.json({ success: true, missionId, completed: !!completed });
  } catch (err) {
    next(err);
  }
};

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

const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progressRows = await RoadmapProgress.findAll({
      where: { userId, status: 'completed' },
      attributes: ['roadmapId'],
    });

    const countByRoadmap = {};
    progressRows.forEach(({ roadmapId }) => {
      countByRoadmap[roadmapId] = (countByRoadmap[roadmapId] || 0) + 1;
    });

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
  // New API
  getRoadmap,
  getPublicRoadmap,
  getPublicSection,
  generateRoadmap,
  getSection,
  getModule,
  getRoadmapProgress,
  updateRoadmap,

  // Legacy API
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
