import { Navigate } from "react-router-dom";
export default function Dashboard() {
  let u = null;
  try {
    u = JSON.parse(localStorage.getItem("user"));
  } catch {}
  if (u?.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (u?.role === "OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/bookings" replace />;
}
