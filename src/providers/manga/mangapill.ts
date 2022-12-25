import axios from 'axios';
import { load } from 'cheerio';

import {
  MangaParser,
  ISearch,
  IMangaInfo,
  IMangaResult,
  IMangaChapterPage,
  IMangaChapter,
} from '../../models';

class MangaPill extends MangaParser {
  override readonly name = 'MangaPill';
  protected override baseUrl = 'https://mangapill.com';
  protected override logo = '';
  protected override classPath = 'MANGA.MangaPill';

  /**
   *
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IMangaResult>> => {
    try {
      const { data } = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      const $ = load(data);

      const results = $('div.container div.my-3.justify-end > div')
        .map(
          (i, el): IMangaResult => ({
            id: $(el).find('a').attr('href')?.split('/manga/')[1]!,
            title: $(el).find('div > a > div').text().trim(),
            image: $(el).find('a img').attr('data-src'),
          })
        )
        .get();

      return {
        results: results,
      };
    } catch (err) {
      //   console.log(err);
      throw new Error((err as Error).message);
    }
  };

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    const mangaInfo: IMangaInfo = {
      id: mangaId,
      title: '',
    };
    try {
      const { data } = await axios.get(`${this.baseUrl}/manga/${mangaId}`);
      const $ = load(data);

      mangaInfo.title = $('div.container div.my-3 div.flex-col div.mb-3 h1').text().trim();
      mangaInfo.description = $('div.container div.my-3  div.flex-col p.text--secondary')
        .text()
        .split('\n')
        .join(' ')!;
      mangaInfo.releaseDate = $('div.container div.my-3 div.flex-col div.gap-3.mb-3 div:contains("Year")')
        .text()
        .split('Year\n')[1]
        .trim();
      mangaInfo.genres = $('div.container div.my-3 div.flex-col div.mb-3:contains("Genres")')
        .text()
        .split('\n')
        .filter((genre: string) => genre !== 'Genres' && genre !== '')
        .map(genre => genre.trim());

      mangaInfo.chapters = $('div.container div.border-border div#chapters div.grid-cols-1 a')
        .map(
          (i, el): IMangaChapter => ({
            id: $(el).attr('href')?.split('/chapters/')[1]!,
            title: $(el).text().trim(),
            chapter: $(el).text().split('Chapter ')[1],
          })
        )
        .get();

      return mangaInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data } = await axios.get(`${this.baseUrl}/chapters/${chapterId}`);
      const $ = load(data);

      const chapterSelector = $('chapter-page');

      const pages = chapterSelector
        .map(
          (i, el): IMangaChapterPage => ({
            img: $(el).find('div picture img').attr('data-src')!,
            page: parseFloat($(el).find(`div[data-summary] > div`).text().split('page ')[1]),
          })
        )
        .get();

      return pages;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

// (async () => {
//   const manga = new MangaPill();
//   const search = await manga.search('one piece');
//   const info = await manga.fetchMangaInfo(search.results[1].id);
//   const pages = await manga.fetchChapterPages(info.chapters![0].id);
//   console.log(pages);
// })();

export default MangaPill;
