const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * RoadmapProgress — tracks which topics a user has completed in any roadmap.
 *
 * One row = one user's status on one topic in one roadmap.
 * e.g. { userId: 5, roadmapId: 'sde', topicId: 't3-2', status: 'completed' }
 *
 * UNIQUE constraint on (userId, roadmapId, topicId) ensures no duplicate rows.
 * Upsert is used on writes so calling complete twice is idempotent.
 */
const RoadmapProgress = sequelize.define(
  'RoadmapProgress',
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
      comment: 'e.g. sde, frontend, devops',
    },
    topicId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. t3-2, t1-7',
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      defaultValue: 'completed', // We only write a row when something is marked
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roadmapId', 'topicId'],
        name: 'unique_user_roadmap_topic',
      },
      {
        fields: ['userId', 'roadmapId'],
        name: 'idx_user_roadmap',
      },
    ],
  }
);

module.exports = RoadmapProgress;
