import { CheerioAPI, load } from 'cheerio';
import {
  IMangaChapter,
  IMangaChapterPage,
  IMangaInfo,
  IMangaResult,
  ISearch,
  MangaParser,
  MediaStatus,
} from '../../models';
import { AxiosResponse } from 'axios';

interface ReadMangaSearchResultData {
  overview: string;
  original_title: string;
  link: string;
  image: string;
}

interface ReadMangaSearchResult {
  results: ReadMangaSearchResultData[];
}

enum RankingType {
  TOPRATED = 'top-rated',
  NEW = 'new',
}

interface RatingResultTitles {
  title: string;
  link: string;
  img: string;
  description: string;
  status: MediaStatus;
  categories: string[];
  type: string; // should be ENUM
  views: number;
  rate: string;
}

interface RatingResult {
  titles: RatingResultTitles[];
  currentPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  hasNextLink: boolean;
}

class ReadManga extends MangaParser {
  override readonly name = 'ReadManga';
  protected override baseUrl: string = 'https://readmanga.app';
  protected override logo = 'https://readmanga.app/assets/new/images/readmangapp-light.png'; // light logo
  protected override classPath = 'MANGA.ReadManga';
  protected darkLogo = 'https://readmanga.app/assets/new/images/readmangaapp-dark.png';

  /**
   *
   * @param query Search query
   */

