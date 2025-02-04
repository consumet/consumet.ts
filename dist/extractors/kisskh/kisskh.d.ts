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
export default function getKKey(id: string | number, subOrVid: 'sub' | 'vid', hash?: string, version?: string, viGuid?: string, subGuid?: string, platformVer?: string): string;
