"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubOrSub = exports.AnimeStatus = exports.StreamingServers = void 0;
var StreamingServers;
(function (StreamingServers) {
    StreamingServers["GogoCDN"] = "gogocdn";
    StreamingServers["StreamSB"] = "streamsb";
    StreamingServers["Doodstream"] = "doodstream";
    StreamingServers["Mp4Upload"] = "mp4upload";
})(StreamingServers = exports.StreamingServers || (exports.StreamingServers = {}));
var AnimeStatus;
(function (AnimeStatus) {
    AnimeStatus["ONGOING"] = "Ongoing";
    AnimeStatus["COMPLETED"] = "Completed";
    AnimeStatus["HIATUS"] = "Hiatus";
    AnimeStatus["CANCELLED"] = "Cancelled";
    AnimeStatus["NOT_YET_AIRED"] = "Not yet aired";
    AnimeStatus["UNKNOWN"] = "Unknown";
})(AnimeStatus = exports.AnimeStatus || (exports.AnimeStatus = {}));
var SubOrSub;
(function (SubOrSub) {
    SubOrSub["SUB"] = "sub";
    SubOrSub["DUB"] = "dub";
})(SubOrSub = exports.SubOrSub || (exports.SubOrSub = {}));
//# sourceMappingURL=types.js.map