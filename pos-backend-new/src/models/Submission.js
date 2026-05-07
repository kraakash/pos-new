const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Submission = sequelize.define("Submission", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  questionId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  code: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  language: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  status: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, {
  timestamps: true // Automatically adds createdAt (submission time) and updatedAt
});

module.exports = Submission;
