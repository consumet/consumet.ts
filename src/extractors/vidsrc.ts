import { VideoExtractor, IVideo } from '../models';

class Vidsrc extends VideoExtractor {
  protected override serverName = 'Vidsrc';
  protected BaseURL = 'https://vidsrc.xyz';
  protected EmmbedURL = 'http://vidsrc.stream';
  protected override sources: IVideo[] = [];

  protected deobfstr = async (data: string, id: string) => {
    id = id.toString();
    let src = '';

    for (let i = 0; i < data.length; i += 2) {
      src += String.fromCharCode(parseInt(data.substr(i, 2), 16) ^ id.charCodeAt((i / 2) % id.length));
    }
    return src;
  };

  override async extract(videoUrl: URL, attempt = 1, ...args: any): Promise<IVideo[]> {
    try {
      const { data } = await this.client.get(videoUrl.href);
      const resp = await this.client
        .get(this.EmmbedURL + data.match(/vidsrc.stream(.*?)"/)[1], {
          headers: {
            Referer: this.BaseURL,
          },
        })
        .then(r => this.deobfstr(r.data.match(/data-h="(.*?)"/)[1], r.data.match(/data-i="(.*?)"/)[1]));

      const r = await this.client
        .get('http:' + resp, {
          headers: {
            Referer: this.BaseURL,
          },
        })
        .then(r => r.data);
      //It helps :v
      this.client.get('https:' + r.match(/pass_path.*?"(.*?)"/)[1]);
      const m3u8 = atob(
        r
          .match(/file:"(.*?)"/)[1]
          .replace(/\/\/\S+?=/g, '')
          .slice(2)
          .replace(/\/@#@\/[^=\/]+==/g, '')
          .replace(/_/g, '/')
          .replace(/-/g, '+')
      );
      this.sources.push({
        url: m3u8,
        isM3U8: m3u8.includes('m3u8'),
      });
      return this.sources;
    } catch (err) {
      if (attempt < 5) {
        return this.extract(videoUrl, ++attempt);
      }
      throw new Error((err as Error).message);
    }
  }
}
export default Vidsrc;
