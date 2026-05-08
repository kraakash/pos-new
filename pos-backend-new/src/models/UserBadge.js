const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * UserBadge — records which badges a user has earned in a roadmap.
 * UNIQUE on (userId, roadmapId, badgeId) — a badge can only be earned once.
 */
const UserBadge = sequelize.define(
  'UserBadge',
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
    badgeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'e.g. b3, b6 — matches id in badges.js',
    },
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roadmapId', 'badgeId'],
        name: 'unique_user_roadmap_badge',
      },
    ],
  }
);

module.exports = UserBadge;
