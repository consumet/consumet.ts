import {
  IMangaChapter,
  IMangaChapterPage,
  IMangaInfo,
  IMangaResult,
  ISearch,
  MangaParser,
  MediaStatus,
} from '../../models';
import { CheerioAPI, load } from 'cheerio';

interface VyvyMangaSearchResult {
  result: VyvyMangaSearchResultData[];
}

interface VyvyMangaSearchResultData {
  authors: {
    id: number;
    name: string;
    name_url: string;
  }[];
  completed: number; // enum, 0 is completed, 2 is ongoing i think
  created_at: string;
  description: string;
  id: number;
  lastChapter: string;
  latest_chapter_id: number;
  main_manga_id: null;
  name: string;
  name_url: string;
  scored: number;
  status: number; // probably enum aswell
  thumbnail: string;
  title: string; // is alternate titles, seperated by comma
  updated_at: string;
  viewed: number;
  voted: number;
}

class VyvyManga extends MangaParser {
  override readonly name: string = 'Vyvymanga';
  protected override baseUrl: string = 'https://vyvymanga.net/api';
  protected override logo: string = 'https://vyvymanga.net/web/img/icon.png';
  protected override classPath = 'MANGA.VyvyManga';
  protected baseWebsiteUrl = 'https://vyvymanga.net';

  override search = async (query: string, page: number = 1): Promise<ISearch<IMangaResult>> => {
    if (page < 1) throw new Error('page must be equal to 1 or greater');

    try {
      const formattedQuery = query.trim().toLowerCase().split(' ').join('+');
      const { data }: { data: string } = await this.client.get(
        `${this.baseWebsiteUrl}/search?search_po=0&q=${formattedQuery}&page=${page}`
      );

      const $: CheerioAPI = load(data);
      const dom = $('html');

      const result = dom
        .find('.row.book-list > div > div > a')
        .map((index, ele) => {
          return {
            id: ($(ele).find('div.comic-image').attr('data-background-image') as string)
              .split('cover/')[1]
              .split('/')[0],
            title: $(ele).find('div.comic-title').text().trim(),
            image: $(ele).find('div.comic-image').attr('data-background-image') as string,
            lastChapter: $(ele).find('div.comic-image > span').text().trim(),
          };
        })
        .get();

      const pagination = dom.find('ul.pagination > li');

      if (!pagination.length) {
        return {
          currentPage: page,
          hasNextPage: false,
          totalPages: page,
          results: result,
        };
      }

      const lastPage = parseInt(
        $(pagination[pagination.length - 2])
          .find('a')
          .text()
          .trim()
      );

      return {
        currentPage: page,
        hasNextPage: page === lastPage ? false : true,
        totalPages: lastPage,
        results: result,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  searchApi = async (query: string): Promise<ISearch<IMangaResult>> => {
    try {
      const formattedQuery = query.toLowerCase().split(' ').join('%20');
      const { data }: { data: VyvyMangaSearchResult } = await this.client.request({
        method: 'get',
        url: `${this.baseUrl}/manga/search?search=${formattedQuery}&uid=`,
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: `${this.baseWebsiteUrl}/`,
        },
      });

      const result = {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 1,
        totalResults: data.result.length,
        results: this.formatSearchResultData(data.result),
      };

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const { data }: { data: string } = await this.client.request({
        method: 'get',
        url: `${this.baseUrl}/manga-detail/${mangaId}?userid=`,
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: `${this.baseWebsiteUrl}/`,
        },
      });

      const $: CheerioAPI = load(data);
      const dom = $('html');

      const title = dom.find('.img-manga').attr('title') as string;
      const img = dom.find('.img-manga').attr('src');
      const authors = $(dom.find('.col-md-7 > p:nth-child(2) > a'))
        .map((index, ele) => $(ele).text().trim())
        .get();
      const status = $(dom.find('div.col-md-7 > p')[1])
        .find('span:nth-child(3)')
        .text()
        .trim() as MediaStatus;
      const genres = $(dom.find('div.col-md-7 > p')[2])
        .find('a')
        .map((index, ele) => $(ele).text().trim())
        .get();
      const description = dom.find('.summary > .content').text().trim();
      const chapters = dom
        .find('.list-group > a')
        .map((index, ele) => {
          const releaseDate = $(ele).find('p').text().trim();
          const title = $(ele).text().replace(releaseDate, '').trim();

          const chapterObj: IMangaChapter = {
            id: $(ele).attr('href') as string,
            title: title,
            releaseDate: releaseDate,
          };

          return chapterObj;
        })
        .get()
        .reverse();

      const mangaInfo = {
        id: mangaId,
        title,
        img,
        authors,
        status,
        genres,
        description,
        chapters,
      };

      return mangaInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data } = await this.client.get(chapterId);

      const $: CheerioAPI = load(data);
      const dom = $('html');

      const images: IMangaChapterPage[] = dom
        .find('.vview.carousel-inner > div > img')
        .map((index, ele) => {
          return {
            img: ($(ele).attr('data-src') as string).slice(0, -5),
            page: index + 1,
          };
        })
        .get();

      return images;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private formatSearchResultData = (searchResultData: VyvyMangaSearchResultData[]): IMangaResult[] => {
    return searchResultData.map(ele => {
      return {
        id: `${ele.id}`,
        title: ele.name,
        altTitles: ele.title
          .split(',')
          .filter(ele => ele.length)
          .map(ele => ele.trim()),
        description: ele.description,
        image: ele.thumbnail,
        status: ele.completed === 1 ? MediaStatus.COMPLETED : MediaStatus.ONGOING,
        score: ele.scored,
        views: ele.viewed,
        votes: ele.voted,
        latestChapterId: ele.latest_chapter_id,
        lastChapter: ele.lastChapter,
      };
    });
  };
}

export default VyvyManga;
