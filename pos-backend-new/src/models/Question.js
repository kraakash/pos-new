const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Question = sequelize.define("Question", {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  difficulty: {
    type: DataTypes.ENUM("Easy", "Medium", "Hard"),
    defaultValue: "Easy"
  },
  category: {
    type: DataTypes.STRING
  },
  expectedTimeComplexity: {
    type: DataTypes.STRING
  },
  expectedSpaceComplexity: {
    type: DataTypes.STRING
  },
  constraints: {
    type: DataTypes.JSONB // Postgres JSONB for array of strings
  },
  examples: {
    type: DataTypes.JSONB // Postgres JSONB for array of example objects
  }
}, {
  timestamps: true
});

module.exports = Question;
