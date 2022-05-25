import { BaseParser } from '.';

abstract class AnimeParser extends BaseParser {
  /**
   * takes anime link
   *
   * returns anime info
   */
  protected abstract fetchAnimeInfo(animeUrl: string): Promise<unknown>;

  /**
   * takes episode link
   *
   * returns episode sources (video links)
   */
  protected abstract fetchEpisodeSources(episodeLink: string): Promise<unknown>;
}

export default AnimeParser;
