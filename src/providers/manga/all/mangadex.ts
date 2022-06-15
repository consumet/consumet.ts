import axios, { AxiosError, AxiosResponse } from 'axios';
import { encode } from 'ascii-url-encoder';

import { MangaParser, IMangaSearch, IMangaInfo } from '../../../models/';

class MangaDex extends MangaParser {
  override readonly name = 'mangadex';
  protected override baseUrl = 'https://mangadex.org';

  protected override logo =
    'https://nitter.net/pic/pbs.twimg.com%2Fprofile_images%2F1391016345714757632%2Fxbt_jW78.jpg';
  protected override classPath = 'MANGA.all.MangaDex';

  private readonly apiUrl = 'https://api.mangadex.org';

  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const { data } = await axios.get(`${this.apiUrl}/manga/${mangaId}`);
      const mangaInfo: IMangaInfo = {
        id: data.data.id,
        title: data.data.attributes.title.en,
        altTtitles: data.data.attributes.altTitles,
        descitption: data.data.attributes.description,
        genres: data.data.attributes.tags
          .filter((tag: any) => tag.attributes.group === 'genre')
          .map((tag: any) => tag.attributes.name.en),
        themes: data.data.attributes.tags
          .filter((tag: any) => tag.attributes.group === 'theme')
          .map((tag: any) => tag.attributes.name.en),
        status: data.data.attributes.status,
        releaseDate: data.data.attributes.year,
        chapters: [],
      };

      const allChapters = await this.fetchAllChapters(mangaId, 0);

      for (const chapter of allChapters) {
        mangaInfo.chapters?.push({
          id: chapter.id,
          title: chapter.attributes.title ? chapter.attributes.title : chapter.attributes.chapter,
          pages: chapter.attributes.pages,
        });
      }
      return mangaInfo;
    } catch (err) {
      if ((err as AxiosError).code == 'ERR_BAD_REQUEST') {
        throw new Error('Bad request. Make sure you have entered a valid query.');
      }

      throw new Error((err as Error).message);
    }
  };

  /**
   * @currently only supports english
   */
  override fetchChapterPages = async (chapterId: string, ...args: any): Promise<unknown> => {
    try {
      const res = await axios.get(`${this.apiUrl}/at-home/server/${chapterId}`);
      const pages: { img: string; page: number }[] = [];

      for (const id of res.data.chapter.data) {
        pages.push({
          img: `${res.data.baseUrl}/data/${res.data.chapter.hash}/${id}`,
          page: parseInt(id.split('-')[0]),
        });
      }
      return pages;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param query search query
   * @param page page number (default: 1)
   * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
   */
  override search = async (
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IMangaSearch> => {
    if (page <= 0) throw new Error('Page number must be greater than 0');
    if (limit > 100) throw new Error('Limit must be less than or equal to 100');
    if (limit * (page - 1) >= 10000) throw new Error('not enough results');

    try {
      const res = await axios.get(
        `${this.apiUrl}/manga?limit=${limit}&title=${encode(query)}&limit=${limit}&offset=${
          limit * (page - 1)
        }&order[relevance]=desc`
      );

      if (res.data.result == 'ok') {
        const results: IMangaSearch = {
          currentPage: page + 1,
          results: [],
        };

        for (const manga of res.data.data) {
          results.results.push({
            id: manga.id,
            title: Object.values(manga.attributes.title)[0] as string,
            altTtitles: manga.attributes.altTitles,
            descitption: Object.values(manga.attributes.description)[0] as string,
            status: manga.attributes.status,
            releaseDate: manga.attributes.year,
            contentRating: manga.attributes.contentRating,
            lastVolume: manga.attributes.lastVolume,
            lastChapter: manga.attributes.lastChapter,
          });
        }

        return results;
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      if ((err as AxiosError).code == 'ERR_BAD_REQUEST') {
        throw new Error('Bad request. Make sure you have entered a valid query.');
      }

      throw new Error((err as Error).message);
    }
  };

  private fetchAllChapters = async (
    mangaId: string,
    offset: number,
    res?: AxiosResponse<any, any>
  ): Promise<any[]> => {
    if (res?.data?.offset + 96 >= res?.data?.total) {
      return [];
    }

    const response = await axios.get(
      `${this.apiUrl}/manga/${mangaId}/feed?offset=${offset}&limit=96&order[volume]=desc&order[chapter]=desc&translatedLanguage[]=en`
    );

    return [
      ...response.data.data,
      ...(await this.fetchAllChapters(mangaId, offset + 96, response)),
    ];
  };
}

export default MangaDex;
