import { useState } from "react";
import { FaMagic, FaTimes, FaSearch, FaCheckCircle, FaMapMarkerAlt, FaHome, FaTag, FaWifi, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "react-toastify";
import { aiApi, propertyApi, errorMessage } from "../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

export default function AiPropertySearch({ onPropertiesFound, onClear }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(null);

  const handleAiSearch = async (e) => {
    if (e) e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Please describe the property you are looking for.");
      return;
    }

    if (trimmed.length < 3) {
      toast.error("Please enter at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send query to Node API Gateway -> Python GenAI service
      const res = await aiApi.parsePropertySearch(trimmed);
      const parsedFilters = res.data;

      setFilters(parsedFilters);

      // Step 2: Fetch real properties from Spring Boot backend using returned filters
      const searchRes = await propertyApi.search({
        city: parsedFilters.city || undefined,
        propertyType: parsedFilters.propertyType || undefined,
        minRent: parsedFilters.minRent || undefined,
        maxRent: parsedFilters.maxRent || undefined,
        minCapacity: parsedFilters.minCapacity || undefined,
        keyword: parsedFilters.keyword || undefined,
      });

      const rawList = Array.isArray(searchRes.data)
        ? searchRes.data
        : Array.isArray(searchRes.data?.content)
        ? searchRes.data.content
        : [];

      // Filter amenities in frontend if amenities array is present
      let matchedList = rawList;
      if (parsedFilters.amenities && parsedFilters.amenities.length > 0) {
        matchedList = rawList.filter((prop) => {
          const propAmenities = prop.amenities || [];
          return parsedFilters.amenities.every((a) =>
            propAmenities.map((x) => x.toLowerCase()).includes(a.toLowerCase())
          );
        });
      }

      const formatted = matchedList.map((item) => ({
        ...item,
        name: item.title,
        type: item.propertyType,
        location: `${item.city}, ${item.state}`,
        price: item.monthlyRent,
        image: item.imageUrls?.[0] || fallbackImage,
        rating: "New",
        reviews: 0,
        amenities: item.amenities || [],
      }));

      if (onPropertiesFound) {
        onPropertiesFound(formatted, parsedFilters);
      }

      if (formatted.length === 0) {
        toast.info("No matching properties found.");
      }
    } catch (err) {
      toast.error(
        errorMessage(
          err,
          "AI search is currently unavailable. You can use normal filters."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setQuery("");
    setFilters(null);
    if (onClear) onClear();
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "";
    return `₹${Number(val).toLocaleString("en-IN")}`;
  };

  const hasFilters =
    filters &&
    (filters.city ||
      filters.propertyType ||
      filters.maxRent ||
      filters.minRent ||
      filters.keyword ||
      (filters.amenities && filters.amenities.length > 0));

  return (
    <div className="ai-search-card">
      <div className="ai-card-top-accent" />
      
      <div className="ai-search-header">
        <div className="ai-search-badge">
          <FaMagic className="ai-badge-icon" />
          <span>AI PROPERTY ASSISTANT</span>
        </div>
        <h3 className="ai-search-title">Find your perfect stay with AI</h3>
        <p className="ai-search-subtitle">
          Describe your preferred accommodation, budget, location, and amenities in simple words.
        </p>
      </div>

      <form className="ai-search-form" onSubmit={handleAiSearch}>
        <div className="ai-search-input-container">
          <div className="ai-input-prefix-icon">
            <FaMagic />
          </div>
          
          <input
            type="text"
            className="ai-search-input"
            placeholder="Example: PG in Pune under ₹8,000 with WiFi and parking"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            aria-label="Describe your property requirement for AI search"
          />

          {query && (
            <button
              type="button"
              className="ai-input-clear-btn me-2"
              onClick={handleClear}
              disabled={loading}
              title="Clear input"
            >
              <FaTimes />
            </button>
          )}

          <button
            type="submit"
            className="btn ai-search-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Understanding...
              </>
            ) : (
              <>
                <FaSearch className="me-2" />
                Search with AI
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Understood Filters Display */}
      {hasFilters && (
        <div className="ai-understood-panel">
          <div className="ai-understood-header">
            <FaCheckCircle className="text-success me-2" />
            <span className="fw-semibold text-dark">AI understood your needs:</span>
          </div>

          <div className="ai-filter-chips-wrapper">
            {filters.city && (
              <span className="ai-filter-chip chip-city">
                <FaMapMarkerAlt /> {filters.city}
              </span>
            )}

            {filters.propertyType && (
              <span className="ai-filter-chip chip-type">
                <FaHome /> {filters.propertyType}
              </span>
            )}

            {filters.maxRent && (
              <span className="ai-filter-chip chip-budget">
                <FaMoneyBillWave /> Under {formatCurrency(filters.maxRent)}
              </span>
            )}

            {filters.minRent && (
              <span className="ai-filter-chip chip-budget">
                <FaMoneyBillWave /> Above {formatCurrency(filters.minRent)}
              </span>
            )}

            {filters.keyword && (
              <span className="ai-filter-chip chip-keyword">
                <FaTag /> {filters.keyword}
              </span>
            )}

            {filters.amenities && filters.amenities.length > 0 && (
              <span className="ai-filter-chip chip-amenities">
                <FaWifi /> {filters.amenities.join(", ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
