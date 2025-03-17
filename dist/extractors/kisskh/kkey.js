"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getKKey;
const staticdata_1 = __importDefault(require("./staticdata"));
function stringToWordArray(input) {
    const wordArray = [];
    for (let i = 0; i < input.length; i++) {
        wordArray[i >>> 2] |= (input.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
    }
    return [wordArray, input.length];
}
function wordArrayToHex(array, length) {
    return Array.from({ length }, (_, i) => ((array[i >>> 2] >>> (24 - (i % 4) * 8)) & 255).toString(16).padStart(2, '0')).join('');
}
const transform = (s = '') => s.substr(0, 48);
function calculateHash(input) {
    return Array.from(input).reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
}
function padString(input) {
    const paddingLength = 16 - (input.length % 16);
    return input + String.fromCharCode(paddingLength).repeat(paddingLength);
}
function processBlock(n) {
    for (let i = 0; i < n.length; i += 4)
        encryptBlock(n, i);
}
//? needs to be enhanced
function encryptBlock(_0x13a508, _0x5baaa1) {
    const [_0x458390, _0x32aa26, _0x53dadc, _0x4810d1, _0x3c0f1b, _0x128bff] = staticdata_1.default;
    const _0x21ba3f = _0x5baaa1 === 0
        ? [22039283, 1457920463, 776125350, -1941999367]
        : _0x13a508.slice(_0x5baaa1 - 4, _0x5baaa1);
    for (let _0x5b9637 = 0; _0x5b9637 < 4; _0x5b9637++)
        _0x13a508[_0x5baaa1 + _0x5b9637] ^= _0x21ba3f[_0x5b9637];
    const _0x116405 = 10;
    let _0x4d3231 = _0x13a508[_0x5baaa1] ^ _0x458390[0], _0x1f3a4f = _0x13a508[_0x5baaa1 + 1] ^ _0x458390[1], _0x598b52 = _0x13a508[_0x5baaa1 + 2] ^ _0x458390[2], _0x2265d4 = _0x13a508[_0x5baaa1 + 3] ^ _0x458390[3], _0xcb5ec5 = 4;
    let _0x34de78;
    let _0x42d7a0;
    let _0x4a8c71;
    for (let _0x5e2dc7 = 1; _0x5e2dc7 < _0x116405; _0x5e2dc7++) {
        _0x34de78 =
            _0x32aa26[_0x4d3231 >>> 24] ^
                _0x53dadc[(_0x1f3a4f >>> 16) & 255] ^
                _0x4810d1[(_0x598b52 >>> 8) & 255] ^
                _0x3c0f1b[_0x2265d4 & 255] ^
                _0x458390[_0xcb5ec5++];
        _0x42d7a0 =
            _0x32aa26[_0x1f3a4f >>> 24] ^
                _0x53dadc[(_0x598b52 >>> 16) & 255] ^
                _0x4810d1[(_0x2265d4 >>> 8) & 255] ^
                _0x3c0f1b[_0x4d3231 & 255] ^
                _0x458390[_0xcb5ec5++];
        _0x4a8c71 =
            _0x32aa26[_0x598b52 >>> 24] ^
                _0x53dadc[(_0x2265d4 >>> 16) & 255] ^
                _0x4810d1[(_0x4d3231 >>> 8) & 255] ^
                _0x3c0f1b[_0x1f3a4f & 255] ^
                _0x458390[_0xcb5ec5++];
        _0x2265d4 =
            _0x32aa26[_0x2265d4 >>> 24] ^
                _0x53dadc[(_0x4d3231 >>> 16) & 255] ^
                _0x4810d1[(_0x1f3a4f >>> 8) & 255] ^
                _0x3c0f1b[_0x598b52 & 255] ^
                _0x458390[_0xcb5ec5++];
        _0x4d3231 = _0x34de78;
        _0x1f3a4f = _0x42d7a0;
        _0x598b52 = _0x4a8c71;
    }
    _0x34de78 =
        ((_0x128bff[_0x4d3231 >>> 24] << 24) |
            (_0x128bff[(_0x1f3a4f >>> 16) & 255] << 16) |
            (_0x128bff[(_0x598b52 >>> 8) & 255] << 8) |
            _0x128bff[_0x2265d4 & 255]) ^
            _0x458390[_0xcb5ec5++];
    _0x42d7a0 =
        ((_0x128bff[_0x1f3a4f >>> 24] << 24) |
            (_0x128bff[(_0x598b52 >>> 16) & 255] << 16) |
            (_0x128bff[(_0x2265d4 >>> 8) & 255] << 8) |
            _0x128bff[_0x4d3231 & 255]) ^
            _0x458390[_0xcb5ec5++];
    _0x4a8c71 =
        ((_0x128bff[_0x598b52 >>> 24] << 24) |
            (_0x128bff[(_0x2265d4 >>> 16) & 255] << 16) |
            (_0x128bff[(_0x4d3231 >>> 8) & 255] << 8) |
            _0x128bff[_0x1f3a4f & 255]) ^
            _0x458390[_0xcb5ec5++];
    _0x2265d4 =
        ((_0x128bff[_0x2265d4 >>> 24] << 24) |
            (_0x128bff[(_0x4d3231 >>> 16) & 255] << 16) |
            (_0x128bff[(_0x1f3a4f >>> 8) & 255] << 8) |
            _0x128bff[_0x598b52 & 255]) ^
            _0x458390[_0xcb5ec5++];
    _0x13a508[_0x5baaa1] = _0x34de78;
    _0x13a508[_0x5baaa1 + 1] = _0x42d7a0;
    _0x13a508[_0x5baaa1 + 2] = _0x4a8c71;
    _0x13a508[_0x5baaa1 + 3] = _0x2265d4;
}
/**
 * Generates the `kkey` for KissKH.
 *
 * @param {Object} params - The parameters object.
 * @param {string | number} params.id - The ID of the video.
 * @param {'sub' | 'vid'} params.subOrVid - Determines if the key is for a subtitle or video.
 * @param {string} [params.hash='mg3c3b04ba'] - The default hash value.
 * @param {string} [params.version='2.8.10'] - The API version.
 * @param {string} [params.viGuid='62f176f3bb1b5b8e70e39932ad34a0c7'] - The video GUID.
 * @param {string} [params.subGuid='VgV52sWhwvBSf8BsM3BRY9weWiiCbtGp'] - The subtitle GUID.
 * @param {string} [params.platformVer='4830201'] - The platform version.
 *
 * @see https://kisskh.co/common.js?v=9082123
 * @see https://kisskh.co/502.065066555371fb02
 */
function getKKey({ id, subOrVid, hash = 'mg3c3b04ba', version = '2.8.10', viGuid = '62f176f3bb1b5b8e70e39932ad34a0c7', subGuid = 'VgV52sWhwvBSf8BsM3BRY9weWiiCbtGp', platformVer = '4830201', }) {
    const data = [
        '',
        id,
        null,
        hash,
        version,
        subOrVid === 'sub' ? subGuid : viGuid,
        platformVer,
        transform('kisskh'),
        transform('kisskh'.toLowerCase()),
        transform('kisskh'),
        'kisskh',
        'kisskh',
        'kisskh',
        '00',
        '',
    ];
    data.splice(1, 0, calculateHash(data.join('|')));
    const _0x278f64 = padString(data.join('|'));
    const [_0x3db385, _0x2f9d88] = stringToWordArray(_0x278f64);
    processBlock(_0x3db385);
    return wordArrayToHex(Uint32Array.of(..._0x3db385), _0x2f9d88).toUpperCase();
}
//# sourceMappingURL=kkey.js.map