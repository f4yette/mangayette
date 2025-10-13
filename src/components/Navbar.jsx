import { NavLink, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const goHome = () => {
    navigate("/", { state: { reset: true } });
    window.scrollTo(0, 0);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button onClick={goHome} className="nav-brand-link">
          mangayette
        </button>
      </div>
      <div className="nav-links">
        <NavLink
          to="/"
          onClick={goHome}
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
