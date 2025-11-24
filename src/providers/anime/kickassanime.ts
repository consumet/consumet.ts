import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
  SubOrSub,
  IVideo,
  ISubtitle,
  StreamingServers,
} from '../../models';
import * as crypto from 'crypto';

class KickAssAnime extends AnimeParser {
  override readonly name = 'KickAssAnime';
  protected override baseUrl = 'https://kickass-anime.ru';
  protected override logo = 'https://kickass-anime.ru/img/logo.png';
  protected override classPath = 'ANIME.KickAssAnime';

  private fallbackDomains = [
    'https://kickass-anime.ru',
    'https://kickass-anime.ro',
    'https://kaa.to',
    'https://kaa.rs',
    'https://kaa.si',
  ];

  /**
   * Get HTTP headers for requests
   * @param host The host URL
   * @param endpoint The endpoint type (optional)
   * @returns Object containing HTTP headers
   */
  private getHeaders(host: string, endpoint: string = '') {
    const baseHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      Host: new URL(host).host,
    };

    if (endpoint === 'search') {
      return {
        ...baseHeaders,
        'Content-Type': 'application/json',
        Referer: `${host}/anime`,
      };
    }

    return baseHeaders;
  }

  /**
   * Search for anime
   * @param query Search query string
   * @param page Page number (default: 1)
   * @returns Promise<ISearch<IAnimeResult>>
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    // Try each domain until one works
    for (const domain of this.fallbackDomains) {
      try {
        const searchUrl = `${domain}/api/fsearch`;
        const headers = this.getHeaders(domain, 'search');

        const response = await this.client.post(
          searchUrl,
          {
            page: page,
            query: query,
          },
          {
            headers,
            timeout: 10000,
          }
        );

        const searchResults: IAnimeResult[] = response.data.result.map((anime: any) => ({
          id: anime.slug,
          title: anime.title,
          url: anime.watch_uri ? `${domain}${anime.watch_uri}` : `${domain}/${anime.slug}`,
          image: anime.poster ? `${domain}/image/${anime.poster.hq}.${anime.poster.formats[0]}` : undefined,
          releaseDate: anime.year?.toString(),
          subOrDub: anime.locales?.includes('en-US') ? SubOrSub.DUB : SubOrSub.SUB,
          status: this.mapStatus(anime.status),
          otherName: anime.title_en,
          totalEpisodes: anime.episode_count,
        }));

        return {
          currentPage: page,
          hasNextPage: page < response.data.maxPage,
          totalPages: response.data.maxPage,
          results: searchResults,
        };
      } catch (error) {
        console.log(`Failed with domain ${domain}:`, error);
        continue; // Try next domain
      }
    }

    throw new Error('All domains failed for search');
  };

  /**
   * Map anime status string to MediaStatus enum
   * @param status The status string from API
   * @returns MediaStatus enum value
   */
  private mapStatus(status: string): MediaStatus {
    switch (status) {
      case 'finished_airing':
        return MediaStatus.COMPLETED;
      case 'currently_airing':
        return MediaStatus.ONGOING;
      case 'not_yet_aired':
        return MediaStatus.NOT_YET_AIRED;
      default:
        return MediaStatus.UNKNOWN;
    }
  }

  /**
   * Fetch detailed anime information
   * @param id Anime slug/id (e.g., 'naruto-f3cf')
   * @returns Promise<IAnimeInfo>
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    // Try each domain until one works
    for (const domain of this.fallbackDomains) {
      try {
        const headers = this.getHeaders(domain);

        // Get anime info
        const infoResponse = await this.client.get(`${domain}/api/show/${id}`, {
          headers,
          timeout: 10000,
        });

        const animeData = infoResponse.data;

        // Get episodes
        const episodesResponse = await this.client.get(
          `${domain}/api/show/${id}/episodes?page=1&lang=ja-JP`,
          {
            headers,
            timeout: 10000,
          }
        );

        const episodes: IAnimeEpisode[] = episodesResponse.data.result.map((ep: any) => ({
          id: `${domain}/api/show/${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
          title: ep.title,
          number: Math.floor(ep.episode_number),
          image: ep.thumbnail ? `${domain}/image/${ep.thumbnail.hq}.${ep.thumbnail.formats[0]}` : undefined,
          url: `${domain}/api/show/${id}/episode/ep-${Math.floor(ep.episode_number)}-${ep.slug}`,
        }));

        return {
          id: animeData.slug,
          title: animeData.title_en || animeData.title,
          url: `${domain}/${animeData.slug}`,
          genres: animeData.genres || [],
          totalEpisodes: episodes.length,
          image: animeData.poster
            ? `${domain}/image/${animeData.poster.hq}.${animeData.poster.formats[0]}`
            : undefined,
          cover: animeData.banner
            ? `${domain}/image/${animeData.banner.hq}.${animeData.banner.formats[0]}`
            : undefined,
          description: animeData.synopsis,
          episodes: episodes,
          subOrDub: animeData.locales?.includes('en-US') ? SubOrSub.DUB : SubOrSub.SUB,
          type: animeData.type?.toUpperCase(),
          status: this.mapStatus(animeData.status),
          otherName: animeData.title_original,
          releaseDate: animeData.year?.toString(),
        };
      } catch (error) {
        continue; // Try next domain
      }
    }

    throw new Error('All domains failed for anime info');
  };

  /**
   * Fetch episode video sources and subtitles
   * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
   * @param server Optional server name to filter (e.g., StreamingServers.VidStreaming, StreamingServers.BirdStream)
   * @returns Promise<ISource>
   */
  override fetchEpisodeSources = async (episodeId: string, server?: string): Promise<ISource> => {
    for (const domain of this.fallbackDomains) {
      try {
        const headers = this.getHeaders(domain);
        const episodeUrl = `${domain}/api/show/${episodeId}`;

        const response = await this.client.get(episodeUrl, {
          headers,
          timeout: 10000,
        });

        const servers = response.data.servers || [];
        const sources: IVideo[] = [];
        const subtitles: ISubtitle[] = [];

        // Filter servers if specific server requested
        const targetServers = server
          ? servers.filter((s: any) => s.name.toLowerCase().includes(server.toLowerCase()))
          : servers;

        if (server && targetServers.length === 0) {
          throw new Error(`Server "${server}" not found`);
        }

        for (const serverData of targetServers) {
          try {
            const serverSources = await this.extractFromServer(serverData.src, serverData.name, headers);
            sources.push(...serverSources.sources);
            subtitles.push(...serverSources.subtitles);
          } catch (error: any) {
            // Silent fail, continue with other servers
          }
        }

        return {
          sources: sources,
          subtitles: subtitles,
          headers: {
            Referer: episodeUrl,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
          },
        };
      } catch (error) {
        // Try next domain
      }
    }
    throw new Error('All domains failed for episode sources');
  };

  /**
   * Fetch available servers for an episode
   * @param episodeId Episode path (e.g., 'naruto-f3cf/episode/ep-1-12cd96')
   * @returns Promise<IEpisodeServer[]>
   */
  override fetchEpisodeServers = async (episodeId: string): Promise<IEpisodeServer[]> => {
    for (const domain of this.fallbackDomains) {
      try {
        const headers = this.getHeaders(domain);
        const episodeUrl = `${domain}/api/show/${episodeId}`;

        const response = await this.client.get(episodeUrl, {
          headers,
          timeout: 10000,
        });

        const servers = response.data.servers || [];
        return servers.map((server: any) => ({
          name: server.name,
          url: server.src,
        }));
      } catch (error) {
        // Try next domain
      }
    }
    throw new Error('All domains failed for episode servers');
  };

  // Decryption shi is here
  private async extractFromServer(
    url: string,
    serverName: string,
    requestHeaders: any
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[] }> {
    const sources: IVideo[] = [];
    const subtitles: ISubtitle[] = [];

    // Check if it's a cat-player URL (new format)
    if (url.includes('/cat-player/')) {
      return await this.extractCatBirdStream(url, serverName, requestHeaders);
    }

    // Legacy vidstreaming URLs
    if (
      serverName.includes(StreamingServers.VidStreaming) ||
      serverName.includes(StreamingServers.DuckStream)
    ) {
      return await this.extractEncryptedServer(url, serverName, requestHeaders);
    }

    if (serverName.includes(StreamingServers.BirdStream) || serverName.includes('CatStream')) {
      return await this.extractCatBirdStream(url, serverName, requestHeaders);
    }

    // Fallback for other servers
    sources.push({
      url: url,
      quality: '1080p',
      isM3U8: true,
    });

    return { sources, subtitles };
  }

  private async extractCatBirdStream(
    url: string,
    serverName: string,
    requestHeaders: any
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[] }> {
    const baseUrl = new URL(url).origin;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      // Remove Accept-Encoding to avoid compression issues
      // 'Accept-Encoding': 'gzip, deflate, br, zstd',
      Referer: 'https://kaa.mx/',
      DNT: '1',
      'Sec-GPC': '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      Host: new URL(url).host,
    };

    try {
      const response = await this.client.get(url, { headers, timeout: 15000 });
      const html = response.data;

      // Extract props JSON from HTML
      const propsMatch = html.match(/props="([^"]+)"/);
      if (!propsMatch) throw new Error('Could not find props in HTML');

      // Decode HTML entities
      const encodedJson = propsMatch[1];
      const unescapedJson = this.decodeHtmlEntities(encodedJson);
      const jsonData = JSON.parse(unescapedJson);

      const sources: IVideo[] = [];
      const subtitles: ISubtitle[] = [];

      // Extract video URL
      if (jsonData.manifest && jsonData.manifest[1]) {
        let videoUrl = jsonData.manifest[1];
        // Fix URL formatting
        if (videoUrl.startsWith('//')) {
          videoUrl = 'https:' + videoUrl;
        } else if (!videoUrl.startsWith('http')) {
          videoUrl = 'https://' + videoUrl;
        }

        // Determine quality from video data if available
        let quality = '1080p';
        if (jsonData.quality) {
          quality = jsonData.quality;
        } else if (videoUrl.includes('1080')) {
          quality = '1080p';
        } else if (videoUrl.includes('720')) {
          quality = '720p';
        } else if (videoUrl.includes('480')) {
          quality = '480p';
        }

        sources.push({
          url: videoUrl,
          quality: quality,
          isM3U8: videoUrl.includes('.m3u8') || jsonData.hls,
        });

        // Extract additional qualities if available
        if (jsonData.qualities && Array.isArray(jsonData.qualities)) {
          for (const qualityData of jsonData.qualities) {
            if (qualityData.url && qualityData.quality) {
              let qualityUrl = qualityData.url;
              if (qualityUrl.startsWith('//')) {
                qualityUrl = 'https:' + qualityUrl;
              }
              sources.push({
                url: qualityUrl,
                quality: qualityData.quality,
                isM3U8: qualityUrl.includes('.m3u8'),
              });
            }
          }
        }
      }

      // Extract subtitles
      if (jsonData.subtitles && jsonData.subtitles[1]) {
        const subtitleArray = jsonData.subtitles[1];
        for (let i = 0; i < subtitleArray.length; i++) {
          const sub = subtitleArray[i][1];
          if (sub && sub.src && sub.src[1] && sub.name && sub.name[1]) {
            subtitles.push({
              url: sub.src[1],
              lang: sub.name[1],
            });
          }
        }
      }

      return { sources, subtitles };
    } catch (error: any) {
      throw error;
    }
  }

  private decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '=',
    };

    return text.replace(/&[#\w]+;/g, entity => {
      return entities[entity] || entity;
    });
  }

  private async extractEncryptedServer(
    url: string,
    serverName: string,
    requestHeaders: any
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[] }> {
    const host = new URL(url).hostname;
    const mid = serverName === 'DuckStream' ? 'mid' : 'id';
    const isBird = serverName === 'BirdStream';

    const query = new URL(url).searchParams.get(mid);
    if (!query) throw new Error('No query parameter found');

    // Special headers for krussdomi.com
    const specialHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      Referer: url,
      DNT: '1',
      'Sec-GPC': '1',
      Connection: 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      TE: 'trailers',
      Host: host,
      'X-Origin': 'kaa.mx',
      'x-timezone': '-330',
      'x-client-ts': Date.now().toString(),
    };

    // Get the HTML page
    const htmlResponse = await this.client.get(url, { headers: specialHeaders });
    const html = htmlResponse.data;

    // Get encryption key based on server
    const key = this.getServerKey(serverName);
    if (!key) throw new Error('Unknown server type');

    // Extract CID from HTML
    const cidMatch = html.match(/cid:\s*'([^']+)'/);
    if (!cidMatch) throw new Error('Could not find CID in HTML');

    const cidHex = cidMatch[1];
    const cidBytes = this.hexToBytes(cidHex);
    const cidString = new TextDecoder().decode(cidBytes);
    const cid = cidString.split('|');

    const timestamp = Math.floor(Date.now() / 1000) + 60;
    const route = cid[1].replace('player.php', 'source.php');

    // Build signature string exactly like your approach
    const signatureData = [
      cid[0], // IP
      specialHeaders['User-Agent'],
      route,
      query,
      timestamp,
      new TextDecoder().decode(key),
    ].join('');

    const signature = this.sha1(signatureData);

    // Build source URL
    const sourceUrl = `https://${host}${route}?${mid}=${query}&e=${timestamp}&s=${signature}`;
    // Get encrypted response
    const sourceResponse = await this.client.get(sourceUrl, {
      headers: specialHeaders,
    });

    // Parse encrypted data
    const encryptedMatch = sourceResponse.data.match(/:"([^"]+)"/);
    if (!encryptedMatch) throw new Error('Could not find encrypted data');

    const [encryptedData, ivHex] = encryptedMatch[1].replace(/\\/g, '').split(':');

    const iv = this.hexToBytes(ivHex);

    // Decrypt using your approach
    try {
      const decryptedData = this.decryptAES(encryptedData, new TextDecoder().decode(key), iv);
      const videoData = JSON.parse(decryptedData);

      const sources: IVideo[] = [];
      const subtitles: ISubtitle[] = [];

      // Extract video URLs with multiple Qualities if available
      const videoUrls = [];

      if (videoData.playlistUrl) {
        let cleanUrl = videoData.playlistUrl;
        // Fix double https: issue
        if (cleanUrl.startsWith('https:https://')) {
          cleanUrl = cleanUrl.replace('https:https://', 'https://');
        } else if (cleanUrl.startsWith('https:////')) {
          cleanUrl = cleanUrl.replace('https:////', 'https://');
        } else if (cleanUrl.startsWith('https://')) {
          // Already correct
        } else if (cleanUrl.startsWith('//')) {
          cleanUrl = 'https:' + cleanUrl;
        }

        videoUrls.push({
          url: cleanUrl,
          quality: videoData.quality || '1080p',
          isM3U8: videoData.hls ? true : false,
        });
      }

      if (videoData.hls) {
        let cleanUrl = videoData.hls;
        // Fix double https: issue
        if (cleanUrl.startsWith('https:https://')) {
          cleanUrl = cleanUrl.replace('https:https://', 'https://');
        }

        videoUrls.push({
          url: cleanUrl,
          quality: videoData.quality || '1080p',
          isM3U8: true,
        });
      }

      // Extract multiple quality sources if available
      if (videoData.sources && Array.isArray(videoData.sources)) {
        for (const source of videoData.sources) {
          if (source.file || source.url) {
            let sourceUrl = source.file || source.url;
            if (sourceUrl.startsWith('//')) {
              sourceUrl = 'https:' + sourceUrl;
            }
            videoUrls.push({
              url: sourceUrl,
              quality: source.label || source.quality || 'auto',
              isM3U8: sourceUrl.includes('.m3u8'),
            });
          }
        }
      }

      sources.push(...videoUrls);

      // Extract subtitles
      if (videoData.subtitles) {
        for (const sub of videoData.subtitles) {
          let subUrl = sub.src;
          if (subUrl.startsWith('//')) {
            subUrl = 'https:' + subUrl;
          } else if (subUrl.startsWith('/')) {
            subUrl = `https://${host}${subUrl}`;
          }

          subtitles.push({
            url: subUrl,
            lang: `${sub.name} (${sub.language})`,
          });
        }
      }

      return { sources, subtitles };
    } catch (error) {
      throw new Error(`Failed to decrypt video data: ${error}`);
    }
  }

  /**
   * Get decryption key for specific server
   * @param serverName Name of the server
   * @returns Uint8Array key or null if not found
   */
  private getServerKey(serverName: string): Uint8Array | null {
    switch (serverName) {
      case StreamingServers.VidStreaming:
      case 'VidStreaming':
        return new TextEncoder().encode('e13d38099bf562e8b9851a652d2043d3');
      case StreamingServers.DuckStream:
      case 'DuckStream':
        return new TextEncoder().encode('4504447b74641ad972980a6b8ffd7631');
      case StreamingServers.BirdStream:
      case 'BirdStream':
        return new TextEncoder().encode('4b14d0ff625163e3c9c7a47926484bf2');
      default:
        return null;
    }
  }

  /**
   * Convert hexadecimal string to Uint8Array
   * @param hex Hexadecimal string
   * @returns Uint8Array representation
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  private sha1(str: string): string {
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  private decryptAES(encryptedData: string, key: string, iv: Uint8Array): string {
    try {
      const keyBuffer = Buffer.from(key, 'utf8');
      const ivBuffer = Buffer.from(iv);
      const encryptedBuffer = Buffer.from(encryptedData, 'base64');

      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`AES decryption failed: ${error}`);
    }
  }
}

export default KickAssAnime;
// (async () => {
//   const kickass = new KickAssAnime();

//   // Test 1: Search
//   console.log('Search Results:', await kickass.search('Naruto'));

//   // Test 2: Anime Info
//   console.log('Anime Info:', await kickass.fetchAnimeInfo('naruto-f3cf'));

//   // Test 3A: Episode Servers
//   console.log('Episode Servers:', await kickass.fetchEpisodeServers('naruto-f3cf/episode/ep-1-12cd96'));

//   // Test 3B: Episode Sources (All Servers)
//   console.log('Episode Sources (All):', await kickass.fetchEpisodeSources('naruto-f3cf/episode/ep-1-12cd96'));

//   // Test 3C: Episode Sources (VidStreaming Only)
//   console.log('Episode Sources (VidStreaming):', await kickass.fetchEpisodeSources('naruto-f3cf/episode/ep-1-12cd96', StreamingServers.VidStreaming));

//   // Test 3D: Episode Sources (BirdStream Only)
//   console.log('Episode Sources (BirdStream):', await kickass.fetchEpisodeSources('naruto-f3cf/episode/ep-1-12cd96', StreamingServers.BirdStream));
// })();
