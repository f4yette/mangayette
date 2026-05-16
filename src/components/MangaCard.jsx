import "../css/MangaCard.css";
import { useNavigate } from "react-router-dom";
function MangaCard({ manga }) {
const navigate = useNavigate();
function onFavourite(e) {
e.stopPropagation();
alert("Added to Favourites");
  }
const title =
manga?.title?.english ||
manga?.title?.romaji ||
manga?.title?.native ||
"Untitled";
const image = manga?.coverImage?.medium;
const year = manga?.startDate?.year ?? "—";
return (
<div className="manga-card" onClick={() => navigate(`/manga/${manga.id}`)}>
      <div className="manga-poster">
{image && <img src={`${image}`} alt={title} />}
        <div className="manga-overlay">
          <button className="favourite-btn" onClick={onFavourite}>
            ♡
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