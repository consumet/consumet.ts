import axios from 'axios';
import { load } from 'cheerio';
import FormData from 'form-data';

import { VideoExtractor, IVideo } from '../../models';
import { USER_AGENT } from '..';

class UpCloud extends VideoExtractor {
  protected override serverName = 'UpCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://mzzcloud.life';

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];

      const res = await axios.get(`${this.host}/ajax/embed-4/getSources?id=${id}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const {
        data: { sources },
      } = res;

      this.sources = sources.map((s: any) => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8'),
      }));

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default UpCloud;
