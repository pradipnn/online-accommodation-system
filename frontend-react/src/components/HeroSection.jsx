import {
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

import SearchBar from "./SearchBar";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay" />

      <div className="container hero-content">
        <div className="row align-items-center min-vh-75">
          <div className="col-lg-7">
            <div className="hero-badge">
              <FaShieldAlt />
              Trusted accommodation platform
            </div>

            <h1 className="hero-title">
              Find a place you will
              <span> love to stay.</span>
            </h1>

            <p className="hero-description">
              Discover verified hostels, rooms and flats near your college,
              workplace or preferred location.
            </p>

            <div className="hero-features">
              <span>
                <FaCheckCircle />
                Verified properties
              </span>

              <span>
                <FaCheckCircle />
                Secure booking
              </span>

              <span>
                <FaCheckCircle />
                Affordable pricing
              </span>
            </div>

            <button className="btn explore-button" type="button">
              Explore Properties
              <FaArrowRight className="ms-2" />
            </button>
          </div>
        </div>

        <SearchBar />
      </div>
    </section>
  );
}

export default HeroSection;