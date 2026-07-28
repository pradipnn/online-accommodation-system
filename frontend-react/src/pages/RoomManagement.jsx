import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { roomApi, errorMessage } from "../services/api";
import PageLoader from "../components/PageLoader";
import EmptyState from "../components/EmptyState";
const blank = {
  roomNumber: "",
  roomType: "SINGLE",
  monthlyRent: "",
  floorNumber: 0,
  bedCount: 1,
};
export default function RoomManagement() {
  const { propertyId } = useParams();
  const [rooms, setRooms] = useState([]),
    [form, setForm] = useState(blank),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      setRooms((await roomApi.list(propertyId)).data);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [propertyId]);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await roomApi.create(propertyId, {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        floorNumber: Number(form.floorNumber),
        bedCount: Number(form.bedCount),
      });
      toast.success("Room added");
      setForm(blank);
      load();
    } catch (e2) {
      toast.error(errorMessage(e2));
    }
  };
  const del = async (id) => {
    if (!confirm("Delete this room?")) return;
    try {
      await roomApi.remove(id);
      toast.success("Room deleted");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  const addBed = async (id) => {
    const bedNumber = prompt("Bed number");
    if (!bedNumber) return;
    try {
      await roomApi.addBed(id, { bedNumber, status: "AVAILABLE" });
      toast.success("Bed added");
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };
  if (loading) return <PageLoader />;
  return (
    <section className="portal-page">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Inventory</span>
          <h1>Room & Bed Management</h1>
        </div>
        <div className="row g-4">
          <div className="col-lg-4">
            <form className="module-card sticky-card" onSubmit={submit}>
              <h4>Add room</h4>
              {[
                ["roomNumber", "Room number"],
                ["monthlyRent", "Monthly rent"],
                ["floorNumber", "Floor number"],
                ["bedCount", "Bed count"],
              ].map(([n, l]) => (
                <div className="mb-3" key={n}>
                  <label className="form-label">{l}</label>
                  <input
                    className="form-control"
                    name={n}
                    value={form[n]}
                    onChange={(e) => setForm({ ...form, [n]: e.target.value })}
                    required={n !== "floorNumber"}
                  />
                </div>
              ))}
              <div className="mb-3">
                <label className="form-label">Room type</label>
                <select
                  className="form-select"
                  value={form.roomType}
                  onChange={(e) =>
                    setForm({ ...form, roomType: e.target.value })
                  }
                >
                  <option>SINGLE</option>
                  <option>DOUBLE</option>
                  <option>TRIPLE</option>
                  <option>FOUR_SHARING</option>
                  <option>FIVE_SHARING</option>
                  <option>SIX_SHARING</option>
                  <option>DORMITORY</option>
                </select>
              </div>
              <button className="btn primary-action w-100">Add room</button>
            </form>
          </div>
          <div className="col-lg-8">
            {!rooms.length ? (
              <EmptyState title="No rooms added" />
            ) : (
              rooms.map((r) => (
                <article className="module-card mb-3" key={r.id}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h4>Room {r.roomNumber}</h4>
                      <p className="muted">
                        {r.roomType} · Floor {r.floorNumber} · ₹{r.monthlyRent}
                        /month
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => addBed(r.id)}
                      >
                        Add bed
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => del(r.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="bed-list">
                    {(r.beds || []).map((b) => (
                      <span
                        key={b.id}
                        className={`bed-chip ${String(b.status).toLowerCase()}`}
                      >
                        Bed {b.bedNumber} · {b.status}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
