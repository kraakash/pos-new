const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    skillLevel: {
      type: DataTypes.ENUM("BEGINNER", "INTERMEDIATE", "ADVANCED"),
      allowNull: true,
      defaultValue: "BEGINNER",
    },
    placementGoal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    githubUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    collegeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    leetcodeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codeforcesUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codechefUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hackerrankUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    readinessScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    weakTopics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    targetCompanies: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
