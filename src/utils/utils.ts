import { load } from 'cheerio';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

export const splitAuthor = (authors: string) => {
  const res: string[] = [];
  let eater = '';
  for (let i = 0; i < authors.length; i++) {
    if (authors[i] == ' ' && (authors[i - 1] == ',' || authors[i - 1] == ';')) {
      continue;
    }
    if (authors[i] == ',' || authors[i] == ';') {
      res.push(eater.trim());
      eater = '';
      continue;
    }
    eater += authors[i];
  }
  res.push(eater);
  return res;
};

export const floorID = (id: string) => {
  let imp = '';
  for (let i = 0; i < id?.length - 3; i++) {
    imp += id[i];
  }
  const idV = parseInt(imp);
  return idV * 1000;
};

export const formatTitle = (title: string) => {
  const result = title.replace(/[0-9]/g, '');
  return result.trim();
};

export const genElement = (s: string, e: string) => {
  if (s == '') return;
  const $ = load(e);
  let i = 0;
  let str = '';
  let el = $();
  for (; i < s.length; i++) {
    if (s[i] == ' ') {
      el = $(str);
      str = '';
      i++;
      break;
    }
    str += s[i];
  }
  for (; i < s.length; i++) {
    if (s[i] == ' ') {
      el = $(el).children(str);
      str = '';
      continue;
    }
    str += s[i];
  }
  el = $(el).children(str);
  return el;
};

export const range = ({ from = 0, to = 0, step = 1, length = Math.ceil((to - from) / step) }) =>
  Array.from({ length }, (_, i) => from + i * step);

export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const anilistAdvancedQuery = () =>
  `query ($page: Int = 1, $id: Int, $type: MediaType, $isAdult: Boolean = false, $search: String, $format: [MediaFormat], $status: MediaStatus, $size: Int, $countryOfOrigin: CountryCode, $source: MediaSource, $season: MediaSeason, $seasonYear: Int, $year: String, $onList: Boolean, $yearLesser: FuzzyDateInt, $yearGreater: FuzzyDateInt, $episodeLesser: Int, $episodeGreater: Int, $durationLesser: Int, $durationGreater: Int, $chapterLesser: Int, $chapterGreater: Int, $volumeLesser: Int, $volumeGreater: Int, $licensedBy: [String], $isLicensed: Boolean, $genres: [String], $excludedGenres: [String], $tags: [String], $excludedTags: [String], $minimumTagRank: Int, $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, season: $season, format_in: $format, status: $status, countryOfOrigin: $countryOfOrigin, source: $source, search: $search, onList: $onList, seasonYear: $seasonYear, startDate_like: $year, startDate_lesser: $yearLesser, startDate_greater: $yearGreater, episodes_lesser: $episodeLesser, episodes_greater: $episodeGreater, duration_lesser: $durationLesser, duration_greater: $durationGreater, chapters_lesser: $chapterLesser, chapters_greater: $chapterGreater, volumes_lesser: $volumeLesser, volumes_greater: $volumeGreater, licensedBy_in: $licensedBy, isLicensed: $isLicensed, genre_in: $genres, genre_not_in: $excludedGenres, tag_in: $tags, tag_not_in: $excludedTags, minimumTagRank: $minimumTagRank, sort: $sort, isAdult: $isAdult) {  id idMal status(version: 2) title { userPreferred romaji english native } bannerImage coverImage{ extraLarge large medium color } episodes season format seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
export const anilistSearchQuery = (query: string, page: number, perPage: number) =>
  `query ($page: Int = ${page}, $id: Int, $type: MediaType = ANIME, $search: String = "${query}", $isAdult: Boolean = false, $size: Int = ${perPage}) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, search: $search, isAdult: $isAdult) { id idMal status(version: 2) title { userPreferred romaji english native } bannerImage coverImage{ extraLarge large medium color } episodes format season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
export const anilistMediaDetailQuery = (id: string) =>
  `query ($id: Int = ${id}) { Media(id: $id) { id idMal title { english native romaji } coverImage { extraLarge large color } startDate { year month day } endDate { year month day } bannerImage season seasonYear description type format status(version: 2) episodes duration chapters volumes trailer { id site thumbnail } genres source averageScore popularity meanScore nextAiringEpisode { airingAt timeUntilAiring episode } characters(sort: ROLE) { edges { role node { id name { first middle last full native userPreferred } image { large medium } } } } recommendations { edges { node { id mediaRecommendation { id idMal title { romaji english native userPreferred } status episodes coverImage { extraLarge large medium color } bannerImage meanScore nextAiringEpisode { episode timeUntilAiring airingAt } } } } } relations { edges { id node { id idMal status coverImage { extraLarge large medium color } bannerImage title { romaji english native userPreferred } episodes nextAiringEpisode { airingAt timeUntilAiring episode } meanScore } } } studios(isMain: true) { edges { isMain node { id name } } } } }`;
export const anilistTrendingAnimeQuery = (page: number = 1, perPage: number = 20) =>
  `query ($page: Int = ${page}, $id: Int, $type: MediaType = ANIME, $isAdult: Boolean = false, $size: Int = ${perPage}, $sort: [MediaSort] = [TRENDING_DESC, POPULARITY_DESC]) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, isAdult: $isAdult, sort: $sort) { id idMal status(version: 2) title { userPreferred romaji english native } genres trailer { id site thumbnail } description format bannerImage coverImage{ extraLarge large medium color } episodes meanScore duration season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
export const anilistPopularAnimeQuery = (page: number = 1, perPage: number = 20) =>
  `query ($page: Int = ${page}, $id: Int, $type: MediaType = ANIME, $isAdult: Boolean = false, $size: Int = ${perPage}, $sort: [MediaSort] = [POPULARITY_DESC]) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, isAdult: $isAdult, sort: $sort) { id idMal status(version: 2) title { userPreferred romaji english native } trailer { id site thumbnail } format genres bannerImage description coverImage { extraLarge large medium color } episodes meanScore duration season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
export const anilistGenresQuery = (genres: string[], page: number = 1, perPage: number = 20) =>
  `query ($genres: [String] = ${JSON.stringify(
    genres
  )}, $page: Int = ${page}, $type: MediaType = ANIME, $isAdult: Boolean = false, $size: Int = ${perPage}) {Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(type: $type, isAdult: $isAdult, genre_in: $genres) { id idMal status(version: 2) title { userPreferred romaji english native } trailer { id site thumbnail } format bannerImage description coverImage { extraLarge large medium color } episodes meanScore duration season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
export const anilistAiringScheduleQuery = (
  page: number = 1,
  perPage: number = 20,
  weekStart: number,
  weekEnd: number,
  notYetAired: boolean
) =>
  `query { Page(page: ${page}, perPage: ${perPage}) { pageInfo { total perPage currentPage lastPage hasNextPage } airingSchedules( notYetAired: ${notYetAired}, airingAt_greater: ${weekStart}, airingAt_lesser: ${weekEnd}) { airingAt episode media { id description idMal title { romaji english userPreferred native } countryOfOrigin bannerImage coverImage { extraLarge large medium color } genres averageScore seasonYear format } } } }`;
export const anilistSiteStatisticsQuery = () => `query { SiteStatistics { anime { nodes { count } } } }`;
export const kitsuSearchQuery = (query: string) =>
  `query{searchAnimeByTitle(first:5, title:"${query}"){ nodes {id season startDate titles { localized } episodes(first: 2000){ nodes { number titles { canonical } description thumbnail { original { url } } } } } } }`;
