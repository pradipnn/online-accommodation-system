import { Navigate, useLocation } from "react-router-dom";
export default function ProtectedRoute({ children, roles }) {
  const loc = useLocation();
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}
