const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * DailyMissionLog — stores the generated missions for a user on a given day.
 *
 * One row = user + roadmap + date combination.
 * The `missions` JSONB column stores the full array of mission objects.
 *
 * UNIQUE on (userId, roadmapId, missionDate) prevents duplicate daily logs.
 */
const DailyMissionLog = sequelize.define(
  'DailyMissionLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    roadmapId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    missionDate: {
      type: DataTypes.DATEONLY, // stores only YYYY-MM-DD
      allowNull: false,
    },
    /**
     * missions JSON structure:
     * [
     *   { id: 'm-t3-2', text: 'Study: Arrays', type: 'dsa', completed: false },
     *   { id: 'daily-apply', text: 'Apply to 2 companies', type: 'execution', completed: true }
     * ]
     */
    missions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roadmapId', 'missionDate'],
        name: 'unique_user_roadmap_date',
      },
    ],
  }
);

module.exports = DailyMissionLog;
