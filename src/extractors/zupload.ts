import { IVideo } from '@/Provider/Tools/types';
import VideoExtractor from '@/Provider/Tools/video-extractor';

class Zupload extends VideoExtractor {
  protected override serverName = 'zupload';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const urlString = videoUrl.href;
      
      const { data } = await this.client.get(urlString, {
        headers: {
          'Referer': 'https://nightflix.world/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const videoMatch = data.match(/data-link="([^"]+)"/);
      
      if (!videoMatch || !videoMatch[1]) {
        const altPattern1 = data.match(/src:\s*["']([^"']+\.mp4[^"']*)["']/);
        const altPattern2 = data.match(/source\s+src=["']([^"']+)["']/);
        const altPattern3 = data.match(/file:\s*["']([^"']+)["']/);
        
        if (altPattern1 && altPattern1[1]) {
          const videoUrl = altPattern1[1].replace(/&amp;/g, '&');
          this.sources.push({
            quality: 'auto',
            url: videoUrl,
            isM3U8: videoUrl.includes('.m3u8'),
          });
          return this.sources;
        }
        
        if (altPattern2 && altPattern2[1]) {
          const videoUrl = altPattern2[1].replace(/&amp;/g, '&');
          this.sources.push({
            quality: 'auto',
            url: videoUrl,
            isM3U8: videoUrl.includes('.m3u8'),
          });
          return this.sources;
        }

        if (altPattern3 && altPattern3[1]) {
          const videoUrl = altPattern3[1].replace(/&amp;/g, '&');
          this.sources.push({
            quality: 'auto',
            url: videoUrl,
            isM3U8: videoUrl.includes('.m3u8'),
          });
          return this.sources;
        }
        
        console.warn(`Zupload: Could not find video source in ${urlString}`);
        return [];
      }

      const videoSourceUrl = videoMatch[1].replace(/&amp;/g, '&');

      if (videoSourceUrl.includes('.m3u8')) {
        const m3u8Content = await this.client.get(videoSourceUrl, {
          headers: {
            'Referer': urlString,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        this.sources.push({
          quality: 'auto',
          url: videoSourceUrl,
          isM3U8: true,
        });

        if (m3u8Content.data.includes('EXTM3U')) {
          const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
          
          for (const video of videoList ?? []) {
            if (!video.includes('m3u8')) continue;

            const lines = video.split('\n');
            const url = lines[1]?.trim();
            
            if (!url) continue;

            const absoluteUrl = url.startsWith('http') 
              ? url 
              : new URL(url, videoSourceUrl).href;

            const resolutionMatch = video.match(/RESOLUTION=(\d+)x(\d+)/);
            const quality = resolutionMatch ? resolutionMatch[2] : 'unknown';

            this.sources.push({
              url: absoluteUrl,
              quality: `${quality}`,
              isM3U8: true,
            });
          }
        }
      } else {
        this.sources.push({
          quality: 'auto',
          url: videoSourceUrl,
          isM3U8: false,
        });
      }

      return this.sources;
    } catch (err) {
      console.error(`Zupload extraction error: ${(err as Error).message}`);
      return [];
    }
  };
}

export default Zupload;
