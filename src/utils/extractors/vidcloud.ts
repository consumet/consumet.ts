import axios from 'axios';
import { load } from 'cheerio';
import FormData from 'form-data';

import { VideoExtractor, IVideo, ISubtitle } from '../../models';
import { USER_AGENT } from '..';

class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://mzzcloud.life';
  private readonly host2 = 'https://rabbitstream.net';
  private readonly host3 = 'https://rapid-cloud.ru';

  override extract = async (
    videoUrl: URL,
    isAlternative: boolean = false
  ): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    const result: { sources: IVideo[]; subtitles: ISubtitle[] } = { sources: [], subtitles: [] };
    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];
      const options = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: videoUrl.href,
          'User-Agent': USER_AGENT,
        },
      };
      let res = null;
      if (videoUrl.href.includes('rapid-cloud.ru')) {
        res = await axios.get(
          `${this.host3}/ajax/embed-6/getSources?id=${id}&sId=zIlsAXDw5t76TRyfhrDY`,
          options
        );
      } else {
        res = await axios.get(
          `${isAlternative ? this.host2 : this.host}/ajax/embed-4/getSources?id=${id}`,
          options
        );
      }
      const {
        data: { sources, tracks },
      } = res;

      this.sources = sources.map((s: any) => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8'),
      }));

      result.sources.push(...this.sources);

      if (videoUrl.href.includes(new URL(this.host3).host)) {
        result.sources = [];
        this.sources = [];
        for (const source of sources) {
          const { data } = await axios.get(source.file, options);
          const m3u8data = data
            .split('\n')
            .filter((line: string) => line.includes('.m3u8') && line.includes('RESOLUTION='));
          const secondHalf = m3u8data.map((line: string) =>
            line.match(/(?<=RESOLUTION=).*(?<=,C)|(?<=URI=).*/g)
          );

          const TdArray = secondHalf.map((s: string[]) => {
            const f1 = s[0].split(',C')[0];
            const f2 = s[1].replace(/"/g, '');

            return [f1, f2];
          });
          for (const [f1, f2] of TdArray) {
            this.sources.push({
              url: `${source.file?.split('master.m3u8')[0]}${f2.replace('iframes', 'index')}`,
              quality: f1.split('x')[1] + 'p',
              isM3U8: f2.includes('.m3u8'),
            });
          }
          result.sources.push(...this.sources);
        }
      } else if (
        videoUrl.href.includes(new URL(this.host2).host) ||
        videoUrl.href.includes(new URL(this.host).host)
      ) {
        result.sources = [];
        this.sources = [];

        for (const source of sources) {
          const { data } = await axios.get(source.file, options);
          const urls = data.split('\n').filter((line: string) => line.includes('.m3u8')) as string[];
          const qualities = data
            .split('\n')
            .filter((line: string) => line.includes('RESOLUTION=')) as string[];

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
      }

      result.subtitles = tracks.map((s: any) => ({
        url: s.file,
        lang: s.label ? s.label : 'Default (maybe)',
      }));

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default VidCloud;
