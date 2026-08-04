import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMagic } from "react-icons/fa";
import { propertyApi, aiApi, errorMessage } from "../services/api";

const PREDEFINED_AMENITIES = [
  "WiFi",
  "Parking",
  "Laundry",
  "Food",
  "AC",
  "CCTV",
  "Power Backup",
  "Hot Water",
  "Attached Bathroom",
  "Security",
  "Housekeeping",
  "Gym",
];

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
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    if (id) {
      propertyApi
        .getById(id)
        .then((r) => {
          setForm({
            ...r.data,
            amenities: Array.isArray(r.data.amenities) ? r.data.amenities : [],
            imageUrls: Array.isArray(r.data.imageUrls) ? r.data.imageUrls : [],
          });
        })
        .catch(() => toast.error("Property not found"));
    }
  }, [id]);

  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const handlePropertyTypeChange = (e) => {
    const newType = e.target.value;
    setForm((prev) => ({
      ...prev,
      propertyType: newType,
    }));
  };

  const handleAmenityToggle = (amenityName) => {
    const currentAmenities = form.amenities || [];
    let updatedAmenities;
    if (currentAmenities.includes(amenityName)) {
      updatedAmenities = currentAmenities.filter((item) => item !== amenityName);
    } else {
      updatedAmenities = [...currentAmenities, amenityName];
    }
    setForm({ ...form, amenities: updatedAmenities });
  };

  const addImage = () => {
    if (!image.trim()) return;
    setForm({ ...form, imageUrls: [...(form.imageUrls || []), image.trim()] });
    setImage("");
  };

  const removeImage = (index) => {
    setForm({
      ...form,
      imageUrls: (form.imageUrls || []).filter((_, i) => i !== index),
    });
  };

  const generateAiDescription = async () => {
    if (!form.title || !form.title.trim()) {
      toast.error("Please enter a property title first.");
      return;
    }

    if (!form.city || !form.city.trim()) {
      toast.error("Please enter a city first.");
      return;
    }

    setGeneratingAi(true);
    try {
      const payload = {
        title: form.title.trim(),
        propertyType: form.propertyType,
        addressLine: form.addressLine?.trim() || "",
        city: form.city.trim(),
        state: form.state?.trim() || "Maharashtra",
        pincode: form.pincode?.trim() || "",
        monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : 0,
        capacity: form.capacity ? Number(form.capacity) : 1,
        available: Boolean(form.available),
        amenities: Array.isArray(form.amenities) ? form.amenities : [],
        imageUrls: Array.isArray(form.imageUrls) ? form.imageUrls : [],
      };

      const res = await aiApi.generatePropertyDescription(payload);
      
      const generatedText =
        typeof res.data === "string"
          ? res.data
          : res.data?.description || res.data?.text || "";

      if (generatedText) {
        setForm((prev) => ({
          ...prev,
          description: String(generatedText).trim(),
        }));
        toast.success("AI description generated successfully!");
      } else {
        toast.error("AI service returned empty description. Please try again.");
      }
    } catch (err) {
      toast.error(
        errorMessage(
          err,
          "Could not generate AI description. Make sure Python service (port 8000) and Gateway (port 8081) are running."
        )
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        capacity: Number(form.capacity),
        amenities: Array.from(new Set(form.amenities || [])),
      };
      if (id) await propertyApi.update(id, payload);
      else await propertyApi.create(payload);
      toast.success(id ? "Property updated successfully" : "Property listed successfully");
      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to save property");
    } finally {
      setLoading(false);
    }
  };

  const isHostelOrPg = form.propertyType === "HOSTEL" || form.propertyType === "PG";
  const isHotel = form.propertyType === "HOTEL";
  const isApartment = form.propertyType === "APARTMENT";

  const rentLabel = isHostelOrPg
    ? "Monthly Rent per Bed (₹)"
    : isHotel
    ? "Price per Room / Night (₹)"
    : isApartment
    ? "Monthly Rent for Apartment (₹)"
    : "Monthly Rent (₹)";

  const capacityLabel = isHostelOrPg
    ? "Total Beds Capacity"
    : isHotel
    ? "Max Room Guest Capacity"
    : isApartment
    ? "Apartment Occupancy Capacity"
    : "Capacity";

  return (
    <section className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="section-label">Owner workspace</span>
          <h1>{id ? "Edit property" : "List a new property"}</h1>
          <p>Fill in property details below to manage your accommodation listing.</p>
        </div>
        <form className="premium-panel" onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Property Title</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={change}
                placeholder="e.g. Sunshine Accommodation"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold text-primary">Property Type</label>
              <select
                className="form-select border-primary"
                name="propertyType"
                value={form.propertyType}
                onChange={handlePropertyTypeChange}
              >
                <option value="HOSTEL">HOSTEL</option>
                <option value="PG">PG</option>
                <option value="HOTEL">HOTEL</option>
                <option value="APARTMENT">APARTMENT</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input
                className="form-control"
                name="addressLine"
                value={form.addressLine}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input
                className="form-control"
                name="city"
                value={form.city}
                onChange={change}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input
                className="form-control"
                name="state"
                value={form.state}
                onChange={change}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Pincode</label>
              <input
                className="form-control"
                name="pincode"
                value={form.pincode}
                onChange={change}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">{rentLabel}</label>
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
              <label className="form-label fw-semibold">{capacityLabel}</label>
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

            <div className="col-12 mt-4">
              <label className="form-label fw-bold d-block">Amenities (Check all that apply)</label>
              <div className="row g-3 bg-light p-3 rounded border">
                {PREDEFINED_AMENITIES.map((amenityName) => {
                  const isChecked = (form.amenities || []).includes(amenityName);
                  return (
                    <div className="col-6 col-sm-4 col-md-3" key={amenityName}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`amenity-${amenityName}`}
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenityName)}
                        />
                        <label className="form-check-label ms-1" htmlFor={`amenity-${amenityName}`}>
                          {amenityName}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

             <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0 fw-semibold">Description</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                  onClick={generateAiDescription}
                  disabled={generatingAi}
                >
                  <FaMagic />
                  {generatingAi ? "Generating..." : "Generate AI Description"}
                </button>
              </div>
              <textarea
                className="form-control"
                rows="4"
                name="description"
                value={form.description}
                onChange={change}
                placeholder="Detailed description of the property..."
                required
              />
              <small className="text-muted d-block mt-1">
                Review and edit the generated description before saving your property.
              </small>
            </div>

            <div className="col-12 mt-4">
              <label className="form-label">Image URLs</label>
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
                  onClick={addImage}
                >
                  Add Image
                </button>
              </div>
              <div className="image-url-list mt-2 d-flex flex-wrap gap-2">
                {form.imageUrls?.map((x, i) => (
                  <div key={i} className="position-relative">
                    <img src={x} alt="property" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 px-1"
                      onClick={() => removeImage(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 form-check ms-2 mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="available"
                id="availableCheck"
                checked={form.available}
                onChange={change}
              />
              <label className="form-check-label" htmlFor="availableCheck">
                Available for booking
              </label>
            </div>
          </div>

          <button className="btn primary-action mt-4" disabled={loading}>
            {loading
              ? "Saving..."
              : id
                ? "Update Property"
                : "Publish Property"}
          </button>
        </form>
      </div>
    </section>
  );
}
