const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVisibility = sequelize.define('ProductVisibility', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = ProductVisibility;