import { VideoExtractor, IVideo } from '../models';

class VidMoly extends VideoExtractor {
  protected override serverName = 'vidmoly';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const urlString = videoUrl.href.replace('vidmoly.to', 'vidmoly.net');
      const { data } = await this.client.get(urlString, {
        headers: {
          Referer: videoUrl.origin,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const patterns = [
        /file:\s*"([^"]+)"/,
        /sources:\s*\[\s*{[^}]*file:\s*"([^"]+)"/,
        /source\s*src="([^"]+\.m3u8[^"]*)"/,
      ];

      let masterUrl: string | null = null;

      for (const pattern of patterns) {
        const match = data.match(pattern);
        if (match && match[1]) {
          masterUrl = match[1];
          break;
        }
      }

      if (!masterUrl) {
        console.warn(`Vidmoly: Could not find video source in ${urlString}`);
        return [];
      }

      const m3u8Content = await this.client.get(masterUrl, {
        headers: {
          Referer: urlString,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      this.sources.push({
        quality: 'auto',
        url: masterUrl,
        isM3U8: masterUrl.includes('.m3u8'),
      });

      if (m3u8Content.data.includes('EXTM3U')) {
        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');

        for (const video of videoList) {
          if (!video.includes('m3u8')) continue;

          const lines = video.split('\n');
          const url = lines[1]?.trim();
          if (!url) continue;

          const resolutionMatch = video.match(/RESOLUTION=(\d+)x(\d+)/);
          const quality = resolutionMatch ? resolutionMatch[2] : 'unknown';

          this.sources.push({
            url,
            quality,
            isM3U8: url.includes('.m3u8'),
          });
        }
      }

      return this.sources;
    } catch (err) {
      console.error(`Vidmoly extraction error: ${(err as Error).message}`);
      return [];
    }
  };
}

export default VidMoly;
