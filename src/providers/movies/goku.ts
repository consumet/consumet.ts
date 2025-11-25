import { load } from 'cheerio';

import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  StreamingServers,
  ISource,
  IMovieResult,
  ISearch,
  IMovieEpisode,
} from '../../models';
import { MixDrop, VidCloud } from '../../extractors';

class Goku extends MovieParser {
  override readonly name = 'Goku';
  protected override baseUrl = 'https://goku.sx';
  protected override logo =
    'https://img.goku.sx/xxrz/400x400/100/9c/e7/9ce7510639c4204bfe43904fad8f361f/9ce7510639c4204bfe43904fad8f361f.png';
  protected override classPath = 'MOVIES.Goku';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  /**
   * Search for movies or TV shows
   * @param query search query string
   * @param page page number (default 1)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    try {
      const sanitizedQuery = query.replace(/[\W_]+/g, '-');
      const { data } = await this.client.get(`${this.baseUrl}/search?keyword=${sanitizedQuery}&page=${page}`);
      const $ = load(data);

      const searchResult: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: $('.page-link').length > 0 && $('.page-link').last().attr('title') === 'Last',
        results: [],
      };

      $('div.section-items > div.item').each((_, el) => {
        const $el = $(el);
        const releaseDate = $el.find('div.movie-info div.info-split > div:nth-child(1)').text();
        const rating = $el.find('div.movie-info div.info-split div.is-rated').text();
        const href = $el.find('.is-watch > a').attr('href');

        searchResult.results.push({
          id: href?.replace('/', '') ?? '',
          title: $el.find('div.movie-info h3.movie-name').text(),
          url: `${this.baseUrl}${href}`,
          image: $el.find('div.movie-thumbnail > a > img').attr('src'),
          releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
          rating: isNaN(parseFloat(rating)) ? undefined : parseFloat(rating),
          type: href?.includes('watch-series') ? TvType.TVSERIES : TvType.MOVIE,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch detailed media information
   * @param mediaId media link or id
   */
  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    const cleanId = mediaId.startsWith(this.baseUrl) ? mediaId.replace(this.baseUrl + '/', '') : mediaId;

