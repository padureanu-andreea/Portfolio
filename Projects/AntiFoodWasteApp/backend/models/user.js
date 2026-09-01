const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [3, 30],
                msg: "Username-ul trebuie să aibă între 3 și 30 de caractere"
            },
            is: {
                args: /^[a-zA-Z0-9_.]+$/i,
                msg: "Username-ul poate conține doar litere, cifre, punct și underscore"
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        validate: {
            is: {
                args: /^07\d{8}$/,
                msg: "Număr de telefon invalid. Format acceptat: 07xxxxxxxx"
            }
        }
    },
    bio: {
        type: DataTypes.TEXT,
        validate: {
            len: {
                args: [0, 500],
                msg: "Bio nu poate depăși 500 de caractere"
            }
        }
    }
});

module.exports = User;