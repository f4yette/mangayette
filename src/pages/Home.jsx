import MangaCard from "../components/MangaCard";
import { useState, useEffect } from "react";
import { getPopularMangas } from "../services/api";
import "../css/Home.css";

function Home() {
  const [mangas, setMangas] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalPages = 50;
  const windowSize = 10;

  const loadMangas = async (pageNum) => {
    try {
      setLoading(true);
      const data = await getPopularMangas(pageNum);
      setMangas(data.media);
      setHasMore(data.pageInfo.hasNextPage);
      setPage(data.pageInfo.currentPage);
    } catch (err) {
      console.log(err);
      setError("Failed to load mangas...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMangas(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    loadMangas(newPage);
  };

  const startPage =
    Math.floor(((page - 1) * 1.0) / windowSize) * windowSize + 1;
  const endPage = Math.min(startPage + windowSize - 1, totalPages);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="home">
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
