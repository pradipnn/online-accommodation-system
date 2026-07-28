import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { authApi } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      if (data.role === "ADMIN") {
        throw {
          response: {
            data: { message: "Please use the separate Admin Login page." },
          },
        };
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("auth-changed"));
      toast.success(`Welcome, ${data.fullName}`);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authentication-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="section-label">Welcome back</span>
            <h1>Login to StayNest</h1>
            <p>Access your bookings, profile and saved properties.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrapper">
                <FaEnvelope />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <FaLock />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              className="btn auth-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {/* <div className="demo-credentials"><strong>User demo:</strong> student@portal.com / user123</div> */}
            <p className="auth-switch">
              Do not have an account?<NavLink to="/register"> Register</NavLink>
            </p>
            <p className="auth-switch">
              <NavLink to="/admin-login">Admin Login</NavLink>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
export default Login;
