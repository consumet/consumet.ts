"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const models_1 = require("../models");
class BilibiliExtractor extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'Bilibili';
        this.sources = [];
        this.toDash = (data) => {
            const videos = data.video
                .filter((video) => video.video_resource.url)
                .map((video) => video.video_resource);
            const audios = data.audio_resource;
            const duration = (0, utils_1.convertDuration)(data.duration);
            const dash = `<?xml version="1.0"?>
<MPD xmlns="urn:mpeg💨schema:mpd:2011" profiles="urn:mpeg💨profile:isoff-on-demand:2011" minBufferTime="PT1M" type="static" mediaPresentationDuration="${duration}">
    <Period duration="${duration}">
        <AdaptationSet id="1" group="1" par="16:9" segmentAlignment="true" subsegmentAlignment="true" subsegmentStartsWithSAP="1" maxWidth="${videos[0].width}" maxHeight="${videos[0].height}" maxFrameRate="${videos[0].frame_rate}" startWithSAP="1">
            ${videos.map((video, index) => this.videoSegment(video, index)).join()}
        </AdaptationSet>
        <AdaptationSet id="2" group="2" subsegmentAlignment="true" subsegmentStartsWithSAP="1" segmentAlignment="true" startWithSAP="1">
            ${audios.map((audio, index) => this.audioSegment(audio, videos.length + index)).join()}
        </AdaptationSet>
    </Period>
</MPD>`;
            return dash;
        };
        this.videoSegment = (video, index = 0) => {
            const allUrls = [video.url, video.backup_url[0]];
            const videoUrl = allUrls.find(url => url.includes('akamaized.net'));
            return `
            <Representation id="${index}" mimeType="${video.mime_type}" codecs="${video.codecs}" width="${video.width}" height="${video.height}" frameRate="${video.frame_rate}" sar="${video.sar}" bandwidth="${video.bandwidth}">
                <BaseURL>${videoUrl.replace(/&/g, '&amp;')}</BaseURL>
                <SegmentBase indexRangeExact="true" indexRange="${video.segment_base.index_range}">
                    <Initialization range="${video.segment_base.range}"/>
                </SegmentBase>
            </Representation>
            `;
        };
        this.audioSegment = (audio, index = 0) => {
            const allUrls = [audio.url, audio.backup_url[0]];
            const audioUrl = allUrls.find(url => url.includes('akamaized.net'));
            return `
            <Representation id="${index}" mimeType="${audio.mime_type}" codecs="${audio.codecs}" bandwidth="${audio.bandwidth}">
                <BaseURL>${audioUrl.replace(/&/g, '&amp;')}</BaseURL>
                <SegmentBase indexRangeExact="true" indexRange="${audio.segment_base.index_range}">
                    <Initialization range="${audio.segment_base.range}"/>
                </SegmentBase>
            </Representation>
            `;
        };
    }
    async extract(episodeId) {
        this.sources.push({
            url: `https://api.consumet.org/utils/bilibili/playurl?episode_id=${episodeId}`,
            isM3U8: false,
            isDASH: true,
        });
        return {
            sources: this.sources,
        };
    }
}
exports.default = BilibiliExtractor;
//# sourceMappingURL=bilibili.js.map