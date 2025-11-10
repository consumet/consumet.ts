import { Cheerio, load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
  StreamingServers,
} from '../../models';

import { StreamTape } from '../../utils';
import { Mp4Player } from '../../extractors';

class AnimeSaturn extends AnimeParser {
  override readonly name = 'AnimeSaturn';
  protected override baseUrl = 'https://www.animesaturn.cx/';
  protected override logo = 'https://www.animesaturn.cx/immagini/favicon-32x32.png';
  protected override classPath = 'ANIME.AnimeSaturn';

  /**
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    // baseUrl/animelist?search={query}

    const data = await this.client.get(`${this.baseUrl}animelist?search=${query}`);

    const $ = await load(data.data);

    if (!$) return { results: [] };

    const res: {
      hasNextPage: boolean;
      results: IAnimeResult[];
    } = {
      hasNextPage: false,
      results: [],
    };

    $('ul.list-group li').each((i, element) => {
      const item: IAnimeResult = {
        id: $(element)?.find('a.thumb')?.attr('href')?.split('/')?.pop() ?? '',
        title: $(element)?.find('h3 a')?.text(),
        image: $(element)?.find('img.copertina-archivio')?.attr('src'),
        url: $(element)?.find('h3 a')?.attr('href'),
      };

      if (!item.id) throw new Error('Invalid id');

      res.results.push(item);
    });

    return res;
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const data = await this.client.get(`${this.baseUrl}anime/${id}`);
    const $ = await load(data.data);

    const info: IAnimeInfo = {
      id,
      title: $('div.container.anime-title-as> b').text(),
      malID: $('a[href^="https://myanimelist.net/anime/"]').attr('href')?.slice(30, -1),
      alID: $('a[href^="https://anilist.co/anime/"]').attr('href')?.slice(25, -1),
      genres:
        $('div.container a.badge.badge-light')
          ?.map((i, element): string => {
            return $(element).text();
          })
          .toArray() ?? undefined,
      image: $('img.img-fluid')?.attr('src') || undefined,
      cover:
        $('div.banner')
          ?.attr('style')
          ?.match(/background:\s*url\(['"]?([^'")]+)['"]?\)/i)?.[1] || undefined,
      description: $('#full-trama').text(),
      episodes: [],
    };

    const episodes: IAnimeEpisode[] = [];

    $('.tab-pane.fade').each((i, element) => {
      $(element)
        .find('.bottone-ep')
        .each((i, element) => {
          const link = $(element).attr('href');
          const episodeNumber = $(element).text().trim().replace('Episodio ', '').trim();

          episodes.push({
            number: parseInt(episodeNumber),
            id: link?.split('/')?.pop() ?? '',
          });
        });
    });

    info.episodes = episodes.sort((a, b) => a.number - b.number);

    return info;
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    const episodeData = await this.client.get(`${this.baseUrl}ep/${episodeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: this.baseUrl,
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        Priority: 'u=0, i',
      },
    });

    const $episode = await load(episodeData.data);

    let watchUrl = $episode("a:contains('Guarda lo streaming')").attr('href');

    if (!watchUrl) {
      watchUrl = $episode("div:contains('Guarda lo streaming')").parent('a').attr('href');
    }

    if (!watchUrl) {
      watchUrl = $episode("a[href*='watch']").attr('href');
    }

    if (!watchUrl) {
      throw new Error('Watch URL not found');
    }

    const watchData = await this.client.get(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: `${this.baseUrl}ep/${episodeId}`,
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        Priority: 'u=0, i',
      },
    });

    const $watch = await load(watchData.data);

    const sources: ISource = {
      headers: {
        Referer: watchUrl,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
      },
      subtitles: [],
      sources: [],
    };

    $watch('video source').each((i, element) => {
      const src = $watch(element).attr('src');
      if (src && (src.includes('.mp4') || src.includes('.m3u8'))) {
        sources.sources.push({
          url: src,
          isM3U8: src.includes('.m3u8'),
          quality: 'default',
        });
      }
    });

    const videoSrc = $watch('video#myvideo').attr('src');
    if (videoSrc && (videoSrc.includes('.mp4') || videoSrc.includes('.m3u8'))) {
      if (!sources.sources.some(s => s.url === videoSrc)) {
        sources.sources.push({
          url: videoSrc,
          isM3U8: videoSrc.includes('.m3u8'),
          quality: 'default',
        });
      }
    }

    $watch('script').each((i, element) => {
      const scriptText = $watch(element).text();

      if (scriptText.includes('jwplayer') || scriptText.includes('file:')) {
        const lines = scriptText.split('\n');

        for (const line of lines) {
          if (line.includes('file:')) {
            let url = line.split('file:')[1].trim().replace(/['"]/g, '').replace(/,/g, '').trim();

            if (url && (url.includes('.mp4') || url.includes('.m3u8'))) {
              if (!sources.sources.some(s => s.url === url)) {
                sources.sources.push({
                  url: url,
                  isM3U8: url.includes('.m3u8'),
                  quality: 'default',
                });
              }
            }
          }
        }
      }

      const mp4Match = scriptText.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g);
      if (mp4Match) {
        mp4Match.forEach(url => {
          if (!sources.sources.some(s => s.url === url)) {
            sources.sources.push({
              url: url,
              isM3U8: false,
              quality: 'default',
            });
          }
        });
      }

      const m3u8Match = scriptText.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/g);
      if (m3u8Match) {
        m3u8Match.forEach(url => {
          if (!sources.sources.some(s => s.url === url)) {
            sources.sources.push({
              url: url,
              isM3U8: true,
              quality: 'default',
            });
          }
        });
      }
    });

    if (sources.sources.length === 0) {
      throw new Error('No video sources found');
    }

    const m3u8Source = sources.sources.find(s => s.isM3U8);
    if (m3u8Source && m3u8Source.url.includes('playlist.m3u8')) {
      sources.subtitles?.push({
        url: m3u8Source.url.replace('playlist.m3u8', 'subtitles.vtt'),
        lang: 'Italian',
      });
    }

    return sources;
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    const episodeData = await this.client.get(`${this.baseUrl}ep/${episodeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: this.baseUrl,
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        Priority: 'u=0, i',
      },
    });

    const $episode = await load(episodeData.data);
    const servers: IEpisodeServer[] = [];

    const mainWatchUrl = $episode("a:contains('Guarda lo streaming')").attr('href');
    if (mainWatchUrl) {
      servers.push({
        name: 'Server 1',
        url: mainWatchUrl,
      });
    }

    if (mainWatchUrl) {
      const watchData = await this.client.get(mainWatchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Referer: `${this.baseUrl}ep/${episodeId}`,
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          Priority: 'u=0, i',
        },
      });

      const $watch = await load(watchData.data);

      $watch('.dropdown-menu .dropdown-item').each((i, element) => {
        const serverUrl = $watch(element).attr('href');
        const serverName = $watch(element).text().trim();

        if (serverUrl && serverName && !servers.some(s => s.url === serverUrl)) {
          servers.push({
            name: serverName,
            url: serverUrl,
          });
        }
      });

      const altPlayerUrl = $watch("a:contains('Player alternativo')").attr('href');
      if (altPlayerUrl && !servers.some(s => s.url === altPlayerUrl)) {
        servers.push({
          name: 'Player Alternativo',
          url: altPlayerUrl,
        });
      }

      $watch('iframe').each((i, element) => {
        const src = $watch(element).attr('src');
        if (src && (src.includes('streamtape') || src.includes('mixdrop') || src.includes('doodstream'))) {
          const serverName = src.includes('streamtape')
            ? 'StreamTape'
            : src.includes('mixdrop')
            ? 'MixDrop'
            : src.includes('doodstream')
            ? 'DoodStream'
            : 'External Server';

          if (!servers.some(s => s.url === src)) {
            servers.push({
              name: serverName,
              url: src,
            });
          }
        }
      });
    }

    return servers;
  };
}

export default AnimeSaturn;

// (async () => {
//   const animesaturn = new AnimeSaturn();

//   const anime = await animesaturn.search('Kingdom');
//   console.log(anime);

//   const info = await animesaturn.fetchAnimeInfo("Kingdom-6");
//   console.log(info);

//   const servers = await animesaturn.fetchEpisodeServers("Kingdom-6-ep-6");
//   console.log(servers);

//   const sources = await animesaturn.fetchEpisodeSources("Kingdom-6-ep-6");
//   console.log(sources);
// })();
