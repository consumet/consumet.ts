import { BaseParser } from '.';

abstract class LighNovelParser extends BaseParser {
  /**
   * takes light novel link or id
   *
   * returns lightNovel info
   */
  protected abstract fetchLighNovelInfo(lightNovelUrl: string, ...args: any): Promise<unknown>;

  /**
   * takes chapter id
   *
   * returns chapter content (text)
   */
  protected abstract fetchChapterContent(chapterId: string, ...args: any): Promise<unknown>;
}

export default LighNovelParser;
