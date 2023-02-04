import { load } from 'cheerio';
import axios from 'axios';
import FormData from 'form-data';

import {
  LightNovelParser,
  ISearch,
  ILightNovelInfo,
  ILightNovelChapter,
  ILightNovelChapterContent,
  ILightNovelResult,
} from '../../models';

class Anify extends LightNovelParser {
  override readonly name = 'Anify';
  protected override baseUrl = 'https://anify.tv';
  private api = "https://api.anify.tv";

  protected override logo = 'https://anify.tv/images/Home%20Page%20Background/2022_12_10%20Anify%20Homepage%20Background%20Layer%201.png';
  protected override classPath = 'LIGHT_NOVELS.ReadLightNovels';

  /**
   *
   * @param lightNovelUrl light novel link or id
   * @param chapterPage chapter page number (optional) if not provided, will fetch all chapter pages.
   */
  override fetchLightNovelInfo = async (
    lightNovelUrl: string,
    chapterPage: number = -1
  ): Promise<ILightNovelInfo> => {
    throw new Error("Method not implemented.")
  };
  private fetchChapters = async (
    novelId: number,
    chapterPage: number,
    referer: string
  ): Promise<ILightNovelChapter[]> => {
    throw new Error("Method not implemented.")
  };

  /**
   *
   * @param chapterId chapter id or url
   */
  override fetchChapterContent = async (chapterId: string): Promise<ILightNovelChapterContent> => {
    throw new Error("Method not implemented.")
  };

  /**
   *
   * @param query search query string
   */
  override search = async (query: string): Promise<ISearch<ILightNovelResult>> => {
    const result: ISearch<ILightNovelResult> = { results: [] };
    try {
      const res = await axios.post(`${this.api}/search/novels`, {
        query: query
      });
       res.data.forEach((novel: any) => {
        result.results.push({
            id: novel.id,
            title: novel.title,
            url: `${this.api}/pdf/${novel.id}`,
            img: `${this.api}/cover/${novel.cover}`
        });
      });
      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default Anify;
