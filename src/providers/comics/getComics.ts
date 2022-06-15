import axios from 'axios';
import { load } from 'cheerio';
import { ComicParser, ComicRes, GetComicsComics, GetComicsComicsObject } from '../../models';
import { parsePostInfo } from '../../utils';

const s = async () => {};

class getComics extends ComicParser {
  override readonly baseUrl = 'https://getcomics.info/';
  override readonly name = 'GetComics';

  override readonly logo =
    'https://scontent-lga3-1.xx.fbcdn.net/v/t31.18172-8/10923821_1548503832063793_2041220008970231476_o.png?_nc_cat=102&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=aQyuLlPZtQAAX8dJviD&_nc_ht=scontent-lga3-1.xx&oh=00_AT_yPS4uuNDGirSqXnTwl2VGS9leFv4-Ujt7l6l5_FZeLw&oe=62D00D68';
  override readonly classPath = 'COMICS.GetComics';

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
