const pool = require("../config/db");

const getNotificationsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM notificari
     WHERE id_utilizator = $1
     ORDER BY data_trimitere DESC`,
    [userId]
  );

  return result.rows;
};

const getNotificationById = async (notificationId) => {
  const result = await pool.query(
    `SELECT *
     FROM notificari
     WHERE id_notificare = $1`,
    [notificationId]
  );

  return result.rows[0];
};

const markAsRead = async (notificationId) => {
  const result = await pool.query(
    `UPDATE notificari
     SET citit = true
     WHERE id_notificare = $1
     RETURNING *`,
    [notificationId]
  );

  return result.rows[0];
};

const deleteNotification = async (notificationId) => {
  const result = await pool.query(
    `DELETE FROM notificari
     WHERE id_notificare = $1
     RETURNING *`,
    [notificationId]
  );

  return result.rows[0];
};

module.exports = {
  getNotificationsByUserId,
  getNotificationById,
  markAsRead,
  deleteNotification
};