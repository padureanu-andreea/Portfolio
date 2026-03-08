const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const GroupMemberTag = sequelize.define('GroupMemberTag', {
  groupId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  memberId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  tagId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  createdBy: {
    type: DataTypes.INTEGER,  
    allowNull: false
  }
});

module.exports = GroupMemberTag;
