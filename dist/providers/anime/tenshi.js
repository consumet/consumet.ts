"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class Tenshi extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'Tenshi';
        this.baseUrl = 'https://tenshi.moe/';
        this.logo = '';
        this.classPath = 'ANIME.Tenshi';
        this.fetchAnimeInfo = async (id) => {
            try {
                const { data } = await axios_1.default.request({
                    method: 'get',
                    url: `${this.baseUrl}anime/${id}`,
                    headers: {
                        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                        cookie: 'loop-view=thumb;__ddg1_=;__ddg2_=',
                    },
                });
                const maxEpisodesPerPage = 36;
                const $ = (0, cheerio_1.load)(data);
                let english_title = undefined;
                let native_title = undefined;
                const synonyms = [];
                const genres = [];
                const info = $('.entry-content').children();
                const extraInfo = $('.info-list').children();
                const status = $('.status.meta-data').text().trim().replace('Status', '').trim();
                const hasDub = $('.audio.meta-data').children().length > 2;
                const producers = [];
                const episodeList = [];
                const totalEpisodes = Number($('.entry-episodes').text().trim().replace('Episodes ', '').trim());
                const hasMultiplePages = $('.entry-episodes').find('nav').length > 0;
                $('.info-box')
                    .find('.value')
                    .each(function (i, item) {
                    if ($(this).find('.flag-icon').attr('title') == 'English') {
                        english_title = $(this).text().trim();
                    }
                    else if ($(this).find('.flag-icon').attr('title') == 'Japanese') {
                        native_title = $(this).text().trim();
                    }
                    else {
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
                const age = $('.content-rating.meta-data')
                    .text()
                    .trim()
                    .replace('Content Rating', '')
                    .trim()
                    .split(' - ');
                if (hasMultiplePages) {
                    const lastPage = Number($('.pagination').children().eq(-2).first().text());
                    for (let i = 1; i <= lastPage; i++) {
                        const { data } = await axios_1.default.request({
                            method: 'get',
                            url: `${this.baseUrl}anime/${id}?page=${i}`,
                            headers: {
                                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                                cookie: 'loop-view=thumb;__ddg1_=;__ddg2_=',
                            },
                        });
                        const ep = (0, cheerio_1.load)(data);
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
                }
                else {
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
                const animeInfo = {
                    id: id,
                    title: {
                        romaji: $('.entry-header').first().text().trim(),
                        english: english_title,
                        native: native_title,
                    },
                    image: info.find('.cover-image').attr('src'),
                    status: status == 'Ongoing'
                        ? models_1.MediaStatus.ONGOING
                        : status == 'Completed'
                            ? models_1.MediaStatus.COMPLETED
                            : status == 'Stalled'
                                ? models_1.MediaStatus.HIATUS
                                : models_1.MediaStatus.UNKNOWN,
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
            }
            catch (err) {
                throw new Error("Anime doesn't exist.");
            }
        };
    }
    fetchEpisodeSources(episodeId, ...args) {
        throw new Error('Method not implemented.');
    }
    fetchEpisodeServers(episodeId) {
        throw new Error('Method not implemented.');
    }
    search(query, ...args) {
        throw new Error('Method not implemented.');
    }
}
exports.default = Tenshi;
// (async () => {
//   const tenshi = new Tenshi();
//   //console.log(await tenshi.fetchAnimeInfo('dewhzcns'));
//   console.log(await tenshi.fetchAnimeInfo('fntoucz2'));
// })();
//# sourceMappingURL=tenshi.js.map