import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="portal-loading-screen">
        <div className="portal-loading-screen__mark">WOOVEN</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;