import { load, CheerioAPI } from 'cheerio';

import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  StreamingServers,
  ISource,
  IMovieResult,
  ISearch,
} from '../../models';
import { MixDrop, VidCloud } from '../../extractors';

class FlixHQ extends MovieParser {
  override readonly name = 'FlixHQ';
  protected override baseUrl = 'https://flixhq.to';
  protected override logo = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png';
  protected override classPath = 'MOVIES.FlixHQ';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  private static readonly NAV_SELECTOR =
    'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';

  /**
   * Search for movies or TV shows
   * @param query search query string
   * @param page page number (default 1)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    try {
      const sanitizedQuery = query.replace(/[\W_]+/g, '-');
      const { data } = await this.client.get(`${this.baseUrl}/search/${sanitizedQuery}?page=${page}`);

      const $ = load(data);
      const searchResult: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: false,
        results: [],
      };

      searchResult.hasNextPage =
        $(FlixHQ.NAV_SELECTOR).length > 0 && !$(FlixHQ.NAV_SELECTOR).children().last().hasClass('active');

      $('.film_list-wrap > div.flw-item').each((_, el) => {
        const $el = $(el);
        const releaseDate = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();

        searchResult.results.push({
          id: $el.find('div.film-poster > a').attr('href')?.slice(1)!,
          title: $el.find('div.film-detail > h2 > a').attr('title')!,
          url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
          image: $el.find('div.film-poster > img').attr('data-src'),
          releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
          seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
          type: this.parseMediaType($el.find('div.film-detail > div.fd-infor > span.float-right').text()),
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
    if (!mediaId.startsWith(this.baseUrl)) {
      mediaId = `${this.baseUrl}/${mediaId}`;
    }

    const movieInfo: IMovieInfo = {
      id: mediaId.split('to/').pop()!,
      title: '',
      url: mediaId,
    };
    try {
      const { data } = await this.client.get(mediaId);
      const $ = load(data);
      const recommendationsArray: IMovieResult[] = [];

      $(
        'div.movie_information > div.container > div.m_i-related > div.film-related > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item'
      ).each((i, el) => {
        recommendationsArray.push({
          id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
          title: $(el).find('div.film-detail > h3.film-name > a').text(),
          image: $(el).find('div.film-poster > img').attr('data-src'),
          duration:
            $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text().replace('m', '') ?? null,
          type:
            $(el).find('div.film-detail > div.fd-infor > span.fdi-type').text().toLowerCase() === 'tv'
              ? TvType.TVSERIES
              : TvType.MOVIE ?? null,
        });
      });

      const uid = $('.watch_block').attr('data-id')!;
      movieInfo.cover = $('div.w_b-cover').attr('style')?.slice(22).replace(')', '').replace(';', '');
      movieInfo.title = $('.heading-name > a:nth-child(1)').text();
      movieInfo.image = $('.m_i-d-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
      movieInfo.description = $('.description').text();
      movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? TvType.TVSERIES : TvType.MOVIE;
      movieInfo.releaseDate = $('div.row-line:nth-child(3)').text().replace('Released: ', '').trim();
      movieInfo.genres = $('div.row-line:nth-child(2) > a')
        .map((i, el) => $(el).text().split('&'))
        .get()
        .map(v => v.trim());
      movieInfo.casts = $('div.row-line:nth-child(5) > a')
        .map((i, el) => $(el).text())
        .get();
      movieInfo.tags = $('div.row-line:nth-child(6) > h2')
        .map((i, el) => $(el).text())
        .get();
      movieInfo.production = $('div.row-line:nth-child(4) > a:nth-child(2)').text();
      movieInfo.country = $('div.row-line:nth-child(1) > a:nth-child(2)').text();
      movieInfo.duration = $('span.item:nth-child(3)').text();
      movieInfo.rating = parseFloat($('span.item:nth-child(2)').text());
      movieInfo.recommendations = recommendationsArray as any;
      const ajaxReqUrl = (id: string, type: string, isSeasons: boolean = false) =>
        `${this.baseUrl}/ajax/${type === 'movie' ? type : `v2/${type}`}/${
          isSeasons ? 'seasons' : 'episodes'
        }/${id}`;

      if (movieInfo.type === TvType.TVSERIES) {
        const { data } = await this.client.get(ajaxReqUrl(uid, 'tv', true));
        const $$ = load(data);
        const seasonsIds = $$('.dropdown-menu > a')
          .map((i, el) => $(el).attr('data-id'))
          .get();

        movieInfo.episodes = [];
        let season = 1;
        for (const id of seasonsIds) {
          const { data } = await this.client.get(ajaxReqUrl(id, 'season'));
          const $$$ = load(data);

          $$$('.nav > li')
            .map((i, el) => {
              const episode = {
                id: $$$(el).find('a').attr('id')!.split('-')[1],
                title: $$$(el).find('a').attr('title')!,
                number: parseInt($$$(el).find('a').attr('title')!.split(':')[0].slice(3).trim()),
                season: season,
                url: `${this.baseUrl}/ajax/v2/episode/servers/${$$$(el).find('a').attr('id')!.split('-')[1]}`,
              };
              movieInfo.episodes?.push(episode);
            })
            .get();
          season++;
        }
      } else {
        movieInfo.episodes = [
          {
            id: uid,
            title: movieInfo.title,
            url: `${this.baseUrl}/ajax/movie/episodes/${uid}`,
          },
        ];
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
    const isMovie = mediaId.includes('movie');

    const serverUrl = isMovie
      ? `${this.baseUrl}/ajax/movie/episodes/${episodeId}`
      : episodeId.startsWith(this.baseUrl + '/ajax')
      ? episodeId
      : `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;

    try {
      const { data } = await this.client.get(serverUrl);
      const $ = load(data);

      const servers = $('.nav > li')
        .map((_, el) => {
          const $el = $(el);
          const title = $el.find('a').attr('title')!;
          const dataId = isMovie ? $el.find('a').attr('data-linkid') : $el.find('a').attr('data-id');
          const urlPattern = isMovie ? /\/movie\// : /\/tv\//;
          const replacement = isMovie ? '/watch-movie/' : '/watch-tv/';

          return {
            name: isMovie ? title.toLowerCase() : title.slice(6).trim().toLowerCase(),
            url: `${this.baseUrl}/${mediaId}.${dataId}`.replace(urlPattern, replacement),
            id: dataId,
          };
        })
        .get();

      return servers;
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
            ...(await new VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, this.baseUrl)),
          };
        case StreamingServers.UpCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, this.baseUrl)),
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

      const i = servers.findIndex(s => s.name === server);

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const { data } = await this.client.get(
        `${this.baseUrl}/ajax/episode/sources/${servers[i].url.split('.').slice(-1).shift()}`
      );

      const serverUrl: URL = new URL(data.link);

      return await this.fetchEpisodeSources(serverUrl.href, mediaId, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch recent movies
   */
  fetchRecentMovies = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('Latest Movies');
  };

  /**
   * Fetch recent TV shows
   */
  fetchRecentTvShows = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSection('Latest TV Shows', true);
  };

  /**
   * Fetch trending movies
   */
  fetchTrendingMovies = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSectionById('trending-movies');
  };

  /**
   * Fetch trending TV shows
   */
  fetchTrendingTvShows = async (): Promise<IMovieResult[]> => {
    return this.fetchHomeSectionById('trending-tv', true);
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
   * Fetch spotlight/featured content
   */
  fetchSpotlight = async (): Promise<ISearch<IMovieResult>> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const results: ISearch<IMovieResult> = { results: [] };

      $('div.swiper-slide').each((_, el) => {
        const $el = $(el);
        const href = $el.find('a').attr('href');

        results.results.push({
          id: href?.slice(1)!,
          title: $el.find('a').attr('title')!,
          url: `${this.baseUrl}${href}`,
          cover: $el
            ?.css('background-image')
            ?.replace(/url\(["']?(.+?)["']?\)/, '$1')
            .trim(),
          duration: $el.find('.scd-item:contains("Duration") strong').text().trim(),
          rating: $el.find('.scd-item:contains("IMDB") strong').text().trim(),
          genres: $el
            .find('.scd-item:contains("Genre") .slide-genre-item')
            .map((_, el) => $(el).text().trim())
            .get(),
          description: $el.find('.sc-desc').text().trim(),
          type: href?.split('/')[1] === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
        });
      });

      return results;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * Fetch content from home page by section title
   * @param sectionTitle section title to search for
   * @param isTvShow whether content is TV shows
   */
  private async fetchHomeSection(sectionTitle: string, isTvShow: boolean = false): Promise<IMovieResult[]> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const results = $(
        `section.block_area:contains("${sectionTitle}") > div:nth-child(2) > div:nth-child(1) > div.flw-item`
      )
        .map((_, el) => {
          const $el = $(el);
          const firstSpan = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
          const result: any = {
            id: $el.find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $el.find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
            image: $el.find('div.film-poster > img').attr('data-src'),
            type: this.parseMediaType($el.find('div.film-detail > div.fd-infor > span.float-right').text()),
          };

          if (isTvShow) {
            result.season = firstSpan;
            result.latestEpisode =
              $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text() || null;
          } else {
            result.releaseDate = isNaN(parseInt(firstSpan)) ? undefined : firstSpan;
            result.duration = $el.find('div.film-detail > div.fd-infor > span.fdi-duration').text() || null;
          }

          return result;
        })
        .get();

      return results;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Fetch content from home page by div ID
   * @param divId div ID to search for
   * @param isTvShow whether content is TV shows
   */
  private async fetchHomeSectionById(divId: string, isTvShow: boolean = false): Promise<IMovieResult[]> {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const results = $(`div#${divId} div.film_list-wrap div.flw-item`)
        .map((_, el) => {
          const $el = $(el);
          const firstSpan = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
          const result: any = {
            id: $el.find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $el.find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
            image: $el.find('div.film-poster > img').attr('data-src'),
            type: this.parseMediaType($el.find('div.film-detail > div.fd-infor > span.float-right').text()),
          };

          if (isTvShow) {
            result.season = firstSpan;
            result.latestEpisode =
              $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text() || null;
          } else {
            result.releaseDate = isNaN(parseInt(firstSpan)) ? undefined : firstSpan;
            result.duration = $el.find('div.film-detail > div.fd-infor > span.fdi-duration').text() || null;
          }

          return result;
        })
        .get();

      return results;
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
      const { data } = await this.client.get(`${this.baseUrl}/${filterType}/${filterValue}?page=${page}`);
      const $ = load(data);

      const result: ISearch<IMovieResult> = {
        currentPage: page,
        hasNextPage: false,
        results: [],
      };

      result.hasNextPage =
        $(FlixHQ.NAV_SELECTOR).length > 0 && !$(FlixHQ.NAV_SELECTOR).children().last().hasClass('active');

      const selector =
        filterType === 'country'
          ? 'div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item'
          : '.film_list-wrap > div.flw-item';

      $(selector).each((_, el) => {
        const $el = $(el);
        const season = $el.find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
        const latestEpisode = $el.find('div.film-detail > div.fd-infor > span:nth-child(3)').text() || null;
        const type = this.parseMediaType(
          $el.find('div.film-detail > div.fd-infor > span.float-right').text()
        );

        const resultItem: IMovieResult = {
          id: $el.find('div.film-poster > a').attr('href')?.slice(1) ?? '',
          title: $el.find('div.film-detail > h2 > a, div.film-detail > h2.film-name > a').attr('title') ?? '',
          url: `${this.baseUrl}${$el.find('div.film-poster > a').attr('href')}`,
          image: $el.find('div.film-poster > img').attr('data-src'),
          type,
        };

        if (type === TvType.TVSERIES) {
          resultItem.season = season;
          resultItem.latestEpisode = latestEpisode;
        } else {
          resultItem.releaseDate = season;
          resultItem.duration = latestEpisode;
        }

        result.results.push(resultItem);
      });

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Parse media type from text
   * @param typeText type text to parse
   */
  private parseMediaType(typeText: string): TvType {
    return typeText === 'Movie' ? TvType.MOVIE : TvType.TVSERIES;
  }
}

export default FlixHQ;
