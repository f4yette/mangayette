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
    loadMangas(newPage);
  };

  const totalPages = 50;

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
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              className={page === pageNum ? "page-btn active" : "page-btn"}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
