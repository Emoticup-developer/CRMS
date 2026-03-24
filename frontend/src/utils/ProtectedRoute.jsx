import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
  const token = Cookies.get("access_token");

  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ from: location }} />;
};

export default ProtectedRoute;
