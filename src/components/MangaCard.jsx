function MangaCard({ manga }) {
  function onFavourite() {
    alert("Added to Favourites");
  }

  return (
    <div className="manga-card">
      <div className="manga-poster">
        <img src={manga.url} alt={manga.title} />
        <div className="manga-overlay">
          <button className="favourite-btn" onClick={onFavourite}>
            ♡
          </button>
        </div>
      </div>
      <div className="manga-info">
        <h3>{manga.title}</h3>
        <p className="release_date">Release date: {manga.release_date}</p>
      </div>
    </div>
  );
}

export default MangaCard;
