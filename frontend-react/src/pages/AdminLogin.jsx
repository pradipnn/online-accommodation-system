import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { authApi } from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "admin@portal.com",
    password: "admin123",
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      if (data.role !== "ADMIN") {
        throw {
          response: {
            data: { message: "This account does not have admin access." },
          },
        };
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Admin login successful");
      navigate("/admin");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid admin credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authentication-page">
      <div className="container">
        <div className="auth-card admin-login-card">
          <div className="auth-header">
            <span className="admin-login-icon">
              <FaShieldAlt />
            </span>
            <span className="section-label">Secure access</span>
            <h1>Admin Login</h1>
            <p>Manage users, owner verification and property approvals.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="admin-email">Admin email</label>
              <div className="auth-input-wrapper">
                <FaEnvelope />
                <input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="admin-password">Password</label>
              <div className="auth-input-wrapper">
                <FaLock />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button className="btn auth-submit-button" disabled={loading}>
              {loading ? "Signing in..." : "Login as Admin"}
            </button>
            {/* <div className="demo-credentials"><strong>Demo:</strong> admin@portal.com / admin123</div> */}
            <p className="auth-switch">
              <NavLink to="/login">Back to user login</NavLink>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
