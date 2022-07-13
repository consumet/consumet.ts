import { BaseParser, IAnimeInfo, ISource, IEpisodeServer } from '.';

abstract class AnimeParser extends BaseParser {
  /**
   * takes anime id
   *
   * returns anime info (including episodes)
   */
  abstract fetchAnimeInfo(animeid: string, ...args: any): Promise<IAnimeInfo>;

  /**
   * takes episode id
   *
   * returns episode sources (video links)
   */
  abstract fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource>;

  /**
   * takes episode link
   *
   * returns episode servers (video links) available
   */
  abstract fetchEpisodeServers(episodeLink: string): Promise<IEpisodeServer[]>;
}

export default AnimeParser;
