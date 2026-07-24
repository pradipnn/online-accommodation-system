import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { propertyApi } from "../services/api";
const initial = {
  title: "",
  description: "",
  propertyType: "HOSTEL",
  addressLine: "",
  city: "",
  state: "Maharashtra",
  pincode: "",
  monthlyRent: "",
  capacity: 1,
  available: true,
  amenities: [],
  imageUrls: [],
};
export default function PropertyForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(initial);
  const [amenity, setAmenity] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id)
      propertyApi
        .getById(id)
        .then((r) => setForm(r.data))
        .catch(() => toast.error("Property not found"));
  }, [id]);
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  const add = (key, value, setter) => {
    if (!value.trim()) return;
    setForm({ ...form, [key]: [...(form[key] || []), value.trim()] });
    setter("");
  };
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        capacity: Number(form.capacity),
      };
      if (id) await propertyApi.update(id, payload);
      else await propertyApi.create(payload);
      toast.success(id ? "Property updated" : "Property listed successfully");
      nav("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to save property");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Owner workspace</span>
          <h1>{id ? "Edit property" : "List a new property"}</h1>
          <p>
            Add complete details so users can confidently book your
            accommodation.
          </p>
        </div>
        <form className="premium-panel" onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label>Property title</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Type</label>
              <select
                className="form-select"
                name="propertyType"
                value={form.propertyType}
                onChange={change}
              >
                <option>HOSTEL</option>
                <option>FLAT</option>
                <option>PG</option>
                <option>ROOM</option>
                <option>APARTMENT</option>
              </select>
            </div>
            <div className="col-12">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="4"
                name="description"
                value={form.description}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-6">
              <label>Address</label>
              <input
                className="form-control"
                name="addressLine"
                value={form.addressLine}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-3">
              <label>City</label>
              <input
                className="form-control"
                name="city"
                value={form.city}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-3">
              <label>State</label>
              <input
                className="form-control"
                name="state"
                value={form.state}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Pincode</label>
              <input
                className="form-control"
                name="pincode"
                value={form.pincode}
                onChange={change}
              />
            </div>
            <div className="col-md-4">
              <label>Monthly rent (₹)</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="monthlyRent"
                value={form.monthlyRent}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Capacity</label>
              <input
                className="form-control"
                type="number"
                min="1"
                name="capacity"
                value={form.capacity}
                onChange={change}
                required
              />
            </div>
            <div className="col-12">
              <label>Amenities</label>
              <div className="input-group">
                <input
                  className="form-control"
                  value={amenity}
                  onChange={(e) => setAmenity(e.target.value)}
                  placeholder="Wi-Fi, Parking, Mess..."
                />
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => add("amenities", amenity, setAmenity)}
                >
                  Add
                </button>
              </div>
              <div className="tag-list">
                {form.amenities?.map((x, i) => (
                  <button
                    type="button"
                    key={i}
                    className="tag"
                    onClick={() =>
                      setForm({
                        ...form,
                        amenities: form.amenities.filter((_, j) => j !== i),
                      })
                    }
                  >
                    {x} ×
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12">
              <label>Image URLs</label>
              <div className="input-group">
                <input
                  className="form-control"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => add("imageUrls", image, setImage)}
                >
                  Add
                </button>
              </div>
              <div className="image-url-list">
                {form.imageUrls?.map((x, i) => (
                  <div key={i}>
                    <img src={x} alt="property" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageUrls: form.imageUrls.filter((_, j) => j !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 form-check ms-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={change}
              />
              <label className="form-check-label">Available for booking</label>
            </div>
          </div>
          <button className="btn primary-action mt-4" disabled={loading}>
            {loading
              ? "Saving..."
              : id
                ? "Update property"
                : "Publish property"}
          </button>
        </form>
      </div>
    </section>
  );
}
