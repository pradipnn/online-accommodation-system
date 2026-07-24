import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { bookingApi, propertyApi } from "../services/api";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({
    moveInDate: "",
    moveOutDate: "",
    occupants: 1,
    message: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyApi
      .getById(id)
      .then(({ data }) => setProperty(data))
      .catch(() => toast.error("Property not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const book = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      toast.info("Please login to book this property.");
      navigate("/login");
      return;
    }
    try {
      await bookingApi.create({
        propertyId: Number(id),
        ...form,
        occupants: Number(form.occupants),
        moveOutDate: form.moveOutDate || null,
      });
      toast.success("Booking request created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed.");
    }
  };

  if (loading)
    return (
      <div className="container section-space">
        <p>Loading property...</p>
      </div>
    );
  if (!property) return null;
  const image =
    property.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="section-space">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-7">
            <img
              src={image}
              alt={property.title}
              className="img-fluid rounded-4 w-100"
            />
            <h1 className="mt-4">{property.title}</h1>
            <p>
              {property.addressLine}, {property.city}, {property.state} -{" "}
              {property.pincode}
            </p>
            <p>{property.description}</p>
            <h3>
              ₹{Number(property.monthlyRent).toLocaleString("en-IN")} / month
            </h3>
            <p>
              Capacity: {property.capacity} | Type: {property.propertyType}
            </p>
            <div>
              {(property.amenities || []).map((a) => (
                <span className="badge text-bg-light me-2" key={a}>
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="auth-card">
              <h2>Book this property</h2>
              <form onSubmit={book}>
                <div className="auth-field">
                  <label>Move-in date</label>
                  <input
                    type="date"
                    className="form-control premium-form-control"
                    required
                    value={form.moveInDate}
                    onChange={(e) =>
                      setForm({ ...form, moveInDate: e.target.value })
                    }
                  />
                </div>
                <div className="auth-field">
                  <label>Move-out date</label>
                  <input
                    type="date"
                    className="form-control premium-form-control"
                    value={form.moveOutDate}
                    onChange={(e) =>
                      setForm({ ...form, moveOutDate: e.target.value })
                    }
                  />
                </div>
                <div className="auth-field">
                  <label>Occupants</label>
                  <input
                    type="number"
                    min="1"
                    max={property.capacity}
                    className="form-control premium-form-control"
                    required
                    value={form.occupants}
                    onChange={(e) =>
                      setForm({ ...form, occupants: e.target.value })
                    }
                  />
                </div>
                <div className="auth-field">
                  <label>Message</label>
                  <textarea
                    className="form-control premium-form-control"
                    rows="4"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>
                <button className="btn auth-submit-button mt-3" type="submit">
                  Send booking request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default PropertyDetails;
