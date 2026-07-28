import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminApi, errorMessage } from "../services/api";
import PageLoader from "../components/PageLoader";

export default function AdminDashboard() {
  const [tab, setTab] = useState("properties"),
    [properties, setProperties] = useState([]),
    [owners, setOwners] = useState([]),
    [users, setUsers] = useState([]),
    [reports, setReports] = useState({}),
    [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.pendingProperties(),
      adminApi.pendingOwners(),
      adminApi.users(),
      adminApi.reports(),
    ])
      .then(([p, o, u, r]) => {
        setProperties(p.data);
        setOwners(o.data);
        setUsers(u.data);
        setReports(r.data);
      })
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const decide = async (type, id, decision) => {
    try {
      type === "property"
        ? await adminApi.decideProperty(id, decision)
        : await adminApi.decideOwner(id, decision);
      toast.success(`${decision} successful`);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const toggleStatus = async (user) => {
    const previousUsers = [...users];

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, enabled: !u.enabled } : u)),
    );

    try {
      await adminApi.toggleUser(user.id);
      toast.success("User status updated successfully");
    } catch (e) {
      setUsers(previousUsers);
      toast.error(errorMessage(e));
    }
  };

  if (loading) return <PageLoader text="Loading admin panel..." />;
  return (
    <section className="portal-page dashboard-bg">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Administration</span>
          <h1>Approval & Verification</h1>
        </div>
        <div className="stats-grid">
          {Object.entries(reports)
            .slice(0, 5)
            .map(([k, v]) => (
              <div className="stat-card" key={k}>
                <span>{k.replace(/([A-Z])/g, " $1")}</span>
                <strong>{String(v)}</strong>
              </div>
            ))}
        </div>
        <div className="module-card mt-4">
          <div className="admin-tabs">
            {["properties", "owners", "users"].map((t) => (
              <button
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "properties" &&
            (properties.length > 0 ? (
              properties.map((p) => (
                <ApprovalRow
                  key={p.id}
                  title={p.title}
                  subtitle={`${p.ownerName} · ${p.city}`}
                  onApprove={() => decide("property", p.id, "APPROVED")}
                  onReject={() => decide("property", p.id, "REJECTED")}
                />
              ))
            ) : (
              <div className="text-center py-1">
                <p className="text-muted">No pending properties available.</p>
              </div>
            ))}
          {tab === "owners" &&
            (owners.length > 0 ? (
              owners.map((o) => (
                <ApprovalRow
                  key={o.id}
                  title={o.fullName}
                  subtitle={o.email}
                  onApprove={() => decide("owner", o.id, "APPROVED")}
                  onReject={() => decide("owner", o.id, "REJECTED")}
                />
              ))
            ) : (
              <div className="text-center py-1">
                <p className="text-muted">No pending owners available.</p>
              </div>
            ))}
          {tab === "users" && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${
                              u.enabled ? "btn-success" : "btn-danger"
                            }`}
                            onClick={() => toggleStatus(u)}
                          >
                            {u.enabled ? "Active" : "Inactive"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No users available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function ApprovalRow({ title, subtitle, onApprove, onReject }) {
  return (
    <div className="approval-row">
      <div>
        <h5>{title}</h5>
        <p>{subtitle}</p>
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-success" onClick={onApprove}>
          Approve
        </button>
        <button className="btn btn-outline-danger" onClick={onReject}>
          Reject
        </button>
      </div>
    </div>
  );
}
