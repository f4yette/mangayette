import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../css/Navbar.css";
function Navbar() {
const navigate = useNavigate();
const [user, setUser] = useState(null);
const goHome = () => {
navigate("/", { state: { reset: true } });
window.scrollTo(0, 0);
  };
useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setUser(session?.user ?? null);
    });
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
setUser(session?.user ?? null);
    });
return () => subscription.unsubscribe();
  }, []);
const handleLogout = async () => {
await supabase.auth.signOut();
navigate("/");
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
className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
>
          home
        </NavLink>
        <NavLink
to="/favourites"
className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
>
          favourites
        </NavLink>
{user ? (
<button className="nav-link logout-btn" onClick={handleLogout}>logout</button>
) : (
<NavLink
to="/login"
className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
>
            login
          </NavLink>
)}
      </div>
    </nav>
);
}
export default Navbar;