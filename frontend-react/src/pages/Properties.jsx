import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PropertyCard from "../components/PropertyCard";
import { propertyApi } from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

const mapProperty = (item) => ({
  ...item,
  name: item.title,
  type: item.propertyType,
  location: `${item.city}, ${item.state}`,
  price: Number(item.monthlyRent || 0),
  image: item.imageUrls?.[0] || fallbackImage,
  rating: "New",
  reviews: 0,
  amenities: item.amenities || [],
});

function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    minRent: searchParams.get("minRent") || "",
    maxRent: searchParams.get("maxRent") || "",
    minCapacity: searchParams.get("minCapacity") || "",
    moveIn: searchParams.get("moveIn") || "",
    moveOut: searchParams.get("moveOut") || "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          [...searchParams.entries()].filter(([, value]) => value),
        );
        const { data } = await propertyApi.search(params);
        setProperties(data.map(mapProperty));
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Could not load properties.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const submit = (event) => {
    event.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );
    setSearchParams(clean);
  };

  return (
    <section className="section-space">
      <div className="container">
        <div className="mb-4">
          <span className="section-label">Live search</span>
          <h1 className="section-title">Available properties</h1>
          {/* <p className="section-subtitle">Results are loaded directly from the Spring Boot REST API.</p> */}
        </div>
        <form className="row g-3 mb-4" onSubmit={submit}>
          <div className="col-md-3">
            <input
              className="form-control premium-form-control"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select premium-form-control"
              value={filters.propertyType}
              onChange={(e) =>
                setFilters({ ...filters, propertyType: e.target.value })
              }
            >
              <option value="">All types</option>
              <option>HOSTEL</option>
              <option>FLAT</option>
              <option>PG</option>
              <option>ROOM</option>
              <option>APARTMENT</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control premium-form-control"
              placeholder="Max rent"
              value={filters.maxRent}
              onChange={(e) =>
                setFilters({ ...filters, maxRent: e.target.value })
              }
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              min="1"
              className="form-control premium-form-control"
              placeholder="Guests"
              value={filters.minCapacity}
              onChange={(e) =>
                setFilters({ ...filters, minCapacity: e.target.value })
              }
            />
          </div>
          <div className="col-md-3">
            <button className="btn search-button w-100" type="submit">
              Search Property
            </button>
          </div>
        </form>
        {loading ? (
          <p>Loading...</p>
        ) : properties.length === 0 ? (
          <p>No matching properties found.</p>
        ) : (
          <div className="row g-4">
            {properties.map((property) => (
              <div className="col-md-6 col-xl-4" key={property.id}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
export default Properties;