  override search = async (query: string): Promise<ISearch<IMangaResult>> => {
    try {
      const { data }: AxiosResponse = await this.client.get(
        `${this.baseUrl}/search/autocomplete?dataType=json&query=${query}`,
        {
          headers: {
            Referer: this.baseUrl,
          },
        }
      );

      const result: ISearch<IMangaResult> = {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 1,
        totalResults: (data as ReadMangaSearchResult).results.length,
        results: this.formatSearchResultData((data as ReadMangaSearchResult).results),
      };

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchNewManga = async (page: number = 1): Promise<ISearch<IMangaResult>> => {
    if (page < 1) {
      throw new Error('please provide a page number that is greater than- or equal to 1');
    }

    try {
      const { data }: AxiosResponse = await this.client.get(
        `${this.baseUrl}/ranking/${RankingType.NEW}/${page}`,
        {
          headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            Referer: this.baseUrl,
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        }
      );

      const result = this.getRankingTitleCardData(data, page);

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  fetchTopRatedManga = async (page: number = 1): Promise<ISearch<IMangaResult>> => {
    if (page < 1) {
      throw new Error('please provide a page number that is greater than- or equal to 1');
    }

    try {
      const { data }: AxiosResponse = await this.client.get(
        `${this.baseUrl}/ranking/${RankingType.TOPRATED}/${page}`,
        {
          headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            Referer: this.baseUrl,
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        }
      );

      const result = this.getRankingTitleCardData(data, page);

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/${mangaId}`, {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'en-US,en;q=0.9',
          'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          Referer: this.baseUrl,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
      const $: CheerioAPI = load(data);

      const dom = $('html');
      const title = dom.find('.section-header.mb-2 > .section-header-title.me-auto > h2').text().trim();
      const image = dom.find('.novels-detail > .novels-detail-left > img').attr('src');

      const altTitles = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(1) > div:nth-child(2) > span')
        .text()
        .split(',');
      const status = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(2) > div:nth-child(2)')
        .text()
        .trim();
      const genres = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(3) > div:nth-child(2) > a')
        .map((index, ele) => $(ele).text().trim())
        .get();
      const type = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(4) > div:nth-child(2) > span')
        .text()
        .trim();
      const rating = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(5) > div:nth-child(2) > span')
        .text()
        .trim();
      const authors = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(6) > div:nth-child(2) > a')
        .map((index, ele) => $(ele).text().trim())
        .get();
      const artists = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(7) > div:nth-child(2)')
        .text()
        .trim();
      const views = dom
        .find('.novels-detail > .novels-detail-right > ul > li:nth-child(8) > div:nth-child(2)')
        .text()
        .trim();
      const description = dom.find('.col-md-12.mb-3 > .empty-box > p').text();
      const chapters = dom
        .find('div > .cm-tabs-content > ul > li > a')
        .map((index, ele) => {
          // link to chapter is not always baseUrl -> id = entire link
          const chapter: IMangaChapter = {
            id: ele.attribs['href'],
            title: $(ele).text().trim(),
          };

          return chapter;
        })
        .get();

      const result: IMangaInfo = {
        authors,
        genres,
        chapters,
        id: mangaId,
        title,
        altTitles,
        image,
        description,
        status: this.getStatus(status),
        rating,
        artists,
        type,
        views,
      };

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data } = await this.client.get(chapterId, {
        headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'en-US,en;q=0.9',
          'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          Referer: this.baseUrl,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });

      const $: CheerioAPI = load(data);
      const dom = $('html');

      const imageSources = dom
        .find('.chapter-detail-novel-big-image.text-center > img')
        .map((index, ele) => {
          const chapterPage: IMangaChapterPage = {
            img: ele.attribs['src'],
            page: index + 1,
          };

          return chapterPage;
        })
        .get();

      return imageSources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private getRankingTitleCardData = (text: string, page: number): ISearch<IMangaResult> => {
    const $: CheerioAPI = load(text);
    const dom = $('html');

    const titles = dom
      .find('.category-items.ranking-category.cm-list > ul > li')
      .map((index, ele) => {
        return {
          title: $(ele).find('.category-name > a').text().trim(),
          id: ($(ele).find('div > a').attr('href') as string).replace('/', ''),
          img: $(ele).find('div:nth-child(2) > div > a > img').attr('src'),
          description: $(ele)
            .find('div:nth-child(2) > div:nth-child(2) > div > a > span')
            .text()
            .split('\n')
            .join(' ')
            .trim(),
          status: this.getStatus(
            $(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(1) > span').text().trim()
          ),
          categories: $(ele)
            .find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(2) > a')
            .map((index, str) => $(str).text())
            .get(),
          type: $(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(3) > span').text(),
          views: parseInt(
            $(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(4) > span').text()
          ),
          rate: parseInt(
            $(ele).find('div:nth-child(2) > div:nth-child(2) > ul > li:nth-child(5) > span').text()
          ),
        };
      })
      .get();

    const totalPages =
      dom.find('nav.cm-pagination > a:last-child').attr('href') === '#'
        ? page
        : this.getTotalPages(dom.find('nav.cm-pagination > a:last-child').attr('href') as string, '/');

    const result: ISearch<IMangaResult> = {
      results: titles,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: !(dom.find('nav.cm-pagination > a:last-child').attr('href') === '#'),
    };
    return result;
  };

  private getTotalPages = (str: string, splitOn: string): number => {
    const split = str.split(splitOn);

    return parseInt(split[split.length - 1]);
  };

  private formatSearchResultData = (results: ReadMangaSearchResultData[]): IMangaResult[] => {
    const formattedResults: IMangaResult[] = results.map(result => {
      const split = result.link.split('/');
      const id = split[split.length - 1];
      return {
        id: id,
        title: result.original_title,
        altTitles: result.overview,
        image: result.image,
      };
    });

    return formattedResults;
  };

  private getStatus = (statusStr: string): MediaStatus => {
    switch (statusStr) {
      case MediaStatus.CANCELLED:
        return MediaStatus.CANCELLED;

      case MediaStatus.COMPLETED:
        return MediaStatus.COMPLETED;

      case MediaStatus.HIATUS:
        return MediaStatus.HIATUS;

      case MediaStatus.NOT_YET_AIRED:
        return MediaStatus.NOT_YET_AIRED;

      case MediaStatus.ONGOING:
        return MediaStatus.ONGOING;

      default:
        return MediaStatus.UNKNOWN;
    }
  };
}

export default ReadManga;
