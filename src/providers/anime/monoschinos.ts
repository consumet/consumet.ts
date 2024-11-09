import { CheerioAPI, load } from 'cheerio';

import { StreamTape, Voe } from '../../extractors';
import {
  AnimeParser,
  IAnimeInfo,
  IAnimeResult,
  IEpisodeServer,
  ISearch,
  ISource,
  ISubtitle,
  IVideo,
  StreamingServers,
} from '../../models';

class MonosChinos extends AnimeParser {
  override readonly name = 'MonosChinos';
  protected override baseUrl = 'https://monoschinos2.com';
  protected override logo = 'https://monoschinos2.com/public/favicon.ico?v=4.57';
  protected override classPath = 'ANIME.MonosChinos';

  /**
   * @param query Search query
   */
  override search = async (query: string): Promise<ISearch<IAnimeResult>> => {
    try {
      const res = await this.client.get(`${this.baseUrl}/buscar?q=${query}`);
      const $ = load(res.data);

      if (!$) return { results: [] };

      const searchResult: {
        hasNextPage: boolean;
        results: IAnimeResult[];
      } = {
        hasNextPage: false,
        results: [],
      };

      $('section ul li article').each((_, el) => {
        searchResult.results.push({
          id: $(el).find('a').attr('href')?.split(`/anime/`)[1]!,
          title: $(el).find('h3').text(),
          url: $(el).find('a').attr('href'),
          image: $(el).find('.tarjeta img').attr('src'),
          releaseDate: $(el).find('span.text-muted').text(),
        });
      });

      return searchResult;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param id Anime id
   * @param totalEpisodes how many episodes you want the info of (why? => refer to the docs)
   */
  override fetchAnimeInfo = async (id: string, totalEpisodes: number = 1000): Promise<IAnimeInfo> => {
    try {
      const url = `${this.baseUrl}/anime/${id}`;
      const res = await this.client.get(url);
      const $ = load(res.data);

      const animeInfo: IAnimeInfo = {
        id: id,
        title: $('h1.fs-2.text-capitalize.text-light').text(),
        url: url,
        genres: $('#profile-tab-pane .d-flex.gap-3 .lh-lg a')
          .map((_, el) => $(el).text())
          .get(),
        totalEpisodes: totalEpisodes,
        image: $('img.lazy.bg-secondary').attr('src'),
        description: $('#profile-tab-pane .col-12.col-md-9 p').text(),
        episodes: [],
      };

      for (let i = 1; i <= totalEpisodes; i++) {
        animeInfo.episodes?.push({
          id: `${
            $('.d-flex.flex-column.pt-3 .d-flex.gap-3.mt-3 a')
              .attr('href')!
              .match(/([a-z0-9\-]+-episodio-)/)![0]
          }${i}`,
          number: i,
          url: $('.d-flex.flex-column.pt-3 .d-flex.gap-3.mt-3 a').attr('href'),
        });
      }

      return animeInfo;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (episodeId: string): Promise<ISource> => {
    try {
      const res = await this.client.get(`https://monoschinos2.com/ver/${episodeId}`);
      const $ = load(res.data);

      let decodedUrl;
      let sources: IVideo[];
      let subtitles: ISubtitle[] = [];

      // filemoon => js code too obfuscated
      // mixdrop => 403 forbidden
      // doodstream => loads infinitely
      // mp4upload => can't access

      try {
        decodedUrl = await this.#getServerDecodedUrl($, StreamingServers.Voe);
        const voeResult = await new Voe().extract(
          new URL(decodedUrl.replace('voe.sx', 'thomasalthoughhear.com'))
        );
        sources = voeResult.sources;
        subtitles = voeResult?.subtitles;
      } catch (err) {
        decodedUrl = await this.#getServerDecodedUrl($, StreamingServers.StreamTape);
        sources = await new StreamTape().extract(new URL(decodedUrl));
        try {
        } catch (err) {
          throw new Error('Source not found.');
        }
      }

      return { sources: sources, subtitles: subtitles };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  #getServerDecodedUrl = async ($: CheerioAPI, server: StreamingServers) => {
    try {
      const button = $('button').filter(function () {
        return $(this).text() === server;
      });

      const res2 = await this.client.get(
        `https://monoschinos2.com/reproductor?url=${button.attr('data-player')}`
      );
      const $2 = load(res2.data);
      const base64Match = $2.html().match(/atob\("([^"]+)"\)/)!;

      return Buffer.from(base64Match[1], 'base64').toString('utf-8');
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default MonosChinos;

// FILEMOON EXTRACTION TEST

// const res3 = await this.client.get(decodedUrl);
// const $3 = load(res3.data);

// const res4 = await this.client.get($3('iframe').attr('src')!);
// const $4 = load(res4.data);

// const data = $4('script').last().html()?.split('image|')[1].split('|file')[0].split('|')!;
// const strangeVal = $4('script')
//   .last()
//   .html()
//   ?.split(/3[a-z]&7[a-z]=/)[1]
//   .split(/&7[a-z]=7/)[0];
// const additionalData = $4('script')
//   .last()
//   .html()
//   ?.split('data|')[1]
//   .replace('com|', '')
//   .split('|video_ad')[0]
//   .split('|')!;

// const url = `https://${data[17]}.${data[16]}.${data[15]}.${
//   data[14] === 'com' ? data[13] : data[14]
// }.com/${data[12]}/${data[11]}/${data[10]}/${data[9]}/${data[8]}.${data[7]}?t=${data[6]}&s=${
//   additionalData[0]
// }&e=${data[5]}&f=${additionalData[1]}&${data[4]}=${strangeVal}&${data[3]}=${data[2]}&${data[1]}=${
//   data[0]
// }`;      const res3 = await this.client.get(decodedUrl);
// const $3 = load(res3.data);

// const res4 = await this.client.get($3('iframe').attr('src')!);
// const $4 = load(res4.data);

// const data = $4('script').last().html()?.split('image|')[1].split('|file')[0].split('|')!;
// const strangeVal = $4('script')
//   .last()
//   .html()
//   ?.split(/3[a-z]&7[a-z]=/)[1]
//   .split(/&7[a-z]=7/)[0];
// const additionalData = $4('script')
//   .last()
//   .html()
//   ?.split('data|')[1]
//   .replace('com|', '')
//   .split('|video_ad')[0]
//   .split('|')!;

// const url = `https://${data[17]}.${data[16]}.${data[15]}.${
//   data[14] === 'com' ? data[13] : data[14]
// }.com/${data[12]}/${data[11]}/${data[10]}/${data[9]}/${data[8]}.${data[7]}?t=${data[6]}&s=${
//   additionalData[0]
// }&e=${data[5]}&f=${additionalData[1]}&${data[4]}=${strangeVal}&${data[3]}=${data[2]}&${data[1]}=${
//   data[0]
// }`;
