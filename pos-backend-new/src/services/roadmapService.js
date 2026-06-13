const { User, Question, Submission, Roadmap } = require('../models');
const { sequelize } = require('../config/db');

const TRACK_TYPES = {
  PRACTICE: 'PRACTICE',
  REVISION: 'REVISION'
};

const MODULE_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  MASTERED: 'MASTERED'
};

const ROADMAP_SECTIONS = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Coding patterns, problem-solving speed, and interview-grade implementation.'
  },
  {
    id: 'os',
    title: 'Operating System',
    description: 'Processes, threads, scheduling, memory, synchronization, and deadlocks.'
  },
  {
    id: 'cn',
    title: 'Computer Networks',
    description: 'OSI/TCP-IP, HTTP, routing, congestion control, and system communication basics.'
  },
  {
    id: 'dbms',
    title: 'DBMS',
    description: 'Relational modeling, transactions, indexing, query planning, and normalization.'
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Scalability, reliability, caching, consistency, and architecture trade-offs.'
  },
  {
    id: 'languages',
    title: 'Programming Languages',
    description: 'Core coding language mastery for interviews and production coding rounds.'
  }
];

const ROADMAP_MODULES = [
  { id: 'arrays', sectionId: 'dsa', title: 'Arrays & Strings', difficulty: 'EASY', practiceTopic: 'Arrays' },
  { id: 'graphs', sectionId: 'dsa', title: 'Graphs', difficulty: 'MEDIUM', practiceTopic: 'Graphs' },
  { id: 'dp', sectionId: 'dsa', title: 'Dynamic Programming', difficulty: 'HARD', practiceTopic: 'Dynamic Programming' },

  { id: 'os-process-thread', sectionId: 'os', title: 'Process vs Thread', difficulty: 'EASY' },
  { id: 'os-memory', sectionId: 'os', title: 'Memory Management', difficulty: 'MEDIUM' },
  { id: 'os-concurrency', sectionId: 'os', title: 'Concurrency & Deadlocks', difficulty: 'HARD' },

  { id: 'cn-protocols', sectionId: 'cn', title: 'Network Protocols', difficulty: 'EASY' },
  { id: 'cn-http', sectionId: 'cn', title: 'HTTP & Web Communication', difficulty: 'MEDIUM' },
  { id: 'cn-routing', sectionId: 'cn', title: 'Routing & Congestion', difficulty: 'HARD' },

  { id: 'dbms-sql', sectionId: 'dbms', title: 'SQL Fundamentals', difficulty: 'EASY', practiceTopic: 'Databases' },
  { id: 'dbms-indexing', sectionId: 'dbms', title: 'Indexing & Query Planning', difficulty: 'MEDIUM', practiceTopic: 'Databases' },
  { id: 'dbms-transactions', sectionId: 'dbms', title: 'Transactions & ACID', difficulty: 'HARD' },

  { id: 'sd-basics', sectionId: 'system-design', title: 'System Design Fundamentals', difficulty: 'MEDIUM' },
  { id: 'sd-caching', sectionId: 'system-design', title: 'Caching & Performance', difficulty: 'MEDIUM' },
  { id: 'sd-scalability', sectionId: 'system-design', title: 'Scalability & Reliability', difficulty: 'HARD' },

  { id: 'lang-c', sectionId: 'languages', title: 'C Language Core', difficulty: 'EASY' },
  { id: 'lang-cpp', sectionId: 'languages', title: 'C++ STL & OOP', difficulty: 'MEDIUM' },
  { id: 'lang-java', sectionId: 'languages', title: 'Java Collections & JVM', difficulty: 'MEDIUM' },
  { id: 'lang-python', sectionId: 'languages', title: 'Python for Interviews', difficulty: 'EASY' }
];

const PRACTICE_TOPIC_ALIAS = {
  arrays: 'arrays',
  graphs: 'graphs',
  'dynamic programming': 'dp',
  databases: 'dbms-sql',
  dbms: 'dbms-sql',
  'system design basics': 'sd-basics'
};

/**
 * Helper to clamp values between min and max bounds.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates a module's status based on completion score and attempts.
 */
function toModuleStatus(progress) {
  if ((progress.attempts || 0) <= 0) return MODULE_STATUS.NOT_STARTED;
  if ((progress.masteryScore || 0) >= 80) return MODULE_STATUS.MASTERED;
  return MODULE_STATUS.IN_PROGRESS;
}

