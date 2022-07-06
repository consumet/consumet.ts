import axios from 'axios';
import { load } from 'cheerio';
import { BookParser, ZLibrary, ZLibraryObject } from '../../models';
import { genElement, countDivs } from '../../utils';

const { get } = axios;

class Zlibrary extends BookParser {
  protected override readonly baseUrl = 'https://3lib.net';
  override readonly name = 'ZLibrary';
  protected override classPath = 'BOOKS.Zlibrary';
  protected override logo = `${this.baseUrl}/img/logo.zlibrary.png`;
  override isWorking = true;
  private headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0',
  };

  search = async (bookTitle: string, page: number = 1) => {
    bookTitle = encodeURIComponent(bookTitle);
    if (page > 10 || page < 1) {
      return;
    }
    const { data } = await get(`${this.baseUrl}/s/${bookTitle}?page=${page}`, {
      headers: this.headers,
    });
    const $ = load(data);
    const containers: ZLibrary[] = [];
    $('div.resItemBox').each((i, e) => {
      const container = new ZLibraryObject();

      const html = $(e).html() || '';

      container.image =
        $(genElement('div table tbody tr td div div a img', html)).attr('data-src')![0] == 'h' &&
        $(genElement('div table tbody tr td div div a img', html)).attr('data-src')![1] == 't' &&
        $(genElement('div table tbody tr td div div a img', html)).attr('data-src')![2] == 't' &&
        $(genElement('div table tbody tr td div div a img', html)).attr('data-src')![3] == 'p'
          ? `${$(genElement('div table tbody tr td div div a img', html)).attr('data-src')}`
          : `${this.baseUrl}${$(genElement('div table tbody tr td div div a img', html)).attr(
              'data-src'
            )}`;

      container.title = $(genElement('div table tbody tr td:eq(1) table tbody tr td h3 a', html))
        .text()
        .trim();

      container.publisher =
        countDivs(
          $(genElement('div table tbody tr td:eq(1) table tbody tr td', html)).html() ?? ''
        ) == 2
          ? $(genElement('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', html)).text()
          : '';

      container.authors =
        countDivs(
          $(genElement('div table tbody tr td:eq(1) table tbody tr td', html)).html() ?? ''
        ) == 2
          ? $(genElement('div table tbody tr td:eq(1) table tbody tr td div:eq(1) a', html))
              .text()
              .split(', ')
          : $(genElement('div table tbody tr td:eq(1) table tbody tr td div:eq(0) a', html))
              .text()
              .split(', ');

      container.link = `${this.baseUrl}${$(
        genElement('div table tbody tr td:eq(1) table tbody tr td h3 a', html)
      ).attr('href')}`;

      container.year = $(
        genElement(
          'div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div div:eq(1)',
          html
        )
      ).text();

      container.language = $(
        genElement(
          'div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(1) div:eq(1)',
          html
        )
      ).text();
      container.size = $(
        genElement(
          'div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(2) div:eq(1)',
          html
        )
      ).text();
      container.bookRating = $(
        genElement(
          'div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(4) div span:eq(0)',
          html
        )
      )
        .text()
        .trim();
      container.bookQuality = $(
        genElement(
          'div table tbody tr td:eq(1) table tbody tr:eq(1) td div:eq(1) div:eq(4) div span:eq(1)',
          html
        )
      )
        .text()
        .trim();
      containers.push(container);
    });
    for (let c of containers) {
      const { data } = await get(c.link, {
        headers: this.headers,
      });
      const $ = load(data);

      c.description = $('#bookDescriptionBox').text().trim();
      c.isbn = [
        $('.property_isbn.10 .property_value').text().trim(),
        $('.property_isbn.13 .property_value').text().trim(),
      ];
      c.edition = $('.property_edition .property_value').text().trim();
      c.pages = $('.property_pages .property_value').text().trim();
      c.link = $('.addDownloadedBook').attr('href') ?? '';
    }
    return {
      containers,
      page,
    };
  };
}

export default Zlibrary;
