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
import Crunchyroll from '../anime/crunchyroll';
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

    const { data } = await axios.request({
      method: 'get',
      url: `https://TVDB.net/anime.php?q=${query}&cat=anime&show=${50 * (page - 1)}`,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
      },
    });

    const $ = load(data);

    const pages = $('.normal_header').find('span').children();
    const maxPage = parseInt(pages.last().text());
    const hasNextPage = page < maxPage;
    searchResults.hasNextPage = hasNextPage;

    $('tr').each((i, item) => {
      const id = $(item).find('.hoverinfo_trigger').attr('href')?.split('anime/')[1].split('/')[0];
      const title = $(item).find('strong').text();
      const description = $(item).find('.pt4').text().replace('...read more.', '...');
      const type = $(item).children().eq(2).text().trim();
      const episodeCount = $(item).children().eq(3).text().trim();
      const score = (parseFloat($(item).children().eq(4).text()) * 10).toFixed(0);
      const imageTmp = $(item).children().first().find('img').attr('data-src');
      const imageUrl = `https://cdn.TVDB.net/images/anime/${imageTmp?.split('anime/')[1]}`;

      if (title != '') {
        searchResults.results.push({
          id: id ?? '',
          title: title,
          image: imageUrl,
          rating: parseInt(score),
          description: description,
          totalEpisodes: parseInt(episodeCount),
          type:
            type == 'TV'
              ? MediaFormat.TV
              : type == 'TV_SHORT'
              ? MediaFormat.TV_SHORT
              : type == 'MOVIE'
              ? MediaFormat.MOVIE
              : type == 'SPECIAL'
              ? MediaFormat.SPECIAL
              : type == 'OVA'
              ? MediaFormat.OVA
              : type == 'ONA'
              ? MediaFormat.ONA
              : type == 'MUSIC'
              ? MediaFormat.MUSIC
              : type == 'MANGA'
              ? MediaFormat.MANGA
              : type == 'NOVEL'
              ? MediaFormat.NOVEL
              : type == 'ONE_SHOT'
              ? MediaFormat.ONE_SHOT
              : undefined,
        });
      }
    });

    return searchResults;
  };

	private statusToConsumetStatus(status: string) {
		if(status.toLowerCase() == "continuing") return MediaStatus.ONGOING
		return MediaStatus.UNKNOWN
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

      const data = await (await axios.get(`${this.baseUrl}${animeId}`)).data

			const $ = load(data)

			console.log($(".translated_title").text().trim())

			const titles: ITitle = {
				english: undefined,
				romaji: "",
				native: $(".translated_title").text().trim()
			}

			const descriptions: any[] = []
			const synonyms: any[] = []

			$('#translations').children().map((i, el) => {
				if($(el).data('language') == "eng") {
					titles.english = $(el).data('title') as string
					$(el).find('li').map((i, element) => {
						synonyms.push($(element).text().trim())
					})
				}
				if($(el).data('language') == "por") titles.romaji = $(el).data('title') as string

				if($(el).data('language') != null) descriptions.push($(el).children().eq(0).text().trim())
			})

			const posters = $("#artwork-posters").children().eq(0).children()
			const posters_list: any[] = []
			posters.map((i: any, el) => {
				posters_list.push($(el).children('a').attr('href'))
			})

			const covers = $("#artwork-backgrounds").children().eq(0).children()
			const covers_list: any[] = []
			covers.map((i: any, el) => {
				covers_list.push($(el).children('a').attr('href'))
			})

			const logos = $("#artwork-clearlogo").children().eq(0).children()
			const logos_list: any[] = []
			logos.map((i: any, el) => {
				logos_list.push($(el).children('a').attr('href'))
			})

			let releaseDate = ""
			let totalEpisodes = 0

			const seasons: any[] = []
			$('.table.table-bordered.table-hover.table-colored').children().eq(1).find('a').map((i, el) => {
				if($(el).text().trim() == "Season 1") {
					releaseDate = $(el).parent().parent().children().eq(1).text().trim().replace(/\D/g,'').trim()
					totalEpisodes = parseInt($(el).parent().parent().children().eq(3).text().trim())
				}
			})

			$('.table.table-bordered.table-hover.table-colored').children().eq(1).map((i, el) => {
				$(el).children().map((i, element) => {
					if(!$(element).text().trim().includes("All Seasons")) {
						seasons.push({
							id: $(element).children().eq(0).children().eq(0).attr('href'),
							number: $(element).children().eq(0).text().trim(),
							start: $(element).children().eq(1).text().trim() != "" ? $(element).children().eq(1).text().trim().split('\n')[0] + ' ' + $(element).children().eq(1).text().trim().split('\n')[1].trim() : '',
							end: $(element).children().eq(2).text().trim() != "" ? $(element).children().eq(2).text().trim().split('\n')[0] + ' ' + $(element).children().eq(2).text().trim().split('\n')[1].trim() : '',
							episodes: parseInt($(element).children().eq(3).text().trim())
						})
					}

				})
			})

			const genres: any[] = []
			$('.list-group').find('a').map((i, el) => {
				if($(el).attr('href')?.includes('genres')) {
					genres.push($(el).text().trim())
				}
			})

			let country = ""
			let duration: number | undefined = undefined
			let studio = ""
			const mappings: {
				imdb: string | undefined,
				tmdb: number | undefined
			} = {
				imdb: undefined,
				tmdb: undefined
			}
			$('.list-group-item.clearfix').map((i, el) => {
				if($(el).text().includes('Original Country')) {
					country = $(el).text().replace('Original Country', '').trim()
				} else if($(el).text().includes('Average Runtime')) {
					duration = parseInt($(el).text().replace('Average Runtime', '').trim())
				} else if($(el).text().includes('Production Company')) {
					studio = $(el).text().replace('Production Company', '').trim()
				} else if($(el).text().includes('On Other Sites')) {
					$(el).children().find('a').map((i, element) => {
						if($(element).attr('href')?.includes('imdb')) {
							const imdb_split = $(element).attr('href')?.split('/') ?? []
							console.log(imdb_split)
							mappings.imdb = imdb_split[imdb_split.length - 2]
						} else if($(element).attr('href')?.includes('themoviedb')) {
							const tmdb_split = $(element).attr('href')?.split('/') ?? []
							mappings.tmdb = parseInt(tmdb_split[tmdb_split.length - 1])
						}
					})
				}
			})

			const cast: any[] = []

			$('.thumbnail').map((i, el) => {
				const data = $(el)
				const names = data.children().eq(0).text().split(' as ')
				cast.push({
					name: names[0].trim(),
					image: $(el).find('img').data('src'),
					voiceActor: names[1].trim()
				})
			})

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
				status: this.statusToConsumetStatus($('.list-group').children().eq(1).text().replace('Status', '').trim()),
				releaseDate: releaseDate,
				totalEpisodes:totalEpisodes,
				duration: duration,
				genres: genres,
				studios: [
					studio
				],
				cast: cast,
				seasons: seasons
			}

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
  console.log(await tvdb.fetchAnimeInfo('329822'));
})();
