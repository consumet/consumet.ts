import axios from 'axios';
import { load } from 'cheerio';

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
import { substringAfter, substringBefore } from '../../utils';
import Gogoanime from '../anime/gogoanime';

class Myanimelist extends AnimeParser {
  override readonly name = 'Myanimelist';
  protected override baseUrl = 'https://myanimelist.net/';
  protected override logo = 'https://en.wikipedia.org/wiki/MyAnimeList#/media/File:MyAnimeList.png';
  protected override classPath = 'META.MAL';

  /**
   * This class maps myanimelist to kitsu with any other anime provider.
   * kitsu is used for episode images, titles and description.
   * @param provider anime provider (optional) default: Gogoanime
   */
  constructor(public provider: AnimeParser = new Gogoanime()) {
    super();
  }

  private malStatusToMediaStatus(status: string): MediaStatus {
    if (status == 'currently airing') return MediaStatus.ONGOING;
    else if (status == 'finished airing') return MediaStatus.COMPLETED;
    else if (status == 'not yet aired') return MediaStatus.NOT_YET_AIRED;
    return MediaStatus.UNKNOWN;
  }

  private async populateEpisodeList(
    episodes: IAnimeEpisode[],
    url: string,
    count: number = 1
  ): Promise<void> {
    try {
      let { data } = await axios.request({
        method: 'get',
        url: `${url}?p=${count}`,
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
        },
      });

      let hasEpisodes = false;
      let $ = load(data);
      for (let elem of $('.video-list').toArray()) {
        let href = $(elem).attr('href');
        let image = $(elem).find('img').attr('data-src');
        let titleDOM = $(elem).find('.episode-title');
        let title = titleDOM?.text();
        titleDOM.remove();

        let numberDOM = $(elem).find('.title').text().split(' ');
        let number = 0;
        if (numberDOM.length > 1) {
          number = Number(numberDOM[1]);
        }
        if (href && href.indexOf('myanimelist.net/anime') > -1) {
          hasEpisodes = true;
          episodes.push({
            id: '',
            number,
            title,
            image,
          });
        }
      }

      if (hasEpisodes) await this.populateEpisodeList(episodes, url, ++count);
    } catch (err) {
      console.error(err);
    }
  }

  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    let searchResults: ISearch<IAnimeResult> = {
      currentPage: page,
      results: [],
    };

    const { data } = await axios.request({
      method: 'get',
      url: `https://myanimelist.net/anime.php?q=${query}&cat=anime&show=${50 * page - 1}`,
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
      const imageUrl = `https://cdn.myanimelist.net/images/anime/${imageTmp?.split('anime/')[1]}`;

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

  fetchAnimeInfo(animeId: string, ...args: any): Promise<IAnimeInfo> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }

  /**
   *
   * @param id anime id
   * @returns anime info without streamable episodes
   */
  fetchMalInfoById = async (id: string): Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
      id: id,
      title: '',
    };

    const { data } = await axios.request({
      method: 'GET',
      url: `https://myanimelist.net/anime/${id}`,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
      },
    });

    const $ = load(data);
    const episodes: IAnimeEpisode[] = [];
    const desc = $('[itemprop="description"]').first().text();
    const imageElem = $('[itemprop="image"]').first();
    const image = imageElem.attr('src') || imageElem.attr('data-image') || imageElem.attr('data-src');
    const genres: string[] = [];
    const genreDOM = $('[itemprop="genre"]').get();

    genreDOM.forEach(elem => genres.push($(elem).text()));

    animeInfo.genres = genres;
    animeInfo.image = image;
    animeInfo.description = desc;
    animeInfo.title = $('.title-name')?.text();
    animeInfo.studios = [];
    // animeInfo.episodes = episodes;

    const teaserDOM = $('.video-promotion > a');
    if (teaserDOM.length > 0) {
      const teaserURL = $(teaserDOM).attr('href');
      const style = $(teaserDOM).attr('style');
      if (teaserURL) {
        animeInfo.trailer = {
          id: substringAfter(teaserURL, 'embed/').split('?')[0],
          site: 'https://youtube.com/watch?v=',
          thumbnail: style ? substringBefore(substringAfter(style, "url('"), "'") : '',
        };
      }
    }

    const description = $('.spaceit_pad').get();

    description.forEach(elem => {
      const text = $(elem).text().toLowerCase().trim();
      const key = text.split(':')[0];
      const value = substringAfter(text, `${key}:`).trim();
      switch (key) {
        case 'status':
          animeInfo.status = this.malStatusToMediaStatus(value);
          break;
        case 'episodes':
          animeInfo.totalEpisodes = parseInt(value);
          if (isNaN(animeInfo.totalEpisodes)) animeInfo.totalEpisodes = 0;
          break;
        case 'premiered':
          animeInfo.season = value.split(' ')[0];
          break;
        case 'aired':
          const dates = value.split('to');
          if (dates.length >= 2) {
            let start = dates[0].trim();
            let end = dates[1].trim();
            let startDate = new Date(start);
            let endDate = new Date(end);

            if (startDate.toString() !== 'Invalid Date') {
              animeInfo.startDate = {
                day: startDate.getDate(),
                month: startDate.getMonth(),
                year: startDate.getFullYear(),
              };
            }

            if (endDate.toString() != 'Invalid Date') {
              animeInfo.endDate = {
                day: endDate.getDate(),
                month: endDate.getMonth(),
                year: endDate.getFullYear(),
              };
            }
          }

          break;

        case 'score':
          animeInfo.rating = parseFloat(value);
          break;
        case 'synonyms':
          animeInfo.synonyms = value.split(',');
          animeInfo.synonyms = animeInfo.synonyms.map(x => x.trim());
          break;
        case 'studios':
          for (let studio of $(elem).find('a')) animeInfo.studios?.push($(studio).text());
          break;
        case 'rating':
          animeInfo.ageRating = value;
      }
    });

    // Only works on certain animes, so it is unreliable
    // let videoLink = $('.mt4.ar a').attr('href');
    // if (videoLink) {
    //   await this.populateEpisodeList(episodes, videoLink);
    // }
    return animeInfo;
  };
}

export default Myanimelist;

(async () => {
  const mal = new Myanimelist();
  console.log(await mal.search('Naruto'));
  //console.log((await mal.fetchMalInfoById("1535")));
  // setInterval(async function(){
  //     let numReqs = 1;
  //     let promises = [];
  //     for(let i = 0; i < numReqs; i++){
  //         promises.push(mal.fetchMalInfoById("28223"));
  //     }
  //     let data : IAnimeInfo[] = await Promise.all(promises);

  //     for(let i = 0; i < numReqs; i++){
  //         assert(data[i].rating === 8.161);
  //     }

  //     count+=numReqs;
  //     console.log("Count: ", count, "Time: ", (performance.now() - start));
  // },1000);
})();
