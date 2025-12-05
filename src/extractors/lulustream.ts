import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';

class LuluStream extends VideoExtractor {
  protected override serverName = 'lulustream';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const urlString = videoUrl.href
        .replace('luluvid.com', 'lulustream.com')
        .replace('lulustream.com', 'luluvid.com');

      const { data } = await this.client.get(urlString, {
        headers: {
          Referer: videoUrl.origin,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      const m3u8Pattern = /sources:\s*\[\s*{[^}]*file:\s*"([^"]+\.m3u8[^"]*)"/;
      const m3u8Match = data.match(m3u8Pattern);

      if (!m3u8Match || !m3u8Match[1]) {
        const altPattern = /file:\s*"([^"]+\.m3u8[^"]*)"/;
        const altMatch = data.match(altPattern);

        if (altMatch && altMatch[1]) {
          await this.parseM3U8(altMatch[1], urlString);
          return this.sources;
        }

        console.warn(`LuluStream: Could not find M3U8 source in ${urlString}`);
        return [];
      }

      await this.parseM3U8(m3u8Match[1], urlString);
      return this.sources;
    } catch (err) {
      console.error(`LuluStream extraction error: ${(err as Error).message}`);
      return [];
    }
  };

  private parseM3U8 = async (masterUrl: string, referer: string): Promise<void> => {
    try {
      this.sources.push({
        quality: 'auto',
        url: masterUrl,
        isM3U8: true,
      });

      const m3u8Response = await this.client.get(masterUrl, {
        headers: {
          Referer: referer,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
      });

      const m3u8Content = m3u8Response.data;

      if (m3u8Content.includes('#EXT-X-STREAM-INF')) {
        const lines = m3u8Content.split('\n');
        const baseUrl = masterUrl.substring(0, masterUrl.lastIndexOf('/') + 1);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith('#EXT-X-STREAM-INF:')) {
            const nextLine = lines[i + 1]?.trim();
            if (!nextLine || nextLine.startsWith('#')) continue;

            const resolutionMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);

            let quality = 'unknown';
            if (resolutionMatch) {
              quality = `${resolutionMatch[2]}p`;
            } else if (bandwidthMatch) {
              const bandwidth = parseInt(bandwidthMatch[1]);
              if (bandwidth >= 2000000) quality = '1080p';
              else if (bandwidth >= 1000000) quality = '720p';
              else if (bandwidth >= 500000) quality = '480p';
              else quality = '360p';
            }

            const variantUrl = nextLine.startsWith('http') ? nextLine : baseUrl + nextLine;

            this.sources.push({
              url: variantUrl,
              quality: quality,
              isM3U8: true,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`LuluStream M3U8 parsing error: ${(err as Error).message}`);
    }
  };
}

export default LuluStream;
