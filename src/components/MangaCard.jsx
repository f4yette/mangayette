import "../css/MangaCard.css";

function MangaCard({ manga }) {
  function onFavourite() {
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
    <div className="manga-card">
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
