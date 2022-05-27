import { AnimeParser, IAnimeSearch } from '../../../models';

class NineAnime extends AnimeParser {
  override readonly name = '9anime';
  protected override baseUrl = 'https://9anime.to';

  override async search(query: string, page: number = 1): Promise<IAnimeSearch[]> {
    throw new Error('Method not implemented.');
  }

  override async fetchAnimeInfo(animeUrl: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  override async fetchEpisodeSources(episodeLink: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  override async fetchEpisodeServers(episodeLink: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default NineAnime;
