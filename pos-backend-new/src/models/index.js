const User = require("./User");
const Question = require("./Question");
const StudyPlan = require("./StudyPlan");
const StudyPlanQuestion = require("./StudyPlanQuestion");
const UserSolvedQuestion = require("./UserSolvedQuestion");
const Submission = require("./Submission");
const LearningNote = require("./LearningNote");

// --- Roadmap Module Models ---
const Roadmap = require("./Roadmap");
const RoadmapProgress = require("./RoadmapProgress");
const DailyMissionLog = require("./DailyMissionLog");
const UserBadge = require("./UserBadge");
const InterviewSession = require("./InterviewSession");

// Define Associations

// StudyPlan <-> Question (Many-to-Many via StudyPlanQuestion)
StudyPlan.belongsToMany(Question, { through: StudyPlanQuestion, foreignKey: 'studyPlanId' });
Question.belongsToMany(StudyPlan, { through: StudyPlanQuestion, foreignKey: 'questionId' });

// User <-> Question (Many-to-Many via UserSolvedQuestion for Tracking Progress)
User.belongsToMany(Question, { through: UserSolvedQuestion, foreignKey: 'userId' });
Question.belongsToMany(User, { through: UserSolvedQuestion, foreignKey: 'questionId' });

// User <-> Submission (One-to-Many)
User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

// Question <-> Submission (One-to-Many)
Question.hasMany(Submission, { foreignKey: 'questionId' });
Submission.belongsTo(Question, { foreignKey: 'questionId' });

// --- Roadmap Associations ---
// User -> Roadmap (One-to-Many)
User.hasMany(Roadmap, { foreignKey: 'userId', onDelete: 'CASCADE' });
Roadmap.belongsTo(User, { foreignKey: 'userId' });

// User -> RoadmapProgress (One-to-Many)
User.hasMany(RoadmapProgress, { foreignKey: 'userId' });
RoadmapProgress.belongsTo(User, { foreignKey: 'userId' });

// User -> DailyMissionLog (One-to-Many)
User.hasMany(DailyMissionLog, { foreignKey: 'userId' });
DailyMissionLog.belongsTo(User, { foreignKey: 'userId' });

// User -> UserBadge (One-to-Many)
User.hasMany(UserBadge, { foreignKey: 'userId' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });

// User -> LearningNote (One-to-Many)
User.hasMany(LearningNote, { foreignKey: 'userId' });
LearningNote.belongsTo(User, { foreignKey: 'userId' });

// User -> InterviewSession (One-to-Many)
User.hasMany(InterviewSession, { foreignKey: 'userId' });
InterviewSession.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Question,
  StudyPlan,
  StudyPlanQuestion,
  UserSolvedQuestion,
  Submission,
  LearningNote,
  InterviewSession,
  // Roadmap module
  Roadmap,
  RoadmapProgress,
  DailyMissionLog,
  UserBadge,
};
