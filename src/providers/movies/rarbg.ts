import { load } from 'cheerio';
import axios from 'axios';
import parser from 'parse-torrent-title';

import { IEpisodeServer, IMovieResult, ISearch, ISource, MovieParser, TvType } from '../../models';
import { MixDrop, VidCloud } from '../../extractors';

class Rarbg extends MovieParser {
  override readonly name = 'rarbg';
  protected override baseUrl = 'https://rarbgto.org';
  protected torrentApi = 'https://torrentapi.org';
  protected override logo = 'https://pbs.twimg.com/profile_images/715149053034635265/LYYQKdrV_400x400.jpg';
  protected override classPath = 'MOVIES.Rarbg';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  protected rarbgToken = { token: null, updated: 0 };

  async search(query: string, page: number = 1, category: string): Promise<ISearch<IMovieResult>> {
    const searchResult: ISearch<IMovieResult> = {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };

    const search_query = query.split(' ').join('+');

    // get token
    const seconds = Math.floor(Date.now() / 1000);
    if (seconds - this.rarbgToken.updated > 870) {
      const token_url = this.torrentApi + '/pubapi_v2.php?get_token=get_token&app_id=torrenter';
      const response = await axios.get(token_url, {
        headers: {
          'user-agent': 'node.js',
        },
        timeout: 10000,
      });
      this.rarbgToken = { token: response.data.token, updated: seconds };
    }

    // docs - https://torrentapi.org/apidocs_v2.txt?&app_id=torrenter
    const search_url = `${this.torrentApi}/pubapi_v2.php?mode=search&search_string=${encodeURIComponent(
      search_query
    )}&app_id=torrenter${
      category ? '&category=' + category : ''
    }&sort=seeders&min_seeders=1&ranked=0&format=json_extended&token=${this.rarbgToken.token}`;

    await this.sleep(2200);

    const { data } = await axios.get(search_url);

    data?.torrent_results?.forEach((torrent: any) => {
      const parsed = parser.parse(torrent.title);
      searchResult.results.push({
        title:
          parsed?.season !== undefined ? `${parsed.title} S${parsed.season}E${parsed.episode}` : parsed.title,
        resolution: parsed.resolution || 'unknown',
        group: parsed.group,
        id: torrent.title,
        category: torrent.category,
        seeders: torrent.seeders,
        leechers: torrent.leechers,
        magnet: torrent.download,
        size: this.bytesToSize(torrent.size),
        length: torrent.size,
        uploaded: torrent.pubdate.split('+')[0],
        episodeInfo: torrent?.episode_info !== undefined ? torrent.episode_info : undefined,
      });
    });

    return searchResult;
  }

  fetchMediaInfo(mediaId: string): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string, ...args: any): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }

  bytesToSize(bytes: number): any {
    // convert bytes to human readable format
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  }

  async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

(async () => {
  const movie = new Rarbg();
  const movieInfo = await movie.search('guardians of the galaxy', 1, 'movies');
  console.log(movieInfo);
})();

export default Rarbg;
