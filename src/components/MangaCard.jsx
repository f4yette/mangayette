import "../css/MangaCard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function MangaCard({ manga }) {
const navigate = useNavigate();
const [isFavourited, setIsFavourited] = useState(false);
const [user, setUser] = useState(null);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setUser(session?.user ?? null);
    });
  }, []);

useEffect(() => {
if (!user) return;
async function checkFavourite() {
const { data } = await supabase
.from("favourites")
.select("id")
.eq("user_id", user.id)
.eq("manga_id", manga.id)
.single();
setIsFavourited(!!data);
    }
checkFavourite();
  }, [user, manga.id]);

async function onFavourite(e) {
e.stopPropagation();
if (!user) {
navigate("/login");
return;
    }
if (isFavourited) {
await supabase
.from("favourites")
.delete()
.eq("user_id", user.id)
.eq("manga_id", manga.id);
setIsFavourited(false);
} else {
await supabase.from("favourites").insert({
user_id: user.id,
manga_id: manga.id,
manga_title: manga?.title?.english || manga?.title?.romaji || "Untitled",
manga_cover: manga?.coverImage?.large,
manga_year: manga?.startDate?.year,
      });
setIsFavourited(true);
    }
  }

const title =
manga?.title?.english ||
manga?.title?.romaji ||
manga?.title?.native ||
"Untitled";
const image = manga?.coverImage?.large;
const year = manga?.startDate?.year ?? "—";

return (
<div className="manga-card" onClick={() => navigate(`/manga/${manga.id}`)}>
      <div className="manga-poster">
{image && <img src={`${image}`} alt={title} />}
        <div className="manga-overlay">
          <button className={`favourite-btn ${isFavourited ? "active" : ""}`} onClick={onFavourite}>
{isFavourited ? "♥" : "♡"}
          </button>
        </div>
      </div>
      <div className="manga-info">
        <h3>{title}</h3>
        <p className="release_date">{year}</p>
      </div>
    </div>
);
}

export default MangaCard;