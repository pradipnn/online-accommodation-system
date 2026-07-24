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
            properties.map((p) => (
              <ApprovalRow
                key={p.id}
                title={p.title}
                subtitle={`${p.ownerName} · ${p.city}`}
                onApprove={() => decide("property", p.id, "APPROVED")}
                onReject={() => decide("property", p.id, "REJECTED")}
              />
            ))}
          {tab === "owners" &&
            owners.map((o) => (
              <ApprovalRow
                key={o.id}
                title={o.fullName}
                subtitle={o.email}
                onApprove={() => decide("owner", o.id, "APPROVED")}
                onReject={() => decide("owner", o.id, "REJECTED")}
              />
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.enabled === false ? "Inactive" : "Active"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={async () => {
                            await adminApi.toggleUser(u.id);
                            load();
                          }}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
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
