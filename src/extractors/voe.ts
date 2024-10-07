import { load } from 'cheerio';

import { IVideo, VideoExtractor } from '../models';

class Voe extends VideoExtractor {
  protected override serverName = 'voe';
  protected override sources: IVideo[] = [];

  private readonly domains = ['voe.sx'];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const res = await this.client.get(videoUrl.href);
      const $ = load(res.data);

      const url = $('body').html()!.split('prompt("Node", "')[1].split('");')[0];
      // const quality = $('body').html()!.match(/'video_height': ?([0-9]+),/)![1];

      this.sources.push({
        url: url,
        quality: 'default',
        isM3U8: url.includes('.m3u8'),
      });

      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default Voe;
