import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deleteNotification,
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

const getNotificationTone = (notification) => {
  const text = `${notification.tip || ""} ${notification.mesaj || ""}`.toLowerCase();

  if (
    text.includes("retras") ||
    text.includes("anulat") ||
    text.includes("respins") ||
    text.includes("respinsa") ||
    text.includes("neprezentat")
  ) {
    return "danger";
  }

  if (
    text.includes("acceptat") ||
    text.includes("acceptata") ||
    text.includes("succes") ||
    text.includes("programat")
  ) {
    return "success";
  }

  if (
    text.includes("reprogramare") ||
    text.includes("actualizat") ||
    text.includes("analiza")
  ) {
    return "warning";
  }

  if (
    text.includes("aplicatie noua") ||
    text.includes("aplicatie trimisa") ||
    text.includes("candidatura inregistrata")
  ) {
    return "info";
  }

  return "neutral";
};

const notificationToneLabels = {
  danger: "Important",
  success: "Pozitiv",
  warning: "Actualizare",
  info: "Informare",
  neutral: "General",
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatNotificationMessage = (message) => {
  if (!message) {
    return "-";
  }

  return message
    .replace(/\s*\[aplicatie:\d+\]/g, "")
    .replace(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?Z?/g,
      (match) => formatDateTime(match)
    );
};

const getApplicationIdFromNotification = (message) => {
  const match = message?.match(/\[aplicatie:(\d+)\]/);

  return match ? match[1] : null;
};

function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setError("");
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Nu s-au putut incarca notificarile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await markNotificationAsRead(notificationId);
      setMessage("Notificarea a fost marcata ca citita.");
      await loadNotifications();
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut marca notificarea ca citita."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (notificationId) => {
    const confirmed = window.confirm("Sigur vrei sa stergi aceasta notificare?");

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      await deleteNotification(notificationId);
      setMessage("Notificarea a fost stearsa.");
      await loadNotifications();
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setError(
        err.response?.data?.message || "Nu s-a putut sterge notificarea."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenNotification = async (notification) => {
    const applicationId = getApplicationIdFromNotification(notification.mesaj);

    if (!applicationId || isSaving) {
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      if (!notification.citit) {
        await markNotificationAsRead(notification.id_notificare);
        window.dispatchEvent(new Event("notifications-updated"));
      }

      navigate(`/applications/${applicationId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nu s-a putut deschide notificarea."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.citit
  ).length;
  const isAdmin = user?.rol === "ADMIN";
  const pageTitle = isAdmin ? "Istoric administrativ" : "Notificari";
  const emptyMessage = isAdmin
    ? "Nu exista evenimente in istoric."
    : "Nu exista notificari.";

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h1>{pageTitle}</h1>
          <p>
            {isAdmin
              ? "Vezi actiunile administrative importante realizate in sistem."
              : unreadCount > 0
                ? `Ai ${unreadCount} notificari necitite.`
                : "Nu ai notificari necitite."}
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="table-section">
        {isLoading ? (
          <p>{isAdmin ? "Se incarca istoricul..." : "Se incarca notificarile..."}</p>
        ) : notifications.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Stare</th>
                <th>Titlu</th>
                <th>Mesaj</th>
                <th>Data</th>
                <th>Actiuni</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((notification) => {
                const tone = getNotificationTone(notification);
                const applicationId = getApplicationIdFromNotification(
                  notification.mesaj
                );
                const formattedMessage = formatNotificationMessage(
                  notification.mesaj
                );

                return (
                  <tr
                    key={notification.id_notificare}
                    className={notification.citit ? "muted-row" : ""}
                  >
                    <td>
                      <span className={`status-badge notification-${notification.citit ? "read" : "unread"}`}>
                        {notification.citit ? "Citita" : "Necitita"}
                      </span>
                    </td>
                    <td>
                      <div className="notification-title">
                        <span className={`status-badge notification-${tone}`}>
                          {notificationToneLabels[tone]}
                        </span>
                        <strong>{notification.tip}</strong>
                      </div>
                    </td>
                    <td className="notification-message">
                      {applicationId ? (
                        <button
                          type="button"
                          className="notification-message-button"
                          onClick={() => handleOpenNotification(notification)}
                          disabled={isSaving}
                        >
                          {formattedMessage}
                        </button>
                      ) : (
                        formattedMessage
                      )}
                    </td>
                    <td>
                      {notification.data_trimitere
                        ? formatDateTime(notification.data_trimitere)
                        : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        {!notification.citit && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(notification.id_notificare)
                            }
                            disabled={isSaving}
                          >
                            Marcheaza citita
                          </button>
                        )}

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDelete(notification.id_notificare)}
                          disabled={isSaving}
                        >
                          Sterge
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default NotificationsPage;
