import { load } from 'cheerio';
import { IAnimeInfo, IEpisodeServer, IMovieInfo, ISource, MovieParser, TvType } from '../../models';

export default class Turkish extends MovieParser {
  name: string = 'Turkish123';
  protected baseUrl: string = 'https://turkish123.ac/';
  protected classPath: string = 'MOVIES.Turkish';
  supportedTypes: Set<TvType> = new Set([TvType.TVSERIES]);

  async fetchMediaInfo(mediaId: string): Promise<IMovieInfo | IAnimeInfo> {
    const info: IMovieInfo = { id: mediaId, title: '' };

    try {
      const { data } = await this.client(this.baseUrl + mediaId, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: this.baseUrl,
        },
      });
      const $ = load(data);
      info.image = $('#content-cover')
        .attr('style')!
        .match(/url\((.*?)\)/)![1];
      info.title = $('.mvic-desc > h1').text();
      info.description = $('.f-desc')
        .text()
        .replace(/[\n\t\b]/g, '');
      info.romaji = $('.yellowi').text();
      info.tags = $('.mvici-left > p:nth-child(3)')
        .find('a')
        .map((_, e) => $(e).text())
        .get();
      info.rating = parseFloat($('.imdb-r').text());
      info.releaseDate = $('.mvici-right > p:nth-child(3)').find('a').first().text();
      info.totalEpisodes = $('.les-content > a').length;
      info.episodes = $('.les-content > a')
        .map((i, e) => ({
          id: $(e).attr('href')!.split('/').slice(-2)[0],
          title: `Episode ${i + 1}`,
        }))
        .get();
    } catch (error) {}
    return info;
  }
  async fetchEpisodeSources(episodeId: string): Promise<ISource> {
    const source: ISource = { sources: [{ url: '' }], headers: { Referer: 'https://tukipasti.com' } };
    try {
      const { data } = await this.client(this.baseUrl + episodeId, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: this.baseUrl,
        },
      });
      const resp = (await this.client(data.match(/"(https:\/\/tukipasti.com\/t\/.*?)"/)![1])).data;
      source.sources[0].url = resp.match(/var urlPlay = '(.*?)'/)![1];
    } catch (error) {}
    return source;
  }
  fetchEpisodeServers(): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
  async search(q: string): Promise<IMovieInfo[]> {
    const params = `wp-admin/admin-ajax.php?s=${q}&action=searchwp_live_search&swpengine=default&swpquery=${q}`;
    try {
      const { data } = await this.client(this.baseUrl + params, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: this.baseUrl,
        },
      });
      const $ = load(data);
      const result: IMovieInfo[] = [];
      $('li')
        .not('.ss-bottom')
        .each((_, ele) => {
          result.push({
            id: $(ele).find('a').attr('href')!.replace(this.baseUrl, '').replace('/', ''),
            image:
              $(ele)
                .find('a')
                .attr('style')!
                .match(/url\((.*?)\)/)![1] ?? '',
            title: $(ele).find('.ss-title').text(),
            tags: $(ele)
              .find('.ss-info >a')
              .not('.ss-title')
              .map((_, e) => $(e).text())
              .get()
              .filter(v => v != 'NULL'),
          });
        });
      return result;
    } catch (error) {
      console.log(error);
    }
    return [];
  }

  async homeData(): Promise<{
    trending: IMovieInfo[];
    recent: IMovieInfo[];
    popular: IMovieInfo[];
  }> {
    const result: { trending: IMovieInfo[]; recent: IMovieInfo[]; popular: IMovieInfo[] } = {
      trending: [],
      recent: [],
      popular: [],
    };
    try {
      const { data } = await this.client(this.baseUrl + 'home', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Referer: this.baseUrl,
        },
      });
      const $ = load(data);
      result.trending = $('#slider > .swiper-wrapper .swiper-slide')
        .map(
          (_, e): IMovieInfo => ({
            id: $(e).find('.slide-link').attr('href')!.replace(this.baseUrl, '').replace('/', ''),
            title: $(e).find('.slide-caption > h2').text(),
            description: $(e).find('.sc-desc').next().text(),
            image:
              $(e)
                .attr('style')!
                .match(/(https.*?)'/)![1] ?? '',
            genres: $(e)
              .find('.slide-caption-info > div:first > a')
              .map((_, ele) => $(ele).text())
              .get(),
            releaseDate: $(e).find('.slide-caption-info > div:nth-child(3)').text().split(':').pop(),
          })
        )
        .get();
      result.recent = $('.main-content > .movies-list-wrap:first > .movies-list > .ml-item')
        .map(
          (_, e): IMovieInfo => ({
            id: $(e).find('a').attr('href')!.replace(this.baseUrl, '').split('-episode-')[0],
            title: $(e).find('.mli-info').text().split(RegExp('[^a-z A-Z]'))[0].trim(),
            image: $(e).find('img').attr('src'),
            totalEpisodes: Number.parseFloat($(e).find('.mli-eps > i').text()),
            episodeId: $(e).find('a').attr('href')!.replace(this.baseUrl, '').replace('/', ''),
          })
        )
        .get();
      result.popular = $('.main-content > .movies-list-wrap:nth-child(3) > .movies-list > .ml-item')
        .map(
          (_, e): IMovieInfo => ({
            id: $(e).find('a').attr('href')!.replace(this.baseUrl, '').split('-episode-')[0],
            title: $(e).find('.mli-info').text().split(RegExp('[^a-z A-Z]'))[0].trim(),
            image: $(e).find('img').attr('src'),
          })
        )
        .get();
    } catch (error) {}

    return result;
  }
}
