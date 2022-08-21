"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Genres = exports.TvType = exports.SubOrSub = exports.MediaStatus = exports.StreamingServers = void 0;
var StreamingServers;
(function (StreamingServers) {
    StreamingServers["GogoCDN"] = "gogocdn";
    StreamingServers["StreamSB"] = "streamsb";
    StreamingServers["MixDrop"] = "mixdrop";
    StreamingServers["UpCloud"] = "upcloud";
    StreamingServers["VidCloud"] = "vidcloud";
    StreamingServers["StreamTape"] = "streamtape";
    StreamingServers["VizCloud"] = "vizcloud";
    StreamingServers["MyCloud"] = "mycloud";
    StreamingServers["Filemoon"] = "filemoon";
    StreamingServers["VidStreaming"] = "vidstreaming";
    StreamingServers["AsianLoad"] = "asianload";
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
var Genres;
(function (Genres) {
    Genres["ACTION"] = "Action";
    Genres["ADVENTURE"] = "Adventure";
    Genres["CARS"] = "Cars";
    Genres["COMEDY"] = "Comedy";
    Genres["DRAMA"] = "Drama";
    Genres["ECCHI"] = "Ecchi";
    Genres["FANTASY"] = "Fantasy";
    Genres["HORROR"] = "Horror";
    Genres["MAHOU_SHOUJO"] = "Mahou Shoujo";
    Genres["MECHA"] = "Mecha";
    Genres["MUSIC"] = "Music";
    Genres["MYSTERY"] = "Mystery";
    Genres["PSYCHOLOGICAL"] = "Psychological";
    Genres["ROMANCE"] = "Romance";
    Genres["SCI_FI"] = "Sci-Fi";
    Genres["SLICE_OF_LIFE"] = "Slice of Life";
    Genres["SPORTS"] = "Sports";
    Genres["SUPERNATURAL"] = "Supernatural";
    Genres["THRILLER"] = "Thriller";
})(Genres = exports.Genres || (exports.Genres = {}));
//# sourceMappingURL=types.js.map