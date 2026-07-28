import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { dashboardApi, propertyApi, errorMessage } from "../services/api";
import { toast } from "react-toastify";
import PageLoader from "../components/PageLoader";
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);
export default function OwnerDashboard() {
  const [data, setData] = useState(null),
    [properties, setProperties] = useState([]),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([dashboardApi.owner(), propertyApi.getMine()])
      .then(([d, p]) => {
        setData(d.data);
        setProperties(p.data);
      })
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <PageLoader text="Loading owner dashboard..." />;
  const months = data?.monthlyBookings || [];
  return (
    <section className="portal-page dashboard-bg">
      <div className="container">
        <div className="page-heading d-flex justify-content-between align-items-end">
          <div>
            <span className="section-label">Owner workspace</span>
            <h1>Dashboard overview</h1>
          </div>
          <Link to="/properties/new" className="btn primary-action">
            + Add property
          </Link>
        </div>
        <div className="stats-grid">
          {[
            ["Properties", data?.totalProperties],
            ["Bookings", data?.totalBookings],
            ["Pending", data?.pendingBookings],
            ["Revenue", `₹${Number(data?.revenue || 0).toLocaleString()}`],
            [
              "Occupancy",
              `${Number(data?.occupancyPercentage || 0).toFixed(1)}%`,
            ],
          ].map(([l, v]) => (
            <div className="stat-card" key={l}>
              <span>{l}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="row g-4 mt-1">
          <div className="col-lg-8">
            <div className="module-card chart-card">
              <h4>Monthly bookings</h4>
              <Bar
                data={{
                  labels: months.map((x) => x.month || x.label),
                  datasets: [
                    {
                      label: "Bookings",
                      data: months.map((x) => x.count || x.value || 0),
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="module-card chart-card">
              <h4>Booking status</h4>
              <Doughnut
                data={{
                  labels: ["Confirmed", "Pending"],
                  datasets: [
                    {
                      data: [
                        data?.confirmedBookings || 0,
                        data?.pendingBookings || 0,
                      ],
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
        <div className="module-card mt-4">
          <div className="d-flex justify-content-between">
            <h4>My properties</h4>
            <Link to="/bookings">Manage bookings</Link>
          </div>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Rent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.city}</td>
                    <td>
                      <span className="status-pill">{p.approvalStatus}</span>
                    </td>
                    <td>₹{p.monthlyRent}</td>
                    <td>
                      <Link
                        to={`/properties/${p.id}/rooms`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Rooms
                      </Link>{" "}
                      <Link
                        to={`/properties/${p.id}/edit`}
                        className="btn btn-sm btn-outline-dark"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
