import axios from 'axios';
import { load } from 'cheerio';
import { BookParser } from '../../models';

const { get } = axios;

class Zlibrary extends BookParser {
  protected override readonly baseUrl = 'https://3lib.net/';
  override readonly name = 'ZLibrary';
  protected override classPath = 'BOOKS.Zlibrary';
  protected override logo = `${this.baseUrl}img/logo.zlibrary.png`;

  search = async (bookUrl: string) => {
    const data = await get(`${this.baseUrl}s/${bookUrl}`);
  };
}
