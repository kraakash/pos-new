const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UserSolvedQuestion = sequelize.define("UserSolvedQuestion", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  status: { 
    type: DataTypes.ENUM("Solved", "Attempted"), 
    defaultValue: "Solved" 
  },
}, {
  timestamps: true
});

module.exports = UserSolvedQuestion;
