import { Link } from "react-router-dom";
import "../css/Navbar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">mangayette</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          home
        </Link>
        <Link to="/favourites" className="nav-link">
          favourties
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
