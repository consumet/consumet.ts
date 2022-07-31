"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TvType = exports.SubOrSub = exports.MediaStatus = exports.StreamingServers = void 0;
var StreamingServers;
(function (StreamingServers) {
    StreamingServers["GogoCDN"] = "gogocdn";
    StreamingServers["StreamSB"] = "streamsb";
    StreamingServers["MixDrop"] = "mixdrop";
    StreamingServers["UpCloud"] = "upcloud";
    StreamingServers["VidCloud"] = "vidcloud";
    /**
     * To use rapidcloud, you need to setup web socket connection with rapidcloud.\
     * connect the web socket server to `wss://ws1.rapid-cloud.ru/socket.io/?EIO=4&transport=websocket`. then
     * set a **message listener**, and inside the message listener, if you recieve a message equals to "2" send a "3".
     * when the video is ready to play. send a "3".
     * when the video stops playing close the web socket connection with the code `4969`.
     */
    StreamingServers["RapidCloud"] = "rapidcloud";
    StreamingServers["StreamTape"] = "streamtape";
    StreamingServers["VizCloud"] = "vizcloud";
    // same as vizcloud
    StreamingServers["MyCloud"] = "mycloud";
})(StreamingServers = exports.StreamingServers || (exports.StreamingServers = {}));
var MediaStatus;
(function (MediaStatus) {
    MediaStatus["ONGOING"] = "Ongoing";
    MediaStatus["COMPLETED"] = "Completed";
    MediaStatus["HIATUS"] = "Hiatus";
    MediaStatus["CANCELLED"] = "Cancelled";
    MediaStatus["NOT_YET_AIRED"] = "Not yet aired";
    MediaStatus["UNKNOWN"] = "Unknown";
})(MediaStatus = exports.MediaStatus || (exports.MediaStatus = {}));
var SubOrSub;
(function (SubOrSub) {
    SubOrSub["SUB"] = "sub";
    SubOrSub["DUB"] = "dub";
    SubOrSub["BOTH"] = "both";
})(SubOrSub = exports.SubOrSub || (exports.SubOrSub = {}));
/**
 * Used **only** for movie/tvshow providers
 */
var TvType;
(function (TvType) {
    TvType["TVSERIES"] = "TV Series";
    TvType["MOVIE"] = "Movie";
    TvType["ANIME"] = "Anime";
})(TvType = exports.TvType || (exports.TvType = {}));
//# sourceMappingURL=types.js.map