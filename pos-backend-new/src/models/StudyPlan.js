const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const StudyPlan = sequelize.define("StudyPlan", {
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  themeStartColor: { 
    type: DataTypes.STRING 
  },
  themeEndColor: { 
    type: DataTypes.STRING 
  },
  isFeatured: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
}, {
  timestamps: true
});

module.exports = StudyPlan;
