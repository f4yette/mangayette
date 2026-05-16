const BASE_URL = "https://graphql.anilist.co";
async function fetchGraphQL(query, variables = {}) {
const res = await fetch(BASE_URL, {
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
export async function getPopularMangasBySort(sort, page = 1, perPage = 20) {
const query = `
    query ($page:Int!, $perPage:Int!, $sort:[MediaSort]) {
      Page(page:$page, perPage:$perPage) {
        pageInfo {
          currentPage
          hasNextPage
        }
        media(type: MANGA, sort: $sort, isAdult: false) {
          id
          isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore
          format
          startDate { year }
        }
      }
    }
  `;
const data = await fetchGraphQL(query, { page, perPage, sort });
return data.Page;
}
export async function getPopularMangas(page = 1, perPage = 20) {
const query = `
    query ($page:Int!, $perPage:Int!) {
      Page(page:$page, perPage:$perPage) {
        pageInfo {
          currentPage
          hasNextPage
        }
        media(type: MANGA, sort: POPULARITY_DESC, isAdult: false) {
          id
          isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore
          format
          startDate { year }
        }
      }
    }
  `;
const data = await fetchGraphQL(query, { page, perPage });
return data.Page;
}
export async function searchMangas(search, page = 1, perPage = 20) {
const query = `
    query ($search:String!, $page:Int!, $perPage:Int!) {
      Page(page:$page, perPage:$perPage) {
        pageInfo {
          currentPage
          hasNextPage
        }
        media(type: MANGA, search:$search, sort: POPULARITY_DESC, isAdult: false) {
          id
          isAdult
          title { romaji english native }
          description(asHtml: false)
          coverImage { medium large }
          averageScore
          format
          startDate { year }
        }
      }
    }
  `;
const data = await fetchGraphQL(query, { search, page, perPage });
return data.Page;
}
export async function getMangaById(id) {
const query = `
    query ($id: Int!) {
      Media(id: $id, type: MANGA) {
        id
        isAdult
        title { romaji english native }
        description(asHtml: false)
        coverImage { medium large }
        averageScore
        chapters
        format
        startDate { year }
      }
    }
  `;
const data = await fetchGraphQL(query, { id });
return data.Media;
}
export async function getMangaDexChapters(title) {
const searchRes = await fetch(
`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1`
  );
const searchData = await searchRes.json();
const mangaId = searchData?.data?.[0]?.id;
if (!mangaId) return [];
const chapterRes = await fetch(
`https://api.mangadex.org/chapter?manga=${mangaId}&translatedLanguage[]=en&order[chapter]=asc&limit=100`
  );
const chapterData = await chapterRes.json();
return chapterData?.data || [];
}
export async function getChapterPages(chapterId) {
const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
const data = await res.json();
const base = data.baseUrl;
const hash = data.chapter.hash;
const files = data.chapter.data;
return files.map((file) => `${base}/data/${hash}/${file}`);
}