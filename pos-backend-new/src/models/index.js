const User = require("./User");
const Question = require("./Question");
const StudyPlan = require("./StudyPlan");
const StudyPlanQuestion = require("./StudyPlanQuestion");
const UserSolvedQuestion = require("./UserSolvedQuestion");
const Submission = require("./Submission");

// --- Roadmap Module Models ---
const RoadmapProgress = require("./RoadmapProgress");
const DailyMissionLog = require("./DailyMissionLog");
const UserBadge = require("./UserBadge");

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
// User -> RoadmapProgress (One-to-Many)
User.hasMany(RoadmapProgress, { foreignKey: 'userId' });
RoadmapProgress.belongsTo(User, { foreignKey: 'userId' });

// User -> DailyMissionLog (One-to-Many)
User.hasMany(DailyMissionLog, { foreignKey: 'userId' });
DailyMissionLog.belongsTo(User, { foreignKey: 'userId' });

// User -> UserBadge (One-to-Many)
User.hasMany(UserBadge, { foreignKey: 'userId' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Question,
  StudyPlan,
  StudyPlanQuestion,
  UserSolvedQuestion,
  Submission,
  // Roadmap module
  RoadmapProgress,
  DailyMissionLog,
  UserBadge,
};
