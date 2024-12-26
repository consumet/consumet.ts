import { Cheerio, load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  MediaFormat,
  MediaStatus,
  StreamingServers,
  ProxyConfig,
} from '../../models';
import { Mp4Upload, StreamWish, VidHide } from '../../extractors';
import { AxiosAdapter } from 'axios';

class Anix extends AnimeParser {
  override readonly name = 'Anix';
  protected override baseUrl = 'https://anix.sh';
  protected override logo = 'https://anix.sh/img/logo.png';
  protected override classPath = 'ANIME.Anix';
  private readonly MediaCategory = {
    MOVIE: 1,
    TV: 2,
    OVA: 3,
    SPECIAL: 4,
    ONA: 5,
    MUSIC: 6,
    TV_SPECIAL: 7,
    UNCATEGORIZED: 0,
  };
  private readonly MediaRegion = {
    ANIME: 'country[]=1&country[]=2&country[]=3&country[]=4&country[]=6',
    DONGHUA: 'country[]=5',
    SUB: 'language[]=sub',
    DUB: 'language[]=dub',
  };
  private readonly defaultSort = `&type[]=${this.MediaCategory.MOVIE}&type[]=${this.MediaCategory.TV}&type[]=${this.MediaCategory.ONA}&type[]=${this.MediaCategory.OVA}&type[]=${this.MediaCategory.SPECIAL}&type[]=${this.MediaCategory.TV_SPECIAL}&type[]=${this.MediaCategory.UNCATEGORIZED}&status[]=${MediaStatus.ONGOING}&status[]=${MediaStatus.COMPLETED}`;
  private readonly requestedWith = 'XMLHttpRequest';

  constructor(customBaseURL?: string, proxy?: ProxyConfig, adapter?: AxiosAdapter) {
    super(proxy, adapter);
    this.baseUrl = customBaseURL
      ? customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')
        ? customBaseURL
        : `http://${customBaseURL}`
      : this.baseUrl;
  }

