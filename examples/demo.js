"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var fs = require("fs/promises");
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var animeData, gogoanime, count, _a, _b, _c, _i, animeTitle, searchValue, animeInfoFile, err_1, res, episodes, episodePromises, episodeData;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                animeData = require('./gogoanime.json');
                gogoanime = new __1.ANIME.Gogoanime();
                count = 0;
                _a = animeData;
                _b = [];
                for (_c in _a)
                    _b.push(_c);
                _i = 0;
                _d.label = 1;
            case 1:
                if (!(_i < _b.length)) return [3 /*break*/, 9];
                _c = _b[_i];
                if (!(_c in _a)) return [3 /*break*/, 8];
                animeTitle = _c;
                count++;
                console.log(count);
                if (!animeData.hasOwnProperty(animeTitle)) return [3 /*break*/, 8];
                searchValue = animeData[animeTitle];
                animeInfoFile = "gogoanime/".concat(searchValue, ".json");
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 8]);
                // Check if the file already exists
                return [4 /*yield*/, fs.access(animeInfoFile)];
            case 3:
                // Check if the file already exists
                _d.sent();
                // If the file exists, skip fetching and saving data
                console.log("File for ".concat(animeTitle, " already exists. Skipping."));
                return [3 /*break*/, 8];
            case 4:
                err_1 = _d.sent();
                return [4 /*yield*/, gogoanime.fetchAnimeInfo(searchValue)];
            case 5:
                res = _d.sent();
                episodes = res.episodes || [];
                episodePromises = episodes.map(function (episode) { return __awaiter(void 0, void 0, void 0, function () {
                    var episodeURL, servers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                episodeURL = episode.url ? episode.url.split('/')[4] : '';
                                if (!episodeURL) return [3 /*break*/, 2];
                                return [4 /*yield*/, gogoanime.fetchEpisodeServers(episodeURL)];
                            case 1:
                                servers = _a.sent();
                                return [2 /*return*/, servers];
                            case 2: return [2 /*return*/, []];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(episodePromises)];
            case 6:
                episodeData = _d.sent();
                // Store anime information in a JSON file with the anime title
                return [4 /*yield*/, fs.writeFile(animeInfoFile, JSON.stringify(episodeData, null, 2))];
            case 7:
                // Store anime information in a JSON file with the anime title
                _d.sent();
                console.log("Saved anime info for ".concat(animeTitle, " in ").concat(animeInfoFile));
                return [3 /*break*/, 8];
            case 8:
                _i++;
                return [3 /*break*/, 1];
            case 9: return [2 /*return*/];
        }
    });
}); };
main();
