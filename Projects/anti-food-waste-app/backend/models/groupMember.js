const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const GroupMember = sequelize.define(
  'GroupMember',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }
);

module.exports = GroupMember;
