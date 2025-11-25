import { load } from 'cheerio';

import { MovieParser, TvType, IMovieInfo, IAnimeInfo, IEpisodeServer, ISource } from '../../models';

class Turkish extends MovieParser {
  override readonly name = 'Turkish123';
  protected override baseUrl = 'https://turkish123.ac/';
  protected override classPath = 'MOVIES.Turkish';
  override supportedTypes = new Set([TvType.TVSERIES]);

  private static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  /**
   * Search for Turkish TV shows
   * @param query search query string
   */
  override async search(query: string): Promise<IMovieInfo[]> {
    try {
      const params = `wp-admin/admin-ajax.php?s=${query}&action=searchwp_live_search&swpengine=default&swpquery=${query}`;
      const { data } = await this.client(this.baseUrl + params, {
        headers: this.getRequestHeaders(),
      });

      const $ = load(data);
      const results: IMovieInfo[] = [];

      $('li')
        .not('.ss-bottom')
        .each((_, el) => {
          const $el = $(el);
          const href = $el.find('a').attr('href')!;
          const styleAttr = $el.find('a').attr('style')!;
          const imageMatch = styleAttr.match(/url\((.*?)\)/);

          results.push({
            id: href.replace(this.baseUrl, '').replace('/', ''),
            image: imageMatch ? imageMatch[1] : '',
            title: $el.find('.ss-title').text(),
            tags: $el
              .find('.ss-info > a')
              .not('.ss-title')
              .map((_, e) => $(e).text())
              .get()
              .filter(v => v !== 'NULL'),
          });
        });

      return results;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Fetch detailed media information
   * @param mediaId media id
   */
  override async fetchMediaInfo(mediaId: string): Promise<IMovieInfo | IAnimeInfo> {
    const info: IMovieInfo = { id: mediaId, title: '' };

    try {
      const { data } = await this.client(this.baseUrl + mediaId, {
        headers: this.getRequestHeaders(),
      });

      const $ = load(data);

      const coverStyle = $('#content-cover').attr('style');
      const coverMatch = coverStyle?.match(/url\((.*?)\)/);

      info.image = coverMatch ? coverMatch[1] : undefined;
      info.title = $('.mvic-desc > h1').text();
      info.description = $('.f-desc')
        .text()
        .replace(/[\n\t\b]/g, '');
      info.romaji = $('.yellowi').text();
      info.tags = $('.mvici-left > p:nth-child(3)')
        .find('a')
        .map((_, el) => $(el).text())
        .get();
      info.rating = parseFloat($('.imdb-r').text());
      info.releaseDate = $('.mvici-right > p:nth-child(3)').find('a').first().text();
      info.totalEpisodes = $('.les-content > a').length;
      info.episodes = $('.les-content > a')
        .map((i, el) => {
          const $el = $(el);
          const href = $el.attr('href')!;
          const episodeId = href.split('/').slice(-2)[0];

          return {
            id: episodeId,
            title: `Episode ${i + 1}`,
          };
        })
        .get();

      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Fetch episode servers (not implemented)
   */
  override fetchEpisodeServers(): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * Fetch episode sources
   * @param episodeId episode id
   */
  override async fetchEpisodeSources(episodeId: string): Promise<ISource> {
    try {
      const { data } = await this.client(this.baseUrl + episodeId, {
        headers: this.getRequestHeaders(),
      });

      // Extract tukipasti URL
      const urlMatch = data.match(/"(https:\/\/tukipasti\.com\/t\/.*?)"/);
      if (!urlMatch) {
        throw new Error('Failed to extract tukipasti URL');
      }

      // Fetch the actual stream URL
      const { data: streamData } = await this.client(urlMatch[1]);
      const streamMatch = streamData.match(/var urlPlay = '(.*?)'/);

      if (!streamMatch) {
        throw new Error('Failed to extract stream URL');
      }

      return {
        sources: [{ url: streamMatch[1] }],
        headers: { Referer: 'https://tukipasti.com' },
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * Get common request headers
   */
  private getRequestHeaders(): Record<string, string> {
    return {
      'User-Agent': Turkish.USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: this.baseUrl,
    };
  }
}

export default Turkish;
