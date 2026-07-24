import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUserCircle,
  FaHeart,
  FaCalendarCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";
export default function Navbar() {
  const nav = useNavigate();
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };
  const [user, setUser] = useState(read);
  useEffect(() => {
    const sync = () => setUser(read());
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    nav("/");
  };
  const cls = ({ isActive }) =>
    `nav-link custom-nav-link ${isActive ? "active-link" : ""}`;
  return (
    <nav className="navbar navbar-expand-lg premium-navbar sticky-top">
      <div className="container">
        <NavLink className="navbar-brand brand-logo" to="/">
          <span className="brand-icon">
            <FaBuilding />
          </span>
          <span>
            Stay<span className="brand-highlight">Nest</span>
          </span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav mx-auto">
            <li>
              <NavLink className={cls} to="/">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink className={cls} to="/properties">
                Properties
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink className={cls} to="/bookings">
                  <FaCalendarCheck /> Bookings
                </NavLink>
              </li>
            )}
            {user && user.role !== "ADMIN" && (
              <li>
                <NavLink className={cls} to="/wishlist">
                  <FaHeart /> Wishlist
                </NavLink>
              </li>
            )}
            {user?.role === "OWNER" && (
              <li>
                <NavLink className={cls} to="/owner">
                  Owner Dashboard
                </NavLink>
              </li>
            )}
            {user?.role === "ADMIN" && (
              <li>
                <NavLink className={cls} to="/admin">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          <div className="d-flex gap-2 align-items-center">
            {user ? (
              <>
                <NavLink className="user-chip" to="/profile">
                  <FaUserCircle /> {user.fullName}
                </NavLink>
                <button className="btn login-button" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="btn login-button" to="/login">
                  User Login
                </NavLink>
                <NavLink className="btn admin-nav-button" to="/admin-login">
                  Admin Login
                </NavLink>
                <NavLink className="btn register-button" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
