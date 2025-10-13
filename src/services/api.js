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

export async function getPopularMangas(page = 1, perPage = 20) {
  const query = `
    query ($page:Int!, $perPage:Int!) {
      Page(page:$page, perPage:$perPage) {
        pageInfo {
          currentPage
          hasNextPage
        }
        media(type: MANGA, sort: POPULARITY_DESC) {
          id
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
        media(type: MANGA, search:$search, sort: POPULARITY_DESC) {
          id
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
