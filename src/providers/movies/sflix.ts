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
} from '../../models';
import { MixDrop, VidCloud, Voe } from '../../extractors';

class SFlix extends MovieParser {
  override readonly name = 'SFlix';
  protected override baseUrl = 'https://sflix.to';
  protected override logo =
    'https://img.sflix.to/xxrz/100x100/100/a2/33/a233d4c4a1426ca77ec1d34deec62f71/a233d4c4a1426ca77ec1d34deec62f71.png';
  protected override classPath = 'MOVIES.SFlix';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

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
        `${this.baseUrl}/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`
      );

      const $ = load(data);

      const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';

      searchResult.hasNextPage =
        $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

      $('.film_list-wrap > div.flw-item').each((i, el) => {
        const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
        searchResult.results.push({
          id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
          title: $(el).find('div.film-detail > h2 > a').attr('title')!,
          url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
          image: $(el).find('div.film-poster > img').attr('data-src'),
          releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
          seasons: releaseDate.includes('SS') ? parseInt(releaseDate.split('SS')[1]) : undefined,
          type:
            $(el).find('div.film-detail > div.fd-infor > span:nth-child(2)').text() === 'Movie'
              ? TvType.MOVIE
              : TvType.TVSERIES,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
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
        'div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item'
      ).each((i, el) => {
        recommendationsArray.push({
          id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
          title: $(el).find('div.film-detail > h3.film-name > a').text(),
          image: $(el).find('div.film-poster > img').attr('data-src'),
          duration:
            $(el).find('div.film-detail > div.fd-infor > span.fdi-duration').text().replace('m', '') ?? null,
          type:
            $(el).find('div.film-detail > div.fd-infor > span.fdi-item').eq(1).text().trim().toLowerCase() ===
            'tv'
              ? TvType.TVSERIES
              : TvType.MOVIE ?? null,
        });
      });

      const uid = $('.detail_page-watch').attr('data-id')!;
      movieInfo.cover = $('.cover_follow').attr('style')?.slice(22).replace(')', '').replace(';', '');
      movieInfo.title = $('.heading-name > a:nth-child(1)').text();
      movieInfo.image = $('.dp-i-c-poster > div:nth-child(1) > img:nth-child(1)').attr('src');
      movieInfo.description = $('.description')
        .text()
        .replace(/^Overview:\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      movieInfo.type = movieInfo.id.split('/')[0] === 'tv' ? TvType.TVSERIES : TvType.MOVIE;
      movieInfo.releaseDate = $('div.row > div.col-xl-5 .row-line')
        .eq(0)
        .text()
        .replace('Released: ', '')
        .trim();
      movieInfo.genres = $('div.row >div.col-xl-5 .row-line')
        .eq(1)
        .find('a')
        .map((i, el) => $(el).text().split('&'))
        .get()
        .map(v => v.trim());
      movieInfo.casts = $('div.row > div.col-xl-5 .row-line')
        .eq(2)
        .find('a')
        .map((i, el) => $(el).text())
        .get();
      movieInfo.tags = $('div.row-tags > h2')
        .map((i, el) => $(el).text().replace(/\s+/g, ' ').trim())
        .get();
      movieInfo.production = $('div.row > div.col-xl-6 .row-line')
        .eq(2)
        .find('a')
        .map((i, el) => $(el).text().trim())
        .get()
        .join(', ');
      movieInfo.country = $('div.row > div.col-xl-6 .row-line').eq(1).find('a').text().trim();
      movieInfo.duration = $('div.row > div.col-xl-6 .row-line')
        .eq(0)
        .text()
        .replace('Duration: ', '')
        .replace(/\s+/g, ' ')
        .trim();
      movieInfo.rating = parseFloat(
        $('div.film-stats > div.fs-item > span.imdb').text().replace('IMDB: ', '')
      );
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

          $$$('.swiper-container > .swiper-wrapper > .swiper-slide')
            .map((i, el) => {
              const episode = {
                id: $$$(el).find('div.flw-item').attr('id')!.split('-')[1],
                image: $$$(el).find('div.flw-item > a > img').attr('src')!,
                title: $$$(el).find('div.flw-item > a > img').attr('title')!,
                number: parseInt(
                  $$$(el).find('div.flw-item > a > img').attr('title')!.split(':')[0].slice(8).trim()
                ),
                season: season,
                url: `${this.baseUrl}/ajax/v2/episode/servers/${
                  $$$(el).find('div.flw-item').attr('id')!.split('-')[1]
                }`,
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
      console.log(err, 'err');
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId episode id
   * @param mediaId media id
   * @param server server type (default `VidCloud`) (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    mediaId: string,
    server: StreamingServers = StreamingServers.UpCloud
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.Voe:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new Voe(this.proxyConfig, this.adapter).extract(serverUrl)),
          };
        case StreamingServers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new VidCloud(this.proxyConfig, this.adapter).extract(serverUrl, true)),
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

      const i = servers.findIndex(s => s.name === server);

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const { data } = await this.client.get(
        `${this.baseUrl}/ajax/get_link/${servers[i].url.split('.').slice(-1).shift()}`
      );

      const serverUrl: URL = new URL(data.link);

      return await this.fetchEpisodeSources(serverUrl.href, mediaId, server);
    } catch (err) {
      console.log(err, 'err');
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId takes episode link or movie id
   * @param mediaId takes movie link or id (found on movie info object)
   */
  override fetchEpisodeServers = async (episodeId: string, mediaId: string): Promise<IEpisodeServer[]> => {
    if (!episodeId.startsWith(this.baseUrl + '/ajax') && !mediaId.includes('movie'))
      episodeId = `${this.baseUrl}/ajax/v2/episode/servers/${episodeId}`;
    else episodeId = `${this.baseUrl}/ajax/movie/episodes/${episodeId}`;

    try {
      const { data } = await this.client.get(episodeId);
      const $ = load(data);

      const servers = $('.ulclear > li')
        .map((i, el) => {
          const server = {
            name: mediaId.includes('movie')
              ? $(el).find('a').find('span').text().trim().toLowerCase()
              : $(el).find('a').find('span').text().trim().toLowerCase(),
            url: `${this.baseUrl}/${mediaId}.${
              !mediaId.includes('movie') ? $(el).find('a').attr('data-id') : $(el).find('a').attr('data-id')
            }`.replace(
              !mediaId.includes('movie') ? /\/tv\// : /\/movie\//,
              !mediaId.includes('movie') ? '/watch-tv/' : '/watch-movie/'
            ),
          };
          return server;
        })
        .get();
      return servers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchRecentMovies = async (): Promise<IMovieResult[]> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const movies = $(
        'section.block_area:contains("Latest Movies") > div:nth-child(2) > div:nth-child(1) > div.flw-item'
      )
        .map((i, el) => {
          const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
          const movie: any = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $(el).find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
            rating: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null,
            type: TvType.MOVIE,
          };
          return movie;
        })
        .get();
      return movies;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchRecentTvShows = async (): Promise<IMovieResult[]> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const tvshows = $(
        'section.block_area:contains("Latest TV Shows") > div:nth-child(2) > div:nth-child(1) > div.flw-item'
      )
        .map((i, el) => {
          const tvshow = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $(el).find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            season:
              $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] || null,
            latestEpisode:
              $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] || null,
            type: TvType.TVSERIES,
          };
          return tvshow;
        })
        .get();
      return tvshows;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchTrendingMovies = async (): Promise<IMovieResult[]> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const movies = $('div#trending-movies div.film_list-wrap div.flw-item')
        .map((i, el) => {
          const releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
          const movie: any = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $(el).find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            releaseDate: isNaN(parseInt(releaseDate)) ? undefined : releaseDate,
            rating: $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text() || null,
            type: TvType.MOVIE,
          };
          return movie;
        })
        .get();
      return movies;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchTrendingTvShows = async (): Promise<IMovieResult[]> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const tvshows = $('div#trending-tv div.film_list-wrap div.flw-item')
        .map((i, el) => {
          const tvshow = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1)!,
            title: $(el).find('div.film-detail > h3.film-name > a').attr('title')!,
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            season:
              $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] || null,
            latestEpisode:
              $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] || null,
            type: TvType.TVSERIES,
          };
          return tvshow;
        })
        .get();
      return tvshows;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchByCountry = async (country: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    const result: ISearch<IMovieResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';

    try {
      const { data } = await this.client.get(`${this.baseUrl}/country/${country}/?page=${page}`);
      const $ = load(data);

      result.hasNextPage =
        $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

      $('div.container > section.block_area > div.block_area-content > div.film_list-wrap > div.flw-item')
        .each((i, el) => {
          const resultItem: IMovieResult = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1) ?? '',
            title: $(el).find('div.film-detail > h2.film-name > a').attr('title') ?? '',
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            type:
              $(el).find('div.film-poster > a').attr('href')?.slice(1).split('/')[0].toLowerCase() === 'movie'
                ? TvType.MOVIE
                : TvType.TVSERIES,
          };
          const season =
            $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] ?? null;
          const latestEpisode =
            $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] ?? null;
          if (resultItem.type === TvType.TVSERIES) {
            resultItem.season = season;
            resultItem.latestEpisode = latestEpisode;
          } else {
            resultItem.rating = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
            resultItem.releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
          }
          result.results.push(resultItem);
        })
        .get();
      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchByGenre = async (genre: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    const result: ISearch<IMovieResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/genre/${genre}?page=${page}`);

      const $ = load(data);

      const navSelector = 'div.pre-pagination:nth-child(3) > nav:nth-child(1) > ul:nth-child(1)';

      result.hasNextPage =
        $(navSelector).length > 0 ? !$(navSelector).children().last().hasClass('active') : false;

      $('.film_list-wrap > div.flw-item')
        .each((i, el) => {
          const resultItem: IMovieResult = {
            id: $(el).find('div.film-poster > a').attr('href')?.slice(1) ?? '',
            title: $(el).find('div.film-detail > h2.film-name > a').attr('title') ?? '',
            url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
            image: $(el).find('div.film-poster > img').attr('data-src'),
            type:
              $(el).find('div.film-poster > a').attr('href')?.slice(1).split('/')[0].toLowerCase() === 'movie'
                ? TvType.MOVIE
                : TvType.TVSERIES,
          };
          const season =
            $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[0] ?? null;
          const latestEpisode =
            $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text().split(':')[1] ?? null;
          if (resultItem.type === TvType.TVSERIES) {
            resultItem.season = season;
            resultItem.latestEpisode = latestEpisode;
          } else {
            resultItem.rating = $(el).find('div.film-detail > div.fd-infor > span:nth-child(1)').text();
            resultItem.releaseDate = $(el).find('div.film-detail > div.fd-infor > span:nth-child(3)').text();
          }
          result.results.push(resultItem);
        })
        .get();

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchSpotlight = async (): Promise<ISearch<IMovieResult>> => {
    try {
      const results: ISearch<IMovieResult> = { results: [] };
      const { data } = await this.client.get(`${this.baseUrl}/home`);

      const $ = load(data);

      $('div.swiper-slide').each((i, el) => {
        results.results.push({
          id: $(el).find('a').attr('href')?.slice(1)!,
          title: $(el).find('a').attr('title')!,
          url: `${this.baseUrl}${$(el).find('a').attr('href')}`,
          cover: $(el).find('div.slide-photo > a > img').attr('src'),
          rating: $(el).find('.scd-item:nth-child(1)').text().trim(),
          description: $(el).find('.sc-desc').text().trim(),
          type: $(el).find('a').attr('href')?.split('/')[1] === 'movie' ? TvType.MOVIE : TvType.TVSERIES,
        });
      });
      return results;
    } catch (err) {
      console.error(err);
      throw new Error((err as Error).message);
    }
  };
}

// (async () => {
//      const movie = new SFlix();
//     // const search = await movie.search('the flash');
//     // const movieInfo = await movie.fetchEpisodeSources('1168337', 'tv/watch-vincenzo-67955');
//     // const recentTv = await movie.fetchTrendingTvShows();
//      const genre = await movie.fetchSpotlight()
//      console.log(genre)
//   })();

export default SFlix;
