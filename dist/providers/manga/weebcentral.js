"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
class WeebCentral extends models_1.MangaParser {
    constructor() {
        super(...arguments);
        this.name = 'WeebCentral';
        this.baseUrl = 'https://weebcentral.com';
        this.logo = 'https://weebcentral.com/static/images/brand.png';
        this.classPath = 'MANGA.WeebCentral';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            Connection: 'keep-alive',
        };
        this.search = async (query, page = 1) => {
            try {
                const limit = 32;
                const offset = (page - 1) * limit;
                const { data } = await this.client.get(`${this.baseUrl}/search/data`, {
                    params: {
                        limit: limit,
                        offset: offset,
                        text: query,
                        sort: 'Best Match',
                        order: 'Descending',
                        official: 'Any',
                        anime: 'Any',
                        adult: 'Any',
                        display_mode: 'Full Display',
                    },
                    headers: {
                        ...this.headers,
                        'HX-Request': 'true',
                        'HX-Current-URL': `${this.baseUrl}/search?text=${encodeURIComponent(query)}&sort=Best+Match&order=Descending&official=Any&anime=Any&adult=Any&display_mode=Full+Display`,
                    },
                    decompress: true,
                });
                const $ = (0, cheerio_1.load)(data);
                const results = $('article.bg-base-300')
                    .map((i, el) => {
                    const linkElement = $(el).find('section a').first();
                    const href = linkElement.attr('href');
                    const id = (href === null || href === void 0 ? void 0 : href.split('/series/')[1]) || '';
                    const title = $(el).find('section.hidden.lg\\:block .tooltip a').text().trim() ||
                        $(el).find('section a .text-ellipsis').text().trim();
                    const image = $(el).find('picture source').first().attr('srcset') || $(el).find('picture img').attr('src');
                    return {
                        id: id,
                        title: title,
                        image: image,
                    };
                })
                    .get();
                const hasNextPage = results.length === limit;
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: results,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchMangaInfo = async (mangaId) => {
            const mangaInfo = {
                id: mangaId,
                title: '',
            };
            try {
                const cleanId = mangaId.split('/')[0];
                const [mainResponse, chaptersResponse] = await Promise.all([
                    this.client.get(`${this.baseUrl}/series/${mangaId}`, {
                        headers: this.headers,
                        decompress: true,
                    }),
                    this.client.get(`${this.baseUrl}/series/${cleanId}/full-chapter-list`, {
                        headers: {
                            ...this.headers,
                            'HX-Request': 'true',
                            'HX-Target': 'chapter-list',
                            'HX-Current-URL': `${this.baseUrl}/series/${mangaId}`,
                        },
                        decompress: true,
                    }),
                ]);
                const $ = (0, cheerio_1.load)(mainResponse.data);
                const $chapters = (0, cheerio_1.load)(chaptersResponse.data);
                mangaInfo.title = $('h1.text-2xl.font-bold').first().text().trim() || $('h1').first().text().trim();
                mangaInfo.image = $('picture source').attr('srcset') || $('picture img').attr('src');
                const descriptionElement = $('strong:contains("Description")').parent().find('p');
                mangaInfo.description = descriptionElement.text().trim();
                const authorLinks = $('strong:contains("Author(s)")').parent().find('a');
                mangaInfo.authors = authorLinks.map((i, el) => $(el).text().trim()).get();
                const genreLinks = $('strong:contains("Tags(s)")').parent().find('a');
                mangaInfo.genres = genreLinks.map((i, el) => $(el).text().trim()).get();
                const releaseDateText = $('strong:contains("Released")').parent().find('span').text().trim();
                mangaInfo.releaseDate = releaseDateText;
                const statusLink = $('strong:contains("Status")').parent().find('a');
                mangaInfo.status = statusLink.text().trim().toLowerCase();
                mangaInfo.chapters = $chapters('a[href*="/chapters/"]')
                    .map((i, el) => {
                    const href = $chapters(el).attr('href');
                    const chapterId = href === null || href === void 0 ? void 0 : href.split('/chapters/')[1];
                    const chapterText = $chapters(el).find('span.grow span').first().text().trim();
                    const timeElement = $chapters(el).find('time');
                    const releaseDate = timeElement.attr('datetime');
                    return {
                        id: chapterId,
                        title: chapterText,
                        releaseDate: releaseDate,
                    };
                })
                    .get();
                return mangaInfo;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        this.fetchChapterPages = async (chapterId) => {
            try {
                const { data } = await this.client.get(`${this.baseUrl}/chapters/${chapterId}/images?is_prev=False&current_page=1&reading_style=long_strip`, {
                    headers: {
                        ...this.headers,
                        Referer: `${this.baseUrl}/chapters/${chapterId}`,
                        'HX-Request': 'true',
                        'HX-Current-URL': `${this.baseUrl}/chapters/${chapterId}`,
                    },
                    decompress: true,
                });
                const $ = (0, cheerio_1.load)(data);
                const pages = $('img')
                    .map((i, el) => {
                    const imgSrc = $(el).attr('src');
                    const altText = $(el).attr('alt') || '';
                    const pageMatch = altText.match(/Page (\d+)/);
                    const pageNumber = pageMatch ? parseInt(pageMatch[1]) : i + 1;
                    return {
                        img: imgSrc,
                        page: pageNumber,
                        headerForImage: this.baseUrl,
                    };
                })
                    .get()
                    .filter(page => page.img && !page.img.includes('broken_image.jpg')); // Filter out broken images
                return pages;
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
}
// (async () => {
//   const manga = new WeebCentral();
//   const search = await manga.search('bleach');
//   const info = await manga.fetchMangaInfo("01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom");
//   const pages = await manga.fetchChapterPages("01K8VEAEHDBSVQ6PJ3MNBDH7D7");
//   console.log(pages)
// })();
exports.default = WeebCentral;
//# sourceMappingURL=weebcentral.js.map