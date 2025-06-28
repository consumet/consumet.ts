import CryptoJS from 'crypto-js';
import { USER_AGENT } from '../../utils/utils';
import axios from 'axios';

/**
 * Thanks to https://github.com/yogesh-hacker for the key's api
 * Thanks to https://github.com/illusionTBA for the key's api
 */

export async function getSources(embed_url: URL, site: string) {
  const regex = /\/([^\/?]+)(?=\?)/;
  const xrax = embed_url.toString().match(regex)?.[1];
  const basePath = embed_url.pathname.split('/').slice(0, 4).join('/');
  const url = `${embed_url.origin}${basePath}/getSources?id=${xrax}`;

  const getKeyType = url.includes('mega') ? 'mega' : url.includes('videostr') ? 'vidstr' : 'rabbit';

  //gets the base64 encoded string from the URL and key in parallel
  let key;
  let data;

  try {
    [{ data }, { data: key }] = await Promise.all([
      axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: site,
          'X-Requested-With': 'XMLHttpRequest',
        },
      }),
      axios.get('https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json'),
    ]);
  } catch (err) {
    [{ data }, { data: key }] = await Promise.all([
      axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Referer: site,
          'X-Requested-With': 'XMLHttpRequest',
        },
      }),
      axios.get('https://keys.hs.vc/'),
    ]);

    // Transform keys.hs.vc format to match yogesh-hacker format
    if (key.megacloud && key.rabbitstream) {
      key = {
        mega: key.megacloud.key,
        vidstr: key.rabbitstream.key,
        rabbit: key.rabbitstream.key,
      };
    }
  }

  const sources = JSON.parse(CryptoJS.AES.decrypt(data.sources, key[getKeyType]).toString(CryptoJS.enc.Utf8));

  return {
    sources,
    tracks: data.tracks,
    intro: data?.intro,
    outro: data?.outro,
  };
}
