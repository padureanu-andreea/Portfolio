require("dotenv").config();
const { Sequelize } = require('sequelize');

// Folosim DATABASE_URL deoarece conține user, pass, host și port într-un singur string
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // curăță consola de interogări SQL lungi
    dialectOptions: {
    }
});

module.exports = sequelize;