import axios from 'axios';

import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';

class VizCloud extends VideoExtractor {
  protected override serverName = 'VizCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://vidstream.pro';
  private keys: {
    cipher: string;
    encrypt: string;
    main: string;
    operations: Map<string, string>;
    post: string[];
    pre: string[];
  } = {
      cipher: '',
      encrypt: '',
      main: '',
      operations: new Map<string, string>(),
      pre: [],
      post: [],
    };

  override extract = async (
    videoUrl: URL,
    vizCloudHelper: string,
    apiKey: string,
  ): Promise<IVideo[]> => {

    const vizID = videoUrl.href.split("/").pop();
    let url;
    if (vizID) {
      url = `${vizCloudHelper}/vizcloud?query=${encodeURIComponent(vizID)}&apikey=${apiKey}`;
    } else {
      throw new Error('Video not found');
    }


    const { data } = await axios.get(url);
    if (!data.data?.media) throw new Error('Video not found');

    this.sources = [
      ...this.sources,
      ...data.data.media.sources.map((source: any) => ({
        url: source.file,
        quality: 'auto',
        isM3U8: source.file?.includes('.m3u8'),
      })),
    ];

    const main = this.sources[this.sources.length - 1].url;
    const req = await axios.get(main);
    const resolutions = req.data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
    resolutions?.forEach((res: string) => {
      const index = main.lastIndexOf('/');
      const quality = res.split('\n')[0].split('x')[1].split(',')[0];
      const url = main.slice(0, index);
      this.sources.push({
        url: url + '/' + res.split('\n')[1],
        isM3U8: (url + res.split('\n')[1]).includes('.m3u8'),
        quality: quality + 'p',
      });
    });
    return this.sources;
  };
}

export default VizCloud;
