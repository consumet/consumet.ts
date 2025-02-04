import staticData from './staticdata';

function stringToWordArray(input: string) {
  const wordArray: number[] = [];
  for (let i = 0; i < input.length; i++) {
    wordArray[i >>> 2] |= (input.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
  }
  return [wordArray, input.length];
}

function wordArrayToHex(array: Uint32Array, length: number) {
  return Array.from({ length }, (_, i) =>
    ((array[i >>> 2] >>> (24 - (i % 4) * 8)) & 255).toString(16).padStart(2, '0')
  ).join('');
}

const transform = (s = '') => s.substr(0, 48);

function calculateHash(input: string) {
  return Array.from(input).reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
}
function padString(input: string) {
  const paddingLength = 16 - (input.length % 16);
  return input + String.fromCharCode(paddingLength).repeat(paddingLength);
}
function processBlock(n: number[]) {
  for (let i = 0; i < n.length; i += 4) encryptBlock(n, i);
}

//? needs to be enhanced
function encryptBlock(_0x13a508: number[], _0x5baaa1: number) {
  const [_0x458390, _0x32aa26, _0x53dadc, _0x4810d1, _0x3c0f1b, _0x128bff] = staticData;
  const _0x21ba3f =
    _0x5baaa1 === 0
      ? [22039283, 1457920463, 776125350, -1941999367]
      : _0x13a508.slice(_0x5baaa1 - 4, _0x5baaa1);
  for (let _0x5b9637 = 0; _0x5b9637 < 4; _0x5b9637++)
    _0x13a508[_0x5baaa1 + _0x5b9637] ^= _0x21ba3f[_0x5b9637];

  const _0x116405 = 10;
  let _0x4d3231 = _0x13a508[_0x5baaa1] ^ _0x458390[0],
    _0x1f3a4f = _0x13a508[_0x5baaa1 + 1] ^ _0x458390[1],
    _0x598b52 = _0x13a508[_0x5baaa1 + 2] ^ _0x458390[2],
    _0x2265d4 = _0x13a508[_0x5baaa1 + 3] ^ _0x458390[3],
    _0xcb5ec5 = 4;
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
 * @param {string | number} id
 * @param {string} version
 * @param {string} viGuid
 * @param {string} platformVer
 *
 * Refer these links
 * - https://kisskh.co/common.js?v=9082123
 * - https://kisskh.co/502.065066555371fb02.js
 */
export default function getKKey(
  id: string | number,
  subOrVid: 'sub' | 'vid',
  hash: string = 'mg3c3b04ba',
  version: string = '2.8.10',
  viGuid: string = '62f176f3bb1b5b8e70e39932ad34a0c7',
  subGuid: string = 'VgV52sWhwvBSf8BsM3BRY9weWiiCbtGp',
  platformVer: string = '4830201'
): string {
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

  processBlock(_0x3db385 as number[]);

  return wordArrayToHex(Uint32Array.of(...(_0x3db385 as number[])), _0x2f9d88 as number).toUpperCase();
}
