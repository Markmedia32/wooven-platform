import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const adminRoles = [
  "admin",
  "super_admin",
  "operations_manager",
  "support_agent",
];

export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="admin-loading">Loading Wooven Admin…</div>;

  if (!user || !adminRoles.includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}