/**
 * Recalculates the mastery score of a module using practice and consistency factors.
 */
function recalculateMastery(progress) {
  const mastery = (0.7 * (progress.practiceScore || 0)) + (0.3 * (progress.consistency || 0));
  progress.masteryScore = Number(clamp(mastery, 0, 100).toFixed(2));
  progress.status = toModuleStatus(progress);
}

/**
 * Recalculates the consistency metric for a module.
 */
function recalculateConsistency(progress) {
  const totalAttempts = progress.practiceAttempts || 0;
  const success = progress.successCount || 0;
  const failure = progress.failureCount || 0;
  const failureRate = totalAttempts > 0 ? failure / totalAttempts : 0;

  let consistency = clamp((totalAttempts * 7) + (success * 2) - (failureRate * 25), 0, 100);

  if (progress.lastActivityAt) {
    const daysSince = (Date.now() - new Date(progress.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 1) consistency += 12;
    else if (daysSince <= 3) consistency += 6;
  }

  progress.consistency = Number(clamp(consistency, 0, 100).toFixed(2));
}

/**
 * Flags module performance weaknesses based on metrics.
 */
function weaknessFlags(progress) {
  if ((progress.attempts || 0) <= 0) return [];
  const flags = [];
  if ((progress.masteryScore || 0) < 55) flags.push('LOW_MASTERY');
  if ((progress.failureRate || 0) > 0.45) flags.push('HIGH_FAILURE_RATE');
  if ((progress.avgTime || 0) > 1400) flags.push('SLOW_SOLVING');
  return flags;
}

/**
 * Merges static module metadata with dynamic user progress metrics.
 */
function enrichModule(module, progress) {
  const progObj = progress || {
    moduleId: module.id,
    practiceScore: 0,
    interviewScore: 0,
    consistency: 0,
    masteryScore: 0,
    attempts: 0,
    practiceAttempts: 0,
    interviewAttempts: 0,
    successCount: 0,
    failureCount: 0,
    failureRate: 0,
    avgTime: 0,
    status: MODULE_STATUS.NOT_STARTED,
    lastActivityAt: null,
    updatedAt: new Date().toISOString()
  };
  return {
    ...module,
    ...progObj,
    weaknessFlags: weaknessFlags(progObj)
  };
}

/**
 * Aggregates section details by summing module metrics.
 */
function aggregateSection(section, modules, progressByModule) {
  const sectionModules = modules.filter((m) => m.sectionId === section.id);
  const enriched = sectionModules.map((m) => enrichModule(m, progressByModule[m.id]));

  const completion = enriched.length
    ? Number(((enriched.filter((m) => m.status === MODULE_STATUS.MASTERED).length / enriched.length) * 100).toFixed(1))
    : 0;

  const masteryScore = enriched.length
    ? Number((enriched.reduce((sum, m) => sum + (m.masteryScore || 0), 0) / enriched.length).toFixed(1))
    : 0;

  const weakModules = enriched
    .filter((m) => weaknessFlags(m).length > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 3)
    .map((m) => ({ id: m.id, title: m.title, masteryScore: m.masteryScore, flags: weaknessFlags(m) }));

  return {
    ...section,
    completionPct: completion,
    masteryScore,
    weakModules,
    moduleCount: enriched.length,
    modules: enriched
  };
}

/**
 * Helper to normalize and match unstarted module metrics.
 */
function normalizeUnstartedProgress(structure) {
  if (!structure || !structure.progressByModule) return structure;
  const progressByModule = { ...structure.progressByModule };
  let changed = false;

  for (const moduleId of Object.keys(progressByModule)) {
    const p = { ...progressByModule[moduleId] };
    if ((p.attempts || 0) === 0 && ((p.practiceScore || 0) !== 0 || (p.interviewScore || 0) !== 0 || (p.consistency || 0) !== 0 || (p.masteryScore || 0) !== 0)) {
      p.practiceScore = 0;
      p.interviewScore = 0;
      p.consistency = 0;
      p.masteryScore = 0;
      p.status = MODULE_STATUS.NOT_STARTED;
      progressByModule[moduleId] = p;
      changed = true;
    }
  }

  return changed ? { ...structure, progressByModule } : structure;
}

/**
 * Builds the initial structure of a generated roadmap.
 */
function buildInitialRoadmap(user) {
  const progressByModule = {};
  for (const module of ROADMAP_MODULES) {
    const progress = {
      moduleId: module.id,
      practiceScore: 0,
      interviewScore: 0,
      consistency: 0,
      masteryScore: 0,
      attempts: 0,
      practiceAttempts: 0,
      interviewAttempts: 0,
      successCount: 0,
      failureCount: 0,
      failureRate: 0,
      avgTime: 0,
      status: MODULE_STATUS.NOT_STARTED,
      lastActivityAt: null,
      updatedAt: new Date().toISOString()
    };

    recalculateMastery(progress);
    progressByModule[module.id] = progress;
  }

  return {
    model: 'section-roadmap-v1',
    sections: ROADMAP_SECTIONS,
    modules: ROADMAP_MODULES,
    progressByModule,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Assures a valid active roadmap exists for the given user, generating one if missing.
 */
async function ensureRoadmap(userId) {
  let active = await Roadmap.findOne({
    where: { userId, status: 'ACTIVE' },
    order: [['updatedAt', 'DESC']]
  });

  if (active?.structure?.model === 'section-roadmap-v1') {
    const normalized = normalizeUnstartedProgress(active.structure);
    if (JSON.stringify(normalized) !== JSON.stringify(active.structure)) {
      active = await active.update({ structure: normalized });
    }
    return active;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Complete onboarding first.');
    err.status = 404;
    throw err;
  }

  const structure = buildInitialRoadmap(user);

  await Roadmap.update(
    { status: 'ARCHIVED' },
    { where: { userId, status: 'ACTIVE' } }
  );

  const latest = await Roadmap.findOne({
    where: { userId },
    order: [['version', 'DESC']]
  });

  active = await Roadmap.create({
    userId,
    version: (latest?.version || 0) + 1,
    structure,
    focusTopics: ROADMAP_MODULES.slice(0, 6).map((m) => m.title),
    status: 'ACTIVE'
  });

  return active;
}

/**
 * Builds the roadmap dashboard stats.
 */
function buildRoadmapDashboard(roadmap, readinessScore) {
  const structure = roadmap.structure || {};
  const sections = Array.isArray(structure.sections) ? structure.sections : [];
  const modules = Array.isArray(structure.modules) ? structure.modules : [];
  const progressByModule = structure.progressByModule || {};

  const sectionSummaries = sections.map((section) => aggregateSection(section, modules, progressByModule));
  const allModules = sectionSummaries.flatMap((s) => s.modules);

  const overallCompletion = allModules.length
    ? Number(((allModules.filter((m) => m.status === MODULE_STATUS.MASTERED).length / allModules.length) * 100).toFixed(1))
    : 0;

  const overallMastery = allModules.length
    ? Number((allModules.reduce((sum, m) => sum + (m.masteryScore || 0), 0) / allModules.length).toFixed(1))
    : 0;

  return {
    roadmapId: roadmap.id,
    version: roadmap.version,
    readinessScore: readinessScore || 0,
    overallCompletion,
    overallMastery,
    sections: sectionSummaries.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      completionPct: s.completionPct,
      masteryScore: s.masteryScore,
      weakModules: s.weakModules,
      moduleCount: s.moduleCount
    }))
  };
}

