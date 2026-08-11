import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CarFront,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Headphones,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Network,
  Users,
  UserRoundCog,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/Logo.png";
import "../../styles/global.css";

const navigation = [
  { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Bookings", to: "/admin/bookings", icon: CalendarDays },
  { label: "Support inbox", to: "/admin/support", icon: Headphones },
  { label: "Dispatch", to: "/admin/dispatch", icon: MapPinned },
  { label: "Drivers", to: "/admin/drivers", icon: UserRoundCog },
  { label: "Vehicles", to: "/admin/vehicles", icon: CarFront },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "Partners", to: "/admin/partners", icon: Network },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Reports", to: "/admin/reports", icon: ClipboardList },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function leavePortal() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <button className="admin-sidebar__close" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>

        <img className="admin-sidebar__logo" src={logo} alt="Wooven Kenya" />
        <p className="admin-sidebar__label">OPERATIONS CONSOLE</p>

        <nav>
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? "is-active" : ""}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__profile">
          <div>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          <span>
            <strong>{user?.firstName} {user?.lastName}</strong>
            <small>{user?.role?.replaceAll("_", " ")}</small>
          </span>
          <button onClick={leavePortal} title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="admin-topbar__menu" onClick={() => setMobileOpen(true)}>
            <Menu size={21} />
          </button>
          <div>
            <span>WOOVEN KENYA</span>
            <strong>Operations Centre</strong>
          </div>
          <div className="admin-topbar__actions">
            <button aria-label="Notifications"><Bell size={19} /><i /></button>
            <button className="admin-topbar__user">
              {user?.firstName} <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}