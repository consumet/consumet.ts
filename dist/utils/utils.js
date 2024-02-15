"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashFromImage = exports.substringBeforeLast = exports.substringAfterLast = exports.substringBefore = exports.substringAfter = exports.compareTwoStrings = exports.convertDuration = exports.isJson = exports.getDays = exports.capitalizeFirstLetter = exports.range = exports.genElement = exports.formatTitle = exports.floorID = exports.splitAuthor = exports.days = exports.USER_AGENT = void 0;
// import sharp from 'sharp';
const cheerio_1 = require("cheerio");
exports.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
exports.days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
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
const capitalizeFirstLetter = (s) => (s === null || s === void 0 ? void 0 : s.charAt(0).toUpperCase()) + s.slice(1);
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const getDays = (day1, day2) => {
    const day1Index = exports.days.indexOf((0, exports.capitalizeFirstLetter)(day1)) - 1;
    const day2Index = exports.days.indexOf((0, exports.capitalizeFirstLetter)(day2)) - 1;
    const now = new Date();
    const day1Date = new Date();
    const day2Date = new Date();
    day1Date.setDate(now.getDate() + ((day1Index + 7 - now.getDay()) % 7));
    day2Date.setDate(now.getDate() + ((day2Index + 7 - now.getDay()) % 7));
    day1Date.setHours(0, 0, 0, 0);
    day2Date.setHours(0, 0, 0, 0);
    return [day1Date.getTime() / 1000, day2Date.getTime() / 1000];
};
exports.getDays = getDays;
const isJson = (str) => {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
};
exports.isJson = isJson;
function convertDuration(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;
    return `PT${hours}H${minutes}M${seconds}S`;
}
exports.convertDuration = convertDuration;
const compareTwoStrings = (first, second) => {
    first = first.replace(/\s+/g, '');
    second = second.replace(/\s+/g, '');
    if (first === second)
        return 1; // identical or empty
    if (first.length < 2 || second.length < 2)
        return 0; // if either is a 0-letter or 1-letter string
    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
        firstBigrams.set(bigram, count);
    }
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }
    return (2.0 * intersectionSize) / (first.length + second.length - 2);
};
exports.compareTwoStrings = compareTwoStrings;
const substringAfter = (str, toFind) => {
    const index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(index + toFind.length);
};
exports.substringAfter = substringAfter;
const substringBefore = (str, toFind) => {
    const index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(0, index);
};
exports.substringBefore = substringBefore;
const substringAfterLast = (str, toFind) => {
    const index = str.lastIndexOf(toFind);
    return index == -1 ? '' : str.substring(index + toFind.length);
};
exports.substringAfterLast = substringAfterLast;
const substringBeforeLast = (str, toFind) => {
    const index = str.lastIndexOf(toFind);
    return index == -1 ? '' : str.substring(0, index);
};
exports.substringBeforeLast = substringBeforeLast;
// const generateHash = async (url: string) => {
//   let returnedBuffer;
//   const response = await fetch(url);
//   const arrayBuffer = await response.arrayBuffer();
//   returnedBuffer = Buffer.from(arrayBuffer);
//   // const { info, data } = await sharp(returnedBuffer).ensureAlpha().raw().toBuffer({
//   //   resolveWithObject: true,
//   // });
//   return blurhash.encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
// };
const getHashFromImage = (url) => {
    if ((url === null || url === void 0 ? void 0 : url.length) === 0) {
        return '';
    }
    else {
        let hash;
        // generateHash(url).then(hashKey => (hash = hashKey));
        return 'hash';
    }
};
exports.getHashFromImage = getHashFromImage;
//# sourceMappingURL=utils.js.map