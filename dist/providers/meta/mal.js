"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
let substringAfter = function substringAfter(str, toFind) {
    let index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(index + toFind.length);
};
let substringBefore = function substringBefore(str, toFind) {
    let index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(0, index);
};
class Myanimelist extends models_1.AnimeParser {
    /**
     * This class maps anilist to kitsu with any other anime provider.
     * kitsu is used for episode images, titles and description.
     * @param provider anime provider (optional) default: Gogoanime
     * @param proxy proxy config (optional) default: null
     */
    constructor() {
        super();
        this.name = 'Myanimelist';
        this.baseUrl = 'https://myanimelist.net/';
        this.logo = 'https://en.wikipedia.org/wiki/MyAnimeList#/media/File:MyAnimeList.png';
        this.classPath = 'META.MAL';
        this.search = async (query, page = 1) => {
            let searchResults = {
                currentPage: page,
                results: [],
            };
            let { data } = await axios_1.default.request({
                method: 'get',
                url: `${this.baseUrl}anime.php?q=${query}&cat=anime&show=${50 * page - 1}`,
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                },
            });
            let $ = (0, cheerio_1.load)(data);
            let pages = $('.normal_header').find('span').children();
            let maxPage = parseInt(pages.last().text());
            let hasNextPage = page < maxPage;
            searchResults.hasNextPage = hasNextPage;
            $('tr').each(function (i, item) {
                var _a;
                let id = (_a = $(this).find('.hoverinfo_trigger').attr('href')) === null || _a === void 0 ? void 0 : _a.split('anime/')[1].split('/')[0];
                let title = $(this).find('strong').text();
                let description = $(this).find('.pt4').text().replace('...read more.', '...');
                let type = $(this).children().eq(2).text().trim();
                let episodeCount = $(this).children().eq(3).text().trim();
                let score = (parseFloat($(this).children().eq(4).text()) * 10).toFixed(0);
                let imageTmp = $(this).children().first().find('img').attr('data-src');
                let imageUrl = `https://cdn.myanimelist.net/images/anime/${imageTmp === null || imageTmp === void 0 ? void 0 : imageTmp.split('anime/')[1]}`;
                if (title != '') {
                    searchResults.results.push({
                        id: id !== null && id !== void 0 ? id : '',
                        title: title,
                        image: imageUrl,
                        rating: parseInt(score),
                        description: description,
                        totalEpisodes: parseInt(episodeCount),
                        type: type == 'TV'
                            ? models_1.MediaFormat.TV
                            : type == 'TV_SHORT'
                                ? models_1.MediaFormat.TV_SHORT
                                : type == 'MOVIE'
                                    ? models_1.MediaFormat.MOVIE
                                    : type == 'SPECIAL'
                                        ? models_1.MediaFormat.SPECIAL
                                        : type == 'OVA'
                                            ? models_1.MediaFormat.OVA
                                            : type == 'ONA'
                                                ? models_1.MediaFormat.ONA
                                                : type == 'MUSIC'
                                                    ? models_1.MediaFormat.MUSIC
                                                    : type == 'MANGA'
                                                        ? models_1.MediaFormat.MANGA
                                                        : type == 'NOVEL'
                                                            ? models_1.MediaFormat.NOVEL
                                                            : type == 'ONE_SHOT'
                                                                ? models_1.MediaFormat.ONE_SHOT
                                                                : undefined,
                    });
                }
            });
            return searchResults;
        };
        this.fetchMalInfoById = async (id) => {
            var _a;
            const animeInfo = {
                id: id,
                title: '',
            };
            let { data } = await axios_1.default.request({
                method: 'get',
                url: `${this.baseUrl}anime/${id}`,
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                },
            });
            let $ = (0, cheerio_1.load)(data);
            let episodes = [];
            let desc = $('[itemprop="description"]').first().text();
            let imageElem = $('[itemprop="image"]').first();
            let image = imageElem.attr('src') || imageElem.attr('data-image') || imageElem.attr('data-src');
            let genres = [];
            let genreDOM = $('[itemprop="genre"]').get();
            genreDOM.forEach(elem => {
                let genreText = $(elem).text();
                genres.push(genreText);
            });
            animeInfo.genres = genres;
            animeInfo.image = image;
            animeInfo.description = desc;
            animeInfo.title = (_a = $('.title-name')) === null || _a === void 0 ? void 0 : _a.text();
            animeInfo.studios = [];
            animeInfo.episodes = episodes;
            let teaserDOM = $('.video-promotion > a');
            if (teaserDOM.length > 0) {
                let teaserURL = $(teaserDOM).attr('href');
                let style = $(teaserDOM).attr('style');
                if (teaserURL) {
                    animeInfo.trailer = {
                        id: substringAfter(teaserURL, 'embed/').split('?')[0],
                        site: 'https://youtube.com/watch?v=',
                        thumbnail: style ? substringBefore(substringAfter(style, "url('"), "'") : '',
                    };
                }
            }
            let description = $('.spaceit_pad').get();
            description.forEach(elem => {
                var _a;
                let text = $(elem).text().toLowerCase().trim();
                let key = text.split(':')[0];
                let value = substringAfter(text, `${key}:`).trim();
                switch (key) {
                    case 'status':
                        animeInfo.status = this.malStatusToMediaStatus(value);
                        break;
                    case 'episodes':
                        animeInfo.totalEpisodes = parseInt(value);
                        if (isNaN(animeInfo.totalEpisodes)) {
                            animeInfo.totalEpisodes = 0;
                        }
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
                        animeInfo.synonyms = animeInfo.synonyms.map(x => {
                            return x.trim();
                        });
                        break;
                    case 'studios':
                        for (let studio of $(elem).find('a')) {
                            (_a = animeInfo.studios) === null || _a === void 0 ? void 0 : _a.push($(studio).text());
                        }
                        break;
                    case 'rating':
                        animeInfo.ageRating = value;
                }
            });
            // Only works on certain animes, so it is unreliable
            let videoLink = $('.mt4.ar a').attr('href');
            if (videoLink) {
                await this.populateEpisodeList(episodes, videoLink);
            }
            return animeInfo;
        };
    }
    fetchAnimeInfo(animeId, ...args) {
        throw new Error('Method not implemented.');
    }
    fetchEpisodeSources(episodeId, ...args) {
        throw new Error('Method not implemented.');
    }
    fetchEpisodeServers(episodeId) {
        throw new Error('Method not implemented.');
    }
    malStatusToMediaStatus(status) {
        if (status == 'currently airing') {
            return models_1.MediaStatus.ONGOING;
        }
        else if (status == 'finished airing') {
            return models_1.MediaStatus.COMPLETED;
        }
        else if (status == 'not yet aired') {
            return models_1.MediaStatus.NOT_YET_AIRED;
        }
        return models_1.MediaStatus.UNKNOWN;
    }
    async populateEpisodeList(episodes, url, count = 1) {
        try {
            let { data } = await axios_1.default.request({
                method: 'get',
                url: `${url}?p=${count}`,
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                },
            });
            let hasEpisodes = false;
            let $ = (0, cheerio_1.load)(data);
            for (let elem of $('.video-list').toArray()) {
                let href = $(elem).attr('href');
                let image = $(elem).find('img').attr('data-src');
                let titleDOM = $(elem).find('.episode-title');
                let title = titleDOM === null || titleDOM === void 0 ? void 0 : titleDOM.text();
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
            if (hasEpisodes) {
                await this.populateEpisodeList(episodes, url, ++count);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.default = Myanimelist;
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
//# sourceMappingURL=mal.js.map