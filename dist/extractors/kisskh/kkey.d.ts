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
export default function getKKey({ id, subOrVid, hash, version, viGuid, subGuid, platformVer, }: {
    id: string | number;
    subOrVid: 'sub' | 'vid';
    hash?: string;
    version?: string;
    viGuid?: string;
    subGuid?: string;
    platformVer?: string;
}): string;
