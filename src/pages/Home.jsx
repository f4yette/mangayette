import MangaCard from "../components/MangaCard";
import { useState, useEffect } from "react";
import { searchMangas, getPopularMangas } from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mangas, setMangas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularMangas = async () => {
      try {
        const popularMangas = await getPopularMangas();
        setMangas(popularMangas);
      } catch (err) {
        console.log(err);
        setError("Failed to load mangas...");
      } finally {
        setLoading(false);
      }
    };
    loadPopularMangas();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    alert(searchQuery);
    setSearchQuery("");
  };

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder=" search for mangas..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search button">
          search
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="mangas-grid">
          {mangas.map((manga) => (
            <MangaCard manga={manga} key={manga.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
