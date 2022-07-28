import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo } from '../../models';

class StreamTape extends VideoExtractor {
  protected override serverName = 'StreamTape';
  protected override sources: IVideo[] = [];

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    try {
      const { data } = await axios.get(videoUrl.href);
      return this.sources;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}
export default StreamTape;
