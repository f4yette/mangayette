import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getChapterPages } from "../services/api";
import "../css/ChapterReader.css";
function ChapterReader() {
const { id, chapterId } = useParams();
const navigate = useNavigate();
const [pages, setPages] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => {
async function fetchPages() {
try {
const data = await getChapterPages(chapterId);
setPages(data);
      } catch {
setError("Failed to load chapter.");
      } finally {
setLoading(false);
      }
    }
fetchPages();
  }, [chapterId]);
if (loading) return <div className="loading">Loading chapter...</div>;
if (error) return (
<div className="chapter-reader">
      <button className="back-btn" onClick={() => navigate(`/manga/${id}`)}>← Back to Manga</button>
      <p>{error}</p>
    </div>
);
return (
<div className="chapter-reader">
      <button className="back-btn" onClick={() => navigate(`/manga/${id}`)}>← Back to Manga</button>
      <div className="chapter-pages">
{pages.map((url, i) => (
<img key={i} src={url} alt={`Page ${i + 1}`} />
))}
      </div>
    </div>
);
}
export default ChapterReader;