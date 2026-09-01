import React, { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCompany } from "../services/companyService";
import { getMyNotifications } from "../services/notificationService";
import CandidateAssistantWidget from "./CandidateAssistantWidget";
import smartHireSidebarLogo from "../assets/smarthire-sidebar-logo.png";

const navItemsByRole = {
  ADMIN: [
    { label: "Panou principal", path: "/dashboard" },
    { label: "Companie", path: "/company" },
    { label: "Departamente", path: "/departments" },
    { label: "Conturi companie", path: "/staff-users" },
    { label: "Conturi candidati", path: "/candidate-users" },
    { label: "Statistici", path: "/statistics" },
    { label: "Istoric", path: "/notifications" },
    { label: "Profil", path: "/profile" },
  ],
  CANDIDAT: [
    { label: "Panou principal", path: "/dashboard" },
    { label: "Joburi", path: "/jobs" },
    { label: "Aplicarile mele", path: "/my-applications" },
    { label: "Interviurile mele", path: "/interviews" },
    { label: "CV-urile mele", path: "/my-cvs" },
    { label: "Notificari", path: "/notifications" },
    { label: "Profil", path: "/profile" },
  ],
  RECRUTOR: [
    { label: "Panou principal", path: "/dashboard" },
    { label: "Joburile mele", path: "/jobs" },
    { label: "Aplicari", path: "/applications" },
    { label: "Interviuri", path: "/interviews" },
    { label: "Clasamente", path: "/rankings" },
    { label: "Statistici", path: "/statistics" },
    { label: "Notificari", path: "/notifications" },
    { label: "Profil", path: "/profile" },
  ],
  MANAGER: [
    { label: "Panou principal", path: "/dashboard" },
    { label: "Joburi departament", path: "/jobs" },
    { label: "Aplicari", path: "/applications" },
    { label: "Interviuri", path: "/interviews" },
    { label: "Clasamente", path: "/rankings" },
    { label: "Statistici", path: "/statistics" },
    { label: "Notificari", path: "/notifications" },
    { label: "Profil", path: "/profile" },
  ],
};

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [companyName, setCompanyName] = useState("");

  const navItems = navItemsByRole[user?.rol] || [];
  const displayName =
    user?.nume && user?.prenume
      ? `${user.prenume} ${user.nume}`
      : user?.email;

  const loadUnreadNotifications = useCallback(async () => {
    if (!user || user.rol === "ADMIN") {
      setUnreadNotifications(0);
      return;
    }

    try {
      const notifications = await getMyNotifications();
      const unreadCount = notifications.filter(
        (notification) => !notification.citit
      ).length;

      setUnreadNotifications(unreadCount);
    } catch {
      setUnreadNotifications(0);
    }
  }, [user]);

  useEffect(() => {
    loadUnreadNotifications();
  }, [loadUnreadNotifications, location.pathname]);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user) {
        setCompanyName("");
        return;
      }

      try {
        const company = await getCompany();
        setCompanyName(company?.nume_companie || "");
      } catch {
        setCompanyName("");
      }
    };

    loadCompany();
  }, [user]);

  useEffect(() => {
    const handleNotificationsUpdated = () => {
      loadUnreadNotifications();
    };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );
    window.addEventListener("focus", handleNotificationsUpdated);

    const intervalId = window.setInterval(handleNotificationsUpdated, 30000);

    return () => {
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
      window.removeEventListener("focus", handleNotificationsUpdated);
      window.clearInterval(intervalId);
    };
  }, [loadUnreadNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <Link className="brand" to="/dashboard">
            <img src={smartHireSidebarLogo} alt="SmartHire" />
          </Link>

          {companyName && (
            <span className="company-name">{companyName}</span>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>{item.label}</span>
              {item.path === "/notifications" && unreadNotifications > 0 && (
                <span className="nav-badge">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <strong>{displayName}</strong>
            <span>{user?.rol}</span>
          </div>

          <button type="button" onClick={handleLogout}>
            Deconectare
          </button>
        </header>

        <main className="content">{children}</main>
      </div>

      {user?.rol === "CANDIDAT" && <CandidateAssistantWidget />}
    </div>
  );
}

export default AppLayout;
