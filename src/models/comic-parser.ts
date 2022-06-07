import { BaseParser } from '.';

abstract class ComicParser extends BaseParser {
  /**
   * takes book link
   *
   * returns book info
   */
  protected abstract scrapePage(pageUrl: string): Promise<unknown>;
}
