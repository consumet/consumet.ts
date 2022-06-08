import axios from 'axios';
import { load } from 'cheerio';
import { ComicParser } from '../../models';

class GetComics extends ComicParser {
  override readonly baseUrl = 'https://getcomics.info/';
  override readonly name = 'GetComics';
  override search = async (query: string) => {
    const { data } = await axios.get(`${this.baseUrl}?s=${query}`);
    const $ = load(data);
    $('article').each((i, e) => {
      console.log($(e).children().text());
    });
  };
}

export default GetComics;
