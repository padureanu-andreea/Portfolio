const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Tag = sequelize.define('Tag',{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // ex: "Vegetarian", "Vegan", "Iubitor de zacusca"
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // true = etichetă predefinită (ex: Vegetarian)
    // false = creată de utilizatori
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  },
);

module.exports = Tag;