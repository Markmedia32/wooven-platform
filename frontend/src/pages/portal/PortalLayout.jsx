import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarPlus,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { fetchNotifications } from "../../lib/api";
import PortalSupportWidget from "./PortalSupportWidget";

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const displayName = useMemo(() => {
    const first = user?.first_name || user?.firstName || "";
    const last = user?.last_name || user?.lastName || "";
    return `${first} ${last}`.trim() || user?.email || "Client";
  }, [user]);

  useEffect(() => {
    const loadNotifications = () =>
      fetchNotifications()
        .then((data) => setNotifications(data.notifications || []))
        .catch(() => setNotifications([]));

    loadNotifications();

    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout?.();
    navigate("/portal/login");
  };

  const openSupport = () => {
    setMobileOpen(false);
    document.querySelector(".portal-chat__launcher")?.click();
  };

  const openTrip = () => {
    setNotificationsOpen(false);
    navigate("/portal/bookings");
  };

  return (
    <div className="portal-shell">
      <header className="portal-mobilebar">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <strong>WOOVEN</strong>

        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          aria-label="View notifications"
        >
          <Bell size={20} />
          {notifications.length > 0 && <i>{notifications.length}</i>}
        </button>
      </header>

      <aside className={`portal-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="portal-sidebar__close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <div className="portal-sidebar__brand">
          <span>WOOVEN</span>
          <small>Client Portal</small>
        </div>

        <nav className="portal-sidebar__nav">
          <NavLink
            to="/portal/dashboard"
            onClick={() => setMobileOpen(false)}
            className="portal-sidebar__link"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/portal/book"
            onClick={() => setMobileOpen(false)}
            className="portal-sidebar__link"
          >
            <CalendarPlus size={18} />
            New booking
          </NavLink>

          <NavLink
            to="/portal/bookings"
            onClick={() => setMobileOpen(false)}
            className="portal-sidebar__link"
          >
            <History size={18} />
            My trips
          </NavLink>

          <button
            type="button"
            className="portal-sidebar__link"
            onClick={openSupport}
          >
            <MessageCircle size={18} />
            Support
          </button>
        </nav>

        <div className="portal-sidebar__footer">
          <div className="portal-sidebar__user">
            <User size={16} />
            <span>{displayName}</span>
          </div>

          <button
            type="button"
            className="portal-sidebar__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="portal-menu-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="portal-main">
        <div className="portal-top-actions">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={18} />
            Notifications
            {notifications.length > 0 && <b>{notifications.length}</b>}
          </button>
        </div>

        <Outlet />
      </main>

      {notificationsOpen && (
        <div className="portal-notification-overlay">
          <button
            type="button"
            className="portal-notification-overlay__backdrop"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close notifications"
          />

          <section className="portal-notification-panel">
            <header>
              <div>
                <span>WOOVEN CLIENT PORTAL</span>
                <h2>Notifications</h2>
              </div>

              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                aria-label="Close notifications"
              >
                <X size={19} />
              </button>
            </header>

            <div className="portal-notification-panel__list">
              {notifications.length ? (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={openTrip}
                    className={`portal-notification-card portal-notification-card--${item.type}`}
                  >
                    <span className="portal-notification-card__marker" />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <small>View trip details</small>
                    </div>
                  </button>
                ))
              ) : (
                <div className="portal-notification-panel__empty">
                  <Bell size={24} />
                  <h3>You are all caught up.</h3>
                  <p>Trip reminders and booking updates will appear here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <PortalSupportWidget />
    </div>
  );
}