  /**
   * @param page page number (optional)
   */
  fetchRecentEpisodes = async (page: number = 1, type?: number): Promise<ISearch<IAnimeResult>> => {
    try {
      let url = `${this.baseUrl}/filter?${this.defaultSort}&sort=recently_updated&page=${page}`;
      if (type == 1) {
        url += `&${this.MediaRegion.ANIME}`;
      } else if (type == 2) {
        url += `&${this.MediaRegion.DONGHUA}`;
      } else if (type == 3) {
        url += `&${this.MediaRegion.SUB}`;
      } else if (type == 4) {
        url += `&${this.MediaRegion.DUB}`;
      }

      const res = await this.client.get(url);

      const $ = load(res.data);

      const recentEpisodes: IAnimeResult[] = [];

      $('.basic.ani.content-item .piece').each((i, el) => {
        const poster = $(el).find('a.poster');
        const url = $(poster).attr('href');
        const episodeNum = parseFloat($(el).find('.sub').text());
        const type = $(el).find('.type.dot').text();
        let finalType = MediaFormat.TV;
        switch (type) {
          case 'ONA':
            finalType = MediaFormat.ONA;
            break;
          case 'Movie':
            finalType = MediaFormat.MOVIE;
            break;
          case 'OVA':
            finalType = MediaFormat.OVA;
            break;
          case 'Special':
            finalType = MediaFormat.SPECIAL;
            break;
          case 'Music':
            finalType = MediaFormat.MUSIC;
            break;
          case 'PV':
            finalType = MediaFormat.PV;
            break;
          case 'TV Special':
            finalType = MediaFormat.TV_SPECIAL;
            break;
          case 'Comic':
            finalType = MediaFormat.COMIC;
            break;
        }
        recentEpisodes.push({
          id: url?.split('/')[2]!,
          episodeId: `ep-${episodeNum}`,
          episodeNumber: episodeNum,
          title: $(el).find('.d-title').text()!,
          englishTitle: $(el).find('.d-title').attr('data-en')!,
          image: $(poster).find('img').attr('src'),
          url: `${this.baseUrl.trim()}${url?.trim()}`,
          type: finalType,
        });
      });

      const hasNextPage = !$('.pagination li').last().hasClass('active');

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: recentEpisodes,
      };
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(
        `${this.baseUrl}/filter?keyword=${query}&page=${page}&type[]=${this.MediaCategory.MOVIE}&type[]=${this.MediaCategory.TV}&type[]=${this.MediaCategory.ONA}&type[]=${this.MediaCategory.OVA}&type[]=${this.MediaCategory.SPECIAL}&type[]=${this.MediaCategory.TV_SPECIAL}&type[]=${this.MediaCategory.MUSIC}&type[]=${this.MediaCategory.UNCATEGORIZED}`
      );
      const $ = load(res.data);
      let hasNextPage = $('.pagination').length > 0;
      if (hasNextPage) {
        hasNextPage = !$('.pagination li').last().hasClass('active');
      }
      const searchResult: ISearch<IAnimeResult> = {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: [],
      };

      $('.basic.ani.content-item .piece').each((i, el) => {
        const poster = $(el).find('a.poster');
        const url = $(poster).attr('href');
        const type = $(el).find('.type.dot').text();
        let finalType = MediaFormat.TV;
        switch (type) {
          case 'ONA':
            finalType = MediaFormat.ONA;
            break;
          case 'Movie':
            finalType = MediaFormat.MOVIE;
            break;
          case 'OVA':
            finalType = MediaFormat.OVA;
            break;
          case 'Special':
            finalType = MediaFormat.SPECIAL;
            break;
          case 'Music':
            finalType = MediaFormat.MUSIC;
            break;
          case 'PV':
            finalType = MediaFormat.PV;
            break;
          case 'TV Special':
            finalType = MediaFormat.TV_SPECIAL;
            break;
          case 'Comic':
            finalType = MediaFormat.COMIC;
            break;
        }
        searchResult.results.push({
          id: url?.split('/')[2]!,
          title: $(el).find('.d-title').text()!,
          englishTitle: $(el).find('.d-title').attr('data-en')!,
          image: $(poster).find('img').attr('src'),
          url: `${this.baseUrl.trim()}${url?.trim()}`,
          type: finalType,
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const url = `${this.baseUrl}/anime/${id}/ep-1`;

    try {
      const res = await this.client.get(url);
      const $ = load(res.data);
      const animeInfo: IAnimeInfo = {
        id: id,
        title: $('.ani-data .maindata .ani-name.d-title')?.text().trim(),
        englishTitle: $('.ani-data .maindata .ani-name.d-title')?.attr('data-en')?.trim(),
        url: `${this.baseUrl}/anime/${id}`,
        image: $('.ani-data .poster img')?.attr('src'),
        description: $('.ani-data .maindata .description .cts-block div').text().trim(),
        episodes: [],
      };
      $('.episodes .ep-range').each((i, el) => {
        $(el)
          .find('div')
          .each((i, el) => {
            animeInfo.episodes?.push({
              id: $(el).find('a').attr('href')?.split('/')[3]!,
              number: parseFloat($(el).find(`a`).text()),
              url: `${this.baseUrl}${$(el).find(`a`).attr('href')?.trim()}`,
            });
          });
      });
      const metaData = { status: '', type: '' };
      $('.metadata .limiter div').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Genre: ')) {
          $(el)
            .find('span a')
            .each((i, el) => {
              if (animeInfo.genres == undefined) {
                animeInfo.genres = [];
              }
              animeInfo.genres.push($(el).attr('title')!);
            });
        } else if (text.includes('Status: ')) {
          metaData.status = text.replace('Status: ', '');
        } else if (text.includes('Type: ')) {
          metaData.type = text.replace('Type: ', '');
        } else if (text.includes('Episodes: ')) {
          animeInfo.totalEpisodes = parseFloat(text.replace('Episodes: ', '')) ?? undefined;
        } else if (text.includes('Country: ')) {
          animeInfo.countryOfOrigin = text.replace('Country: ', '');
        }
      });
      animeInfo.status = MediaStatus.UNKNOWN;
      switch (metaData.status) {
        case 'Ongoing':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Completed':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
      }
      animeInfo.type = MediaFormat.TV;
      switch (metaData.type) {
        case 'ONA':
          animeInfo.type = MediaFormat.ONA;
          break;
        case 'Movie':
          animeInfo.type = MediaFormat.MOVIE;
          break;
        case 'OVA':
          animeInfo.type = MediaFormat.OVA;
          break;
        case 'Special':
          animeInfo.type = MediaFormat.SPECIAL;
          break;
        case 'Music':
          animeInfo.type = MediaFormat.MUSIC;
          break;
        case 'PV':
          animeInfo.type = MediaFormat.PV;
          break;
        case 'TV Special':
          animeInfo.type = MediaFormat.TV_SPECIAL;
          break;
        case 'Comic':
          animeInfo.type = MediaFormat.COMIC;
          break;
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchRandomAnimeInfo = async (): Promise<IAnimeInfo> => {
    const url = `${this.baseUrl}/random`;

    try {
      const res = await this.client.get(url);
      const $ = load(res.data);
      const id = $('.content .tmp_alias')?.attr('value')!;
      const animeInfo: IAnimeInfo = {
        id: id,
        title: $('.ani-data .maindata .ani-name.d-title')?.text().trim(),
        englishTitle: $('.ani-data .maindata .ani-name.d-title')?.attr('data-en')?.trim(),
        url: `${this.baseUrl}/anime/${id}`,
        image: $('.ani-data .poster img')?.attr('src'),
        description: $('.ani-data .maindata .description .cts-block div').text().trim(),
        episodes: [],
      };
      $('.episodes .ep-range').each((i, el) => {
        $(el)
          .find('div')
          .each((i, el) => {
            animeInfo.episodes?.push({
              id: $(el).find('a').attr('href')?.split('/')[3]!,
              number: parseFloat($(el).find(`a`).text()),
              url: `${this.baseUrl}${$(el).find(`a`).attr('href')?.trim()}`,
            });
          });
      });
      const metaData = { status: '', type: '' };
      $('.metadata .limiter div').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Genre: ')) {
          $(el)
            .find('span a')
            .each((i, el) => {
              if (animeInfo.genres == undefined) {
                animeInfo.genres = [];
              }
              animeInfo.genres.push($(el).attr('title')!);
            });
        } else if (text.includes('Status: ')) {
          metaData.status = text.replace('Status: ', '');
        } else if (text.includes('Type: ')) {
          metaData.type = text.replace('Type: ', '');
        } else if (text.includes('Episodes: ')) {
          animeInfo.totalEpisodes = parseFloat(text.replace('Episodes: ', '')) ?? undefined;
        } else if (text.includes('Country: ')) {
          animeInfo.countryOfOrigin = text.replace('Country: ', '');
        }
      });
      animeInfo.status = MediaStatus.UNKNOWN;
      switch (metaData.status) {
        case 'Ongoing':
          animeInfo.status = MediaStatus.ONGOING;
          break;
        case 'Completed':
          animeInfo.status = MediaStatus.COMPLETED;
          break;
      }
      animeInfo.type = MediaFormat.TV;
      switch (metaData.type) {
        case 'ONA':
          animeInfo.type = MediaFormat.ONA;
          break;
        case 'Movie':
          animeInfo.type = MediaFormat.MOVIE;
          break;
        case 'OVA':
          animeInfo.type = MediaFormat.OVA;
          break;
        case 'Special':
          animeInfo.type = MediaFormat.SPECIAL;
          break;
        case 'Music':
          animeInfo.type = MediaFormat.MUSIC;
          break;
        case 'PV':
          animeInfo.type = MediaFormat.PV;
          break;
        case 'TV Special':
          animeInfo.type = MediaFormat.TV_SPECIAL;
          break;
        case 'Comic':
          animeInfo.type = MediaFormat.COMIC;
          break;
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param id Anime id
   * @param episodeId Episode id
   * @param server Streaming server(optional)
   * @param type Type (optional) (options: `sub`, `dub`, `raw`)
   */
  override fetchEpisodeSources = async (
    id: string,
    episodeId: string,
    server: StreamingServers = StreamingServers.BuiltIn,
    type: string = ''
  ): Promise<ISource> => {
    const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
    const uri = new URL(url);
    const res = await this.client.get(url);
    const $ = load(res.data);
    const servers = new Map<string, string>();
    $($('.ani-server-type-pad')[0])
      .find('.server')
      .each((i, el) => {
        servers.set($(el).text().trim(), $(el).attr('data-video')!);
      });
    switch (server) {
      case StreamingServers.VidHide:
        if (servers.get('Vidhide') !== undefined) {
          const streamUri = new URL(servers.get('Vidhide')!);
          return {
            headers: {
              Referer: streamUri.origin,
            },
            sources: await new VidHide(this.proxyConfig, this.adapter).extract(streamUri),
          };
        }
      case StreamingServers.Mp4Upload:
        if (servers.get('Mp4upload') !== undefined) {
          const streamUri = new URL(servers.get('Mp4upload')!);
          return {
            headers: {
              Referer: streamUri.origin,
            },
            sources: await new Mp4Upload(this.proxyConfig, this.adapter).extract(streamUri),
          };
        }
        throw new Error('Mp4Upload server not found');
      case StreamingServers.StreamWish:
        if (servers.get('Streamwish') != undefined) {
          const streamUri = new URL(servers.get('Streamwish')!);
          return {
            headers: {
              Referer: uri.origin,
            },
            ...(await new StreamWish(this.proxyConfig, this.adapter).extract(streamUri)),
          };
        }
        throw new Error('StreamWish server not found');
      default:
        const episodeSources: ISource = {
          sources: [],
        };

        try {
          let defaultUrl = '';
          $('script:contains("loadIframePlayer")').each((i, el) => {
            const scriptContent = $(el).text();
            // Regular expression to capture the JSON inside loadIframePlayer
            const jsonRegex = /loadIframePlayer\(\s*(['"`])(\[[\s\S]*?\])\1/;
            const match = jsonRegex.exec(scriptContent);

            if (match && match[0]) {
              const extractedJson = match[0]
                .replace('loadIframePlayer(', '')
                .replace("'", '')
                .replace("'", '');
              const data = JSON.parse(extractedJson);
              if (data == undefined || data.length <= 0) {
                throw new Error('BuiltIn server not found');
              }

              if (type != '') {
                for (const item of data) {
                  if (item.type.toUpperCase() == type.toUpperCase()) {
                    defaultUrl = item.url;
                    break;
                  }
                }
              } else {
                defaultUrl = data[0].url;
              }
              if (defaultUrl != '')
                episodeSources.sources.push({
                  url: defaultUrl,
                  quality: `default`,
                  isM3U8: defaultUrl.includes('.m3u8'),
                });
            } else {
              throw new Error('BuiltIn server not found');
            }
          });

          if (defaultUrl != '' && !defaultUrl.includes('.mp4')) {
            const options = {
              headers: {
                Referer: url,
              },
            };
            const m3u8Content = await this.client.get(defaultUrl, options);
            if (m3u8Content.data.includes('EXTM3U')) {
              const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
              for (const video of videoList ?? []) {
                if (video.includes('BANDWIDTH')) {
                  const url = video.split('\n')[1];
                  const quality = video.split('RESOLUTION=')[1].split('\n')[0].split('x')[1];
                  const path = defaultUrl.replace(/\/[^/]*\.m3u8$/, '/');
                  episodeSources.sources.push({
                    url: path + url,
                    quality: `${quality.split(',')[0]}p`,
                    isM3U8: true,
                  });
                }
              }
            }
          }
        } catch (err) {
          throw new Error((err as Error).message);
        }
        return {
          headers: {
            Referer: uri.origin,
          },
          ...episodeSources,
        };
    }
  };

  /**
   *
   * @param id Anime id
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = async (id: string, episodeId: string): Promise<IEpisodeServer[]> => {
    const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
    const res = await this.client.get(url);
    const $ = load(res.data);
    const servers: IEpisodeServer[] = [];
    $($('.ani-server-type-pad')[0])
      .find('.server')
      .each((i, el) => {
        servers.push({
          name: $(el).text().trim(),
          url: $(el).attr('data-video')!,
        });
      });
    return servers;
  };

  /**
   *
   * @param id Anime id
   * @param episodeId Episode id
   * @param type Type (optional) (options: `sub`, `dub`, `raw`)
   */
  fetchEpisodeServerType = async (
    id: string,
    episodeId: string,
    type?: string
  ): Promise<{ sub: IEpisodeServer[]; dub: IEpisodeServer[]; raw: IEpisodeServer[] } | IEpisodeServer[]> => {
    const url = `${this.baseUrl}/anime/${id}/${episodeId}`;
    const res = await this.client.get(url);
    const $ = load(res.data);
    const subs: IEpisodeServer[] = [];
    const dubs: IEpisodeServer[] = [];
    const raw: IEpisodeServer[] = [];

    $('.ani-server-type-pad').each((index, element) => {
      $(element)
        .find('.server')
        .each((i, el) => {
          const serverData = {
            name: $(el).text().trim(),
            url: $(el).attr('data-video')!,
          };
          const dataType = $(el).attr('data-typesv')!.split('-')[0];
          if (dataType === 'SUB') {
            subs.push(serverData);
          } else if (dataType === 'DUB') {
            dubs.push(serverData);
          } else if (dataType === 'RAW') {
            raw.push(serverData);
          }
        });
    });

    if (!type) {
      return { sub: subs, dub: dubs, raw: raw };
    }

    // Utilizando un string para seleccionar el tipo
    if (type.toUpperCase() === 'SUB') {
      return subs;
    } else if (type.toUpperCase() === 'DUB') {
      return dubs;
    } else if (type.toUpperCase() === 'RAW') {
      return raw;
    } else {
      throw new Error('Invalid server type');
    }
  };
}

export default Anix;
