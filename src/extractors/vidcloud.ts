import CryptoJS from 'crypto-js';

import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
import { USER_AGENT, isJson, substringAfter, substringBefore } from '../utils';

class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://dokicloud.one';
  private readonly host2 = 'https://rabbitstream.net';

  override extract = async (
    videoUrl: URL,
    isAlternative: boolean = false
  ): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    const result: { sources: IVideo[]; subtitles: ISubtitle[]; intro?: Intro } = {
      sources: [],
      subtitles: [],
    };
    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];
      const options = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: videoUrl.href,
          'User-Agent': USER_AGENT,
        },
      };
      let res = undefined;
      let sources = undefined;

      res = await this.client.get(
        `${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`,
        options
      );

      if (!isJson(res.data.sources)) {
        let { data: key } = await this.client.get('https://raw.githubusercontent.com/theonlymo/keys/e4/key');

        key = substringBefore(substringAfter(key, '"blob-code blob-code-inner js-file-line">'), '</td>');

        if (!key) {
          key = await (await this.client.get('https://raw.githubusercontent.com/theonlymo/keys/e4/key')).data;
        }

        const sourcesArray = res.data.sources.split('');
        let extractedKey = '';

        let currentIndex = 0;
        for (const index of key) {
          const start = index[0] + currentIndex;
          const end = start + index[1];
          for (let i = start; i < end; i++) {
            extractedKey += res.data.sources[i];
            sourcesArray[i] = '';
          }
          currentIndex += index[1];
        }

        key = extractedKey;
        res.data.sources = sourcesArray.join('');

        const decryptedVal = CryptoJS.AES.decrypt(res.data.sources, key).toString(CryptoJS.enc.Utf8);
        sources = isJson(decryptedVal) ? JSON.parse(decryptedVal) : res.data.sources;
      }

      this.sources = sources.map((s: any) => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8'),
      }));

      result.sources.push(...this.sources);

      result.sources = [];
      this.sources = [];

      for (const source of sources) {
        const { data } = await this.client.get(source.file, options);
        const urls = data.split('\n').filter((line: string) => line.includes('.m3u8')) as string[];
        const qualities = data.split('\n').filter((line: string) => line.includes('RESOLUTION=')) as string[];

        const TdArray = qualities.map((s, i) => {
          const f1 = s.split('x')[1];
          const f2 = urls[i];

          return [f1, f2];
        });

        for (const [f1, f2] of TdArray) {
          this.sources.push({
            url: f2,
            quality: f1,
            isM3U8: f2.includes('.m3u8'),
          });
        }
        result.sources.push(...this.sources);
      }

      result.sources.push({
        url: sources[0].file,
        isM3U8: sources[0].file.includes('.m3u8'),
        quality: 'auto',
      });

      result.subtitles = res.data.tracks.map((s: any) => ({
        url: s.file,
        lang: s.label ? s.label : 'Default (maybe)',
      }));

      return result;
    } catch (err) {
      throw err;
    }
  };
}

export default VidCloud;
