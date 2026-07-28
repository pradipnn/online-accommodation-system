import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { userApi, errorMessage } from "../services/api";
import PageLoader from "../components/PageLoader";
export default function Profile() {
  const [form, setForm] = useState({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      profileImageUrl: "",
    }),
    [password, setPassword] = useState({
      currentPassword: "",
      newPassword: "",
    }),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    userApi
      .me()
      .then((r) => setForm({ ...form, ...r.data }))
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await userApi.update(form);
      const cached = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cached, ...data }));
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Profile updated");
    } catch (e2) {
      toast.error(errorMessage(e2));
    }
  };
  const change = async (e) => {
    e.preventDefault();
    try {
      await userApi.changePassword(password);
      setPassword({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (e2) {
      toast.error(errorMessage(e2));
    }
  };
  if (loading) return <PageLoader />;
  return (
    <section className="portal-page">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Account</span>
          <h1>User Profile</h1>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <form className="module-card" onSubmit={save}>
              <h4>Personal information</h4>
              <div className="row g-3">
                {[
                  ["fullName", "Full name"],
                  ["phone", "Phone"],
                  ["city", "City"],
                  ["state", "State"],
                  ["address", "Address"],
                  ["profileImageUrl", "Profile image URL"],
                ].map(([n, l]) => (
                  <div
                    className={
                      n === "address" || n === "profileImageUrl"
                        ? "col-12"
                        : "col-md-6"
                    }
                    key={n}
                  >
                    <label className="form-label">{l}</label>
                    <input
                      className="form-control"
                      value={form[n] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [n]: e.target.value })
                      }
                      required={n === "fullName"}
                    />
                  </div>
                ))}
              </div>
              <button className="btn primary-action mt-4">Save profile</button>
            </form>
          </div>
          <div className="col-lg-4">
            <form className="module-card" onSubmit={change}>
              <h4>Change password</h4>
              <label className="form-label mt-2">Current password</label>
              <input
                type="password"
                className="form-control"
                value={password.currentPassword}
                onChange={(e) =>
                  setPassword({ ...password, currentPassword: e.target.value })
                }
                required
              />
              <label className="form-label mt-3">New password</label>
              <input
                type="password"
                minLength="6"
                className="form-control"
                value={password.newPassword}
                onChange={(e) =>
                  setPassword({ ...password, newPassword: e.target.value })
                }
                required
              />
              <button className="btn btn-dark w-100 mt-4">
                Update password
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
