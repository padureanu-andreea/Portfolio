const notificationModel = require("../models/notificationModel");

const getMyNotifications = async (req, res) => {
  try {
    const notifications =
      await notificationModel.getNotificationsByUserId(req.user.id);

    res.json(notifications);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification =
      await notificationModel.getNotificationById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notificarea nu exista"
      });
    }

    if (notification.id_utilizator !== req.user.id) {
      return res.status(403).json({
        message: "Nu poti modifica aceasta notificare"
      });
    }

    const updated =
      await notificationModel.markAsRead(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error("MARK NOTIFICATION READ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification =
      await notificationModel.getNotificationById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notificarea nu exista"
      });
    }

    if (notification.id_utilizator !== req.user.id) {
      return res.status(403).json({
        message: "Nu poti sterge aceasta notificare"
      });
    }

    const deleted =
      await notificationModel.deleteNotification(req.params.id);

    res.json({
      message: "Notificare stearsa cu succes",
      notification: deleted
    });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  deleteNotification
};