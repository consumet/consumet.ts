import axios from 'axios';
import CryptoJS from 'crypto-js';
import WebSocket from 'ws';

import { VideoExtractor, IVideo, ISubtitle, Intro } from '../../models';
import { USER_AGENT, isJson } from '..';

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

      res = await axios.get(
        `${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`,
        options
      );

      //const res = await this.wss(id!);

      if (!isJson(res.data.sources)) {
        const { data: key } = await axios.get(
          'https://raw.githubusercontent.com/consumet/rapidclown/rabbitstream/key.txt'
        );

        sources = JSON.parse(CryptoJS.AES.decrypt(res.data.sources, key).toString(CryptoJS.enc.Utf8));
      }

      this.sources = sources.map((s: any) => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8'),
      }));

      result.sources.push(...this.sources);

      result.sources = [];
      this.sources = [];

      for (const source of sources) {
        const { data } = await axios.get(source.file, options);
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

  private wss = async (iframeId: string): Promise<any> => {
    const ws = new WebSocket('wss://wsx.dokicloud.one/socket.io/?EIO=4&transport=websocket');
    ws.onopen = () => {
      ws.send('40');
    };
    return await new Promise(resolve => {
      let sid = '';
      let res: { sid: string; sources: any[]; tracks: any[] } = { sid: '', sources: [], tracks: [] };
      ws.onmessage = e => {
        const data = e.data.toString();
        if (data.startsWith('40')) {
          res.sid = JSON.parse(data.slice(2)).sid;
          ws.send(`42["getSources",{"id":"${iframeId}"}]`);
        } else if (data.startsWith('42["getSources"')) {
          const ress = JSON.parse(data.slice(2))[1];
          res.sources = ress.sources;
          res.tracks = ress.tracks;
          resolve(res);
        }
      };
    });
  };
}

export default VidCloud;
