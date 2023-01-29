import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo } from '../models';

class Kwik extends VideoExtractor {
  protected override serverName = 'kwik';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://animepahe.com';
  private readonly sgProxy = 'https://cors.consumet.stream';

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const { data } = await axios.get(`${this.sgProxy}/${videoUrl.href}`, {
        headers: { Referer: this.host },
      });

      const match = load(data)
        .html()
        .match(/p\}.*kwik.*/g);

      if (!match) {
        throw new Error('Video not found.');
      }
      let arr: string[] = match[0].split('return p}(')[1].split(',');

      const l = arr.slice(0, arr.length - 5).join('');
      arr = arr.slice(arr.length - 5, -1);
      arr.unshift(l);

      const [p, a, c, k, e, d] = arr.map(x => x.split('.sp')[0]);

      const formated = this.format(p, a, c, k, e, {});

      const source = formated
        .match(/source=\\(.*?)\\'/g)[0]
        .replace(/\'/g, '')
        .replace(/source=/g, '')
        .replace(/\\/g, '');

      this.sources.push({
        url: source,
        isM3U8: source.includes('.m3u8'),
      });

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  private format = (p: any, a: any, c: any, k: any, e: any, d: any) => {
    k = k.split('|');
    e = (c: any) => {
      return (
        (c < a ? '' : e(parseInt((c / a).toString()))) +
        ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
      );
    };
    if (!''.replace(/^/, String)) {
      while (c--) {
        d[e(c)] = k[c] || e(c);
      }
      k = [
        (e: any) => {
          return d[e];
        },
      ];
      e = () => {
        return '\\w+';
      };
      c = 1;
    }
    while (c--) {
      if (k[c]) {
        p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
      }
    }
    return p;
  };
}
export default Kwik;
