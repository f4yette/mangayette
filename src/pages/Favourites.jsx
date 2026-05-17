import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import MangaCard from "../components/MangaCard";
import "../css/Favourites.css";

function Favourites() {
const [favourites, setFavourites] = useState([]);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);
const navigate = useNavigate();

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
if (!session) {
navigate("/login");
return;
      }
setUser(session.user);
    });
  }, []);

useEffect(() => {
if (!user) return;
async function fetchFavourites() {
const { data } = await supabase
.from("favourites")
.select("*")
.eq("user_id", user.id)
.order("created_at", { ascending: false });
setFavourites(data || []);
setLoading(false);
      }
fetchFavourites();
  }, [user]);

if (loading) return <div className="loading">Loading...</div>;

return (
<div className="favourites">
      <h1>My Favourites</h1>
{favourites.length === 0 ? (
<p className="no-favourites">You haven't added any favourites yet.</p>
) : (
<div className="mangas-grid">
{favourites.map((fav) => (
<div key={fav.manga_id} className="manga-card" onClick={() => navigate(`/manga/${fav.manga_id}`)}>
              <div className="manga-poster">
{fav.manga_cover && <img src={fav.manga_cover} alt={fav.manga_title} />}
              </div>
              <div className="manga-info">
                <h3>{fav.manga_title}</h3>
                <p className="release_date">{fav.manga_year ?? "—"}</p>
              </div>
            </div>
))}
        </div>
)}
    </div>
);
}

export default Favourites;