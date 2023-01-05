import axios from 'axios';
import { Cheerio, load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  SubOrSub,
  IEpisodeServer,
  Genres,
  MangaParser,
  IMangaChapterPage,
  IMangaInfo,
  IMangaResult,
  IMangaChapter,
  ProxyConfig,
  MediaFormat,
  ITitle,
  FuzzyDate,
} from '../../models';
import { substringAfter, substringBefore, compareTwoStrings, kitsuSearchQuery, range } from '../../utils';
import Gogoanime from '../anime/gogoanime';
import Zoro from '../anime/zoro';
// import Crunchyroll from '../anime/crunchyroll';
import Enime from '../anime/enime';
import Bilibili from '../anime/bilibili';

class TVDB extends AnimeParser {
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
  override readonly name = 'TVDB';
  protected override baseUrl = 'https://www.thetvdb.com/dereferrer/series/';
  protected override logo = 'https://en.wikipedia.org/wiki/TVDB#/media/File:TVDB.png';
  protected override classPath = 'META.TVDB';
  provider: AnimeParser;

  /**
   * This class maps TVDB to kitsu with any other anime provider.
   * kitsu is used for episode images, titles and description.
   * @param provider anime provider (optional) default: Gogoanime
   */
  constructor(provider?: AnimeParser) {
    super();
    this.provider = provider || new Gogoanime();
  }

  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    const searchResults: ISearch<IAnimeResult> = {
      currentPage: page,
      results: [],
    };

    const { data } = await axios.post(
      'https://tvshowtime-1.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.32.0%3Binstantsearch.js%20(3.5.3)%3BJS%20Helper%20(2.28.0)&x-algolia-application-id=tvshowtime&x-algolia-api-key=c9d5ec1316cec12f093754c69dd879d3',
      {
        requests: [{ indexName: 'TVDB', params: `query=${query}&maxValuesPerFacet=10&page=${page - 1}` }],
      }
    );

