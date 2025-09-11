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
import { MixDrop, StreamTape, StreamWish, VidHide } from '../../extractors';

class MultiMovies extends MovieParser {
  override readonly name = 'MultiMovies';
  protected override baseUrl = 'https://multimovies.email';
  protected override logo =
    'https://multimovies.email/wp-content/uploads/2024/01/cropped-CompressJPEG.online_512x512_image.png';
  protected override classPath = 'MOVIES.MultiMovies';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);
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
      let url;
      if (page === 1) {
        url = `${this.baseUrl}/?s=${query.replace(/[\W_]+/g, '+')}`;
      } else {
        url = `${this.baseUrl}/page/${page}/?s=${query.replace(/[\W_]+/g, '+')}`;
      }
      const { data } = await this.client.get(url);
      const $ = load(data);

      const navSelector = 'div.pagination';
      searchResult.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
      const articles = $('.search-page .result-item article').toArray();

      await Promise.all(
        articles.map(async el => {
          const seasonSet = new Set<number>();

          const href =
            $(el)
              .find('.thumbnail a')
              .attr('href')
              ?.replace(/^https?:\/\/[^/]+\//, '')
              .replace(/^\/|\/$/g, '') ?? '';

          const episodesInfo = await this.fetchMediaInfo(href);
          const episodes = episodesInfo?.episodes || [];

          for (const episode of episodes) {
            if (episode.season != null) {
              seasonSet.add(episode.season);
            }
          }
          searchResult.results.push({
            id: href,
            title: $(el).find('.details .title a').text().trim(),
            url: $(el).find('.thumbnail a').attr('href') ?? '',
            image: $(el).find('.thumbnail img').attr('src') ?? '',
            rating: parseFloat($(el).find('.meta .rating').text().replace('IMDb ', '')) || 0,
            releaseDate: $(el).find('.meta .year').text().trim(),
            seasons: seasonSet.size,
            description: $(el).find('.contenido p').text().trim(),
            type: $(el).find('.thumbnail a').attr('href')?.includes('/movies/')
              ? TvType.MOVIE
              : TvType.TVSERIES,
          });
        })
      );

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
      id: mediaId.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/|\/$/g, '')!,
      title: '',
      url: mediaId,
    };
    try {
      const { data } = await this.client.get(mediaId);
      const $ = load(data);
      const recommendationsArray: IMovieResult[] = [];

      $('div#single_relacionados  article').each((i, el) => {
        recommendationsArray.push({
          id: $(el)
            .find('a')
            .attr('href')
            ?.replace(/^https?:\/\/[^/]+\//, '')
            .replace(/^\/|\/$/g, '')!,
          title: $(el).find('a img').attr('alt')!,
          image: $(el).find('a img').attr('data-src') ?? $(el).find('a img').attr('src'),
          type: $(el).find('.thumbnail a').attr('href')?.includes('/movies/')
            ? TvType.TVSERIES
            : TvType.MOVIE ?? null,
        });
      });
      movieInfo.cover = $('div#info .galeria').first().find('.g-item a').attr('href')?.trim() ?? '';
      movieInfo.title = $('.sheader > .data > h1').text();
      movieInfo.image =
        $('.sheader > .poster > img').attr('src') ?? $('.sheader > .poster > img').attr('data-src');
      movieInfo.description = $('div#info div[itemprop="description"] p').text();
      movieInfo.type = movieInfo.id.split('/')[0] === 'tvshows' ? TvType.TVSERIES : TvType.MOVIE;
      movieInfo.releaseDate = $('.sheader > .data > .extra > span.date').text().trim();
      movieInfo.trailer = {
        id:
          $('div#trailer .embed  iframe').attr('data-litespeed-src')?.split('embed/')[1]?.split('?')[0] ??
          $('div#trailer .embed  iframe').attr('src')?.split('embed/')[1]?.split('?')[0]!,
        url:
          $('div#trailer .embed iframe').attr('data-litespeed-src') ??
          $('div#trailer .embed iframe').attr('src'),
      };
      movieInfo.genres = $('.sgeneros a')
        .map((i, el) => $(el).text())
        .get()
        .map(v => v.trim());
      movieInfo.characters = [];
      $('div#cast .persons .person').each((i, el) => {
        const url = $(el).find('.img > a').attr('href');
        const image =
          $(el).find('.img > a > img').attr('data-src') ?? $(el).find('.img > a > img').attr('src');
        const name = $(el).find('.data > .name > a').text();
        const character = $(el).find('.data > .caracter').text();

        (movieInfo.characters as any[]).push({
          url,
          image,
          name,
          character,
        });
      });
      movieInfo.country = $('.sheader > .data > .extra > span.country').text();
      movieInfo.duration = $('.sheader > .data > .extra > span.runtime').text();
      movieInfo.rating = parseFloat(
        $('.starstruck-rating span.dt_rating_vgs[itemprop="ratingValue"]').text()
      );
      movieInfo.recommendations = recommendationsArray as any;

      if (movieInfo.type === TvType.TVSERIES) {
        movieInfo.episodes = [];
        $('#seasons .se-c').each((i, el) => {
          const seasonNumber = parseInt($(el).find('.se-t').text().trim());
          $(el)
            .find('.episodios li')
            .each((j, ep) => {
              const episode = {
                id: $(ep)
                  .find('.episodiotitle a')
                  .attr('href')
                  ?.replace(/^https?:\/\/[^/]+\//, '')
                  .replace(/^\/|\/$/g, '')!,
                season: seasonNumber,
                number: parseInt($(ep).find('.numerando').text().trim().split('-')[1]),
                title: $(ep).find('.episodiotitle a').text().trim(),
                url: $(ep).find('.episodiotitle a').attr('href')?.trim() ?? '',
                releaseDate: String(new Date($(ep).find('.episodiotitle .date').text().trim()).getFullYear()),
                image:
                  $(ep).find('.imagen img').attr('data-src')?.trim() ??
                  $(ep).find('.imagen img').attr('src')?.trim(),
              };

              movieInfo.episodes?.push(episode);
            });
        });
      } else {
        movieInfo.episodes = [
          {
            id: movieInfo.id,
            title: movieInfo.title,
            url: movieInfo.url,
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
   * @param server server type (default `StreamWish`) (optional)
   */
  override fetchEpisodeSources = async (
    episodeId: string,
    mediaId?: string, //just placeholder for compatibility with tmdb
    server: StreamingServers = StreamingServers.StreamWish,
    fileId?: string
  ): Promise<ISource> => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);
      switch (server) {
        case StreamingServers.MixDrop:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new MixDrop(this.proxyConfig, this.adapter).extract(serverUrl),
            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
          };
        case StreamingServers.StreamWish:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new StreamWish(this.proxyConfig, this.adapter).extract(serverUrl)),
            download: fileId ? `${serverUrl.href.toString().replace('/e/', '/f/')}/${fileId}` : '',
          };
        case StreamingServers.StreamTape:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
          };
        case StreamingServers.VidHide:
          return {
            headers: { Referer: serverUrl.href },
            sources: await new VidHide(this.proxyConfig, this.adapter).extract(serverUrl),
            download: fileId ? `https://gdmirrorbot.nl/file/${fileId}` : '',
          };
        default:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new StreamWish(this.proxyConfig, this.adapter).extract(serverUrl)),
            download: fileId ? `${serverUrl.href.toString().replace('/e/', '/f/')}/${fileId}` : '',
          };
      }
    }

    try {
      const servers = await this.fetchEpisodeServers(episodeId);
      const i = servers.findIndex(s => s.name.toLowerCase() === server.toLowerCase());

      if (i === -1) {
        throw new Error(`Server ${server} not found`);
      }

      const serverUrl: URL = new URL(servers[i].url);
      let fileId = '';

      if (!episodeId.startsWith('http')) {
        const { fileId: id } = await this.getServer(`${this.baseUrl}/${episodeId}`);
        fileId = id ?? '';
      }
      // fileId to be used for download link
      return await this.fetchEpisodeSources(serverUrl.href, mediaId, server, fileId);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId takes episode link or movie id
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    if (!episodeId.startsWith(this.baseUrl)) {
      episodeId = `${this.baseUrl}/${episodeId}`;
    }

    try {
      const { servers } = await this.getServer(episodeId);

      return servers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchPopular = async (page: number = 1): Promise<ISearch<IMovieResult>> => {
    const result: ISearch<IMovieResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/trending/page/${page}/`);
      const $ = load(data);
      const navSelector = 'div.pagination';

      result.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
      $('.items > article')
        .each((i, el) => {
          const resultItem: IMovieResult = {
            id: $(el).attr('id')!,
            title: $(el).find('div.data > h3').text() ?? '',
            url: $(el).find('div.poster > a').attr('href'),
            image: $(el).find('div.poster > img').attr('data-src') ?? '',
            type: $(el).find('div.poster > a').attr('href')?.includes('/movies/')
              ? TvType.MOVIE
              : TvType.TVSERIES,
            rating: $(el).find('div.poster > div.rating').text() ?? '',
            releaseDate: $(el).find('div.data > span').text() ?? '',
          };
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
      const { data } = await this.client.get(`${this.baseUrl}/genre/${genre}/page/${page}`);

      const $ = load(data);
      const navSelector = 'div.pagination';

      result.hasNextPage = $(navSelector).find('#nextpagination').length > 0;
      $('.items > article')
        .each((i, el) => {
          const resultItem: IMovieResult = {
            id: $(el).attr('id')!,
            title: $(el).find('div.data > h3').text() ?? '',
            url: $(el).find('div.poster > a').attr('href'),
            image: $(el).find('div.poster > img').attr('data-src') ?? '',
            type: $(el).find('div.poster > a').attr('href')?.includes('/movies/')
              ? TvType.MOVIE
              : TvType.TVSERIES,
            rating: $(el).find('div.poster > div.rating').text() ?? '',
            releaseDate: $(el).find('div.data > span').text() ?? '',
          };
          result.results.push(resultItem);
        })
        .get();

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private async getServer(url: string): Promise<{ servers: IEpisodeServer[]; fileId: string }> {
    try {
      const { data } = await this.client.get(url);
      const $ = load(data);

      // Extract player config
      const playerConfig = {
        postId: $('#player-option-1').attr('data-post'),
        nume: $('#player-option-1').attr('data-nume'),
        type: $('#player-option-1').attr('data-type'),
      };

      if (!playerConfig.postId || !playerConfig.nume || !playerConfig.type) {
        throw new Error('Missing player configuration');
      }

      const formData = new FormData();
      formData.append('action', 'doo_player_ajax');
      formData.append('post', playerConfig.postId);
      formData.append('nume', playerConfig.nume);
      formData.append('type', playerConfig.type);

      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        Referer: this.baseUrl,
        'Sec-Fetch-User': '?1',
      };

      const playerRes = await this.client.post(`${this.baseUrl}/wp-admin/admin-ajax.php`, formData, {
        headers,
      });

      const iframeUrl =
        playerRes.data?.embed_url?.match(/<iframe[^>]+src="([^"]+)"[^>]*>/i)?.[1] ||
        playerRes.data?.embed_url;

      // Handle non-multimovies case
      if (!iframeUrl.includes('multimovies')) {
        if (iframeUrl.includes('dhcplay')) {
          return {
            servers: [{ name: 'StreamWish', url: iframeUrl }],
            fileId: iframeUrl.split('/').pop() ?? '',
          };
        }
        let playerBaseUrl = iframeUrl.split('/').slice(0, 3).join('/');
        const redirectResponse = await this.client.head(playerBaseUrl, {
          headers: headers,
          maxRedirects: 5,
          validateStatus: () => true,
        });

        const isRedirected = redirectResponse.request._redirectable._isRedirect ? redirectResponse : null;
        const finalResponse = isRedirected ? redirectResponse : null;

        // Update base URL if redirect occurred
        if (finalResponse) {
          playerBaseUrl = finalResponse?.request.res.responseUrl.split('/').slice(0, 3).join('/');
        }

        const fileId = iframeUrl.split('/').pop();
        if (!fileId) {
          throw new Error('No player ID found');
        }

        const streamRequestData = new FormData();
        streamRequestData.append('sid', fileId);

        const streamResponse = await this.client.post(`${playerBaseUrl}/embedhelper.php`, streamRequestData, {
          headers,
        });

        if (!streamResponse.data) {
          throw new Error('No stream data found');
        }

        const streamDetails = streamResponse.data;
        const mresultKeys = new Set(Object.keys(JSON.parse(atob(streamDetails.mresult))));
        const siteUrlsKeys = new Set(Object.keys(streamDetails.siteUrls));

        // Find common keys
        const commonKeys = [...mresultKeys].filter(key => siteUrlsKeys.has(key));

        // Convert to a Set (if needed)
        const commonStreamSites = new Set(commonKeys);
        const servers = Array.from(commonStreamSites).map(site => {
          return {
            name:
              streamDetails.siteFriendlyNames[site] === 'StreamHG'
                ? 'StreamWish'
                : streamDetails.siteFriendlyNames[site] === 'EarnVids'
                ? 'VidHide'
                : streamDetails.siteFriendlyNames[site],
            url: streamDetails.siteUrls[site] + JSON.parse(atob(streamDetails.mresult))[site],
          };
        });

        return { servers, fileId };
      } else {
        return {
          servers: [{ name: 'StreamWish', url: iframeUrl }],
          fileId: iframeUrl.split('/').pop() ?? '',
        };
      }
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}

// (async () => {
//   const movie = new MultiMovies();
//   const search = await movie.search('mercy for none');
//   const movieInfo = await movie.fetchMediaInfo(search.results[0]?.id);
//   console.log(movieInfo.episodes![0].id, movieInfo.id);
//   const server = await movie.fetchEpisodeSources(movieInfo.episodes![0].id, movieInfo.id);
//   // const recentTv = await movie.fetchPopular();
//   // const genre = await movie.fetchByGenre('action');
//   console.log(server);
// })();

export default MultiMovies;
