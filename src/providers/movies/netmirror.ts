import {
  MovieParser,
  TvType,
  IMovieInfo,
  IEpisodeServer,
  ISource,
  IMovieResult,
  ISearch,
  IMovieEpisode,
} from '../../models';

enum NetMirrorOTT {
  NETFLIX = 'nf',
  PRIME = 'pv',
  DISNEY = 'dp',
  LIONSGATE = 'lg',
}

interface NetMirrorSearchResult {
  head: string;
  type: number;
  searchResult: Array<{ id: string; t: string }>;
}

interface NetMirrorQuickInfo {
  runtime: string;
  hdsd: string;
  ua: string;
  match: string;
  genre: string;
}

interface NetMirrorPlaylist {
  title: string;
  image: string;
  sources: Array<{
    file: string;
    label: string;
    type: string;
    default?: string;
  }>;
  tracks: Array<{
    kind: string;
    file: string;
    label: string;
    language?: string;
  }>;
}

class NetMirror extends MovieParser {
  override readonly name = 'NetMirror';
  protected override baseUrl = 'https://net20.cc';
  protected override logo = 'https://net20.cc/img/nf2/icon_x192.png';
  protected override classPath = 'MOVIES.NetMirror';
  override supportedTypes = new Set([TvType.MOVIE, TvType.TVSERIES]);

  private ott: NetMirrorOTT = NetMirrorOTT.NETFLIX;
  private headers = {
    'X-Requested-With': 'XMLHttpRequest',
    Referer: `${this.baseUrl}/home`,
  };

  setOTT(provider: NetMirrorOTT): void {
    this.ott = provider;
  }

  private getCookies(): string {
    return `user_token=consumets; ott=${this.ott}`;
  }

  override search = async (query: string, page: number = 1): Promise<ISearch<IMovieResult>> => {
    try {
      const { data } = await this.client.get<NetMirrorSearchResult>(
        `${this.baseUrl}/search.php?s=${encodeURIComponent(query)}&t=x`,
        {
          headers: {
            ...this.headers,
            Cookie: this.getCookies(),
          },
        }
      );

      if (!data.searchResult || !Array.isArray(data.searchResult)) {
        return { currentPage: page, hasNextPage: false, results: [] };
      }

      const results: IMovieResult[] = data.searchResult.map(item => ({
        id: item.id,
        title: item.t,
        image: `https://imgcdn.kim/poster/342/${item.id}.jpg`,
        type: TvType.MOVIE,
      }));

      return {
        currentPage: page,
        hasNextPage: false,
        results,
      };
    } catch (err) {
      throw new Error(`NetMirror search failed: ${(err as Error).message}`);
    }
  };

  fetchQuickInfo = async (id: string): Promise<NetMirrorQuickInfo> => {
    try {
      const { data } = await this.client.get<NetMirrorQuickInfo>(
        `${this.baseUrl}/mini-modal-info.php?id=${id}&t=x`,
        {
          headers: {
            ...this.headers,
            Cookie: this.getCookies(),
          },
        }
      );
      return data;
    } catch (err) {
      throw new Error(`NetMirror fetchQuickInfo failed: ${(err as Error).message}`);
    }
  };

  override fetchMediaInfo = async (mediaId: string): Promise<IMovieInfo> => {
    try {
      const quickInfo = await this.fetchQuickInfo(mediaId);
      const isTvShow = quickInfo.runtime?.toLowerCase().includes('season');

      const movieInfo: IMovieInfo = {
        id: mediaId,
        title: '',
        type: isTvShow ? TvType.TVSERIES : TvType.MOVIE,
        image: `https://imgcdn.kim/poster/780/${mediaId}.jpg`,
        cover: `https://imgcdn.kim/poster/1920/${mediaId}.jpg`,
        genres: quickInfo.genre?.split(', ').map(g => g.trim()) || [],
        duration: quickInfo.runtime,
        rating: quickInfo.ua ? undefined : undefined,
      };

      if (isTvShow) {
        movieInfo.episodes = [
          {
            id: mediaId,
            title: 'Full Content',
          },
        ];
      } else {
        movieInfo.episodes = [
          {
            id: mediaId,
            title: 'Full Movie',
          },
        ];
      }

      return movieInfo;
    } catch (err) {
      throw new Error(`NetMirror fetchMediaInfo failed: ${(err as Error).message}`);
    }
  };

  override fetchEpisodeServers = async (episodeId: string, mediaId?: string): Promise<IEpisodeServer[]> => {
    return [
      {
        name: 'NetMirror',
        url: `${this.baseUrl}/playlist.php?id=${episodeId}`,
      },
    ];
  };

  override fetchEpisodeSources = async (episodeId: string, mediaId?: string): Promise<ISource> => {
    try {
      const { data } = await this.client.get<NetMirrorPlaylist[]>(
        `${this.baseUrl}/playlist.php?id=${episodeId}&t=Video&tm=${Date.now()}`,
        {
          headers: {
            ...this.headers,
            Cookie: this.getCookies(),
          },
        }
      );

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No playlist data received');
      }

      const playlist = data[0];

      if (!playlist.sources || !Array.isArray(playlist.sources)) {
        throw new Error('No sources in playlist');
      }

      const sources = playlist.sources.map(s => {
        let quality = '480p';
        if (s.label === 'Full HD') quality = '1080p';
        else if (s.label === 'Mid HD') quality = '720p';
        else if (s.label === 'Low HD') quality = '480p';

        return {
          url: `${this.baseUrl}${s.file}`,
          quality,
          isM3U8: true,
        };
      });

      const subtitles = playlist.tracks
        ?.filter(t => t.kind === 'captions')
        .map(t => ({
          url: t.file.startsWith('//') ? `https:${t.file}` : t.file,
          lang: t.label || t.language || 'Unknown',
        }));

      return {
        headers: { Referer: `${this.baseUrl}/` },
        sources,
        subtitles,
      };
    } catch (err) {
      throw new Error(`NetMirror fetchEpisodeSources failed: ${(err as Error).message}`);
    }
  };

  fetchHlsPlaylist = async (episodeId: string): Promise<string> => {
    try {
      const { data } = await this.client.get<string>(`${this.baseUrl}/hls/${episodeId}.m3u8?in=unknown::ni`, {
        headers: {
          ...this.headers,
          Cookie: this.getCookies(),
        },
      });
      return data;
    } catch (err) {
      throw new Error(`NetMirror fetchHlsPlaylist failed: ${(err as Error).message}`);
    }
  };

  fetchRecentMovies = async (): Promise<IMovieResult[]> => {
    try {
      const data = await this.search('new');
      return data.results;
    } catch (err) {
      throw new Error(`NetMirror fetchRecentMovies failed: ${(err as Error).message}`);
    }
  };

  fetchTrendingMovies = async (): Promise<IMovieResult[]> => {
    try {
      const data = await this.search('trending');
      return data.results;
    } catch (err) {
      throw new Error(`NetMirror fetchTrendingMovies failed: ${(err as Error).message}`);
    }
  };
}

export default NetMirror;
