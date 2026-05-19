import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMangaById, getMangaDexChapters } from "../services/api";
import { supabase } from "../services/supabase";
import "../css/MangaDetail.css";

const PROXY = "https://mangayette-proxy.ahmedahmedd1012.workers.dev";

function isUUID(id) {
return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function mdToFormat(md) {
const title = md.attributes?.title?.en ||
Object.values(md.attributes?.title || {})[0] ||
"Untitled";
const cover = md.relationships?.find((r) => r.type === "cover_art");
const fileName = cover?.attributes?.fileName;
const coverUrl = fileName
? `${PROXY}/mangadex/covers/${md.id}/${fileName}`
: null;
return {
id: md.id,
title: { english: title, romaji: title },
description: md.attributes?.description?.en || "No description available.",
coverImage: { large: coverUrl },
chapters: null,
startDate: { year: md.attributes?.year || null },
    };
}

function MangaDetail() {
const { id } = useParams();
const navigate = useNavigate();
const [manga, setManga] = useState(null);
const [chapters, setChapters] = useState([]);
const [loading, setLoading] = useState(true);
const [chaptersLoading, setChaptersLoading] = useState(true);
const [error, setError] = useState(null);
const [chapterOrder, setChapterOrder] = useState("asc");
const [user, setUser] = useState(null);
const [isFavourited, setIsFavourited] = useState(false);
const [favLoading, setFavLoading] = useState(false);
const [lastRead, setLastRead] = useState(null);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setUser(session?.user ?? null);
    });
  }, []);

useEffect(() => {
if (!user || !manga) return;
async function checkFav() {
const { data } = await supabase
.from("favourites")
.select("id")
.eq("user_id", user.id)
.eq("manga_id", String(id))
.single();
setIsFavourited(!!data);
      }
async function checkProgress() {
const { data } = await supabase
.from("reading_progress")
.select("chapter_id, chapter_number")
.eq("user_id", user.id)
.eq("manga_id", String(id))
.single();
if (data) setLastRead(data);
      }
checkFav();
checkProgress();
  }, [user, manga, id]);

async function handleFavourite() {
if (!user) {
navigate("/login");
return;
    }
setFavLoading(true);
const title = manga?.title?.english || manga?.title?.romaji || "Untitled";
const cover = manga?.coverImage?.large;
const year = manga?.startDate?.year;
if (isFavourited) {
await supabase
.from("favourites")
.delete()
.eq("user_id", user.id)
.eq("manga_id", String(id));
setIsFavourited(false);
} else {
await supabase.from("favourites").insert({
user_id: user.id,
manga_id: String(id),
manga_title: title,
manga_cover: cover,
manga_year: year,
      });
setIsFavourited(true);
    }
setFavLoading(false);
  }

useEffect(() => {
async function fetchManga() {
try {
let data;
if (isUUID(id)) {
const res = await fetch(`${PROXY}/mangadex/manga/${id}?includes[]=cover_art`);
const json = await res.json();
data = mdToFormat(json.data);
let allChapters = [];
let offset = 0;
const limit = 100;
while (true) {
const chapterRes = await fetch(
`${PROXY}/mangadex/chapter?manga=${id}&translatedLanguage[]=en&order[chapter]=asc&limit=${limit}&offset=${offset}`
              );
const chapterJson = await chapterRes.json();
const batch = chapterJson?.data || [];
allChapters = [...allChapters, ...batch];
if (allChapters.length >= (chapterJson?.total || 0) || batch.length < limit) break;
offset += limit;
            }
setChapters(allChapters);
} else {
data = await getMangaById(Number(id));
const title = data?.title?.english || data?.title?.romaji;
if (title) {
const chapterData = await getMangaDexChapters(title);
setChapters(chapterData);
          }
        }
setManga(data);
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
const sortedChapters = chapterOrder === "asc" ? [...chapters] : [...chapters].reverse();
const chapterNavList = sortedChapters.map((c) => ({ id: c.id, number: c.attributes.chapter }));

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
          <div className="manga-actions">
            <button
className={`fav-btn ${isFavourited ? "active" : ""}`}
onClick={handleFavourite}
disabled={favLoading}
>
{isFavourited ? "♥ Remove from Favourites" : "♡ Add to Favourites"}
            </button>
{lastRead && (
<button
className="continue-btn"
onClick={() => {
const idx = chapterNavList.findIndex((c) => c.id === lastRead.chapter_id);
navigate(`/manga/${id}/chapter/${lastRead.chapter_id}`, {
state: {
chapterNumber: lastRead.chapter_number,
chapters: chapterNavList,
currentIndex: idx,
                  }
                });
              }}
>
                ▶ Continue Ch. {lastRead.chapter_number || ""}
              </button>
)}
          </div>
        </div>
      </div>
      <div className="chapter-list">
        <div className="chapter-header">
          <h2>Chapters</h2>
          <div className="chapter-order-btns">
            <button
className={chapterOrder === "asc" ? "order-btn active" : "order-btn"}
onClick={() => setChapterOrder("asc")}
title="Oldest First"
>
              ↑ Oldest
            </button>
            <button
className={chapterOrder === "desc" ? "order-btn active" : "order-btn"}
onClick={() => setChapterOrder("desc")}
title="Latest First"
>
              ↓ Latest
            </button>
          </div>
        </div>
{chaptersLoading ? (
<div className="loading">Loading chapters...</div>
) : sortedChapters.length === 0 ? (
<p>No chapters found.</p>
) : (
sortedChapters.map((ch, index) => (
<div
key={ch.id}
className={`chapter-item ${lastRead?.chapter_id === ch.id ? "last-read" : ""}`}
onClick={() => navigate(`/manga/${id}/chapter/${ch.id}`, {
state: {
chapterNumber: ch.attributes.chapter,
chapters: chapterNavList,
currentIndex: index,
              }
})}
>
              Chapter {ch.attributes.chapter ?? "?"} — {ch.attributes.title || "No title"}
{lastRead?.chapter_id === ch.id && <span className="last-read-badge">Last Read</span>}
            </div>
))
)}
      </div>
    </div>
);
}

export default MangaDetail;