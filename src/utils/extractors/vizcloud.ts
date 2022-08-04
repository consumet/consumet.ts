import axios from 'axios';

import { VideoExtractor, IVideo, ISubtitle, Intro } from '../../models';
import { USER_AGENT } from '..';

class VizCloud extends VideoExtractor {
  protected override serverName = 'VizCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://vizcloud.site';
  private keys: { cipher: string; encrypt: string; main: string; dashTable: string } = {
    cipher: '',
    encrypt: '',
    main: '',
    dashTable: '',
  };
  private readonly base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=/_';

  override extract = async (
    videoUrl: URL,
    cipher: (query: string, key: string) => string,
    encrypt: (query: string, key: string) => string
  ): Promise<IVideo[]> => {
    const groups = videoUrl.href.split('/');

    this.keys = await this.fetchKeys();

    const id = encrypt(cipher(groups[4], this.keys.cipher), this.keys.encrypt);

    const url = `${this.host}/mediainfo/${this.dashify(id)}?key=${this.keys.main}`;
    const { data } = await axios.get(url, {
      headers: {
        Referer: videoUrl.href,
      },
    });
    this.sources = data.data.media.sources.map((source: any) => ({
      url: source.file,
      isM3U8: source.file?.includes('.m3u8'),
    }));
    return this.sources;
  };

  // lagrad :)
  private dashify = (id: string): string => {
    const table = this.keys.dashTable.split(' ');
    const dashedId = id
      .split('')
      .map((char, i) => table[this.base64Table.indexOf(char) * 16 + (i % 16)])
      .join('-');

    return dashedId;
  };

  private fetchKeys = async (): Promise<{
    cipher: string;
    encrypt: string;
    main: string;
    dashTable: string;
  }> => {
    const { data } = await axios.get(
      'https://raw.githubusercontent.com/chenkaslowankiya/BruhFlow/main/keys.json'
    );
    return data;
  };
}

export default VizCloud;
