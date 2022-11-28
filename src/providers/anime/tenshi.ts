import axios from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  IEpisodeServer,
  IVideo,
  StreamingServers,
  MediaStatus,
  SubOrSub,
  IAnimeResult,
  ISource,
  MediaFormat,
  IAnimeEpisode,
} from '../../models';

class Tenshi extends AnimeParser {
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
    throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
    throw new Error('Method not implemented.');
  }
  search(query: string, ...args: any[]): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  override readonly name = 'Tenshi';
  protected override baseUrl = 'https://tenshi.moe/';
  protected override logo = '';
  protected override classPath = 'ANIME.Tenshi';

  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    try {
      let { data } = await axios.request({
        method: 'get',
        url: `${this.baseUrl}anime/${id}`,
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
          cookie: 'loop-view=thumb;__ddg1_=;__ddg2_=',
        },
      });

      const maxEpisodesPerPage = 36;

      let $ = load(data);

      let english_title: string | undefined = undefined;
      let native_title: string | undefined = undefined;
      let synonyms: string[] = [];
      let genres: string[] = [];
      let info = $('.entry-content').children();
      let extraInfo = $('.info-list').children();
      let status = $('.status.meta-data').text().trim().replace('Status', '').trim();
      let hasDub = $('.audio.meta-data').children().length > 2;
      let producers: string[] = [];
      let episodeList: IAnimeEpisode[] = [];
      let totalEpisodes = Number($('.entry-episodes').text().trim().replace('Episodes ', '').trim());
      let hasMultiplePages = $('.entry-episodes').find('nav').length > 0;

      $('.info-box')
        .find('.value')
        .each(function (i, item) {
          if ($(this).find('.flag-icon').attr('title') == 'English') {
            english_title = $(this).text().trim();
          } else if ($(this).find('.flag-icon').attr('title') == 'Japanese') {
            native_title = $(this).text().trim();
          } else {
            synonyms.push($(this).text().trim());
          }
        });

      $('.synonym.meta-data')
        .find('.value')
        .each(function (i, item) {
          synonyms.push($(this).text().trim());
        });

      $('.genre.meta-data')
        .find('.value')
        .each(function (i, item) {
          genres.push($(this).text().trim());
        });

      $('.production.meta-data')
        .find('.value')
        .each(function (i, item) {
          producers.push($(this).text().trim());
        });

      let age = $('.content-rating.meta-data')
        .text()
        .trim()
        .replace('Content Rating', '')
        .trim()
        .split(' - ');

      if (hasMultiplePages) {
        let lastPage = Number($('.pagination').children().eq(-2).first().text());
        for (let i = 1; i <= lastPage; i++) {
          let { data } = await axios.request({
            method: 'get',
            url: `${this.baseUrl}anime/${id}?page=${i}`,
            headers: {
              'user-agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
              cookie: 'loop-view=thumb;__ddg1_=;__ddg2_=',
            },
          });

          let ep = load(data);

          ep('.loop.episode-loop.thumb')
            .children()
            .each(function (i, item) {
              episodeList.push({
                id: `${id}/${Number($(this).find('.episode-slug').text().replace('Episode', ''))}`,
                number: Number($(this).find('.episode-slug').text().replace('Episode', '')),
                title: $(this).find('.episode-title').text(),
                image: $(this).find('img').attr('src'),
                description: $(this).find('.film-grain').attr('data-content'),
                releaseDate: $(this).find('.episode-date').text(),
              });
            });
        }
      } else {
        $('.loop.episode-loop.thumb')
          .children()
          .each(function (i, item) {
            episodeList.push({
              id: `${id}/${Number($(this).find('.episode-slug').text().replace('Episode', ''))}`,
              number: Number($(this).find('.episode-slug').text().replace('Episode', '')),
              title: $(this).find('.episode-title').text(),
              image: $(this).find('img').attr('src'),
              description: $(this).find('.film-grain').attr('data-content'),
              releaseDate: $(this).find('.episode-date').text(),
            });
          });
      }

      let animeInfo: IAnimeInfo = {
        id: id,
        title: {
          romaji: $('.entry-header').first().text().trim(),
          english: english_title,
          native: native_title,
        },
        image: info.find('.cover-image').attr('src'),
        status:
          status == 'Ongoing'
            ? MediaStatus.ONGOING
            : status == 'Completed'
            ? MediaStatus.COMPLETED
            : status == 'Stalled'
            ? MediaStatus.HIATUS
            : MediaStatus.UNKNOWN,
        description: $('.card-body').text(),
        hasDub: hasDub,
        genres: genres,
        rating: Number((parseFloat($('.rating.btn.btn-lg.btn-heart').find('span').text()) * 10).toFixed(0)),
        releaseDate: $('.release-date.meta-data').text().trim().replace('Release Date', '').trim(),
        producers: producers,
        synonyms: synonyms,
        ageRating: age[0],
        ageRatingGuide: age[1],
        totalEpisodes: totalEpisodes,
        episodes: episodeList,
      };

      return animeInfo;
    } catch (err) {
      throw new Error("Anime doesn't exist.");
    }
  };
}

export default Tenshi;

(async () => {
  const tenshi = new Tenshi();
  //console.log(await tenshi.fetchAnimeInfo('dewhzcns'));
  console.log(await tenshi.fetchAnimeInfo('fntoucz2'));
})();
