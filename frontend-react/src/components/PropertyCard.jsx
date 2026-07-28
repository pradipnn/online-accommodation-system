import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  return (
    <article className="property-card">
      <div className="property-image-wrapper">
        <img
          src={property.image}
          alt={property.name}
          className="property-image"
        />

        <span className="property-type-badge">{property.type}</span>

        <button
          type="button"
          className="property-like-button"
          aria-label={`Add ${property.name} to wishlist`}
        >
          <FaHeart />
        </button>
      </div>

      <div className="property-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div>
            <h3 className="property-name">{property.name}</h3>

            <p className="property-location">
              <FaMapMarkerAlt />
              {property.location}
            </p>
          </div>

          <div className="property-rating">
            <FaStar />
            {property.rating}
          </div>
        </div>

        <div className="property-amenities">
          {property.amenities.map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
        </div>

        <div className="property-footer">
          <div>
            <span className="property-price">
              ₹{property.price.toLocaleString("en-IN")}
            </span>

            <span className="price-period"> / month</span>

            <p className="review-count mb-0">
              {property.reviews} verified reviews
            </p>
          </div>

          <button type="button" className="btn view-details-button" onClick={() => navigate(`/properties/${property.id}`)}>
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;