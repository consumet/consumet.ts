"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const crypto = __importStar(require("crypto"));
class KickAssAnime extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'KickAssAnime';
        this.baseUrl = 'https://kickass-anime.ru';
        this.logo = 'https://kickass-anime.ru/img/logo.png';
        this.classPath = 'ANIME.KickAssAnime';
        /**
         * Search for anime
         * @param query Search query string
         * @param page Page number (default: 1)
         * @returns Promise<ISearch<IAnimeResult>>
         */
        this.search = async (query, page = 1) => {
            try {
                const searchUrl = `${this.baseUrl}/api/fsearch`;
                const headers = this.getHeaders(this.baseUrl, 'search');
                const response = await this.client.post(searchUrl, {
                    page: page,
                    query: query,
                }, {
                    headers,
                    timeout: 10000,
                });
                const searchResults = response.data.result.map((anime) => {
                    var _a, _b;
                    return ({
                        id: anime.slug,
                        title: anime.title,
                        url: anime.watch_uri ? `${this.baseUrl}${anime.watch_uri}` : `${this.baseUrl}/${anime.slug}`,
                        image: anime.poster
                            ? `${this.baseUrl}/image/${anime.poster.hq}.${anime.poster.formats[0]}`
                            : undefined,
                        releaseDate: (_a = anime.year) === null || _a === void 0 ? void 0 : _a.toString(),
                        subOrDub: ((_b = anime.locales) === null || _b === void 0 ? void 0 : _b.includes('en-US')) ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB,
                        status: this.mapStatus(anime.status),
                        otherName: anime.title_en,
                        totalEpisodes: anime.episode_count,
                    });
                });
                return {
                    currentPage: page,
                    hasNextPage: page < response.data.maxPage,
                    totalPages: response.data.maxPage,
                    results: searchResults,
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch detailed anime information
         * @param id Anime slug/id (e.g., 'naruto-f3cf')
         * @returns Promise<IAnimeInfo>
         */
        this.fetchAnimeInfo = async (id) => {
            var _a, _b, _c;
            try {
                const headers = this.getHeaders(this.baseUrl);
                // Get anime info
                const infoResponse = await this.client.get(`${this.baseUrl}/api/show/${id}`, {
                    headers,
                    timeout: 10000,
                });
                const animeData = infoResponse.data;
                // Get episodes
                const episodesResponse = await this.client.get(`${this.baseUrl}/api/show/${id}/episodes?page=1&lang=ja-JP`, {
                    headers,
                    timeout: 10000,
                });
                const episodes = episodesResponse.data.result.map((ep) => ({
                    id: `${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
                    title: ep.title,
                    number: Math.floor(ep.episode_number),
                    image: ep.thumbnail
                        ? `${this.baseUrl}/image/${ep.thumbnail.hq}.${ep.thumbnail.formats[0]}`
                        : undefined,
                    url: `${this.baseUrl}/api/show/${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
                }));
                return {
                    id: animeData.slug,
                    title: animeData.title_en || animeData.title,
                    url: `${this.baseUrl}/${animeData.slug}`,
                    genres: animeData.genres || [],
                    totalEpisodes: episodes.length,
                    image: animeData.poster
                        ? `${this.baseUrl}/image/${animeData.poster.hq}.${animeData.poster.formats[0]}`
                        : undefined,
                    cover: animeData.banner
                        ? `${this.baseUrl}/image/${animeData.banner.hq}.${animeData.banner.formats[0]}`
                        : undefined,
                    description: animeData.synopsis,
                    episodes: episodes,
                    subOrDub: ((_a = animeData.locales) === null || _a === void 0 ? void 0 : _a.includes('en-US')) ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB,
                    type: (_b = animeData.type) === null || _b === void 0 ? void 0 : _b.toUpperCase(),
                    status: this.mapStatus(animeData.status),
                    otherName: animeData.title_original,
                    releaseDate: (_c = animeData.year) === null || _c === void 0 ? void 0 : _c.toString(),
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch episode video sources and subtitles
         * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
         * @param server Optional server name to filter (e.g., StreamingServers.VidStreaming, StreamingServers.BirdStream)
         * @returns Promise<ISource>
         */
        this.fetchEpisodeSources = async (episodeId, server) => {
            try {
                const headers = this.getHeaders(this.baseUrl);
                const episodeUrl = `${this.baseUrl}/api/show/${episodeId}`;
                const response = await this.client.get(episodeUrl, {
                    headers,
                    timeout: 10000,
                });
                const servers = response.data.servers || [];
                const sources = [];
                const subtitles = [];
                // Filter servers if specific server requested
                const targetServers = server
                    ? servers.filter((s) => s.name.toLowerCase().includes(server.toLowerCase()))
                    : servers;
                if (server && targetServers.length === 0) {
                    throw new Error(`Server "${server}" not found`);
                }
                for (const serverData of targetServers) {
                    try {
                        const serverSources = await this.extractFromServer(serverData.src, serverData.name, headers);
                        sources.push(...serverSources.sources);
                        subtitles.push(...serverSources.subtitles);
                    }
                    catch (error) {
                        // Silent fail, continue with other servers
                    }
                }
                return {
                    sources: sources,
                    subtitles: subtitles,
                    headers: {
                        Referer: episodeUrl,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
                    },
                };
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
        /**
         * Fetch available servers for an episode
         * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
         * @returns Promise<IEpisodeServer[]>
         */
        this.fetchEpisodeServers = async (episodeId) => {
            try {
                const headers = this.getHeaders(this.baseUrl);
                const episodeUrl = `${this.baseUrl}/api/show/${episodeId}`;
                const response = await this.client.get(episodeUrl, {
                    headers,
                    timeout: 10000,
                });
                const servers = response.data.servers || [];
                return servers.map((server) => ({
                    name: server.name,
                    url: server.src,
                }));
            }
            catch (err) {
                throw new Error(err.message);
            }
        };
    }
    /**
     * Get HTTP headers for requests
     * @param host The host URL
     * @param endpoint The endpoint type (optional)
     * @returns Object containing HTTP headers
     */
    getHeaders(host, endpoint = '') {
        const baseHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            Accept: 'application/json, text/plain, */*',
            Host: new URL(host).host,
        };
        if (endpoint === 'search') {
            return {
                ...baseHeaders,
                'Content-Type': 'application/json',
                Referer: `${host}/anime`,
            };
        }
        return baseHeaders;
    }
    /**
     * Map anime status string to MediaStatus enum
     * @param status The status string from API
     * @returns MediaStatus enum value
     */
    mapStatus(status) {
        switch (status) {
            case 'finished_airing':
                return models_1.MediaStatus.COMPLETED;
            case 'currently_airing':
                return models_1.MediaStatus.ONGOING;
            case 'not_yet_aired':
                return models_1.MediaStatus.NOT_YET_AIRED;
            default:
                return models_1.MediaStatus.UNKNOWN;
        }
    }
    // Decryption shi is here
    async extractFromServer(url, serverName, requestHeaders) {
        const sources = [];
        const subtitles = [];
        // Check if it's a cat-player URL (new format)
        if (url.includes('/cat-player/')) {
            return await this.extractCatBirdStream(url, serverName, requestHeaders);
        }
        // Legacy vidstreaming URLs
        if (serverName.includes(models_1.StreamingServers.VidStreaming) ||
            serverName.includes(models_1.StreamingServers.DuckStream)) {
            return await this.extractEncryptedServer(url, serverName, requestHeaders);
        }
        if (serverName.includes(models_1.StreamingServers.BirdStream) || serverName.includes('CatStream')) {
            return await this.extractCatBirdStream(url, serverName, requestHeaders);
        }
        // Fallback for other servers
        sources.push({
            url: url,
            quality: '1080p',
            isM3U8: true,
        });
        return { sources, subtitles };
    }
    async extractCatBirdStream(url, serverName, requestHeaders) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            Referer: 'https://kaa.mx/',
            DNT: '1',
            'Sec-GPC': '1',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            Host: new URL(url).host,
        };
        try {
            const response = await this.client.get(url, { headers, timeout: 15000 });
            const html = response.data;
            // Extract props JSON from HTML
            const propsMatch = html.match(/props="([^"]+)"/);
            if (!propsMatch)
                throw new Error('Could not find props in HTML');
            // Decode HTML entities
            const encodedJson = propsMatch[1];
            const unescapedJson = this.decodeHtmlEntities(encodedJson);
            const jsonData = JSON.parse(unescapedJson);
            const sources = [];
            const subtitles = [];
            // Extract video URL
            if (jsonData.manifest && jsonData.manifest[1]) {
                let videoUrl = jsonData.manifest[1];
                // Fix URL formatting
                if (videoUrl.startsWith('//')) {
                    videoUrl = 'https:' + videoUrl;
                }
                else if (!videoUrl.startsWith('http')) {
                    videoUrl = 'https://' + videoUrl;
                }
                // Determine quality from video data if available
                let quality = '1080p';
                if (jsonData.quality) {
                    quality = jsonData.quality;
                }
                else if (videoUrl.includes('1080')) {
                    quality = '1080p';
                }
                else if (videoUrl.includes('720')) {
                    quality = '720p';
                }
                else if (videoUrl.includes('480')) {
                    quality = '480p';
                }
                sources.push({
                    url: videoUrl,
                    quality: quality,
                    isM3U8: videoUrl.includes('.m3u8') || jsonData.hls,
                });
                // Extract additional qualities if available
                if (jsonData.qualities && Array.isArray(jsonData.qualities)) {
                    for (const qualityData of jsonData.qualities) {
                        if (qualityData.url && qualityData.quality) {
                            let qualityUrl = qualityData.url;
                            if (qualityUrl.startsWith('//')) {
                                qualityUrl = 'https:' + qualityUrl;
                            }
                            sources.push({
                                url: qualityUrl,
                                quality: qualityData.quality,
                                isM3U8: qualityUrl.includes('.m3u8'),
                            });
                        }
                    }
                }
            }
            // Extract subtitles
            if (jsonData.subtitles && jsonData.subtitles[1]) {
                const subtitleArray = jsonData.subtitles[1];
                for (let i = 0; i < subtitleArray.length; i++) {
                    const sub = subtitleArray[i][1];
                    if (sub && sub.src && sub.src[1] && sub.name && sub.name[1]) {
                        subtitles.push({
                            url: sub.src[1],
                            lang: sub.name[1],
                        });
                    }
                }
            }
            return { sources, subtitles };
        }
        catch (error) {
            throw error;
        }
    }
    decodeHtmlEntities(text) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&#x27;': "'",
            '&#x2F;': '/',
            '&#x60;': '`',
            '&#x3D;': '=',
        };
        return text.replace(/&[#\w]+;/g, entity => {
            return entities[entity] || entity;
        });
    }
    async extractEncryptedServer(url, serverName, requestHeaders) {
        const host = new URL(url).hostname;
        const mid = serverName === 'DuckStream' ? 'mid' : 'id';
        const isBird = serverName === 'BirdStream';
        const query = new URL(url).searchParams.get(mid);
        if (!query)
            throw new Error('No query parameter found');
        // Special headers for krussdomi.com
        const specialHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            Referer: url,
            DNT: '1',
            'Sec-GPC': '1',
            Connection: 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            TE: 'trailers',
            Host: host,
            'X-Origin': 'kaa.mx',
            'x-timezone': '-330',
            'x-client-ts': Date.now().toString(),
        };
        // Get the HTML page
        const htmlResponse = await this.client.get(url, { headers: specialHeaders });
        const html = htmlResponse.data;
        // Get encryption key based on server
        const key = this.getServerKey(serverName);
        if (!key)
            throw new Error('Unknown server type');
        // Extract CID from HTML
        const cidMatch = html.match(/cid:\s*'([^']+)'/);
        if (!cidMatch)
            throw new Error('Could not find CID in HTML');
        const cidHex = cidMatch[1];
        const cidBytes = this.hexToBytes(cidHex);
        const cidString = new TextDecoder().decode(cidBytes);
        const cid = cidString.split('|');
        const timestamp = Math.floor(Date.now() / 1000) + 60;
        const route = cid[1].replace('player.php', 'source.php');
        // Build signature string exactly like your approach
        const signatureData = [
            cid[0], // IP
            specialHeaders['User-Agent'],
            route,
            query,
            timestamp,
            new TextDecoder().decode(key),
        ].join('');
        const signature = this.sha1(signatureData);
        // Build source URL
        const sourceUrl = `https://${host}${route}?${mid}=${query}&e=${timestamp}&s=${signature}`;
        // Get encrypted response
        const sourceResponse = await this.client.get(sourceUrl, {
            headers: specialHeaders,
        });
        // Parse encrypted data
        const encryptedMatch = sourceResponse.data.match(/:"([^"]+)"/);
        if (!encryptedMatch)
            throw new Error('Could not find encrypted data');
        const [encryptedData, ivHex] = encryptedMatch[1].replace(/\\/g, '').split(':');
        const iv = this.hexToBytes(ivHex);
        // Decrypt using your approach
        try {
            const decryptedData = this.decryptAES(encryptedData, new TextDecoder().decode(key), iv);
            const videoData = JSON.parse(decryptedData);
            const sources = [];
            const subtitles = [];
            // Extract video URLs with multiple Qualities if available
            const videoUrls = [];
            if (videoData.playlistUrl) {
                let cleanUrl = videoData.playlistUrl;
                // Fix double https: issue
                if (cleanUrl.startsWith('https:https://')) {
                    cleanUrl = cleanUrl.replace('https:https://', 'https://');
                }
                else if (cleanUrl.startsWith('https:////')) {
                    cleanUrl = cleanUrl.replace('https:////', 'https://');
                }
                else if (cleanUrl.startsWith('https://')) {
                    // Already correct
                }
                else if (cleanUrl.startsWith('//')) {
                    cleanUrl = 'https:' + cleanUrl;
                }
                videoUrls.push({
                    url: cleanUrl,
                    quality: videoData.quality || '1080p',
                    isM3U8: videoData.hls ? true : false,
                });
            }
            if (videoData.hls) {
                let cleanUrl = videoData.hls;
                // Fix double https: issue
                if (cleanUrl.startsWith('https:https://')) {
                    cleanUrl = cleanUrl.replace('https:https://', 'https://');
                }
                videoUrls.push({
                    url: cleanUrl,
                    quality: videoData.quality || '1080p',
                    isM3U8: true,
                });
            }
            // Extract multiple quality sources if available
            if (videoData.sources && Array.isArray(videoData.sources)) {
                for (const source of videoData.sources) {
                    if (source.file || source.url) {
                        let sourceUrl = source.file || source.url;
                        if (sourceUrl.startsWith('//')) {
                            sourceUrl = 'https:' + sourceUrl;
                        }
                        videoUrls.push({
                            url: sourceUrl,
                            quality: source.label || source.quality || 'auto',
                            isM3U8: sourceUrl.includes('.m3u8'),
                        });
                    }
                }
            }
            sources.push(...videoUrls);
            // Extract subtitles
            if (videoData.subtitles) {
                for (const sub of videoData.subtitles) {
                    let subUrl = sub.src;
                    if (subUrl.startsWith('//')) {
                        subUrl = 'https:' + subUrl;
                    }
                    else if (subUrl.startsWith('/')) {
                        subUrl = `https://${host}${subUrl}`;
                    }
                    subtitles.push({
                        url: subUrl,
                        lang: `${sub.name} (${sub.language})`,
                    });
                }
            }
            return { sources, subtitles };
        }
        catch (error) {
            throw new Error(`Failed to decrypt video data: ${error}`);
        }
    }
    /**
     * Get decryption key for specific server
     * @param serverName Name of the server
     * @returns Uint8Array key or null if not found
     */
    getServerKey(serverName) {
        switch (serverName) {
            case models_1.StreamingServers.VidStreaming:
            case 'VidStreaming':
                return new TextEncoder().encode('e13d38099bf562e8b9851a652d2043d3');
            case models_1.StreamingServers.DuckStream:
            case 'DuckStream':
                return new TextEncoder().encode('4504447b74641ad972980a6b8ffd7631');
            case models_1.StreamingServers.BirdStream:
            case 'BirdStream':
                return new TextEncoder().encode('4b14d0ff625163e3c9c7a47926484bf2');
            default:
                return null;
        }
    }
    /**
     * Convert hexadecimal string to Uint8Array
     * @param hex Hexadecimal string
     * @returns Uint8Array representation
     */
    hexToBytes(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }
    sha1(str) {
        return crypto.createHash('sha1').update(str).digest('hex');
    }
    decryptAES(encryptedData, key, iv) {
        try {
            const keyBuffer = Buffer.from(key, 'utf8');
            const ivBuffer = Buffer.from(iv);
            const encryptedBuffer = Buffer.from(encryptedData, 'base64');
            const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
            decipher.setAutoPadding(true);
            let decrypted = decipher.update(encryptedBuffer);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString('utf8');
        }
        catch (error) {
            throw new Error(`AES decryption failed: ${error}`);
        }
    }
}
exports.default = KickAssAnime;
//# sourceMappingURL=kickassanime.js.map