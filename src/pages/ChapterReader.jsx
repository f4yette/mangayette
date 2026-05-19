import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getComickPages } from "../services/api";
import { supabase } from "../services/supabase";
import "../css/ChapterReader.css";

const PROXY = "https://mangayette-proxy.ahmedahmedd1012.workers.dev";

function ChapterReader() {
const { id, chapterId } = useParams();
const navigate = useNavigate();
const location = useLocation();
const [pages, setPages] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [readingMode, setReadingMode] = useState("vertical");
const [currentPage, setCurrentPage] = useState(0);

const chapters = location.state?.chapters || [];
const currentIndex = location.state?.currentIndex ?? -1;
const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

useEffect(() => {
async function fetchPages() {
try {
let pageUrls = [];
if (chapterId.startsWith("comick_")) {
const hid = chapterId.replace("comick_", "");
pageUrls = await getComickPages(hid);
} else {
const res = await fetch(`${PROXY}/mangadex/at-home/server/${chapterId}`);
const data = await res.json();
const base = data.baseUrl;
const hash = data.chapter.hash;
const files = data.chapter.data;
pageUrls = files.map((file) => `${base}/data/${hash}/${file}`);
        }
setPages(pageUrls);
      } catch {
setError("Failed to load chapter.");
      } finally {
setLoading(false);
      }
    }
fetchPages();
  }, [chapterId]);

useEffect(() => {
async function saveProgress() {
const { data: { session } } = await supabase.auth.getSession();
if (!session) return;
await supabase.from("reading_progress").upsert({
user_id: session.user.id,
manga_id: id,
chapter_id: chapterId,
chapter_number: location.state?.chapterNumber ?? null,
updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,manga_id" });
      }
saveProgress();
  }, [id, chapterId]);

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

function goToChapter(ch, index) {
setCurrentPage(0);
navigate(`/manga/${id}/chapter/${ch.id}`, {
state: {
chapterNumber: ch.number,
chapters,
currentIndex: index,
      }
    });
  }

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
      <div className="chapter-nav">
{prevChapter ? (
<button className="chapter-nav-btn" onClick={() => goToChapter(prevChapter, currentIndex - 1)}>
            ← Ch. {prevChapter.number ?? "Prev"}
          </button>
) : <div />}
{nextChapter ? (
<button className="chapter-nav-btn" onClick={() => goToChapter(nextChapter, currentIndex + 1)}>
            Ch. {nextChapter.number ?? "Next"} →
          </button>
) : <div />}
      </div>
    </div>
);
}

export default ChapterReader;