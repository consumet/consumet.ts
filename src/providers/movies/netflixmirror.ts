import { load } from 'cheerio';
import {
  MovieParser,
  TvType,
  type IMovieInfo,
  type IEpisodeServer,
  type ISource,
  type IMovieResult,
  type ISearch,
  type IMovieEpisode,
} from '../../models';

class NetflixMirror extends MovieParser {
  override readonly name = 'NetflixMirror';
  protected override baseUrl = 'https://netfree2.cc';
  protected override logo = 'https://netfree2.cc//mobile/img/nf2/icon_x192.png';
  protected override classPath = 'MOVIES.NetflixMirror';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);
  private nfCookie: null | string = 'hd=on;';

  constructor(customBaseURL?: string) {
    super(...arguments);
    if (customBaseURL) {
      if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
        this.baseUrl = customBaseURL;
      } else {
        this.baseUrl = `http://${customBaseURL}`;
      }
    } else {
      this.baseUrl = this.baseUrl;
    }
    this.initCookie();
  }

  private async initCookie(): Promise<void> {
    try {
      const { data } = await this.client.get(
        'https://raw.githubusercontent.com/2004durgesh/nfmirror-cookies/refs/heads/main/captured-cookies.json'
      );
      for (const cookie of data.cookiesByDomain['.netfree2.cc']) {
        this.nfCookie += `${cookie.name}=${cookie.value.replace('%3A%3Asu', '%3A%3Ani')};`;
      }
    } catch (err) {
      console.error('Failed to get cookie:', err);
    }
  }

  private Headers() {
    const headers: Record<string, string> = {
      authority: 'netfree2.cc',
      accept: 'application/json, text/javascript, */*; q=0.01',
      'sec-ch-ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      Referer: `${this.baseUrl}/mobile/home`,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    };

    if (this.nfCookie) {
      headers.Cookie = this.nfCookie || '';
    }

    return headers;
  }

  /**
   *
   * @param query search query string
   * @param page page number (default 1) (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    const searchResult: ISearch<IMovieResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      const { data } = await this.client.get(
        `https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${
          this.baseUrl
        }/mobile/search.php?s=${encodeURI(query)}`,
        {
          headers: this.Headers(),
        }
      );

      const basicResults = data.searchResult || [];

      if (basicResults.length === 0) {
        return searchResult;
      }
      const detailedResults = await Promise.all(
        basicResults.map(async (item: any) => {
          try {
            // Fetch additional details for each item
            const detailResponse = await this.client.get(
              `https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/post.php?id=${item.id}`,
              {
                headers: this.Headers(),
              }
            );

            return {
              id: item.id,
              title: item.t,
              image: `https://imgcdn.media/poster/v/${item.id}.jpg`,
              type: detailResponse.data.type === 't' ? TvType.TVSERIES : TvType.MOVIE,
              releaseDate: detailResponse.data.year,
              seasons: detailResponse.data.season?.length ?? undefined,
            };
          } catch (error) {
            // If we can't fetch details, just return the basic info
            console.error(`Error fetching details for ${item.id}:`, error);
            return {
              id: item.id,
              title: item.t,
              image: `https://imgcdn.media/poster/v/${item.id}.jpg`,
            };
          }
        })
      );

      searchResult.results = detailedResults;

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private async fetchAllEpisodesForSeason(seasonId: string, seriesId: string): Promise<IMovieEpisode[]> {
    let page = 1;
    let episodes: IMovieEpisode[] = [];

    while (true) {
      const url = `https://netfree2.cc/mobile/episodes.php?s=${seasonId}&series=${seriesId}&page=${page}`;
      const { data } = await this.client.get(url);

      if (data.episodes?.length) {
        episodes.push(
          ...data.episodes.map((episode: IMovieEpisode) => ({
            id: episode.id,
            title: episode.t as string,
            season: parseInt(String(episode.s).replace('S', '')),
            number: parseInt(String(episode.ep).replace('E', '')),
            image: `https://imgcdn.media/epimg/150/${episode.id}.jpg`,
          }))
        );
      }

      if (data.nextPageShow !== 1) break; // no more pages
      page++;
    }

    return episodes;
  }

  private async fetchAllEpisodesOrdered(seasons: any[], seriesId: string) {
    const allEpisodes: any[] = [];

    for (const season of seasons.sort((a, b) => Number(a.s) - Number(b.s))) {
      const seasonEpisodes = await this.fetchAllEpisodesForSeason(season.id, seriesId);
      allEpisodes.push(...seasonEpisodes);
    }

    return allEpisodes;
  }

  /**
   *
   * @param mediaId media link or id
   */
  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    const movieInfo: IMovieInfo = {
      id: mediaId!,
      title: '',
    };
    try {
      const { data } = await this.client.get(
        `https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/post.php?id=${mediaId}`,
        {
          headers: this.Headers(),
        }
      );

      movieInfo.cover = `https://imgcdn.media/poster/h/${mediaId}.jpg`;
      movieInfo.title = data.title;
      movieInfo.image = `https://imgcdn.media/poster/v/${mediaId}.jpg`;
      movieInfo.description = data.desc?.trim() ?? '';
      movieInfo.type = data.type === 't' ? TvType.TVSERIES : TvType.MOVIE;
      movieInfo.releaseDate = data.year;
      movieInfo.genres = data.genre?.split(',').map((genre: string) => genre?.trim()) ?? [];
      movieInfo.duration = data.runtime;
      if (movieInfo.type === TvType.TVSERIES) {
        movieInfo.episodes = await this.fetchAllEpisodesOrdered(data.season, mediaId);
      } else {
        movieInfo.episodes = [
          {
            id: mediaId,
            title: data.title,
            image: movieInfo.cover || movieInfo.image,
          },
        ];
      }
      return movieInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId episode id
   * @param media media id
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    mediaId?: string //just placeholder for compatibility with tmdb
  ): Promise<ISource> => {
    try {
      if (!this.nfCookie) {
        await this.initCookie();
      }

      const { data } = await this.client.get(
        `https://netmirror.8man.me/api/net-proxy?isPrime=false&url=${this.baseUrl}/mobile/playlist.php?id=${episodeId}`,
        {
          headers: this.Headers(),
        }
      );
      const sources: ISource = {
        sources: [],
        subtitles: [],
      };
      data[0].sources?.map((source: any) => {
        sources.sources.push({
          url: `${this.baseUrl}${source.file.replace(/%3A%3Asu/g, '%3A%3Ani').replace(/::su/g, '::ni')}`,
          quality:
            source.label === 'Auto' ? source.label.toLowerCase() : source.file.match(/[?&]q=([^&]+)/)?.[1],
          isM3U8: source.file.includes('.m3u8'),
        });
      });

      data[0].tracks?.map((subtitle: any) => {
        sources.subtitles = sources.subtitles || [];
        sources.subtitles.push({
          url: `https:${subtitle.file}`,
          lang: subtitle.label,
        });
      });

      return sources;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  /**
   * @deprecated method not implemented
   * @param episodeId takes episode link or movie id
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

// (async () => {
//   const movie = new NetflixMirror();
//   const search = await movie.search('one');
//   // const movieInfo = await movie.fetchMediaInfo(search.results[0]?.id);
//   // const sources = await movie.fetchEpisodeSources(movieInfo.episodes![0]?.id);
//   //   const server = await movie.fetchEpisodeServers(search.results[0]?.id);
//   // const recentTv = await movie.fetchPopular();
//   // const genre = await movie.fetchByGenre('action');
//   console.log(search);
// })();

export default NetflixMirror;
