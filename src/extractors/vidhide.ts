import { VideoExtractor, IVideo, ISubtitle } from '../models';
import { safeUnpack } from '../utils/utils';

class VidHide extends VideoExtractor {
  protected override serverName = 'VidHide';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const result: { sources: IVideo[]; subtitles: ISubtitle[] } = {
        sources: [],
        subtitles: [],
      };

      const { data } = await this.client.get(videoUrl.href).catch(() => {
        throw new Error('Video not found');
      });

      const unpackedData = safeUnpack(/(eval)(\(f.*?)(\n<\/script>)/s.exec(data)![2]);
      const links = unpackedData.match(/https?:\/\/[^"]+?\.m3u8[^"]*/g) ?? [];
      const m3u8Link = links[0];

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
        const pathWithoutMaster = m3u8Link.split('/master.m3u8')[0];
        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
        for (const video of videoList ?? []) {
          if (!video.includes('m3u8')) continue;

          const url = video.split('\n')[1];
          const quality = video.split('RESOLUTION=')[1]?.split(',')[0].split('x')[1];

          result.sources.push({
            url: `${pathWithoutMaster}/${url}`,
            quality: `${quality}p`,
            isM3U8: url.includes('.m3u8'),
          });
        }
      }

      return result.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}
export default VidHide;