    data.results[0].hits.map((hit: any, i: number) => {
      searchResults.results.push({
        id: hit.id,
        title: hit.name,
        cover: hit.banner,
        image: hit.poster,
        releaseDate: hit.release_year,
        status: this.statusToConsumetStatus(hit.status),
        type: hit.type,
        url: hit.url,
        titles: hit.translations,
        country: hit.country,
        network: hit.network,
        companies: hit.companies,
        aliases: hit.aliases,
        overviews: hit.overviews,
        mappings: hit.remote_ids,
      });
    });
    return searchResults;
  };

  private statusToConsumetStatus(status: string) {
    if (status.toLowerCase() == 'continuing') return MediaStatus.ONGOING;
    if (status.toLowerCase() == 'released') return MediaStatus.COMPLETED;
    if (status.toLowerCase() == 'ended') return MediaStatus.COMPLETED;
    return MediaStatus.UNKNOWN;
  }

  /**
   *
   * @param animeId anime id
   * @param fetchFiller fetch filler episodes
   */
  fetchAnimeInfo = async (
    animeId: string,
    dub: boolean = false,
    fetchFiller: boolean = false
  ): Promise<IAnimeInfo> => {
    try {
      const data = await (await axios.get(`${this.baseUrl}${animeId}`)).data;

      const $ = load(data);

      console.log($('.translated_title').text().trim());

      const titles: ITitle = {
        english: undefined,
        romaji: '',
        native: $('.translated_title').text().trim(),
      };

      const descriptions: any[] = [];
      const synonyms: any[] = [];

      $('#translations')
        .children()
        .map((i, el) => {
          if ($(el).data('language') == 'eng') {
            titles.english = $(el).data('title') as string;
            $(el)
              .find('li')
              .map((i, element) => {
                synonyms.push($(element).text().trim());
              });
          }
          if ($(el).data('language') == 'por') titles.romaji = $(el).data('title') as string;

          if ($(el).data('language') != null)
            descriptions.push({
              language: $(el).data('language'),
              text: $(el).children().eq(0).text().trim(),
            });
        });

      const posters = $('#artwork-posters').children().eq(0).children();
      const posters_list: any[] = [];
      posters.map((i, el) => {
        posters_list.push($(el).children('a').attr('href'));
      });

      const covers = $('#artwork-backgrounds').children().eq(0).children();
      const covers_list: any[] = [];
      covers.map((i, el) => {
        covers_list.push($(el).children('a').attr('href'));
      });

      const logos = $('#artwork-clearlogo').children().eq(0).children();
      const logos_list: any[] = [];
      logos.map((i, el) => {
        logos_list.push($(el).children('a').attr('href'));
      });

      let releaseDate = '';
      let totalEpisodes = 0;

      const seasons: any[] = [];
      $('.table.table-bordered.table-hover.table-colored')
        .children()
        .eq(1)
        .find('a')
        .map((i, el) => {
          if ($(el).text().trim() == 'Season 1') {
            releaseDate = $(el).parent().parent().children().eq(1).text().trim().replace(/\D/g, '').trim();
            totalEpisodes = parseInt($(el).parent().parent().children().eq(3).text().trim());
          }
        });

      $('.table.table-bordered.table-hover.table-colored')
        .children()
        .eq(1)
        .map((i, el) => {
          $(el)
            .children()
            .map((i, element) => {
              if (!$(element).text().trim().includes('All Seasons')) {
                seasons.push({
                  id: $(element).children().eq(0).children().eq(0).attr('href'),
                  number: $(element).children().eq(0).text().trim(),
                  start:
                    $(element).children().eq(1).text().trim() != ''
                      ? $(element).children().eq(1).text().trim().split('\n')[0] +
                        ' ' +
                        $(element).children().eq(1).text().trim().split('\n')[1].trim()
                      : '',
                  end:
                    $(element).children().eq(2).text().trim() != ''
                      ? $(element).children().eq(2).text().trim().split('\n')[0] +
                        ' ' +
                        $(element).children().eq(2).text().trim().split('\n')[1].trim()
                      : '',
                  episodes: parseInt($(element).children().eq(3).text().trim()),
                });
              }
            });
        });

      const genres: any[] = [];
      $('.list-group')
        .find('a')
        .map((i, el) => {
          if ($(el).attr('href')?.includes('genres')) {
            genres.push($(el).text().trim());
          }
        });

      let country = '';
      let duration: number | undefined = undefined;
      let studio = '';
      const mappings: {
        imdb: string | undefined;
        tmdb: number | undefined;
      } = {
        imdb: undefined,
        tmdb: undefined,
      };
      $('.list-group-item.clearfix').map((i, el) => {
        if ($(el).text().includes('Original Country')) {
          country = $(el).text().replace('Original Country', '').trim();
        } else if ($(el).text().includes('Average Runtime')) {
          duration = parseInt($(el).text().replace('Average Runtime', '').trim());
        } else if ($(el).text().includes('Production Company')) {
          studio = $(el).text().replace('Production Company', '').trim();
        } else if ($(el).text().includes('On Other Sites')) {
          $(el)
            .children()
            .find('a')
            .map((i, element) => {
              if ($(element).attr('href')?.includes('imdb')) {
                const imdb_split = $(element).attr('href')?.split('/') ?? [];
                console.log(imdb_split);
                mappings.imdb = imdb_split[imdb_split.length - 2];
              } else if ($(element).attr('href')?.includes('themoviedb')) {
                const tmdb_split = $(element).attr('href')?.split('/') ?? [];
                mappings.tmdb = parseInt(tmdb_split[tmdb_split.length - 1]);
              }
            });
        }
      });

      const cast: any[] = [];

      $('.thumbnail').map((i, el) => {
        const data = $(el);
        const names = data.children().eq(0).text().split(' as ');
        cast.push({
          name: names[0].trim(),
          image: $(el).find('img').data('src'),
          voiceActor: names[1].trim(),
        });
      });

      const animeData: IAnimeInfo = {
        id: animeId,
        title: titles,
        mappings: mappings,
        countryOfOrigin: country,
        synonyms: synonyms,
        images: posters_list,
        covers: covers_list,
        logos: logos_list,
        descriptions: descriptions,
        status: this.statusToConsumetStatus(
          $('.list-group').children().eq(1).text().replace('Status', '').trim()
        ),
        releaseDate: releaseDate,
        totalEpisodes: totalEpisodes,
        duration: duration,
        genres: genres,
        studios: [studio],
        cast: cast,
        seasons: seasons,
      };

      return animeData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}

export default TVDB;

(async () => {
  const tvdb = new TVDB();
  const info = await tvdb.search('classroom of the elite');
  console.log(info);
  //   console.log(await tvdb.fetchAnimeInfo('329822'));
})();
