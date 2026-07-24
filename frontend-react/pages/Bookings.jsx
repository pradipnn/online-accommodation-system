import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bookingApi, errorMessage } from "../services/api";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";

export default function Bookings() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const owner = user?.role === "OWNER";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await (owner ? bookingApi.owner() : bookingApi.mine());
      setItems(data);
    } catch (e) {
      toast.error(errorMessage(e, "Could not load bookings"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const change = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  if (loading) return <PageLoader text="Loading bookings..." />;
  return (
    <section className="portal-page">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Bookings</span>
          <h1>{owner ? "Booking requests" : "My bookings"}</h1>
        </div>
        {!items.length ? (
          <EmptyState
            title="No bookings yet"
            text="Bookings will appear here."
          />
        ) : (
          <div className="row g-4">
            {items.map((b) => (
              <div className="col-lg-6" key={b.id}>
                <article className="module-card">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>{b.propertyTitle}</h4>
                      <p className="muted">
                        #{b.id} · {b.roomNumber || "Room pending"}{" "}
                        {b.bedNumber ? `· Bed ${b.bedNumber}` : ""}
                      </p>
                    </div>
                    <span
                      className={`status-pill ${String(b.status).toLowerCase()}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="detail-grid">
                    <span>
                      Move in<strong>{b.moveInDate}</strong>
                    </span>
                    <span>
                      Occupants<strong>{b.occupants}</strong>
                    </span>
                    <span>
                      Amount
                      <strong>
                        ₹{Number(b.totalAmount || 0).toLocaleString()}
                      </strong>
                    </span>
                    <span>
                      Payment<strong>{b.paymentStatus}</strong>
                    </span>
                  </div>
                  {owner && b.status === "PENDING" && (
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className="btn btn-success"
                        onClick={() => change(b.id, "CONFIRMED")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => change(b.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {!owner && ["PENDING", "CONFIRMED"].includes(b.status) && (
                    <button
                      className="btn btn-outline-danger mt-3"
                      onClick={() => change(b.id, "CANCELLED")}
                    >
                      Cancel booking
                    </button>
                  )}
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
