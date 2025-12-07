import { makeRequest } from '../../models/gotscraping-wrapper';
import {
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  IVideo,
  MediaStatus,
  SubOrSub,
  IAnimeEpisode,
} from '../../models/';
import AnimeParser from '../../models/anime-parser';
import VidMoly from '../../extractors/vidmoly';
import MoveArnPre from '../../extractors//movearnpre';
import Sibnet from '../../extractors/sibnet';
import Sendvid from '../../extractors//sendvid';
import Lpayer from '../../extractors//lplayer';

interface EpisodePlayer {
  [playerName: string]: string;
}

interface EpisodeData {
  episode: number;
  players: EpisodePlayer;
}

class AnimeSama extends AnimeParser {
  override readonly name = 'AnimeSama';
  protected override baseUrl = 'https://anime-sama.eu/';
  protected override logo = 'https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/logo.png';
  protected override classPath = 'ANIME.AnimeSama';

  private vidmolyExtractor: VidMoly;
  private movearnpreExtractor: MoveArnPre;
  private sibnetExtractor: Sibnet;
  private sendvidExtractor: Sendvid;
  private lplayerExtractor: Lpayer;

  constructor() {
    super();
    this.vidmolyExtractor = new VidMoly();
    this.movearnpreExtractor = new MoveArnPre();
    this.sibnetExtractor = new Sibnet();
    this.sendvidExtractor = new Sendvid();
    this.lplayerExtractor = new Lpayer();
  }

  private getHeaders(referer?: string) {
    const headers: Record<string, string> = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-GB,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      Priority: 'u=0, i',
      TE: 'trailers',
    };

    if (referer) {
      headers['Referer'] = referer;
      headers['Sec-Fetch-Site'] = 'same-origin';
    } else {
      headers['Sec-Fetch-Site'] = 'none';
    }

