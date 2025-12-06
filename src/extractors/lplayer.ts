import { IVideo } from '../models';
import VideoExtractor from '../models/video-extractor';
import * as crypto from 'crypto';

class Lpayer extends VideoExtractor {
  protected override serverName = 'lpayer';
  protected override sources: IVideo[] = [];

  private readonly AES_KEY = Buffer.from('kiemtienmua911ca', 'utf8');
  private readonly AES_IV = Buffer.from('1234567890oiuytr', 'utf8');

  private decrypt(encryptedHex: string): string {
    try {
      const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-128-cbc', this.AES_KEY, this.AES_IV);
      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString('utf8');
    } catch {
      return '';
    }
  }

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const videoId = videoUrl.hash.substring(1);
      if (!videoId) return [];

      const apiUrl = `${videoUrl.origin}/api/v1/video?id=${videoId}&w=1366&h=768&r=`;

      const { data: encryptedData } = await this.client.get(apiUrl, {
        headers: {
          Referer: videoUrl.href,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const decryptedData = this.decrypt(encryptedData);
      if (!decryptedData) return [];

      const videoData = JSON.parse(decryptedData);

      let hlsUrl = videoData.hls || videoData.source || videoData.url || videoData.file || '';
      if (!hlsUrl) return [];

      if (hlsUrl.startsWith('/')) {
        hlsUrl = videoUrl.origin + hlsUrl;
      }

      this.sources.push({
        quality: 'auto',
        url: hlsUrl,
        isM3U8: hlsUrl.includes('.m3u8'),
      });

      if (hlsUrl.includes('.m3u8')) {
        try {
          const { data } = await this.client.get(hlsUrl, {
            headers: {
              Referer: videoUrl.href,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            timeout: 5000,
          });

          if (data.includes('EXT-X-STREAM-INF')) {
            const lines = data.split('\n');

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
                const resolutionMatch = lines[i].match(/RESOLUTION=\d+x(\d+)/);
                const quality = resolutionMatch ? `${resolutionMatch[1]}p` : 'unknown';

                const urlLine = lines[i + 1]?.trim();
                if (urlLine && !urlLine.startsWith('#')) {
                  let variantUrl = urlLine;

                  if (!variantUrl.startsWith('http')) {
                    const baseUrl = hlsUrl.substring(0, hlsUrl.lastIndexOf('/') + 1);
                    variantUrl = baseUrl + variantUrl;
                  }

                  this.sources.push({
                    quality,
                    url: variantUrl,
                    isM3U8: true,
                  });
                }
              }
            }
          }
        } catch {}
      }

      return this.sources;
    } catch {
      return [];
    }
  };
}

export default Lpayer;
