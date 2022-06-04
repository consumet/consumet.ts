import { BaseParser } from '.';

abstract class BookParser extends BaseParser {
  /**
   * takes book link
   *
   * returns book info
   */
  protected abstract scrapePage(pageUrl: string): Promise<unknown>;
}

export default BookParser;
