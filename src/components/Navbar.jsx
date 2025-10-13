import { NavLink } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="nav-brand-link">
          mangayette
        </NavLink>
      </div>
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          home
        </NavLink>
        <NavLink
          to="/favourites"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          favourites
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
