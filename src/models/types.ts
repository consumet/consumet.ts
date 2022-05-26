export interface IProviderStats {
  name: string;
  baseUrl: string;
  lang: string[] | string;
  isNSFW: boolean;
}

export interface IAnimeSearch {
  animeId: string;
  animeTitle: string;
  animeUrl: string;
  animeImage?: string;
  animeReleaseDate?: string;
  [x: string]: unknown; // other fields
}
