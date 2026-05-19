import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import "../css/ChapterReader.css";

const PROXY = "https://mangayette-proxy.ahmedahmedd1012.workers.dev";

function ChapterReader() {
const { id, chapterId } = useParams();
const navigate = useNavigate();
const [pages, setPages] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [readingMode, setReadingMode] = useState("vertical");
const [currentPage, setCurrentPage] = useState(0);

useEffect(() => {
async function fetchPages() {
try {
const res = await fetch(`${PROXY}/mangadex/at-home/server/${chapterId}`);
const data = await res.json();
const base = data.baseUrl;
const hash = data.chapter.hash;
const files = data.chapter.data;
setPages(files.map((file) => `${base}/data/${hash}/${file}`));
      } catch {
setError("Failed to load chapter.");
      } finally {
setLoading(false);
      }
    }
fetchPages();
  }, [chapterId]);

const handleKeyDown = useCallback((e) => {
if (readingMode !== "horizontal") return;
if (e.key === "ArrowLeft") {
setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
    }
if (e.key === "ArrowRight") {
setCurrentPage((p) => Math.max(0, p - 1));
    }
  }, [readingMode, pages.length]);

useEffect(() => {
window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

if (loading) return <div className="loading">Loading chapter...</div>;
if (error) return (
<div className="chapter-reader">
      <button className="back-btn" onClick={() => navigate(`/manga/${id}`)}>← Back to Manga</button>
      <p>{error}</p>
    </div>
);

return (
<div className="chapter-reader">
      <div className="reader-header">
        <button className="back-btn" onClick={() => navigate(`/manga/${id}`)}>← Back to Manga</button>
        <div className="reading-mode-btns">
          <button
className={readingMode === "vertical" ? "order-btn active" : "order-btn"}
onClick={() => { setReadingMode("vertical"); setCurrentPage(0); }}
>
            ↕ Vertical
          </button>
          <button
className={readingMode === "horizontal" ? "order-btn active" : "order-btn"}
onClick={() => { setReadingMode("horizontal"); setCurrentPage(0); }}
>
            ↔ Horizontal
          </button>
        </div>
      </div>
{readingMode === "vertical" ? (
<div className="chapter-pages vertical">
{pages.map((url, i) => (
<img key={i} src={url} alt={`Page ${i + 1}`} />
))}
        </div>
) : (
<div className="chapter-pages horizontal">
          <div
className="horizontal-strip"
style={{ transform: `translateX(calc(${currentPage} * 100vw))` }}
>
{[...pages].reverse().map((url, i) => (
<img key={i} src={url} alt={`Page ${pages.length - i}`} />
))}
          </div>
          <p className="page-counter">{currentPage + 1} / {pages.length}</p>
        </div>
)}
    </div>
);
}

export default ChapterReader;