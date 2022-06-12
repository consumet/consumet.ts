import axios from 'axios';
import { load } from 'cheerio';
import { ComicParser, ComicRes, GetComicsComics, GetComicsComicsObject } from '../../models';
import { parsePostInfo } from '../../utils';

const s = async () => {};

class getComics extends ComicParser {
  override readonly baseUrl = 'https://getcomics.info/';
  override readonly name = 'GetComics';
  override search = async (query: string, pages?: number) => {
    const { data } = await axios.get(`${this.baseUrl}/page/${pages ? pages : 1}/?s=${query}`);
    const $ = load(data);
    const res: ComicRes = { containers: [], page: pages ? pages : 1 };
    $('article').each((i, el) => {
      const container: GetComicsComics = new GetComicsComicsObject();
      const vals = parsePostInfo($(el).children('div.post-info').text());
      container.image =
        $(el).children('div.post-header-image').children('a').children('img').attr('src') || '';
      container.title = $(el).children('div.post-info').children('h1').text();
      container.excerpt = $(el).children('div.post-info').children('p.post-excerpt').text();
      container.year = vals.year;
      container.size = vals.size;
      container.description = vals.description;
      const link = $(el).children('div.post-header-image').children('a').attr('href');
      container.ufile = link || '';
      res.containers.push(container);
    });
    for (let container of res.containers) {
      if (container.ufile != '') {
        const { data } = await axios.get(container.ufile);
        const $ = load(data);
        container.download = $('.aio-red[title="Download Now"]').attr('href') || '';
        container.readOnline = $('.aio-red[title="Read Online"]').attr('href') || '';
        container.ufile = $('.aio-blue').attr('href') || '';
        container.mega = $('.aio-purple').attr('href') || '';
        container.mediafire = $('.aio-orange').attr('href') || '';
        container.zippyshare = $('.aio-gray').attr('href') || '';
      }
    }
    return res;
  };
}

export default getComics;
