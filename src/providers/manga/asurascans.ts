import { CheerioAPI, load } from 'cheerio';

import {
  MangaParser,
  ISearch,
  IMangaInfo,
  IMangaResult,
  MediaStatus,
  IMangaChapterPage,
  IMangaChapter,
} from '../../models';
import { AxiosResponse } from 'axios';

class AsuraScans extends MangaParser {
  override readonly name = 'AsuraScans';
  protected override baseUrl = 'https://asuracomic.net';
  protected override logo = 'https://asuracomic.net/images/logo.png';
  protected override classPath = 'MANGA.AsuraScans';

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const { data }: AxiosResponse = await this.client.get(`${this.baseUrl}/${mangaId}`);
      const $: CheerioAPI = load(data);

      const dom = $('html');
      const topInfoWrapper = dom.find('.relative.col-span-12.space-y-3.px-6');

      const info: IMangaInfo = {
        id: mangaId,
        title: dom.find('.text-xl.font-bold:nth-child(1)').text().trim(),
        image: $(topInfoWrapper).find('img').attr('src'),
        rating: $(topInfoWrapper).find('div > div.px-2.py-1 > p').text().trim(),
        status: this.determineMediaState(
          $(topInfoWrapper).find('div > div.flex.flex-row > div:nth-child(1) > h3:nth-child(2)').text().trim()
        ),
        description: dom.find('span.font-medium.text-sm').text().trim(),
        authors: dom
          .find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(2) > h3:nth-child(2)')
          .text()
          .trim()
          .split('/')
          .map(ele => ele.trim()),
        artist: dom.find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(3) > h3:nth-child(2)').text().trim(),
        updatedOn: dom
          .find('.grid.grid-cols-1.gap-5.mt-8 > div:nth-child(5) > h3:nth-child(2)')
          .text()
          .trim(),
        genres: dom
          .find('.space-y-1.pt-4 > div > button')
          .map((index, ele) => $(ele).text().trim())
          .get(),
        recommendations: dom
          .find('.grid.grid-cols-2.gap-3.p-4 > a')
          .map((index, ele): IMangaResult => {
            return {
              id: $(ele).attr('href') as string,
              title: $(ele).find('div > h2.font-bold').text().trim(),
              image: $(ele).find('div > div > img').attr('src'),
              latestChapter: $(ele).find('div > h2:nth-child(3)').text().trim(),
              status: this.determineMediaState($(ele).find('div > div:nth-child(1) > span').text().trim()),
              rating: $(ele).find('div > div.block > span > label').text().trim(),
            };
          })
          .get(),
      };

      const chapMatch = data
        .replace(/\n/g, '')
        .replace(/\\/g, '')
        .match(/"chapters".*:(\[\{.*?\}\]),/);
      if (chapMatch) {
        const chap: { name: string; title: string; id: string; published_at: string }[] = JSON.parse(
          chapMatch[1]
        );
        info.chapters = chap.map((ele): IMangaChapter => {
          return {
            id: ele.name,
            title: ele.title != '' ? ele.title : `Chapter ${ele.name}`,
            releaseDate: ele.published_at,
          };
        });
      }
      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data }: AxiosResponse = await this.client.get(`${this.baseUrl}/series/${chapterId}`);
      const chapMatch = data.replace(/\\/g, '').match(/pages.*:(\[{['"]order["'].*?}\])/);
      if (!chapMatch) throw new Error('Parsing error');
      const chap: { order: string; url: string }[] = JSON.parse(chapMatch[1]);
      return chap.map(
        (page, index): IMangaChapterPage => ({
          page: index + 1,
          img: page.url,
        })
      );
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param query Search query
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IMangaResult>> => {
    try {
      const formattedQuery = encodeURI(query.toLowerCase());
      const { data }: AxiosResponse = await this.client.get(
        `${this.baseUrl}/series?page=${page}&name=${formattedQuery}`
      );

      const $: CheerioAPI = load(data);
      const dom = $('html');

      const results = dom
        .find('.grid.grid-cols-2.gap-3.p-4 > a')
        .map((index, ele): IMangaResult => {
          return {
            id: $(ele).attr('href') as string,
            title: $(ele).find('div > div > div:nth-child(2) > span:nth-child(1)').text().trim() as string,
            image: $(ele).find('div > div > div:nth-child(1) > img').attr('src') as string,
            status: this.determineMediaState(
              $(ele).find('div > div > div:nth-child(1) > span').text().trim()
            ),
            latestChapter: $(ele).find('div > div > div:nth-child(2) > span:nth-child(2)').text().trim(),
            rating: $(ele).find('div > div > div:nth-child(2) > span:nth-child(3) > label').text().trim(),
          };
        })
        .get();

      const searchResults: ISearch<IMangaResult> = {
        currentPage: page,
        hasNextPage:
          (dom.find('.flex.items-center.justify-center > a').attr('style') as string)
            .split('pointer-events:')[1]
            .slice(1, -1) === 'auto'
            ? true
            : false,
        results: results,
      };

      return searchResults;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private determineMediaState(state: string): MediaStatus {
    switch (state.toLowerCase().trim()) {
      case 'completed':
        return MediaStatus.COMPLETED;
      case 'ongoing':
        return MediaStatus.ONGOING;
      case 'dropped':
        return MediaStatus.CANCELLED;
      default:
        return MediaStatus.UNKNOWN;
    }
  }
}

export default AsuraScans;
