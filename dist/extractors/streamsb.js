"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const utils_1 = require("../utils");
class StreamSB extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'streamsb';
        this.sources = [];
        this.host = 'https://streamsss.net/sources50';
        // TODO: update host2
        this.host2 = 'https://watchsb.com/sources50';
        this.PAYLOAD = (hex) => `566d337678566f743674494a7c7c${hex}7c7c346b6767586d6934774855537c7c73747265616d7362/6565417268755339773461447c7c346133383438333436313335376136323337373433383634376337633465366534393338373136643732373736343735373237613763376334363733353737303533366236333463353333363534366137633763373337343732363536313664373336327c7c6b586c3163614468645a47617c7c73747265616d7362`;
        this.extract = async (videoUrl, isAlt = false) => {
            let headers = {
                watchsb: 'sbstream',
                'User-Agent': utils_1.USER_AGENT,
                Referer: videoUrl.href,
            };
            let id = videoUrl.href.split('/e/').pop();
            if (id === null || id === void 0 ? void 0 : id.includes('html'))
                id = id.split('.html')[0];
            const bytes = new TextEncoder().encode(id);
            const res = await this.client
                .get(`${isAlt ? this.host2 : this.host}/${this.PAYLOAD(Buffer.from(bytes).toString('hex'))}`, {
                headers,
            })
                .catch(() => null);
            if (!(res === null || res === void 0 ? void 0 : res.data.stream_data))
                throw new Error('No source found. Try a different server.');
            headers = {
                'User-Agent': utils_1.USER_AGENT,
                Referer: videoUrl.href.split('e/')[0],
            };
            const m3u8Urls = await this.client.get(res.data.stream_data.file, {
                headers,
            });
            const videoList = m3u8Urls.data.split('#EXT-X-STREAM-INF:');
            for (const video of videoList !== null && videoList !== void 0 ? videoList : []) {
                if (!video.includes('m3u8'))
                    continue;
                const url = video.split('\n')[1];
                const quality = video.split('RESOLUTION=')[1].split(',')[0].split('x')[1];
                this.sources.push({
                    url: url,
                    quality: `${quality}p`,
                    isM3U8: true,
                });
            }
            this.sources.push({
                quality: 'auto',
                url: res.data.stream_data.file,
                isM3U8: res.data.stream_data.file.includes('.m3u8'),
            });
            return this.sources;
        };
        this.addSources = (source) => {
            this.sources.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
            });
        };
    }
}
exports.default = StreamSB;
//# sourceMappingURL=streamsb.js.map