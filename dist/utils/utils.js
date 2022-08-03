"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kitsuSearchQuery = exports.anilistMediaDetailQuery = exports.anilistSearchQuery = exports.capitalizeFirstLetter = exports.range = exports.genElement = exports.formatTitle = exports.floorID = exports.splitAuthor = exports.USER_AGENT = void 0;
const cheerio_1 = require("cheerio");
exports.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
const splitAuthor = (authors) => {
    const res = [];
    let eater = '';
    for (let i = 0; i < authors.length; i++) {
        if (authors[i] == ' ' && (authors[i - 1] == ',' || authors[i - 1] == ';')) {
            continue;
        }
        if (authors[i] == ',' || authors[i] == ';') {
            res.push(eater.trim());
            eater = '';
            continue;
        }
        eater += authors[i];
    }
    res.push(eater);
    return res;
};
exports.splitAuthor = splitAuthor;
const floorID = (id) => {
    let imp = '';
    for (let i = 0; i < (id === null || id === void 0 ? void 0 : id.length) - 3; i++) {
        imp += id[i];
    }
    const idV = parseInt(imp);
    return idV * 1000;
};
exports.floorID = floorID;
const formatTitle = (title) => {
    const result = title.replace(/[0-9]/g, '');
    return result.trim();
};
exports.formatTitle = formatTitle;
const genElement = (s, e) => {
    if (s == '')
        return;
    const $ = (0, cheerio_1.load)(e);
    let i = 0;
    let str = '';
    let el = $();
    for (; i < s.length; i++) {
        if (s[i] == ' ') {
            el = $(str);
            str = '';
            i++;
            break;
        }
        str += s[i];
    }
    for (; i < s.length; i++) {
        if (s[i] == ' ') {
            el = $(el).children(str);
            str = '';
            continue;
        }
        str += s[i];
    }
    el = $(el).children(str);
    return el;
};
exports.genElement = genElement;
const range = ({ from = 0, to = 0, step = 1, length = Math.ceil((to - from) / step) }) => Array.from({ length }, (_, i) => from + i * step);
exports.range = range;
const capitalizeFirstLetter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const anilistSearchQuery = (query, page, perPage) => `query ($page: Int = ${page}, $id: Int, $type: MediaType = ANIME, $search: String = "${query}", $isAdult: Boolean = false, $size: Int = ${perPage}) { Page(page: $page, perPage: $size) { pageInfo { total perPage currentPage lastPage hasNextPage } media(id: $id, type: $type, search: $search, isAdult: $isAdult) { id idMal status(version: 2) title { userPreferred romaji english native } bannerImage coverImage{ extraLarge large medium color } episodes meanScore season seasonYear averageScore nextAiringEpisode { airingAt timeUntilAiring episode }  } } }`;
exports.anilistSearchQuery = anilistSearchQuery;
const anilistMediaDetailQuery = (id) => `query ($id: Int = ${id}) { Media(id: $id) { id idMal title { userPreferred english native romaji } coverImage { extraLarge large color } startDate { year month day } endDate { year month day } bannerImage season seasonYear description type format status(version: 2) episodes duration chapters volumes trailer { id site thumbnail } genres source averageScore popularity meanScore nextAiringEpisode { airingAt timeUntilAiring episode } characters(sort: ROLE) { edges { role node { id name { first middle last full native userPreferred } image { large medium } } } } recommendations { edges { node { id mediaRecommendation { id idMal title { romaji english native userPreferred } status episodes coverImage { extraLarge large medium color } bannerImage meanScore nextAiringEpisode { episode timeUntilAiring airingAt } } } } } relations { edges { id node { id idMal status coverImage { extraLarge large medium color } bannerImage title { romaji english native userPreferred } episodes nextAiringEpisode { airingAt timeUntilAiring episode } meanScore } } } streamingEpisodes { title thumbnail url } studios(isMain: true) { edges { isMain node { id name } } } } }`;
exports.anilistMediaDetailQuery = anilistMediaDetailQuery;
const kitsuSearchQuery = (query) => `query{searchAnimeByTitle(first:5, title:"${query}"){ nodes {id season startDate titles { localized } episodes(first: 2000){ nodes { number titles { canonical } description thumbnail { original { url } } } } } } }`;
exports.kitsuSearchQuery = kitsuSearchQuery;
//# sourceMappingURL=utils.js.map