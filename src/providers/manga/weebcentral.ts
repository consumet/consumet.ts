import { load } from 'cheerio';

import {
  MangaParser,
  ISearch,
  IMangaInfo,
  IMangaResult,
  IMangaChapterPage,
  IMangaChapter,
} from '../../models';

class WeebCentral extends MangaParser {
  override readonly name = 'WeebCentral';
  protected override baseUrl = 'https://weebcentral.com';
  protected override logo = 'https://weebcentral.com/static/images/brand.png';
  protected override classPath = 'MANGA.WeebCentral';

  private headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Connection: 'keep-alive',
  };

  override search = async (query: string, page: number = 1): Promise<ISearch<IMangaResult>> => {
    try {
      const limit = 32;
      const offset = (page - 1) * limit;

      const { data } = await this.client.get(`${this.baseUrl}/search/data`, {
        params: {
          limit: limit,
          offset: offset,
          text: query,
          sort: 'Best Match',
          order: 'Descending',
          official: 'Any',
          anime: 'Any',
          adult: 'Any',
          display_mode: 'Full Display',
        },
        headers: {
          ...this.headers,
          'HX-Request': 'true',
          'HX-Current-URL': `${this.baseUrl}/search?text=${encodeURIComponent(
            query
          )}&sort=Best+Match&order=Descending&official=Any&anime=Any&adult=Any&display_mode=Full+Display`,
        },
        decompress: true,
      });

      const $ = load(data);

      const results: IMangaResult[] = $('article.bg-base-300')
        .map((i, el) => {
          const linkElement = $(el).find('section a').first();
          const href = linkElement.attr('href');
          const id = href?.split('/series/')[1] || '';

          const title =
            $(el).find('section.hidden.lg\\:block .tooltip a').text().trim() ||
            $(el).find('section a .text-ellipsis').text().trim();

          const image =
            $(el).find('picture source').first().attr('srcset') || $(el).find('picture img').attr('src');

          return {
            id: id,
            title: title,
            image: image,
          };
        })
        .get();

      const hasNextPage = results.length === limit;

      return {
        currentPage: page,
        hasNextPage: hasNextPage,
        results: results,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    const mangaInfo: IMangaInfo = {
      id: mangaId,
      title: '',
    };
    try {
      const cleanId = mangaId.split('/')[0];

      const [mainResponse, chaptersResponse] = await Promise.all([
        this.client.get(`${this.baseUrl}/series/${mangaId}`, {
          headers: this.headers,
          decompress: true,
        }),
        this.client.get(`${this.baseUrl}/series/${cleanId}/full-chapter-list`, {
          headers: {
            ...this.headers,
            'HX-Request': 'true',
            'HX-Target': 'chapter-list',
            'HX-Current-URL': `${this.baseUrl}/series/${mangaId}`,
          },
          decompress: true,
        }),
      ]);

      const $ = load(mainResponse.data);
      const $chapters = load(chaptersResponse.data);

      mangaInfo.title = $('h1.text-2xl.font-bold').first().text().trim() || $('h1').first().text().trim();

      mangaInfo.image = $('picture source').attr('srcset') || $('picture img').attr('src');

      const descriptionElement = $('strong:contains("Description")').parent().find('p');
      mangaInfo.description = descriptionElement.text().trim();

      const authorLinks = $('strong:contains("Author(s)")').parent().find('a');
      mangaInfo.authors = authorLinks.map((i, el) => $(el).text().trim()).get();

      const genreLinks = $('strong:contains("Tags(s)")').parent().find('a');
      mangaInfo.genres = genreLinks.map((i, el) => $(el).text().trim()).get();

      const releaseDateText = $('strong:contains("Released")').parent().find('span').text().trim();
      mangaInfo.releaseDate = releaseDateText;

      const statusLink = $('strong:contains("Status")').parent().find('a');
      mangaInfo.status = statusLink.text().trim().toLowerCase() as any;

      mangaInfo.chapters = $chapters('a[href*="/chapters/"]')
        .map((i, el): IMangaChapter => {
          const href = $chapters(el).attr('href');
          const chapterId = href?.split('/chapters/')[1];
          const chapterText = $chapters(el).find('span.grow span').first().text().trim();
          const timeElement = $chapters(el).find('time');
          const releaseDate = timeElement.attr('datetime');

          return {
            id: chapterId!,
            title: chapterText,
            releaseDate: releaseDate,
          };
        })
        .get();

      return mangaInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data } = await this.client.get(
        `${this.baseUrl}/chapters/${chapterId}/images?is_prev=False&current_page=1&reading_style=long_strip`,
        {
          headers: {
            ...this.headers,
            Referer: `${this.baseUrl}/chapters/${chapterId}`,
            'HX-Request': 'true',
            'HX-Current-URL': `${this.baseUrl}/chapters/${chapterId}`,
          },
          decompress: true,
        }
      );
      const $ = load(data);

      const pages = $('img')
        .map((i, el): IMangaChapterPage => {
          const imgSrc = $(el).attr('src');
          const altText = $(el).attr('alt') || '';

          const pageMatch = altText.match(/Page (\d+)/);
          const pageNumber = pageMatch ? parseInt(pageMatch[1]) : i + 1;

          return {
            img: imgSrc!,
            page: pageNumber,
            headerForImage: this.baseUrl,
          };
        })
        .get()
        .filter(page => page.img && !page.img.includes('broken_image.jpg')); // Filter out broken images

      return pages;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

// (async () => {
//   const manga = new WeebCentral();
//   const search = await manga.search('bleach');
//   const info = await manga.fetchMangaInfo("01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom");
//   const pages = await manga.fetchChapterPages("01K8VEAEHDBSVQ6PJ3MNBDH7D7");
//   console.log(pages)
// })();

export default WeebCentral;
