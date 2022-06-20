import axios from 'axios';
import { load } from 'cheerio';
import { BookParser, ZLibrary, ZLibraryObject } from '../../models';
import { genElement, getSize, splitAuthor, splitStar } from '../../utils';

const { get } = axios;

class Zlibrary extends BookParser {
  protected override readonly baseUrl = 'https://3lib.net';
  override readonly name = 'ZLibrary';
  protected override classPath = 'BOOKS.Zlibrary';
  protected override logo = `${this.baseUrl}/img/logo.zlibrary.png`;
  override isWorking = false;

  search = async (bookUrl: string) => {
    bookUrl = encodeURIComponent(bookUrl);
    const { data } = await get(`${this.baseUrl}/s/${bookUrl}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0',
      },
    });
    const $ = load(data);
    const containers: ZLibrary[] = [];
    $('div.resItemBox').each((i, e) => {
      const container = new ZLibraryObject();

      container.image =
        $(genElement('div table tbody tr td div div a img', $(e).html() || '')).attr('data-src') ??
        '';

      container.title = $(
        genElement('div table tbody tr td:eq(1) table tbody tr td h3 a', $(e).html() || '')
      )
        .text()
        .trim();

      container.publisher = $(
        genElement('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', $(e).html() || '')
      ).text();

      container.authors = $(
        genElement('div table tbody tr td:eq(1) table tbody tr td div:eq(1)', $(e).html() || '')
      )
        .text()
        .split(', ');

      container.link = `${this.baseUrl}${$(
        genElement('div table tbody tr td:eq(1) table tbody tr td h3 a', $(e).html() || '')
      ).attr('href')}`;

      console.log($(e).children('.property_year').text());

      container.year = $(e).children('.property_year .property_value').text();
      container.language = $(e).children('.property_language .property_value').text();
      container.size = getSize($(e).children('.property__file .property_value').text());
      const { rating, quality } = splitStar($(e).children('.book_rating').text());
      container.bookRating = rating;
      container.bookQuality = quality;
      console.log(container);
    });
  };
}

export default Zlibrary;
