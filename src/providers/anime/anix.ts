import { Cheerio, load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IAnimeResult,
  ISource,
  IEpisodeServer,
  SubOrSub,
  MediaFormat,
  MediaStatus,
} from '../../models';

class Anix extends AnimeParser {
  override readonly name = 'Anix';
  protected override baseUrl = 'https://anix.sh';
  protected override logo = 'https://anix.sh/img/logo.png';
  protected override classPath = 'ANIME.Anix';
  private readonly requestedWith = 'XMLHttpRequest';

  /**
   * @param page page number (optional)
   * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
   */
  fetchRecentEpisodes = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(
        `${this.baseUrl}/filter?status[]=${MediaStatus.ONGOING}&status[]=${MediaStatus.COMPLETED}&sort=recently_updated&page=${page}`
      );

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
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/filter?keyword=${query}&page=${page}`);
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
   * @param page Page number
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
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    throw new Error('Method not implemented.');
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default Anix;
