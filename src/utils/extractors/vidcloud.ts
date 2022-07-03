import axios from 'axios';
import { load } from 'cheerio';
import FormData from 'form-data';

import { VideoExtractor, IVideo, ISubtitle } from '../../models';
import { USER_AGENT } from '..';

class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://mzzcloud.life';
  private readonly host2 = 'https://rabbitstream.net';

  override extract = async (
    videoUrl: URL,
    isAlternative: boolean = false
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[] }> => {
    const result: { sources: IVideo[]; subtitles: ISubtitle[] } = { sources: [], subtitles: [] };
    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];

      const res = await axios.get(
        `${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      const {
        data: { sources, tracks },
      } = res;

      this.sources = sources.map((s: any) => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8'),
      }));

      result.sources.push(...this.sources);

      result.subtitles = tracks.map((s: any) => ({
        url: s.file,
        lang: s.label,
      }));

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default VidCloud;
