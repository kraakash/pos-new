const User = require("./User");
const Question = require("./Question");
const StudyPlan = require("./StudyPlan");
const StudyPlanQuestion = require("./StudyPlanQuestion");
const UserSolvedQuestion = require("./UserSolvedQuestion");
const Submission = require("./Submission");

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

module.exports = {
  User,
  Question,
  StudyPlan,
  StudyPlanQuestion,
  UserSolvedQuestion,
  Submission
};
