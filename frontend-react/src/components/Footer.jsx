import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="premium-footer" id="about">
      <div className="container">
        <div className="row g-5 footer-main">
          <div className="col-lg-4">
            <NavLink className="footer-brand" to="/">
              <FaBuilding />
              StayNest
            </NavLink>

            <p className="footer-description">
              StayNest helps students, employees and individuals find verified
              hostels, rooms and flats with a smooth booking experience.
            </p>

            <div className="social-links">
              <a href="#facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#instagram" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#linkedin" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h3 className="footer-title">Quick Links</h3>

            <ul className="footer-links">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/properties">Properties</NavLink>
              </li>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
              <li>
                <NavLink to="/register">Register</NavLink>
              </li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h3 className="footer-title">Property</h3>

            <ul className="footer-links">
              <li><a href="#hostels">Hostels</a></li>
              <li><a href="#flats">Flats</a></li>
              <li><a href="#rooms">Rooms</a></li>
              <li><a href="#pg">PG Accommodation</a></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h3 className="footer-title">Contact Us</h3>

            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt />
                Karad, Maharashtra, India
              </li>

              <li>
                <FaPhoneAlt />
                +91 80805 44930
              </li>

              <li>
                <FaEnvelope />
                support@staynest.com
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} StayNest. All rights reserved.
          </p>

          <div>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;