import MangaCard from "../components/MangaCard";
import { useState, useEffect } from "react";
import { getPopularMangas, searchMangas } from "../services/api";
import "../css/Home.css";

function Home() {
  const [mangas, setMangas] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = 50;
  const windowSize = 10;

  const loadMangas = async (pageNum, query = "") => {
    try {
      setLoading(true);
      const data = query
        ? await searchMangas(query, pageNum)
        : await getPopularMangas(pageNum);
      const filtered = query
        ? data.media.filter((m) =>
            (m?.title?.english || m?.title?.romaji || "")
              .toLowerCase()
              .startsWith(query.toLowerCase())
          )
        : data.media;
      setMangas(filtered);
      setHasMore(data.pageInfo.hasNextPage);
      setPage(data.pageInfo.currentPage);
    } catch {
      setError("Failed to load mangas...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      loadMangas(1, searchQuery.trim());
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadMangas(1, searchQuery.trim());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    loadMangas(newPage, searchQuery.trim());
  };

  const startPage = Math.floor((page - 1) / windowSize) * windowSize + 1;
  const endPage = Math.min(startPage + windowSize - 1, totalPages);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="search for mangas..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="mangas-grid">
        {mangas.map((manga) => (
          <MangaCard manga={manga} key={manga.id} />
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="pagination">
        <button
          className="page-btn"
          onClick={() => handlePageChange(startPage - 1)}
          disabled={startPage === 1 || loading}
        >
          ‹
        </button>

        {pages.map((n) => (
          <button
            key={n}
            className={page === n ? "page-btn active" : "page-btn"}
            onClick={() => handlePageChange(n)}
            disabled={loading}
          >
            {n}
          </button>
        ))}

        <button
          className="page-btn"
          onClick={() => handlePageChange(endPage + 1)}
          disabled={endPage === totalPages || loading || !hasMore}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default Home;
