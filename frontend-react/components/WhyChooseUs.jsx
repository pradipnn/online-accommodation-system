import { FaArrowRight } from "react-icons/fa";

import properties from "../data/properties";
import PropertyCard from "./PropertyCard";

function FeaturedProperties() {
  return (
    <section className="section-space" id="properties">
      <div className="container">
        <div className="section-heading-row">
          <div>
            <span className="section-label">Recommended stays</span>

            <h2 className="section-title">Featured properties</h2>

            <p className="section-subtitle">
              Hand-picked and verified accommodations for students and
              professionals.
            </p>
          </div>

          <button className="btn view-all-button" type="button">
            View all
            <FaArrowRight className="ms-2" />
          </button>
        </div>

        <div className="row g-4">
          {properties.map((property) => (
            <div className="col-md-6 col-xl-4" key={property.id}>
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProperties;