const pool = require("../config/db");

const createNotification = async ({
  id_utilizator,
  titlu,
  mesaj
}) => {
  const result = await pool.query(
    `INSERT INTO notificari
     (id_utilizator, tip, mesaj, citit)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_utilizator, titlu, mesaj, false]
  );

  return result.rows[0];
};

module.exports = {
  createNotification
};