import axios from 'axios';
import { replaceElement } from 'domutils';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
  ISubtitle,
  SubOrSub,
  Genres,
} from '../../models';
import { USER_AGENT } from '../../utils';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  country: string;
  account_id: string;
  signature: string;
  key_pair_id: string;
  bucket: string;
  policy: string;
}

export interface EpisodeData {
  id: string;
  number: number;
  title?: string;
  animeTitle?: string;
  description?: string;
  image?: string;
  releaseDate?: string;
  streamData?: StreamData;
  [x: string]: unknown; // other fields
}

export interface StreamData {
  sources?: Source[];
  subtitles?: Subtitle[];
}

export interface Source {
  url: string;
  quality: string;
}

export interface Subtitle {
  url: string;
  lang: string;
}

function getYear(isoTimeString: string) {
  const date = new Date(isoTimeString);
  const json = {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // getMonth returns a 0-based index, so we add 1
    day: date.getDate(),
  };
  return json;
}

class Crunchyroll extends AnimeParser {
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }

  override readonly name = 'Crunchyroll';
  protected override baseUrl = 'https://www.crunchyroll.com';
  protected override logo =
    'https://play-lh.googleusercontent.com/CjzbMcLbmTswzCGauGQExkFsSHvwjKEeWLbVVJx0B-J9G6OQ-UCl2eOuGBfaIozFqow';
  protected override classPath = 'ANIME.Crunchyroll';

  private locale = 'en-US';
  private channelId = 'crunchyroll';

  private languageNames = new Intl.DisplayNames(['en'], {
    type: 'language',
  });

  private subOrder = [
    'Subbed',
    'English Dub',
    'German Dub',
    'French Dub',
    'Spanish Dub',
    'Italian Dub',
    'Portuguese Dub',
  ];

  async search(query: string, locale: string = 'en-US'): Promise<unknown> {
    const data: any = await (
      await axios.get(`https://cronchy.consumet.stream/search/${query}?locale=${locale}`)
    ).data;

    return data;
  }

  /**
   * @param id Anime id
   * @param mediaType Anime type (series, movie)
   */
  //https://crunchy.consumet.org/info/id?type
  //https://crunchy.consumet.org/episodes/id?type
  override fetchAnimeInfo = async (
    id: string,
    mediaType: string,
    locale: string = 'en-US',
    fetchAllSeason: boolean = false
  ): Promise<IAnimeInfo> => {
    const data: IAnimeInfo = await (
      await axios.get(
        `https://cronchy.consumet.stream/info/${id}?type=${mediaType}&locale=${locale}&fetchAllSeasons=${fetchAllSeason}`
      )
    ).data;

    return data;
  };

  override fetchEpisodeSources = async (episodeId: string, locale: string = 'en-US'): Promise<ISource> => {
    const data: ISource = await (
      await axios.get(`https://cronchy.consumet.stream/episode/${episodeId}?locale=${locale}`)
    ).data;

    return data;
  };
}
export default Crunchyroll;
