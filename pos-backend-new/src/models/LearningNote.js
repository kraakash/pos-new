const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const LearningNote = sequelize.define("LearningNote", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: "Users", key: "id" },
    onDelete: "CASCADE"
  },
  topic: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  content: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  }
}, {
  timestamps: true
});

module.exports = LearningNote;
