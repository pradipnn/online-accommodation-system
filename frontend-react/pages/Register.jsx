import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "STUDENT",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) =>
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  const handleRegister = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const { data } = await authApi.register(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Registration successful.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="authentication-page">
      <div className="container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <span className="section-label">Create account</span>
            <h1>Join StayNest</h1>
            <p>Create your account to search and book accommodation.</p>
          </div>
          <form onSubmit={handleRegister}>
            <div className="row g-3">
              <div className="col-md-6 auth-field">
                <label>Full name</label>
                <input
                  name="fullName"
                  className="form-control premium-form-control"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 auth-field">
                <label>Mobile number</label>
                <input
                  name="phone"
                  className="form-control premium-form-control"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 auth-field">
                <label>Email address</label>
                <input
                  name="email"
                  className="form-control premium-form-control"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 auth-field">
                <label>Account type</label>
                <select
                  name="role"
                  className="form-select premium-form-control"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="OWNER">Property Owner</option>
                  <option value="ORGANIZATION">Organization</option>
                </select>
              </div>
              <div className="col-md-6 auth-field">
                <label>Password</label>
                <input
                  name="password"
                  className="form-control premium-form-control"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
              <div className="col-md-6 auth-field">
                <label>Confirm password</label>
                <input
                  name="confirmPassword"
                  className="form-control premium-form-control"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button
              className="btn auth-submit-button mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="auth-switch">
              Already have an account?<NavLink to="/login"> Login</NavLink>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
export default Register;
