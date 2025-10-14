import CryptoJS from 'crypto-js';
import { USER_AGENT } from '../../utils/utils';
import axios from 'axios';
import { load } from 'cheerio';

/**
 * Thanks to https://github.com/yogesh-hacker for the original implementation.
 */

export async function getSources(embed_url: URL, site: string) {
  const regex = /\/([^\/?]+)(?=\?)/;
  const xrax = embed_url.toString().match(regex)?.[1];
  const basePath = embed_url.pathname.split('/').slice(0, 4).join('/');

  const url = `${embed_url.origin}${basePath}/getSources?id=${xrax}}`;
  const getKeyType = url.includes('mega') ? 'mega' : url.includes('videostr') ? 'vidstr' : 'rabbit';
  //gets the base64 encoded string from the URL and key in parallel
  let key;

  const headers = {
    Accept: '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: site,
    'User-Agent': USER_AGENT,
  };

  try {
    const { data: keyData } = await axios.get(
      'https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json'
    );
    key = keyData;
  } catch (err) {
    console.error('❌ Error fetching key:', err);
    throw new Error('Failed to fetch key');
  }
  let videoTag;
  let embedRes;
  try {
    embedRes = await axios.get(embed_url.href, { headers });
    const $ = load(embedRes.data);
    videoTag = $('#megacloud-player');
  } catch (error) {
    console.error('❌ Error fetching embed URL:', error);
    throw new Error('Failed to fetch embed URL');
  }

  if (!videoTag.length) {
    console.error('❌ Looks like URL expired!');
    throw new Error('Embed tag not found');
  }

  const rawText = embedRes.data;

  let nonceMatch = rawText.match(/\b[a-zA-Z0-9]{48}\b/);
  if (!nonceMatch) {
    const altMatch = rawText.match(/\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b/);
    if (altMatch) nonceMatch = [altMatch.slice(1).join('')];
  }

  const nonce = nonceMatch?.[0];
  if (!nonce) {
    console.error('❌ Nonce not found!');
    throw new Error('Nonce not found');
  }
  const fileId = videoTag.attr('data-id');

  const { data: encryptedResData } = await axios.get(
    `${embed_url.origin}${basePath}/getSources?id=${fileId}&_k=${nonce}`,
    {
      headers,
    }
  );

  const encrypted = encryptedResData.encrypted;
  const sources = encryptedResData.sources;
  let videoSrc = [];

  if (encrypted) {
    const decodeUrl =
      'https://script.google.com/macros/s/AKfycbxHbYHbrGMXYD2-bC-C43D3njIbU-wGiYQuJL61H4vyy6YVXkybMNNEPJNPPuZrD1gRVA/exec';

    const params = new URLSearchParams({
      encrypted_data: sources,
      nonce: nonce,
      secret: key[getKeyType],
    });

    const decodeRes = await axios.get(`${decodeUrl}?${params.toString()}`);
    videoSrc = JSON.parse(decodeRes.data.match(/\[.*?\]/s)?.[0]);
  } else {
    videoSrc = sources;
  }
  return {
    sources: videoSrc,
    tracks: encryptedResData.tracks,
    intro: encryptedResData?.intro,
    outro: encryptedResData?.outro,
  };
}
