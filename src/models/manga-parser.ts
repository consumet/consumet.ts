import { BaseParser } from '.';

abstract class MangaParser extends BaseParser {
  /**
   * takes manga link or id
   *
   * returns manga info with chapters
   */
  protected abstract fetchMangaInfo(mangaUrl: string): Promise<unknown>;

  /**
   * takes chapter id
   *
   * returns chapter (image links)
   */
  protected abstract fetchChapterPages(chapterId: string, ...args: any): Promise<unknown>;
}

export default MangaParser;
