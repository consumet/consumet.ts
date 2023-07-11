import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo, ISubtitle } from '../models';

class StreamHub extends VideoExtractor {
  protected override serverName = 'StreamHub';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      const result: { sources: IVideo[]; subtitles: ISubtitle[] } = {
        sources: [],
        subtitles: [],
      };

      const { data } = await axios.get(videoUrl.href).catch(() => {
        throw new Error('Video not found');
      });

      const $ = load(data);
      const ss = $.html().indexOf('eval(function(p,a,c,k,e,d)');
      const se = $.html().indexOf('</script>', ss);
      const s = $.html().substring(ss, se).replace('eval', '');
      const unpackedData = eval(s) as string;

      const links = unpackedData.match(new RegExp('sources:\\[\\{src:"(.*?)"')) ?? [];
      const m3u8Content = await axios.get(links[1], {
        headers: {
          Referer: links[1],
        },
      });

      result.sources.push({
        quality: 'auto',
        url: links[1],
        isM3U8: links[1].includes('.m3u8'),
      });

      if (m3u8Content.data.includes('EXTM3U')) {
        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
        for (const video of videoList ?? []) {
          if (!video.includes('m3u8')) continue;

          const url = video.split('\n')[1];
          const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];

          result.sources.push({
            url: url,
            quality: `${quality}p`,
            isM3U8: url.includes('.m3u8'),
          });
        }
      }

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}
export default StreamHub;
