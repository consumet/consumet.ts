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
})(SubOrSub = exports.SubOrSub || (exports.SubOrSub = {}));
var TvType;
(function (TvType) {
    TvType["TVSERIES"] = "TV Series";
    TvType["MOVIE"] = "Movie";
    TvType["ANIME"] = "Anime";
})(TvType = exports.TvType || (exports.TvType = {}));
//# sourceMappingURL=types.js.map