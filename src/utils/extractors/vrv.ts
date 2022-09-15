import axios from 'axios';
import { load } from 'cheerio';

import { VideoExtractor, IVideo } from '../../models';
import { USER_AGENT } from '..';

/**
 * work in progress
 */
class Vrv extends VideoExtractor {
  protected override serverName = 'vrv';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://v.vrv.co';
  private readonly animixplayHost = 'https://animixplay.to';

  override extract = async (videoUrl: URL): Promise<IVideo[]> => {
    const options = {
      headers: {
        Referer: videoUrl.href,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'X-Requested-With': 'XMLHttpRequest',
      },
    };
    console.log(videoUrl.href);
    const { data } = await axios.get(videoUrl.href);

    const $ = load(data);
    const iframe = $('#iframeplayer').attr('src')!;
    console.log(this.animixplayHost + iframe);
    const { data: iframeData } = await axios.get(this.animixplayHost + iframe);

    return this.sources;
  };
}

export default Vrv;
