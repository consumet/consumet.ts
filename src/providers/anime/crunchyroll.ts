import axios from 'axios';

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
} from '../../models';
import { USER_AGENT } from '../../utils';

class Crunchyroll extends AnimeParser {
  override readonly name = 'Crunchyroll';
  protected override baseUrl = 'https://api.kamyroll.tech';
  protected override logo =
    'https://user-images.githubusercontent.com/65111632/95666535-4f6dba80-0ba6-11eb-8583-e3a2074590e9.png';
  protected override classPath = 'ANIME.Crunchyroll';

  private locale = 'en-US';
  private channelId = 'crunchyroll';
  private TOKEN: string | undefined = undefined;

  private options = {
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + this.TOKEN,
    },
  };
  private locales = [
    '[ar-ME] Arabic',
    '[ar-SA] Arabic (Saudi Arabia)',
    '[de-DE] German',
    '[en-US] English',
    '[es-419] Spanish (Latin America)',
    '[es-ES] Spanish (Spain)',
    '[fr-FR] French',
    '[he-IL] Hebrew',
    '[it-IT] Italian',
    '[pt-BR] Portuguese (Brazil)',
    '[pt-PT] Portuguese (Portugal)',
    '[pl-PL] Polish',
    '[ru-RU] Russian',
    '[ro-RO] Romanian',
    '[sv-SE] Swedish',
    '[tr-TR] Turkish',
    '[uk-UK] Ukrainian',
    '[zh-CN] Chinese (Simplified)',
    '[zh-TW] Chinese (Traditional)',
  ];

  private subOrder = [
    'Subbed',
    'English Dub',
    'German Dub',
    'French Dub',
    'Spanish Dub',
    'Italian Dub',
    'Portuguese Dub',
  ];

  async fetch(locale?: string, token?: string, accessToken?: string) {
    let data = undefined;
    if (!token && accessToken) {
      data = await axios.post(
        `${this.baseUrl}/auth/v1/token`,
        new URLSearchParams({
          device_id: 'whatvalueshouldbeforweb',
          device_type: 'com.service.data',
          access_token: accessToken,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }

    if (locale && !this.locales.find(l => l.includes(locale))) throw new Error('Invalid locale');
    else this.locale = locale || this.locale;
    if (locale) this.locale = locale;
    if (token) this.TOKEN = token;

    if (data) return data.data.access_token;
    else return token;
  }

  /**
   *
   * @param locale Locale (default: en-US) (ar-ME, ar-SA, de-DE, en-US, es-419, es-ES, fr-FR, he-IL, it-IT, pt-BR, pl-PL, ru-RU, tr-TR)
   * @param token Token
   * @param accessToken Access Token
   */
  static async create(locale?: string, token?: string, accessToken?: string) {
    const instance = new Crunchyroll();
    const data = await instance.fetch(locale, token, accessToken);
    instance.TOKEN = data;
    instance.options.headers.Authorization = 'Bearer ' + instance.TOKEN;
    return instance;
  }

  /**
   * @param query Search query
   * @param limit Limit of results (default: 25) (max: 100)
   */
  override search = async (query: string, limit: number = 25): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/content/v1/search?query=${query}&limit=${limit}&channel_id=${this.channelId}&locale=${this.locale}`,
        this.options
      );

      const list = data.items.map((item: any) => item.items).flat();

      return {
        totalResults: list.length,
        results: list.map(
          (item: any): IAnimeResult => ({
            id: item.id,
            title: item.title,
            slug: item.slug_title,
            description: item.description,
            cover: item.images.poster_wide[item.images.poster_wide.length - 1].source,
            image: item.images.poster_tall[item.images.poster_tall.length - 1].source,
            type: item.media_type.replace('_listing', ''),
            isNew: item.new,
            ageRating:
              item.media_type == 'series'
                ? item.series_metadata?.maturity_ratings
                : item.movie_listing_metadata?.maturity_ratings,
            isDubbed:
              item.media_type == 'series'
                ? item.series_metadata?.is_dubbed
                : item.movie_listing_metadata?.is_dubbed,
            isAdult:
              item.media_type == 'series'
                ? item.series_metadata?.is_mature
                : item.movie_listing_metadata?.is_mature,
            isSubbed:
              item.media_type == 'series'
                ? item.series_metadata?.is_subbed
                : item.movie_listing_metadata?.is_subbed,
            totalEpisodes: item.media_type == 'series' ? item.series_metadata?.episode_count : undefined,
            totalSeasons: item.media_type == 'series' ? item.series_metadata?.season_count : undefined,
          })
        ),
      };
    } catch (error) {
      throw new Error("Couldn't fetch data from Crunchyroll");
    }
  };

  /**
   * @param id Anime id
   * @param mediaType Anime type (series, movie)
   */
  override fetchAnimeInfo = async (id: string, mediaType: string): Promise<IAnimeInfo> => {
    if (mediaType == 'series') {
      const { data } = await axios.get(
        `${this.baseUrl}/content/v1/seasons?id=${id}&channel_id=${this.channelId}&locale=${this.locale}`,
        this.options
      );

      const items = data.items.map((item: any) => item.episodes).flat();

      const regx_extract = /\(([^\)]+)\)[^\(]*$/gm;
      const episodes = items
        .map((ep: any) => ({
          id: ep.id,
          number: ep.episode_number,
          type: !ep.season_title.match(regx_extract)
            ? 'Subbed'
            : ep.season_title.match(regx_extract)[0].replace('(', '').replace(')', ''),
          title: ep.title,
          slug: ep.slug_title,
          image: ep.images.thumbnail[ep.images.thumbnail.length - 1].source,
          description: ep.description,
          releaseDate: ep.episode_air_date,
          isHD: ep.hd_flag,
          isAdult: ep.is_mature,
          isDubbed: ep.is_dubbed,
          isSubbed: ep.is_subbed,
          duration: ep.duration_ms,
        }))
        .sort((ep1: any, ep2: any) => {
          if (ep1.type == ep2.type) return 0;
          return this.subOrder.indexOf(ep1.type) > this.subOrder.indexOf(ep2.type) ? 1 : -1;
        });

      return {
        id: id,
        title: data.items[0].title,
        slug: data.items[0].slug_title,
        description: data.items[0].description,
        subOrDub: SubOrSub.BOTH,
        episodes: episodes,
      };
    } else {
      const { data } = await axios.get(
        `${this.baseUrl}/content/v1/movies?id=${id}&channel_id=${this.channelId}&locale=${this.locale}`,
        this.options
      );

      const episode = data.items.map(
        (item: any): IAnimeEpisode => ({
          id: item.id,
          number: 1,
          title: item.title,
          slug: item.slug_title,
          description: item.description,
          image: item.images.poster_wide[item.images.thumbnail.length - 1].source,
        })
      );

      return {
        id: id,
        title: data.items[0].title,
        slug: data.items[0].slug_title,
        description: data.items[0].description,
        cover: data.items[0].images.poster_wide[data.items[0].images.thumbnail.length - 1].source,
        image: data.items[0].images.poster_wide[data.items[0].images.thumbnail.length - 1].source,
        episodes: episode,
      };
    }
  };

  /**
   *
   * @param episodeId Episode id
   * @param format subtitle format (default: `srt`) (srt, vtt, ass)
   * @param type Video type (default: `adaptive_hls` (m3u8)) `adaptive_dash` (dash), `drm_adaptive_dash` (dash with drm)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    format: string = 'vtt',
    type: string = 'adaptive_hls'
  ): Promise<ISource> => {
    const { data } = await axios.get(
      `${this.baseUrl}/videos/v1/streams?id=${episodeId}&channel_id=${this.channelId}&format=${format}&type=${type}`,
      this.options
    );
    data.subtitles = data.subtitles.sort((a: any, b: any) => {
      if (a.locale == b.locale) return 0;
      return this.locales.findIndex(l => l.includes(a.locale)) >
        this.locales.findIndex(l => l.includes(b.locale))
        ? 1
        : -1;
    });

    //TODO: Add hardcoded subtitles for all languages
    return {
      subtitles: data.subtitles.map(
        (sub: any): ISubtitle => ({
          lang: this.locales.find(l => l.includes(sub.locale)) || sub.locale,
          url: sub.url,
        })
      ),
      sources: [
        {
          isM3U8: type == 'adaptive_hls',
          url: data.streams[data.streams.length - 1].url,
        },
      ],
    };
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

// (async () => {
//   const anime = await Crunchyroll.create('fr-FRs', 'O+xmBPFx1UxoAiQYjDc9YYq01SdCZo1ABBoHDrNuIScEIKmYfIZoj57l1xeoLWGW3R2ZlxPlyqUf5R3hWzx+xSQnmPyk3GoUIFF19P0oCqp2B9ivNhtYiqir06rBK71mRzIjVUCmN3C7MvQUhH82QQWAvxsvkZ0hfhr4fY/NYzY=');
//   const search = await anime.search('classroom of the elite season 2');
//   const res = await anime.fetchAnimeInfo(search.results[0].id, search.results[0].type!);
//   const sources = await anime.fetchEpisodeSources(res.episodes![res.episodes?.length! - 1].id);
//   console.log(sources);
// })();
export default Crunchyroll;
