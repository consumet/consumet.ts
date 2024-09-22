import { VideoExtractor, IVideo } from '../models';
import { USER_AGENT } from '../utils';
class StreamWish extends VideoExtractor {
  protected override serverName = 'streamwish';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const options = {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'max-age=0',
          Priority: 'u=0, i',
          'Sec-Ch-Ua': 'Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': 'Windows',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Referrer-Policy': 'no-referrer-when-downgrade',
          Referer: videoUrl.href,
          'User-Agent': USER_AGENT,
        },
      };
      // console.log(videoUrl.href,"videoUrl")
      const { data } = await this.client.get(videoUrl.href, options);

      // Code adapted from Zenda-Cross (https://github.com/Zenda-Cross/vega-app/blob/main/src/lib/providers/multi/multiGetStream.ts)
      // Thank you to Zenda-Cross for the original implementation.

      const functionRegex = /eval\(function\((.*?)\)\{.*?return p\}.*?\('(.*?)'\.split/;
      const match = functionRegex.exec(data);
      let p = '';
      if (match) {
        const params = match[1].split(',').map(param => param.trim());
        const encodedString = match[2];

        p = encodedString.split("',36,")?.[0].trim();
        const a = 36;
        let c = encodedString.split("',36,")[1].slice(2).split('|').length;
        const k = encodedString.split("',36,")[1].slice(2).split('|');

        while (c--) {
          if (k[c]) {
            const regex = new RegExp('\\b' + c.toString(a) + '\\b', 'g');
            p = p.replace(regex, k[c]);
          }
        }

        // console.log('Decoded String:', p);
      } else {
        console.log('No match found');
      }
      const links = p.match(/file:\s*"([^"]+)"/) ?? [];
      // console.log(links, "links");
      let lastLink: string | null = null;
      links.forEach((link: string) => {
        if (link.includes('file:"')) {
          link = link.replace('file:"', '').replace(new RegExp('"', 'g'), '');
        }
        this.sources.push({
          quality: lastLink! ? 'backup' : 'default',
          url: link.replace(/&i=\d+,'\.4&/, '&i=0.4&'),
          isM3U8: link.includes('.m3u8'),
        });
        lastLink = link;
      });

      const m3u8Content = await this.client.get(links[1].replace(/&i=\d+,'\.4&/, '&i=0.4&'), options);

      if (m3u8Content.data.includes('EXTM3U')) {
        const videoList = m3u8Content.data.split('#EXT-X-STREAM-INF:');
        for (const video of videoList ?? []) {
          if (!video.includes('m3u8')) continue;

          const url = links[1].split('master.m3u8')[0] + video.split('\n')[1];
          const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];

          this.sources.push({
            url: url,
            quality: `${quality}p`,
            isM3U8: url.includes('.m3u8'),
          });
        }
      }

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}
export default StreamWish;