/**
 * Triggers re-generation of user roadmap.
 */
async function generateRoadmap(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Complete onboarding first.');
    err.status = 404;
    throw err;
  }
  const structure = buildInitialRoadmap(user);

  await Roadmap.update(
    { status: 'ARCHIVED' },
    { where: { userId, status: 'ACTIVE' } }
  );

  const latest = await Roadmap.findOne({
    where: { userId },
    order: [['version', 'DESC']]
  });

  const created = await Roadmap.create({
    userId,
    version: (latest?.version || 0) + 1,
    structure,
    focusTopics: ROADMAP_MODULES.slice(0, 6).map((m) => m.title),
    status: 'ACTIVE'
  });

  return buildRoadmapDashboard(created, user.readinessScore);
}

/**
 * Gets user roadmap details.
 */
async function getRoadmap(userId) {
  const [user, active] = await Promise.all([
    User.findByPk(userId),
    ensureRoadmap(userId)
  ]);

  return buildRoadmapDashboard(active, user?.readinessScore || 0);
}

/**
 * Gets aggregated section data.
 */
async function getSection(userId, sectionId) {
  const active = await ensureRoadmap(userId);
  const structure = active.structure || {};

  const sections = Array.isArray(structure.sections) ? structure.sections : [];
  const modules = Array.isArray(structure.modules) ? structure.modules : [];
  const progressByModule = structure.progressByModule || {};

  const section = sections.find((s) => s.id === sectionId);
  if (!section) {
    const err = new Error('Section not found');
    err.status = 404;
    throw err;
  }

  return aggregateSection(section, modules, progressByModule);
}

