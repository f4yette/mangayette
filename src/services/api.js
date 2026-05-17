const PROXY = "https://mangayette-proxy.ahmedahmedd1012.workers.dev";

async function fetchGraphQL(query, variables = {}) {
const res = await fetch(`${PROXY}/anilist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
const json = await res.json();
if (!res.ok || json.errors) {
const msg = json?.errors?.[0]?.message || `HTTP ${res.status}`;
throw new Error(`AniList error: ${msg}`);
  }
return json.data;
}

function mdToAnilistFormat(md) {
const title =
md.attributes?.title?.en ||
Object.values(md.attributes?.title || {})[0] ||
"Untitled";
const cover = md.relationships?.find((r) => r.type === "cover_art");
const fileName = cover?.attributes?.fileName;
const coverUrl = fileName
? `https://uploads.mangadex.org/covers/${md.id}/${fileName}`
: null;
return {
id: md.id,
isMangaDex: true,
title: { english: title, romaji: title, native: title },
description: md.attributes?.description?.en || "",
coverImage: { medium: coverUrl, large: coverUrl },
averageScore: null,
format: md.attributes?.publicationDemographic || "MANGA",
startDate: { year: md.attributes?.year || null },
isAdult:
md.attributes?.contentRating === "pornographic" ||
md.attributes?.contentRating === "erotica",
    };
}

async function getMangaDexPopular(page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;

  try {
    const url =
      `${PROXY}/mangadex/manga` +
      `?limit=${perPage}` +
      `&offset=${offset}` +
      `&order[followedCount]=desc` +
      `&contentRating[]=safe` +
      `&contentRating[]=suggestive` +
      `&includes[]=cover_art`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("MangaDex Popular:", data); // DEBUG

    return {
      media: (data?.data || []).map(mdToAnilistFormat),
      pageInfo: {
        currentPage: page,
        hasNextPage: offset + perPage < (data?.total || 0),
      },
    };
  } catch (err) {
    console.error("MangaDex Popular Error:", err);
    return {
      media: [],
      pageInfo: { currentPage: page, hasNextPage: false },
    };
  }
}

async function getMangaDexSearch(search, page = 1, perPage = 20) {
const offset = (page - 1) * perPage;
try {
const res = await fetch(
`${PROXY}/mangadex/manga?title=${encodeURIComponent(search)}&limit=${perPage}&offset=${offset}&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`
    );
const data = await res.json();
return {
media: (data.data || []).map(mdToAnilistFormat),
pageInfo: {
currentPage: page,
hasNextPage: offset + perPage < (data.total || 0),
        },
      };
    } catch {
return { media: [], pageInfo: { currentPage: page, hasNextPage: false } };
    }
}

export async function getPopularMangasBySort(sort, page = 1, perPage = 20) {
const query = `
    query ($page:Int!, $perPage:Int!, $sort:[MediaSort]) {
      Page(page:$page, perPage:$perPage) {
        pageInfo { currentPage hasNextPage }
        media(type: MANGA, sort: $sort, isAdult: false) {
          id isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore format
          startDate { year }
        }
      }
    }
  `;
try {
const data = await fetchGraphQL(query, { page, perPage, sort });
return data.Page;
  } catch {
return getMangaDexPopular(page, perPage, sort[0]);
  }
}

export async function getPopularMangas(page = 1, perPage = 20) {
const query = `
    query ($page:Int!, $perPage:Int!) {
      Page(page:$page, perPage:$perPage) {
        pageInfo { currentPage hasNextPage }
        media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          id isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore format
          startDate { year }
        }
      }
    }
  `;
try {
const data = await fetchGraphQL(query, { page, perPage });
return data.Page;
  } catch {
return getMangaDexPopular(page, perPage, "POPULARITY_DESC");
  }
}

export async function searchMangas(search, page = 1, perPage = 20) {
const query = `
    query ($search:String!, $page:Int!, $perPage:Int!) {
      Page(page:$page, perPage:$perPage) {
        pageInfo { currentPage hasNextPage }
        media(type: MANGA, search:$search, sort: POPULARITY_DESC, isAdult: false) {
          id isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore format
          startDate { year }
        }
      }
    }
  `;
try {
const data = await fetchGraphQL(query, { search, page, perPage });
return data.Page;
  } catch {
return getMangaDexSearch(search, page, perPage);
  }
}

export async function getMangaById(id) {
const query = `
    query ($id: Int!) {
      Media(id: $id, type: MANGA) {
        id isAdult
        title { romaji english native }
        description(asHtml: false)
        coverImage { medium large }
        averageScore chapters format
        startDate { year }
      }
    }
  `;
try {
const data = await fetchGraphQL(query, { id });
return data.Media;
  } catch {
try {
const res = await fetch(`${PROXY}/mangadex/manga/${id}?includes[]=cover_art`);
const data = await res.json();
return mdToAnilistFormat(data.data);
      } catch {
return null;
      }
  }
}

export async function getMangaDexChapters(title) {
try {
const searchRes = await fetch(
`${PROXY}/mangadex/manga?title=${encodeURIComponent(title)}&limit=1`
    );
const searchData = await searchRes.json();
const mangaId = searchData?.data?.[0]?.id;
if (!mangaId) return [];
let allChapters = [];
let offset = 0;
const limit = 100;
while (true) {
const chapterRes = await fetch(
`${PROXY}/mangadex/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=${limit}&offset=${offset}`
        );
const chapterData = await chapterRes.json();
const chapters = chapterData?.data || [];
allChapters = [...allChapters, ...chapters];
if (allChapters.length >= (chapterData?.total || 0) || chapters.length < limit) break;
offset += limit;
      }
return allChapters;
  } catch {
return [];
  }
}

export async function getChapterPages(chapterId) {
try {
const res = await fetch(`${PROXY}/mangadex/at-home/server/${chapterId}`);
const data = await res.json();
const base = data.baseUrl;
const hash = data.chapter.hash;
const files = data.chapter.data;
return files.map((file) => `${base}/data/${hash}/${file}`);
  } catch {
return [];
  }
}