import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo } from '../../models';
import { USER_AGENT } from '../';

class DoodStream extends VideoExtractor {
  protected override serverName = 'DoodStream';
  protected override sources: IVideo[] = [];
  private readonly host = 'https://doodstream.watch';

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      // TODO: bypass cloudflare
      const { data } = await axios({
        method: 'GET',
        url: videoUrl.href,
        withCredentials: true,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
          Cookie:
            'file_id=15395486; aff=6778; ref_url=; lang=1; __cf_bm=MRe1z0FtGoLvNVfJeXshCHJLSdjWVy5CEcXpCwpI.Yw-1656713570-0-AXfYGFrfvR5T/gkmibX7FieYEFPKYicYMiKxgVTx1OYZIpZbkzFiVuZiNyLLj63nn18GAgCzLxvkrZv2vMJ/2uR79Y2vLhFnZX/QRyCmPKLxgAgt5sCp1xQiwbgBksQvEQ==',
        },
      });

      const $ = load(data);

      const md5 = new RegExp("/pass_md5/[^']*").exec($.html())![0];
      console.log(md5);

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default DoodStream;
