import { VideoExtractor, IVideo, ISubtitle } from '../models';
import { safeUnpack } from '../utils/utils';

class StreamHub extends VideoExtractor {
  protected override serverName = 'StreamHub';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      const result: { sources: IVideo[]; subtitles: ISubtitle[] } = {
        sources: [],
        subtitles: [],
      };

      const { data } = await this.client.get(videoUrl.href).catch(() => {
        throw new Error('Video not found');
      });

      const unpackedData = safeUnpack(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)![2]);

      const links = unpackedData.match(new RegExp('sources:\\[\\{src:"(.*?)"')) ?? [];
      const m3u8Link = links[1];

      if (!m3u8Link) {
        throw new Error('No m3u8 link found in unpacked data');
      }

      const m3u8Content = await this.client.get(m3u8Link, {
        headers: {
          Referer: m3u8Link,
        },
      });

      result.sources.push({
        quality: 'auto',
        url: m3u8Link,
        isM3U8: m3u8Link.includes('.m3u8'),
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