    try {
      const { data } = await this.client.get(`${this.baseUrl}/${cleanId}`);
      const $ = load(data);

      const mediaType: TvType = cleanId.includes('watch-series') ? TvType.TVSERIES : TvType.MOVIE;

      const movieInfo: IMovieInfo = {
        id: cleanId,
        title: $('div.movie-detail > div.is-name > h3').text(),
        url: `${this.baseUrl}/${cleanId}`,
        image: $('.movie-thumbnail > img').attr('src'),
        description: $('.is-description > .text-cut').text(),
        type: mediaType,
        genres: $("div.name:contains('Genres:')")
          .siblings()
          .find('a')
          .map((_, el) => $(el).text())
          .get(),
        casts: $("div.name:contains('Cast:')")
          .siblings()
          .find('a')
          .map((_, el) => $(el).text())
          .get(),
        production: $("div.name:contains('Production:')")
          .siblings()
          .find('a')
          .map((_, el) => $(el).text())
          .get()
          .join(),
        duration: $("div.name:contains('Duration:')").siblings().text().split('\n').join('').trim(),
      };

      // Fetch episodes
      if (mediaType === TvType.TVSERIES) {
        movieInfo.episodes = await this.fetchTvSeriesEpisodes(cleanId);
      } else {
        movieInfo.episodes = [];
        $('meta').each((_, el) => {
          const $el = $(el);
          if ($el.attr('property') === 'og:url') {
            movieInfo.episodes?.push({
              id: $el.attr('content')?.split('/').pop() ?? '',
              title: movieInfo.title.toString(),
              url: $el.attr('content'),
            });
          }
        });
      }

      return movieInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch available episode servers
   * @param episodeId episode link or movie id
   * @param mediaId movie link or id
   */
  override fetchEpisodeServers = async (episodeId: string, mediaId: string): Promise<IEpisodeServer[]> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/episode/servers/${episodeId}`);
      const $ = load(data);

      const servers = $('.dropdown-menu > a')
        .map((_, el) => {
          const $el = $(el);
          return {
            name: $el.text(),
            id: $el.attr('data-id') ?? '',
          };
        })
        .get();

      const episodeServers: IEpisodeServer[] = [];

      for (const server of servers) {
        const { data } = await this.client.get(
          `${this.baseUrl}/ajax/movie/episode/server/sources/${server.id}`
        );

        episodeServers.push({
          name: server.name,
          url: data.data.link,
        });
      }

      return episodeServers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch episode sources from a specific server
   * @param episodeId episode id or URL
   * @param mediaId media id
   * @param server streaming server type (default UpCloud)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    mediaId: string,
    server: StreamingServers = StreamingServers.UpCloud
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);

      switch (server) {
        case StreamingServers.MixDrop:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
          };

        case StreamingServers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new VidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
          };

        case StreamingServers.UpCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new VidCloud(this.proxyConfig, this.adapter).extract(serverUrl)),
          };

        default:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
          };
      }
    }

    try {
      const servers = await this.fetchEpisodeServers(episodeId, mediaId);
      const selectedServer = servers.find(s => s.name.toLowerCase() === server.toLowerCase());

      if (!selectedServer) {
        throw new Error(`Server ${server} not found`);
      }

      return await this.fetchEpisodeSources(selectedServer.url, mediaId, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch recent movies
   */
  fetchRecentMovies = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('.section-last', true);
  };

  /**
   * Fetch recent TV shows
   */
  fetchRecentTvShows = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('.section-last', false, true);
  };

  /**
   * Fetch trending movies
   */
  fetchTrendingMovies = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('#trending-movies', true);
  };

  /**
   * Fetch trending TV shows
   */
  fetchTrendingTvShows = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('#trending-series', false, true);
  };

  /**
   * Fetch content by country
   * @param country country name
   * @param page page number (default 1)
   */
  fetchByCountry = async (country: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    return this.fetchByFilter('country', country, page);
  };

  /**
   * Fetch content by genre
   * @param genre genre name
   * @param page page number (default 1)
   */
  fetchByGenre = async (genre: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    return this.fetchByFilter('genre', genre, page);
  };

  /**
   * Fetch TV series episodes for all seasons
   * @param mediaId media unique identifier
   */
  private async fetchTvSeriesEpisodes(mediaId: string): Promise<IMovieEpisode[]> {
    const { data } = await this.client.get(`${this.baseUrl}/ajax/movie/seasons/${mediaId.split('-').pop()}`);
    const $ = load(data);

    const seasonIds = $('.dropdown-menu > a')
      .map((_, el) => {
        const $el = $(el);
        const seasonText = $el.text().replace('Season', '').trim();
        return {
          id: $el.attr('data-id'),
          season: isNaN(parseInt(seasonText)) ? undefined : parseInt(seasonText),
        };
      })
      .get();

    const episodes: IMovieEpisode[] = [];

    for (const season of seasonIds) {
      const { data: seasonData } = await this.client.get(
        `${this.baseUrl}/ajax/movie/season/episodes/${season.id}`
      );
      const $$ = load(seasonData);

      $$('.item').each((_, el) => {
        const $$el = $$(el);
        const episodeText = $$el.find('a').text()?.split(':')[0].trim().substring(3) ?? '';

        episodes.push({
          id: $$el.find('a').attr('data-id') ?? '',
          title: $$el.find('a').attr('title') ?? '',
          number: parseInt(episodeText),
          season: season.season,
          url: $$el.find('a').attr('href'),
        });
      });
    }

    return episodes;
  }

  /**
   * Fetch content from home page by section
   * @param selector CSS selector for section
   * @param isMovie whether content is movies
   * @param useLast whether to use last() selector
   */
  private async fetchHomeSection(
    selector: string,
    isMovie: boolean = false,
    useLast: boolean = false
  ): Promise<IMovieResult[]> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      let section = $(selector);
      if (useLast) {
        section = section.last();
      } else if (selector === '.section-last' && isMovie) {
        section = section.first();
      }

      return section
        .find('.item')
        .map((_, el) => {
          const $el = $(el);
          const href = $el.find('.is-watch > a').attr('href');
          const result: any = {
            id: href?.replace('/', '')!,
            title: $el.find('.movie-name').text(),
            url: `${this.baseUrl}${href}`,
            image: $el.find('.movie-thumbnail > a > img').attr('src'),
            type: href?.includes(isMovie ? 'watch-movie' : 'watch-series')
              ? isMovie
                ? TvType.MOVIE
                : TvType.TVSERIES
              : isMovie
              ? TvType.MOVIE
              : TvType.TVSERIES,
          };

          if (isMovie) {
            const releaseDate = $el.find('.info-split').children().first().text();
            result.releaseDate = isNaN(parseInt(releaseDate)) ? undefined : releaseDate;
            result.duration = $el.find('.info-split > div:nth-child(3)').text();
          } else {
            const seasonEpisode = $el.find('.info-split > div:nth-child(2)').text();
            const parts = seasonEpisode.split('/');
            result.season = parts[0]?.trim();
            result.latestEpisode = parts[1]?.trim();
          }

          return result;
        })
        .get();
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Fetch content by filter (genre or country)
   * @param filterType filter type (genre or country)
   * @param filterValue filter value
   * @param page page number
   */
  private async fetchByFilter(
    filterType: 'genre' | 'country',
    filterValue: string,
    page: number
  ): Promise<ISearch<IMovieResult>> {
    try {
      const url =
        filterType === 'country'
          ? `${this.baseUrl}/country/${filterValue}/?page=${page}`
          : `${this.baseUrl}/genre/${filterValue}?page=${page}`;

      const { data } = await this.client.get(url);
      const $ = load(data);

      const result: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: $('.page-link').length > 0 && $('.page-link').last().attr('title') === 'Last',
        results: [],
      };

      $('div.section-items.section-items-default > div.item').each((_, el) => {
        const $el = $(el);
        const href = $el.find('div.movie-info > a').attr('href');
        const mediaType = href?.includes('movie/') ? TvType.MOVIE : TvType.TVSERIES;

        const resultItem: IMovieResult = {
          id: $el.find('div.movie-thumbnail > a').attr('href')?.slice(1) ?? '',
          title: $el.find('div.movie-info > a > h3.movie-name').text().trim(),
          url: `${this.baseUrl}${href}`,
          image: $el.find('div.movie-thumbnail > a > img').attr('src'),
          type: mediaType,
        };

        if (mediaType === TvType.TVSERIES) {
          const seasonEpisode = $el.find('div.movie-info > div.info-split > div:nth-child(2)').text();
          const parts = seasonEpisode.split('/');
          resultItem.season = parts[0]?.trim();
          resultItem.latestEpisode = parts[1]?.trim();
        } else {
          resultItem.releaseDate = $el.find('div.movie-info > div.info-split > div:nth-child(1)').text();
          resultItem.duration = $el.find('div.movie-info > div.info-split > div:nth-child(3)').text();
        }

        result.results.push(resultItem);
      });

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

export default Goku;