/**
 * Gets specific module details, mapping corresponding coding problems and user submissions.
 */
async function getModule(userId, moduleId) {
  const active = await ensureRoadmap(userId);
  const structure = active.structure || {};

  const modules = Array.isArray(structure.modules) ? structure.modules : [];
  const progressByModule = structure.progressByModule || {};

  const module = modules.find((m) => m.id === moduleId);
  if (!module) {
    const err = new Error('Module not found');
    err.status = 404;
    throw err;
  }

  const progress = progressByModule[module.id] || {};
  const practiceProblems = module.practiceTopic
    ? await Question.findAll({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('category')),
          sequelize.fn('lower', module.practiceTopic)
        ),
        order: [
          ['difficulty', 'ASC'],
          ['updatedAt', 'DESC']
        ],
        limit: 8
      })
    : [];

  const submissions = module.practiceTopic
    ? await Submission.findAll({
        where: { userId },
        include: [{
          model: Question,
          where: sequelize.where(
            sequelize.fn('lower', sequelize.col('category')),
            sequelize.fn('lower', module.practiceTopic)
          )
        }],
        order: [['createdAt', 'DESC']],
        limit: 15
      })
    : [];

  const solvedProblemIds = new Set(
    submissions
      .filter((s) => s.questionId && s.status === 'Accepted')
      .map((s) => s.questionId)
  );

  const accuracyPct = progress.attempts > 0
    ? Number((((progress.successCount || 0) / progress.attempts) * 100).toFixed(1))
    : 0;

  return {
    ...module,
    ...progress,
    weaknessFlags: weaknessFlags(progress),
    practiceProblems: practiceProblems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.category,
      estimatedMinutes: 20, // default placeholder minutes
      status: solvedProblemIds.has(p.id) ? 'SOLVED' : 'UNSOLVED'
    })),
    submissions: submissions.map((s) => ({
      id: s.id,
      problemTitle: s.Question?.title || 'Unknown',
      status: s.status,
      timeTaken: 120, // default time taken placeholder
      attempts: 1,
      createdAt: s.createdAt
    })),
    analytics: {
      accuracyPct,
      avgSolveTime: Number((progress.avgTime || 0).toFixed(1)),
      attempts: progress.attempts || 0,
      weakPatterns: weaknessFlags(progress)
    }
  };
}

/**
 * Updates module progress state.
 */