    return headers;
  }

  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    try {
      const response = await makeRequest({
        url: 'https://anime-sama.eu/template-php/defaut/fetch.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://anime-sama.eu/catalogue/',
          Origin: 'https://anime-sama.eu',
          Accept: '*/*',
          'Accept-Language': 'en-GB,en;q=0.5',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
        body: `query=${encodeURIComponent(query)}`,
        throwHttpErrors: false,
        headerGeneratorOptions: {
          browsers: [
            { name: 'chrome', minVersion: 100, maxVersion: 120 },
            { name: 'firefox', minVersion: 100, maxVersion: 120 },
          ],
          devices: ['desktop'],
          operatingSystems: ['windows', 'linux', 'macos'],
        },
      });

      if (response.statusCode !== 200) {
        console.error(`Search API returned status code ${response.statusCode}`);
        throw new Error(`API returned status code ${response.statusCode}`);
      }

      const data = response.body;

      if (data.includes('Just a moment') || data.includes('cf_chl_opt')) {
        console.error('Cloudflare challenge detected in search');
        throw new Error('Cloudflare challenge detected. The scraper may need browser emulation.');
      }

      const animeRegex =
        /<a href="https:\/\/anime-sama\.eu\/catalogue\/([^/"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*\/>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/g;
      const results: IAnimeResult[] = [];
      let match;

      while ((match = animeRegex.exec(data)) !== null) {
        const slug = match[1];
        const image = match[2];
        const title = match[3].trim();

        results.push({
          id: slug,
          title: title,
          url: `${this.baseUrl}/catalogue/${slug}/`,
          image: image,
        });
      }

      if (results.length === 0) {
        console.warn('No results found for query:', query);
        console.warn('Response preview:', data.substring(0, 500));
      }

      return {
        currentPage: 1,
        hasNextPage: false,
        results: results,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    try {
      const catalogueUrl = `${this.baseUrl}/catalogue/`;
      const animeUrl = `${this.baseUrl}/catalogue/${id}/`;

      const response = await makeRequest({
        url: animeUrl,
        headers: this.getHeaders(catalogueUrl),
      });

      const data = response.body;

      if (data.includes('Just a moment')) {
        throw new Error('Cloudflare challenge detected.');
      }

      const titleMatch = data.match(/<h4[^>]*id="titreOeuvre"[^>]*>([^<]+)<\/h4>/);
      const title = titleMatch ? titleMatch[1].trim() : id;

      const altTitleMatch = data.match(/<h2[^>]*id="titreAlter"[^>]*>([^<]+)<\/h2>/);

      const imageMatch = data.match(/<img[^>]*id="coverOeuvre"[^>]*src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : undefined;

      const descMatch = data.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/);
      const description = descMatch ? descMatch[1] : undefined;

      let trailerUrl: string | undefined;
      const trailerMatch = data.match(/\$\("#bandeannonce"\)\.attr\("src",\s*"([^"]+)"\)/);
      if (trailerMatch) {
        trailerUrl = trailerMatch[1];
      }

      const genresMatch = data.match(/<h2[^>]*>Genres<\/h2>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
      const genres: string[] = [];
      if (genresMatch) {
        const genresText = genresMatch[1];
        genres.push(...genresText.split(',').map((g: string) => g.trim()));
      }

      let news: string | undefined;
      const newsMatch = data.match(/<p[^>]*>Actualité\s*:\s*<span[^>]*>([^<]+)<\/span><\/p>/);
      if (newsMatch) {
        news = newsMatch[1].trim();
      }

      const animeSeasons: Array<{ name: string; url: string }> = [];
      const animeRegex = /panneauAnime\("([^"]+)",\s*"([^"]+)"\)/g;
      let animeMatch;
      while ((animeMatch = animeRegex.exec(data)) !== null) {
        if (
          !data.substring(0, animeMatch.index).includes('/*') ||
          data.substring(animeMatch.index).indexOf('*/') > data.substring(animeMatch.index).indexOf('\n')
        ) {
          animeSeasons.push({
            name: animeMatch[1],
            url: `${animeUrl}${animeMatch[2]}`,
          });
        }
      }

      const languages: string[] = [];
      const seasonLangRegex = /panneauAnime\("[^"]+",\s*"[^/]+\/(vf|vostfr)"\)/g;
      let seasonLangMatch;
      while ((seasonLangMatch = seasonLangRegex.exec(data)) !== null) {
        const lang = seasonLangMatch[1].toUpperCase();
        if (!languages.includes(lang)) {
          languages.push(lang);
        }
      }

      const hasVF = languages.includes('VF');
      const hasVOSTFR = languages.includes('VOSTFR');
      let subOrDub: SubOrSub;
      if (hasVF && hasVOSTFR) {
        subOrDub = SubOrSub.BOTH;
      } else if (hasVF) {
        subOrDub = SubOrSub.DUB;
      } else {
        subOrDub = SubOrSub.SUB;
      }

      let status = MediaStatus.UNKNOWN;
      if (news) {
        const newsLower = news.toLowerCase();
        if (newsLower.includes('terminé') || newsLower.includes('fini')) {
          status = MediaStatus.COMPLETED;
        } else if (newsLower.includes('en cours') || newsLower.includes('annoncé')) {
          status = MediaStatus.ONGOING;
        }
      }

      const episodes: IAnimeEpisode[] = [];
      if (animeSeasons.length > 0) {
        for (const season of animeSeasons) {
          const seasonMatch = season.url.match(/\/(saison\d+|film|oav|ova)\/([^/]+)\/?$/);
          if (seasonMatch) {
            const seasonSlug = seasonMatch[1];
            const lang = seasonMatch[2];
            try {
              const episodeData = await this.fetchEpisodesData(id, seasonSlug, lang);
              const seasonEpisodes: IAnimeEpisode[] = episodeData.map((ep: EpisodeData) => ({
                id: `${id}/${seasonSlug}/${lang}/${ep.episode}`,
                number: ep.episode,
                title: `Episode ${ep.episode}`,
                url: `${this.baseUrl}/catalogue/${id}/${seasonSlug}/${lang}/`,
              }));
              episodes.push(...seasonEpisodes);
            } catch (error) {
              console.warn(`Failed to fetch episodes for ${season.name}:`, error);
            }
          }
        }
      }

      return {
        id: id,
        title: title,
        alternativeTitles: altTitleMatch ? [altTitleMatch[1].trim()] : undefined,
        url: animeUrl,
        image: image,
        description: description,
        genres: genres,
        trailer: trailerUrl ? { id: trailerUrl, url: trailerUrl } : undefined,
        subOrDub: subOrDub,
        status: status,
        episodes: episodes,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private fetchEpisodesData = async (
    id: string,
    season: string = 'saison1',
    language: string = 'vf'
  ): Promise<EpisodeData[]> => {
    try {
      const animeUrl = `${this.baseUrl}/catalogue/${id}/`;
      const episodesUrl = `${this.baseUrl}/catalogue/${id}/${season}/${language}/`;

      const response = await makeRequest({
        url: episodesUrl,
        headers: this.getHeaders(animeUrl),
      });

      const html = response.body;

      if (html.includes('Just a moment')) {
        throw new Error('Cloudflare challenge detected.');
      }

      const episodesJsMatch = html.match(/src=['"]([^'"]*episodes\.js[^'"]*)['"]/);
      if (!episodesJsMatch) {
        throw new Error('Could not find episodes.js reference');
      }

      const episodesJsUrl = new URL(episodesJsMatch[1], episodesUrl).href;

      const jsResponse = await makeRequest({
        url: episodesJsUrl,
        headers: {
          ...this.getHeaders(episodesUrl),
          Accept: '*/*',
          'Sec-Fetch-Dest': 'script',
          'Sec-Fetch-Mode': 'no-cors',
        },
      });

      const episodesJs = jsResponse.body;

      const episodeData: EpisodeData[] = [];
      const epsRegex = /var eps(\d+) = \[([\s\S]*?)\];/g;
      let match;

      while ((match = epsRegex.exec(episodesJs)) !== null) {
        const playerNumber = match[1];
        const urlsString = match[2];

        const urls = urlsString
          .split(',')
          .map(u => u.trim().replace(/^['"]|['"]$/g, ''))
          .filter(u => u.length > 0);

        urls.forEach((embedUrl, index) => {
          if (!episodeData[index]) {
            episodeData[index] = {
              episode: index + 1,
              players: {},
            };
          }
          episodeData[index].players[`Player ${playerNumber}`] = embedUrl;
        });
      }

      return episodeData;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    try {
      const [id, season, language, episodeNumStr] = episodeId.split('/');
      const episodeNumber = parseInt(episodeNumStr);

      const episodes = await this.fetchEpisodesData(id, season, language);
      const episode = episodes[episodeNumber - 1];

      if (!episode) {
        throw new Error(`Episode ${episodeNumber} not found`);
      }

      return Object.entries(episode.players).map(([name, url]) => ({
        name: name,
        url: url,
      }));
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeSources = async (episodeId: string, server?: string): Promise<ISource> => {
    try {
      const [id, season, language, episodeNumStr] = episodeId.split('/');
      const episodeNumber = parseInt(episodeNumStr);

      const episodes = await this.fetchEpisodesData(id, season, language);
      const episode = episodes[episodeNumber - 1];

      if (!episode) {
        throw new Error(`Episode ${episodeNumber} not found`);
      }

      let embedUrl: string | null = null;

      if (server) {
        embedUrl = this.findServerUrl(episode.players, server);
      } else {
        const preferenceOrder = ['vidmoly', 'movearnpre', 'sibnet', 'sendvid', 'lpayer'];
        for (const serverType of preferenceOrder) {
          embedUrl = this.findServerUrl(episode.players, serverType);
          if (embedUrl) break;
        }
      }

      if (!embedUrl) {
        const firstServer = Object.values(episode.players)[0];
        if (firstServer) {
          embedUrl = firstServer;
        } else {
          throw new Error('No servers available for this episode');
        }
      }

      const sources = await this.extractSourcesByServer(embedUrl);

      return {
        sources: sources,
        headers: {
          Referer: embedUrl,
        },
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private findServerUrl(players: EpisodePlayer, serverType: string): string | null {
    const serverKeywords: { [key: string]: string[] } = {
      vidmoly: ['vidmoly.net', 'vidmoly.to', 'vidmoly'],
      sibnet: ['sibnet.ru', 'sibnet'],
      sendvid: ['sendvid.com', 'sendvid'],
      movearnpre: ['movearnpre.com', 'movearnpre'],
      doodstream: ['doodstream', 'dood'],
      lpayer: ['lpayer.embed4me.com', 'embed4me', 'lpayer'],
      oneupload: ['oneupload.to', 'oneupload'],
    };

    const keywords = serverKeywords[serverType.toLowerCase()] || [serverType.toLowerCase()];

    for (const [, url] of Object.entries(players)) {
      for (const keyword of keywords) {
        if (url.toLowerCase().includes(keyword)) {
          return url;
        }
      }
    }
    return null;
  }

  private async extractSourcesByServer(serverUrl: string): Promise<IVideo[]> {
    if (serverUrl.includes('vidmoly')) {
      return await this.vidmolyExtractor.extract(new URL(serverUrl));
    } else if (serverUrl.includes('movearnpre')) {
      return await this.movearnpreExtractor.extract(new URL(serverUrl));
    } else if (serverUrl.includes('sibnet')) {
      return await this.sibnetExtractor.extract(new URL(serverUrl));
    } else if (serverUrl.includes('sendvid')) {
      return await this.sendvidExtractor.extract(new URL(serverUrl));
    } else if (serverUrl.includes('embed4me')) {
      return await this.lplayerExtractor.extract(new URL(serverUrl));
    } else if (serverUrl.includes('doodstream')) {
      const source = await this.extractDoodstream(serverUrl);
      return source.sources;
    } else {
      const source = await this.extractGeneric(serverUrl);
      return source.sources;
    }
  }

  private extractDoodstream = async (embedUrl: string): Promise<ISource> => {
    try {
      const response = await makeRequest({
        url: embedUrl,
        headers: this.getHeaders(this.baseUrl),
      });

      const html = response.body;
      const tokenMatch = html.match(/\$\.get\('([^']+)',/);

      if (!tokenMatch) {
        throw new Error('Could not find Doodstream token URL');
      }

      const tokenUrl = tokenMatch[1];
      const fullTokenUrl = new URL(tokenUrl, embedUrl).href;

      const tokenResponse = await makeRequest({
        url: fullTokenUrl,
        headers: {
          ...this.getHeaders(embedUrl),
          Accept: '*/*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const token = tokenResponse.body;

      return {
        sources: [
          {
            url: `${token}`,
            quality: 'default',
            isM3U8: false,
          },
        ],
        headers: {
          Referer: embedUrl,
        },
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private extractGeneric = async (embedUrl: string): Promise<ISource> => {
    try {
      const response = await makeRequest({
        url: embedUrl,
        headers: this.getHeaders(this.baseUrl),
      });

      const html = response.body;

      const patterns = [
        /file:\s*["']([^"']+\.m3u8[^"']*)["']/,
        /source[^>]*src=["']([^"']+)["']/,
        /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/g,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          const url = match[1] || match[0];
          return {
            sources: [
              {
                url: url,
                quality: 'default',
                isM3U8: url.includes('.m3u8'),
              },
            ],
          };
        }
      }

      throw new Error('Could not extract video URL');
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default AnimeSama;
// (async () => {
//   const animeSama = new AnimeSama();
//   const anime = await animeSama.search('gachiakuta');
//   const info = await animeSama.fetchAnimeInfo(anime.results[0].id);
//   // console.log(info);
//   const sources = await animeSama.fetchEpisodeSources(info.episodes![0].id);
//   console.log(sources);
// })();
