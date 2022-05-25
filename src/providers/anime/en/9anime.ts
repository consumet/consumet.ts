import { AnimeParser, IAnimeSearch } from '../../../models';

export class NineAnime extends AnimeParser {
  protected override name = '9anime';
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
}
