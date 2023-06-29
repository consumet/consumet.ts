import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  ISource,
  IMovieResult,
  ISearch,
} from '../../models';
import axios from 'axios';
import { load } from 'cheerio';
import { SmashyStream } from '../../extractors';

class Seez extends MovieParser {
  override readonly name = 'Seez';
  protected override baseUrl = 'https://embed.smashystream.com';
  protected override logo = 'https://seez.su/favicon.ico';
  protected override classPath = 'MOVIES.Seez';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    throw new Error('Method not implemented.');
  };

  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    throw new Error('Method not implemented.');
  };

  override fetchEpisodeServers = async (
    tmdbId: string,
    season: number,
    episode: number
  ): Promise<IEpisodeServer[]> => {
    try {
      const epsiodeServers: IEpisodeServer[] = [];

      let url = `${this.baseUrl}/playere.php?tmdb=${tmdbId}`;
      if (season) {
        url = `${this.baseUrl}/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
      }
      const { data } = await axios.get(url);
      const $ = load(data);

      await Promise.all(
        $('div#_default-servers a.server')
          .map(async (i, el) => {
            const streamLink = $(el).attr('data-id') ?? '';

            epsiodeServers.push({
              name: $(el).text().replace(/  +/g, ' ').trim(),
              url: streamLink,
            });
          })
          .get()
      );
      
      return epsiodeServers;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  override fetchEpisodeSources = async (
    tmdbId: string,
    season: number,
    episode: number,
    server: string
  ): Promise<ISource> => {
    try {
      const servers = await this.fetchEpisodeServers(tmdbId, season, episode);
      const selectedServer = servers.find(s => s.name.toLowerCase() === server.toLowerCase());

      //console.log(servers);
      //console.log(selectedServer);

      if (!selectedServer) {
        throw new Error(`Server ${server} not found`);
      }

      if (selectedServer.url.includes('/ffix')) {
        return {
          headers: { Referer: this.baseUrl },
          ...(await new SmashyStream().invokeSmashyFfix(selectedServer.url)),
        };
      }

      if (selectedServer.url.includes('/nflim')) {
        return {
          headers: { Referer: this.baseUrl },
          ...(await new SmashyStream().invokeSmashyNflim(selectedServer.url)),
        };
      }

      // streamLink.includes("/gtop") -> {
      //     invokeSmashyGtop(it.second, streamLink, callback)
      // }
      // streamLink.includes("/dude_tv") -> {
      //     invokeSmashyDude(it.second, streamLink, callback)
      // }
      // streamLink.includes("/rip") -> {
      //     invokeSmashyRip(it.second, streamLink, subtitleCallback, callback)
      // }

      return await this.fetchEpisodeSources(selectedServer.url, season, episode, server);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default Seez;
