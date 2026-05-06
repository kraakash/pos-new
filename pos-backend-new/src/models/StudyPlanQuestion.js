const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const StudyPlanQuestion = sequelize.define("StudyPlanQuestion", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  sequence: { 
    type: DataTypes.INTEGER 
  },
}, {
  timestamps: false
});

module.exports = StudyPlanQuestion;
