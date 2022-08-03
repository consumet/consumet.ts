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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
class VizCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VizCloud';
        this.sources = [];
        this.host = 'https://vizcloud.site';
        // lagrad :)
        this.keys = {
            cipher: 'boAIQ51VJKvU0m7Z',
            encrypt: 'm0kiUE5oC+BQuVqH7e1nZ89WbfJXjlygArwva2FdDR46NxtSpYcLMzGOh/I3TsKP',
            main: '4ls9Jl12UNhZVsFf',
            dashTable: '69 130 60 60 59 67 69 69 130 60 60 59 67 69 69 130 70 132 61 61 60 68 70 70 132 61 61 60 68 70 70 132 71 134 62 62 61 69 71 71 134 62 62 61 69 71 71 134 72 136 63 63 62 70 64 72 136 63 63 62 70 64 72 136 73 138 64 64 63 71 65 73 138 64 64 63 71 65 73 138 74 140 65 65 64 72 66 74 140 65 65 64 72 66 74 140 75 142 66 66 65 73 67 75 142 66 66 65 73 67 75 142 76 144 67 67 66 74 76 76 144 67 67 66 74 76 76 144 77 146 68 68 67 75 77 77 146 68 68 67 75 77 77 146 78 148 69 69 68 76 78 78 148 69 69 68 76 78 78 148 79 150 70 70 69 77 79 79 150 70 70 69 77 79 79 150 80 152 71 71 70 78 72 80 152 71 71 70 78 72 80 152 81 154 72 72 71 79 73 81 154 72 72 71 79 73 81 154 82 156 73 73 72 80 74 82 156 73 73 72 80 74 82 156 83 158 74 74 73 81 75 83 158 74 74 73 81 75 83 158 84 160 75 75 74 82 84 84 160 75 75 74 82 84 84 160 85 162 76 76 75 83 85 85 162 76 76 75 83 85 85 162 86 164 77 77 76 84 86 86 164 77 77 76 84 86 86 164 87 166 78 78 77 85 87 87 166 78 78 77 85 87 87 166 88 168 79 79 78 86 80 88 168 79 79 78 86 80 88 168 89 170 80 80 79 87 81 89 170 80 80 79 87 81 89 170 90 172 81 81 80 88 82 90 172 81 81 80 88 82 90 172 91 174 82 82 81 89 83 91 174 82 82 81 89 83 91 174 92 176 83 83 82 90 92 92 176 83 83 82 90 92 92 176 93 178 84 84 83 91 93 93 178 84 84 83 91 93 93 178 94 180 85 85 84 92 94 94 180 85 85 84 92 94 94 180 101 194 92 92 91 99 101 101 194 92 92 91 99 101 101 194 102 196 93 93 92 100 102 102 196 93 93 92 100 102 102 196 103 198 94 94 93 101 103 103 198 94 94 93 101 103 103 198 104 200 95 95 94 102 96 104 200 95 95 94 102 96 104 200 105 202 96 96 95 103 97 105 202 96 96 95 103 97 105 202 106 204 97 97 96 104 98 106 204 97 97 96 104 98 106 204 107 206 98 98 97 105 99 107 206 98 98 97 105 99 107 206 108 208 99 99 98 106 108 108 208 99 99 98 106 108 108 208 109 210 100 100 99 107 109 109 210 100 100 99 107 109 109 210 110 212 101 101 100 108 110 110 212 101 101 100 108 110 110 212 111 214 102 102 101 109 111 111 214 102 102 101 109 111 111 214 112 216 103 103 102 110 104 112 216 103 103 102 110 104 112 216 113 218 104 104 103 111 105 113 218 104 104 103 111 105 113 218 114 220 105 105 104 112 106 114 220 105 105 104 112 106 114 220 115 222 106 106 105 113 107 115 222 106 106 105 113 107 115 222 116 224 107 107 106 114 116 116 224 107 107 106 114 116 116 224 117 226 108 108 107 115 117 117 226 108 108 107 115 117 117 226 118 228 109 109 108 116 118 118 228 109 109 108 116 118 118 228 119 230 110 110 109 117 119 119 230 110 110 109 117 119 119 230 120 232 111 111 110 118 112 120 232 111 111 110 118 112 120 232 121 234 112 112 111 119 113 121 234 112 112 111 119 113 121 234 122 236 113 113 112 120 114 122 236 113 113 112 120 114 122 236 123 238 114 114 113 121 115 123 238 114 114 113 121 115 123 238 124 240 115 115 114 122 124 124 240 115 115 114 122 124 124 240 125 242 116 116 115 123 125 125 242 116 116 115 123 125 125 242 126 244 117 117 116 124 126 126 244 117 117 116 124 126 126 244 52 96 43 43 42 50 52 52 96 43 43 42 50 52 52 96 53 98 44 44 43 51 53 53 98 44 44 43 51 53 53 98 54 100 45 45 44 52 54 54 100 45 45 44 52 54 54 100 55 102 46 46 45 53 55 55 102 46 46 45 53 55 55 102 56 104 47 47 46 54 48 56 104 47 47 46 54 48 56 104 57 106 48 48 47 55 49 57 106 48 48 47 55 49 57 106 58 108 49 49 48 56 50 58 108 49 49 48 56 50 58 108 59 110 50 50 49 57 51 59 110 50 50 49 57 51 59 110 60 112 51 51 50 58 60 60 112 51 51 50 58 60 60 112 61 114 52 52 51 59 61 61 114 52 52 51 59 61 61 114 47 86 38 38 37 45 47 47 86 38 38 37 45 47 47 86 65 122 56 56 55 63 57 65 122 56 56 55 63 57 65 122 51 94 42 42 41 49 43 51 94 42 42 41 49 43 51 94 99 190 90 90 89 97 91 99 190 90 90 89 97 91 99 190',
        };
        this.base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=/_';
        this.extract = (videoUrl, cipher, encrypt) => __awaiter(this, void 0, void 0, function* () {
            const groups = videoUrl.href.split('/');
            const id = encrypt(cipher(groups[4], this.keys.cipher), this.keys.encrypt);
            const url = `${this.host}/mediainfo/${this.dashify(id)}?key=${this.keys.main}`;
            const { data } = yield axios_1.default.get(url, {
                headers: {
                    Referer: videoUrl.href,
                },
            });
            this.sources = data.data.media.sources.map((source) => {
                var _a;
                return ({
                    url: source.file,
                    isM3U8: (_a = source.file) === null || _a === void 0 ? void 0 : _a.includes('.m3u8'),
                });
            });
            return this.sources;
        });
        this.dashify = (id) => {
            const table = this.keys.dashTable.split(' ');
            const dashedId = id
                .split('')
                .map((char, i) => table[this.base64Table.indexOf(char) * 16 + (i % 16)])
                .join('-');
            return dashedId;
        };
    }
}
exports.default = VizCloud;
//# sourceMappingURL=vizcloud.js.map