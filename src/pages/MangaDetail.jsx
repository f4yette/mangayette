import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMangaById, getMangaDexChapters } from "../services/api";
import "../css/MangaDetail.css";
function MangaDetail() {
const { id } = useParams();
const navigate = useNavigate();
const [manga, setManga] = useState(null);
const [chapters, setChapters] = useState([]);
const [loading, setLoading] = useState(true);
const [chaptersLoading, setChaptersLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => {
async function fetchManga() {
try {
const data = await getMangaById(Number(id));
setManga(data);
const title = data?.title?.english || data?.title?.romaji;
if (title) {
const chapterData = await getMangaDexChapters(title);
setChapters(chapterData);
        }
      } catch {
setError("Failed to load manga.");
      } finally {
setLoading(false);
setChaptersLoading(false);
      }
    }
fetchManga();
  }, [id]);
if (loading) return <div className="loading">Loading...</div>;
if (error) return (
<div className="manga-detail">
      <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
      <p>{error}</p>
    </div>
);
const title = manga?.title?.english || manga?.title?.romaji || "Untitled";
const image = manga?.coverImage?.large;
const description = manga?.description
? manga.description.replace(/<[^>]*>/g, "")
: "No description available.";
const year = manga?.startDate?.year ?? "—";
const totalChapters = manga?.chapters ?? "Ongoing";
return (
<div className="manga-detail">
      <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
      <div className="manga-detail-content">
{image && <img src={image} alt={title} />}
        <div className="manga-detail-info">
          <h1>{title}</h1>
          <p className="release_date">{year}</p>
          <p><strong>Chapters:</strong> {totalChapters}</p>
          <p>{description}</p>
        </div>
      </div>
      <div className="chapter-list">
        <h2>Chapters</h2>
{chaptersLoading ? (
<div className="loading">Loading chapters...</div>
) : chapters.length === 0 ? (
<p>No chapters found.</p>
) : (
chapters.map((ch) => (
<div
key={ch.id}
className="chapter-item"
onClick={() => navigate(`/manga/${id}/chapter/${ch.id}`)}
>
              Chapter {ch.attributes.chapter ?? "?"} — {ch.attributes.title || "No title"}
            </div>
))
)}
      </div>
    </div>
);
}
export default MangaDetail;