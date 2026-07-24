import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import PropertyCard from "./PropertyCard";
import { propertyApi } from "../services/api";

const fallbackImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyApi.search().then(({ data }) => {
      setProperties(data.slice(0, 6).map((item) => ({
        ...item,
        name: item.title,
        type: item.propertyType,
        location: `${item.city}, ${item.state}`,
        price: item.monthlyRent,
        image: item.imageUrls?.[0] || fallbackImage,
        rating: "New",
        reviews: 0,
        amenities: item.amenities || [],
      })));
    }).catch(() => toast.error("Could not load properties from backend.")).finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-space" id="properties"><div className="container">
      <div className="section-heading-row"><div><span className="section-label">Recommended stays</span><h2 className="section-title">Featured properties</h2><p className="section-subtitle">Live properties loaded from the Spring Boot REST API.</p></div><button className="btn view-all-button" type="button">View all<FaArrowRight className="ms-2" /></button></div>
      {loading ? <p>Loading properties...</p> : properties.length === 0 ? <p>No approved properties are available yet.</p> : <div className="row g-4">{properties.map((property) => <div className="col-md-6 col-xl-4" key={property.id}><PropertyCard property={property} /></div>)}</div>}
    </div></section>
  );
}
export default FeaturedProperties;
