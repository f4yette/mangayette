import MangaCard from "../components/MangaCard";
import { useState } from "react";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const manga = [
    { id: 1, title: "One Piece", release_date: "1997" },
    { id: 2, title: "Naruto", release_date: "1999" },
    { id: 3, title: "Bleach", release_date: "2002" },
    { id: 4, title: "Gintama", release_date: "2004" },
  ];

  const handleSearch = () => {
    e.preventDefault();
    alert(searchQuery);

    setSearchQuery("");
  };

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder=" Search for Mangas..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search button">
          Search
        </button>
      </form>
      <div className="mangas-grid">
        {manga.map((manga) => (
          <MangaCard manga={manga} key={manga.id} />
        ))}
      </div>
    </div>
  );
}

export default Home;
