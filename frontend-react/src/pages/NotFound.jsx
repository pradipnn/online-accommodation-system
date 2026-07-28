import { NavLink } from "react-router-dom";

function NotFound() {
  return (
    <section className="not-found-page">
      <div className="container text-center">
        <span className="not-found-number">404</span>

        <h1>Page not found</h1>

        <p>
          The page you are looking for does not exist or may have been moved.
        </p>

        <NavLink className="btn register-button" to="/">
          Back to Home
        </NavLink>
      </div>
    </section>
  );
}

export default NotFound;