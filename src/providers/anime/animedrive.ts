import { load } from 'cheerio';
import axios, { AxiosResponse } from 'axios';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  IVideo,
  MediaFormat,
} from '../../models';

import { GogoCDN } from '../../extractors';

interface watchAnime {
  url: string;
  quality: string;
}

class AnimeDrive extends AnimeParser {
  override readonly name = 'AnimeDrive';
  protected override baseUrl = 'https://animedrive.hu';
  protected override logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeDrive/assets/logo.png';
  protected override classPath = 'ANIME.animedrive';

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await this.client.get(
        `${this.baseUrl}/search/?q=${decodeURIComponent(query)}&p=${page}`
      );

      const $ = load(data);

      const hasNextPage = $('.nk-pagination.nk-pagination-center > nav > a.nk-pagination-current-white').next('a').length > 0;

      const searchResults: IAnimeResult[] = [];

      $('div.row.row--grid .card').slice(1).each((i, el) => {
        searchResults.push({
          id: $(el).find('div.card__content > h3.card__title > a').attr('href')?.replace('https://animedrive.hu/anime/?id=', '')!,
          title: $(el).find('div.card__content > h3.card__title > a').text()!,
          image: $(el).find('div.card__cover > div.nk-image-box-1-a > img').attr('src')!,
          url: $(el).find('div.card__content > h3.card__title > a').attr('href')!,
        });
      });
      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: searchResults,
      };
    } catch (err: any) {
      throw new Error(err);
    }
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const info: IAnimeInfo = {
      id: id,
      title: '',
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/anime/?id=${id}`);
      const $ = load(data);

      info.title = $('div.col-sm-12.col-md-8.col-lg-9 > h2').text()!;
      info.image = $('div.nk-image-box-1-a.col-12 > img').attr('src')!;
      info.description = $('div.col-sm-12.col-md-8.col-lg-9 > p.col-12').text().trim()!;
      switch ($('table.animeSpecs.left td:contains("TÍPUS:")').next('td').text().trim()) {
        case 'Sorozat':
          info.type = MediaFormat.TV;
          break;
        case 'Film':
          info.type = MediaFormat.MOVIE;
          break;
        case 'Special':
          info.type = MediaFormat.SPECIAL;
          break;
        case 'OVA':
          info.type = MediaFormat.OVA;
          break;
        default:
          info.type = MediaFormat.TV;
          break;
      }

      info.releaseYear = $('table.animeSpecs.left td:contains("KIADÁS:")').next('td').text().trim()!;
      switch ($('table.animeSpecs.left td:contains("STÁTUSZ:")').next('td').text().trim()!) {
        case 'Fut':
          info.status = MediaStatus.ONGOING;
          break;
        case 'Befejezett':
          info.status = MediaStatus.COMPLETED;
          break;
        case 'Hamarosan':
          info.status = MediaStatus.NOT_YET_AIRED;
          break;
        default:
          info.status = MediaStatus.UNKNOWN;
          break;
      }
      let totalEpisodesWithSlash = $('table.animeSpecs.right td:contains("RÉSZEK:")').next('td').text().trim();
      let totalEpisodesWithoutSlash = totalEpisodesWithSlash.split('/')[0].trim();
      info.totalEpisodes = parseInt(
        totalEpisodesWithoutSlash
      )!;
      info.url = `${this.baseUrl}/anime/?id=${id}`;
      info.episodes = [];
      const episodes = Array.from({ length: info.totalEpisodes }, (_, i) => i + 1);
      episodes.forEach((element, i) =>
        info.episodes?.push({
          id: `?id=${id}&ep=${i + 1}`,
          number: i + 1,
          title: `${info.title} Episode ${i + 1}`,
          url: `${this.baseUrl}/watch/?id=${id}&ep=${i + 1}`,
        })
      );
      return info;
    } catch (err: any) {
      throw new Error(err);
    }
  };

  /**
   * @param page Page number
   */
  fetchRecentEpisodes = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/latest-added?page=${page}`);
      const $ = load(data);

      const hasNextPage = $('.pagination > nav > ul > li').last().hasClass('disabled') ? false : true;

      const recentEpisodes: IAnimeResult[] = [];

      $('div.film_list-wrap > div').each((i, el) => {
        recentEpisodes.push({
          id: $(el).find('div.film-poster > a').attr('href')?.replace('/watch/', '')!,
          image: $(el).find('div.film-poster > img').attr('data-src')!,
          title: $(el).find('div.film-poster > img').attr('alt')!,
          url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}!`,
          episode: parseInt($(el).find('div.tick-eps').text().replace('EP ', '').split('/')[0])!,
        });
      });

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
   *
   * @param episodeId episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Dnt': '1',
      'Referer': 'https://animedrive.hu/',
      'Sec-Ch-Ua': '"Not(A:Brand";v="24", "Chromium";v="122"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'iframe',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-site',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    };

    try {
      const response: AxiosResponse<string> = await axios.get(
        `https://player.animedrive.hu/player_v1.5.php${episodeId}`,
        { headers }
      );

      const $ = load(response.data);
      const htmlData = response.data;

      const sourcesDataMatch = /sources:\s*\[\s*(.*?)\s*\],?\s*poster:/.exec(htmlData);
      let sources: watchAnime[] = [];

      if (sourcesDataMatch) {
        const sourcesData = sourcesDataMatch[1];
        const sourceRegex = /{\s*src:\s*'(.*?)'.*?type:\s*'(.*?)'.*?size:\s*(\d+),?\s*}/g;
        let match;

        while ((match = sourceRegex.exec(sourcesData)) !== null) {
          const url = match[1];
          const size = match[3];
          const quality = `${size}p`;
          sources.push({ url: url, quality: quality });
        }
      }

      const convertedSources: IVideo[] = sources.map(wa => ({ url: wa.url, quality: wa.quality }));
      return { sources: convertedSources }; // Ensure sources matches ISource's definition
      
    } catch (err) {
      console.log(err);
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  /**
   * @deprecated Use fetchEpisodeSources instead
   */
  override fetchEpisodeServers = (episodeIs: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default AnimeDrive;

