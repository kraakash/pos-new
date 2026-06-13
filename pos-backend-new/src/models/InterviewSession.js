const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/**
 * ============================================================================
 * MODEL: InterviewSession
 * ============================================================================
 * Keeps track of candidate mock interview sessions.
 * Holds role information, active/completed status, chat transcripts, and final reports.
 */
const InterviewSession = sequelize.define(
  "InterviewSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transcript: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "Array of message objects: [{ role: 'interviewer'|'candidate', content: string, createdAt: timestamp }]",
    },
    evaluation: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: "Evaluation report details: scores, strengths, weaknesses, follow-ups",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "COMPLETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = InterviewSession;