async function updateRoadmap(userId, dto) {
  const active = await ensureRoadmap(userId);
  const structure = active.structure || {};
  const modules = Array.isArray(structure.modules) ? structure.modules : [];
  const progressByModule = structure.progressByModule || {};

  const module = modules.find((m) => m.id === dto.moduleId);
  if (!module) {
    const err = new Error('Module not found for update');
    err.status = 404;
    throw err;
  }

  const progress = progressByModule[module.id] || {
    moduleId: module.id,
    practiceScore: 0,
    interviewScore: 0,
    consistency: 0,
    masteryScore: 0,
    attempts: 0,
    practiceAttempts: 0,
    interviewAttempts: 0,
    successCount: 0,
    failureCount: 0,
    failureRate: 0,
    avgTime: 0,
    status: MODULE_STATUS.NOT_STARTED,
    lastActivityAt: null,
    updatedAt: new Date().toISOString()
  };

  if (dto.type === TRACK_TYPES.PRACTICE) {
    const verdict = dto.verdict || 'PARTIAL';
    const delta = verdict === 'SUCCESS' ? 8 : verdict === 'PARTIAL' ? 4 : -6;
    const pastePenalty = dto.pasteRatio > 0.6 ? 8 : dto.pasteRatio > 0.35 ? 4 : 0;

    progress.practiceAttempts = (progress.practiceAttempts || 0) + 1;
    progress.attempts = (progress.attempts || 0) + 1;
    progress.successCount = (progress.successCount || 0) + (verdict === 'SUCCESS' ? 1 : 0);
    progress.failureCount = (progress.failureCount || 0) + (verdict === 'FAILURE' ? 1 : 0);

    const nextPractice = clamp((progress.practiceScore || 0) + delta - pastePenalty, 0, 100);
    progress.practiceScore = Number(nextPractice.toFixed(2));

    const timeTaken = dto.timeTaken || 300;
    progress.avgTime = progress.avgTime
      ? Number((((progress.avgTime * (progress.attempts - 1)) + timeTaken) / progress.attempts).toFixed(2))
      : timeTaken;
  }

  if (dto.type === TRACK_TYPES.REVISION) {
    progress.attempts = (progress.attempts || 0) + 1;
    progress.consistency = Number(clamp((progress.consistency || 0) + 6, 0, 100).toFixed(2));
  }

  const totalAttempts = progress.practiceAttempts || 0;
  progress.failureRate = totalAttempts > 0 ? Number(((progress.failureCount || 0) / totalAttempts).toFixed(3)) : 0;
  progress.lastActivityAt = new Date().toISOString();
  progress.updatedAt = new Date().toISOString();

  recalculateConsistency(progress);
  recalculateMastery(progress);
  progressByModule[module.id] = progress;

  const user = await User.findByPk(userId);

  const updated = await active.update({
    structure: {
      ...(structure || {}),
      sections: structure.sections || ROADMAP_SECTIONS,
      modules: structure.modules || ROADMAP_MODULES,
      progressByModule
    },
    focusTopics: Object.values(progressByModule)
      .sort((a, b) => (a.masteryScore || 0) - (b.masteryScore || 0))
      .slice(0, 6)
      .map((p) => modules.find((m) => m.id === p.moduleId)?.title)
      .filter(Boolean)
  });

  return {
    module: enrichModule(module, progress),
    dashboard: buildRoadmapDashboard(updated, user?.readinessScore || 0)
  };
}

/**
 * Evaluates and builds progress details for the user roadmap.
 */
async function getRoadmapProgress(userId) {
  const active = await ensureRoadmap(userId);
  const structure = active.structure || {};
  const modules = structure.modules || [];
  const progressByModule = structure.progressByModule || {};

  const enriched = modules.map((m) => enrichModule(m, progressByModule[m.id]));
  const completionPct = enriched.length
    ? Number(((enriched.filter((m) => m.status === MODULE_STATUS.MASTERED).length / enriched.length) * 100).toFixed(1))
    : 0;

  const avgTimeByModule = enriched
    .filter((m) => (m.avgTime || 0) > 0)
    .map((m) => ({ module: m.title, avgTime: Number((m.avgTime || 0).toFixed(1)) }))
    .sort((a, b) => b.avgTime - a.avgTime);

  const weaknessReport = enriched
    .map((m) => ({ module: m.title, masteryScore: m.masteryScore || 0, flags: weaknessFlags(m) }))
    .filter((x) => x.flags.length > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  return { completionPct, avgTimeByModule, weaknessReport };
}

/**
 * Public static initial templates.
 */
function buildPublicRoadmapStructure() {
  return buildInitialRoadmap({});
}

function getPublicRoadmap() {
  const structure = buildPublicRoadmapStructure();
  return buildRoadmapDashboard({ id: 'public', version: 0, structure }, 0);
}

function getPublicSection(sectionId) {
  const structure = buildPublicRoadmapStructure();
  const sections = structure.sections || [];
  const modules = structure.modules || [];
  const progressByModule = structure.progressByModule || {};
  const section = sections.find((s) => s.id === sectionId);
  if (!section) {
    const err = new Error('Section not found');
    err.status = 404;
    throw err;
  }
  return aggregateSection(section, modules, progressByModule);
}

module.exports = {
  getRoadmap,
  generateRoadmap,
  getSection,
  getModule,
  updateRoadmap,
  getRoadmapProgress,
  getPublicRoadmap,
  getPublicSection
};
