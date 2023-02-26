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
    vizCloudHelper : string,
    apiKey : string,
  ): Promise<IVideo[]> => {

    const vizID: Array<string> = videoUrl.href.split("/");
    let url;
    if (!vizID.length) {
      throw new Error('Video not found');
    } else {
      url = `${vizCloudHelper}/vizcloud?query=${vizID.pop()}&apikey=${apiKey}`;
    }

    const { data } = await axios.get(url);
    if (!data.data?.media) throw new Error('Video not found');

    this.sources = [
      ...this.sources,
      ...data.data.media.sources.map((source: any) => ({
        url: source.file,
        isM3U8: source.file?.includes('.m3u8'),
      })),
    ];
    return this.sources;
  };
}

export default VizCloud;
