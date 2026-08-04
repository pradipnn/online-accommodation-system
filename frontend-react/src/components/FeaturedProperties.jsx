import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PropertyCard from "./PropertyCard";
import AiPropertySearch from "./AiPropertySearch";
import { propertyApi, wishlistApi } from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

function FeaturedProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiActive, setAiActive] = useState(false);

  const loadProperties = async () => {
    setLoading(true);
    setAiActive(false);
    try {
      const response = await propertyApi.search();

      const rawData = response?.data;
      const propertyList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.content)
        ? rawData.content
        : Array.isArray(rawData?.properties)
        ? rawData.properties
        : [];

      let wishlistedIds = new Set();

      if (localStorage.getItem("token")) {
        try {
          const wishRes = await wishlistApi.list();
          const wishItems = Array.isArray(wishRes.data)
            ? wishRes.data
            : Array.isArray(wishRes.data?.content)
            ? wishRes.data.content
            : [];
          wishlistedIds = new Set(
            wishItems.map((item) => Number(item.propertyId))
          );
        } catch (e) {
          // Ignore error if token is expired or wishlist fails
        }
      }

      setProperties(
        propertyList.slice(0, 6).map((item) => ({
          ...item,
          isWishlisted: wishlistedIds.has(Number(item.id)),
          name: item.title,
          type: item.propertyType,
          location: `${item.city}, ${item.state}`,
          price: item.monthlyRent,
          image: item.imageUrls?.[0] || fallbackImage,
          rating: "New",
          reviews: 0,
          amenities: item.amenities || [],
        }))
      );
    } catch (err) {
      toast.error("Could not load properties from backend.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleAiResults = (filteredProperties) => {
    setAiActive(true);
    setProperties(filteredProperties);
  };

  const handleClearAi = () => {
    loadProperties();
  };

  return (
    <section className="section-space" id="properties">
      <div className="container">
        {/* AI Property Search Assistant Card */}
        <AiPropertySearch
          onPropertiesFound={handleAiResults}
          onClear={handleClearAi}
        />

        <div className="section-heading-row mt-4">
          <div>
            <span className="section-label">
              {aiActive ? "AI Search Results" : "Recommended Stays"}
            </span>
            <h2 className="section-title">
              {aiActive ? "Matching Properties" : "Featured Properties"}
            </h2>
            <p className="section-subtitle">
              {aiActive
                ? "Properties filtered directly from database based on your AI requirements."
                : "Real verified properties loaded dynamically from our platform."}
            </p>
          </div>
          <button
            className="btn view-all-button"
            type="button"
            onClick={() => navigate("/properties")}
          >
            View all<FaArrowRight className="ms-2" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4 border border-dashed my-3">
            <h5 className="fw-bold text-dark mb-1">No matching properties found.</h5>
            <p className="text-muted small mb-0">
              Try changing your location, budget, property type, or amenities.
            </p>
          </div>
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

export default FeaturedProperties;
