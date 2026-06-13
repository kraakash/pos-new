const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Roadmap model to store user-customized roadmap data, completions, progress,
 * and focus topics in a single JSONB column.
 */
const Roadmap = sequelize.define(
  'Roadmap',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
      defaultValue: 'ACTIVE',
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    structure: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    focusTopics: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'status'],
        name: 'idx_user_roadmap_status',
      },
    ],
  }
);

module.exports = Roadmap;
