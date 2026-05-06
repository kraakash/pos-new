const User = require("./User");
const Question = require("./Question");
const StudyPlan = require("./StudyPlan");
const StudyPlanQuestion = require("./StudyPlanQuestion");
const UserSolvedQuestion = require("./UserSolvedQuestion");

// Define Associations

// StudyPlan <-> Question (Many-to-Many via StudyPlanQuestion)
StudyPlan.belongsToMany(Question, { through: StudyPlanQuestion, foreignKey: 'studyPlanId' });
Question.belongsToMany(StudyPlan, { through: StudyPlanQuestion, foreignKey: 'questionId' });

// User <-> Question (Many-to-Many via UserSolvedQuestion for Tracking Progress)
User.belongsToMany(Question, { through: UserSolvedQuestion, foreignKey: 'userId' });
Question.belongsToMany(User, { through: UserSolvedQuestion, foreignKey: 'questionId' });

module.exports = {
  User,
  Question,
  StudyPlan,
  StudyPlanQuestion,
  UserSolvedQuestion
};
