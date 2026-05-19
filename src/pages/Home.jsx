import MangaCard from "../components/MangaCard";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPopularMangasBySort, searchMangas } from "../services/api";
import "../css/Home.css";

const BANNED_WORDS = [
  "rape", "incest", "loli", "shota", "molest", "assault", "abuse",
  "underage", "child", "hentai", "ecchi", "nsfw", "explicit", "erotica"
];

const SORT_OPTIONS = [
  { label: "Popular This Week", value: "TRENDING_DESC" },
  { label: "Popular This Month", value: "POPULARITY_DESC" },
  { label: "All Time Best", value: "SCORE_DESC" },
];

function isSafeContent(manga) {
const title = (
manga?.title?.english ||
manga?.title?.romaji ||
manga?.title?.native ||
""
  ).toLowerCase();
const hasBannedTitle = BANNED_WORDS.some((word) => title.includes(word));
const isAdult = manga?.isAdult === true;
return !hasBannedTitle && !isAdult;
}

function Home() {
const [mangas, setMangas] = useState([]);
const [allMangas, setAllMangas] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
const [activeSort, setActiveSort] = useState("TRENDING_DESC");
const totalPages = 50;
const windowSize = window.innerWidth < 768 ? 5 : 10;
const location = useLocation();
const navigate = useNavigate();
const isFirstRender = useRef(true);

const loadMangas = async (pageNum, query = "", sort = activeSort) => {
try {
setLoading(true);
setError(null);
const data = query
? await searchMangas(query, 1, 100)
: await getPopularMangasBySort([sort], pageNum);
const filtered = query
? data.media.filter(isSafeContent)
: data.media.filter(isSafeContent);
setMangas(filtered);
if (!query) setAllMangas(filtered);
if (!query) {
setHasMore(data.pageInfo.hasNextPage);
setPage(data.pageInfo.currentPage);
      }
    } catch {
setError("Failed to load mangas...");
    } finally {
setLoading(false);
    }
  };

useEffect(() => {
loadMangas(1, "", activeSort);
  }, [activeSort]);

useEffect(() => {
if (isFirstRender.current) {
isFirstRender.current = false;
return;
    }
const q = searchQuery.trim();
const t = setTimeout(() => {
if (q.length === 0) {
loadMangas(1, "", activeSort);
} else if (q.length === 1) {
const filtered = allMangas
.filter(isSafeContent)
.filter((m) =>
(m?.title?.english || m?.title?.romaji || "")
.toLowerCase()
.startsWith(q.toLowerCase())
);
setMangas(filtered);
} else {
loadMangas(1, q, activeSort);
}
    }, 300);
return () => clearTimeout(t);
  }, [searchQuery]);

useEffect(() => {
if (location.state?.reset) {
setSearchQuery("");
setActiveSort("TRENDING_DESC");
navigate("/", { replace: true, state: null });
    }
  }, [location.state, navigate]);

const handleSearch = (e) => {
e.preventDefault();
loadMangas(1, searchQuery.trim(), activeSort);
  };

const handlePageChange = (newPage) => {
if (newPage < 1 || newPage > totalPages || newPage === page) return;
window.scrollTo({ top: 0, behavior: "smooth" });
loadMangas(newPage, searchQuery.trim(), activeSort);
  };

const handleSortChange = (sort) => {
if (sort === activeSort) return;
setActiveSort(sort);
setSearchQuery("");
setPage(1);
  };

const startPage = Math.floor((page - 1) / windowSize) * windowSize + 1;
const endPage = Math.min(startPage + windowSize - 1, totalPages);
const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
);

const activeSortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label;

return (
<div className="home">
      <div className="home-hero">
        <h1>Welcome to <span>Mangayette</span></h1>
        <p>Read your favourite manga · Discover new titles · Build your collection</p>
      </div>
      <form onSubmit={handleSearch} className="search-form">
        <input
type="text"
placeholder="search for mangas..."
className="search-input"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
/>
        <button type="submit" className="search-button">Search</button>
      </form>
      <div className="sort-tabs">
{SORT_OPTIONS.map((opt) => (
<button
key={opt.value}
className={activeSort === opt.value ? "sort-tab active" : "sort-tab"}
onClick={() => handleSortChange(opt.value)}
>
{opt.label}
          </button>
))}
      </div>
{error && <p className="error">{error}</p>}
      <p className="section-label">— <span>{searchQuery ? `Results for "${searchQuery}"` : activeSortLabel}</span></p>
      <div className="mangas-grid">
{loading ? (
<div className="grid-loading">Loading...</div>
) : (
mangas.map((manga) => (
<MangaCard manga={manga} key={manga.id} />
))
)}
      </div>
{!searchQuery && (
<div className="pagination">
          <button className="page-btn" onClick={() => handlePageChange(startPage - 1)} disabled={startPage === 1 || loading}>‹</button>
{pages.map((n) => (
<button key={n} className={page === n ? "page-btn active" : "page-btn"} onClick={() => handlePageChange(n)} disabled={loading}>{n}</button>
))}
          <button className="page-btn" onClick={() => handlePageChange(endPage + 1)} disabled={endPage === totalPages || loading || !hasMore}>›</button>
        </div>
)}
    </div>
);
}
export default Home;