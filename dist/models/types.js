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
    /**
     * To use rapidcloud, you need to setup web socket connection with rapidcloud.\
     * connect the web socket server to `wss://ws1.rapid-cloud.ru/socket.io/?EIO=4&transport=websocket`. then
     * set a **message listener**, and inside the message listener, if you recieve a message equals to "2" send a "3".
     * when the video is ready to play. send a "3".
     * when the video stops playing close the web socket connection with the code `4969`.
     */
    StreamingServers["StreamTape"] = "streamtape";
    StreamingServers["VizCloud"] = "vizcloud";
    // same as vizcloud
    StreamingServers["MyCloud"] = "mycloud";
    StreamingServers["Filemoon"] = "filemoon";
    StreamingServers["VidStreaming"] = "vidstreaming";
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
    Genres["CRIME"] = "Crime";
    Genres["dementia"] = "Dementia";
    Genres["DEMONS"] = "Demons";
    Genres["DRAMA"] = "Drama";
    Genres["ECCHI"] = "Ecchi";
    Genres["FAMILY"] = "Family";
    Genres["FANTASY"] = "Fantasy";
    Genres["GAME"] = "Game";
    Genres["GOURMET"] = "Gourmet";
    Genres["HAREM"] = "Harem";
    Genres["HISTORICAL"] = "Historical";
    Genres["HORROR"] = "Horror";
    Genres["JOSEI"] = "Josei";
    Genres["KIDS"] = "Kids";
    Genres["MAGIC"] = "Magic";
    Genres["MARTIAL_ARTS"] = "Martial-Arts";
    Genres["MECHA"] = "Mecha";
    Genres["MILITARY"] = "Military";
    Genres["MUSIC"] = "Music";
    Genres["MYSTERY"] = "Mystery";
    Genres["PARODY"] = "Parody";
    Genres["POLICE"] = "Police";
    Genres["PSYCHOLOGICAL"] = "Psychological";
    Genres["ROMANCE"] = "Romance";
    Genres["SAMURAI"] = "Samurai";
    Genres["SCHOOL"] = "School";
    Genres["SCI_FI"] = "Sci-Fi";
    Genres["SEINEN"] = "Seinen";
    Genres["SHOUJO"] = "Shoujo";
    Genres["SHOUJO_AI"] = "Shoujo-Ai";
    Genres["SHOUNEN"] = "Shounen";
    Genres["SHOUNEN_AI"] = "Shounen-Ai";
    Genres["SLICE_OF_LIFE"] = "Slice-Of-Life";
    Genres["SPACE"] = "Space";
    Genres["SPORTS"] = "Sports";
    Genres["SUPER_POWER"] = "Super-Power";
    Genres["SUPERNATURAL"] = "Supernatural";
    Genres["SUSPENSE"] = "Suspense";
    Genres["THRILLER"] = "Thriller";
    Genres["VAMPIRE"] = "Vampire";
    Genres["YAOI"] = "Yaoi";
    Genres["YURI"] = "Yuri";
    Genres["ISEKAI"] = "Isekai";
})(Genres = exports.Genres || (exports.Genres = {}));
//# sourceMappingURL=types.js.map