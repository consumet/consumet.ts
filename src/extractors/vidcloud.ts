import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
import { USER_AGENT } from '../utils';
import axios from 'axios';

class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  override extract = async (
    videoUrl: URL,
    _?: boolean,
    referer: string = 'https://flixhq.to/'
  ): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      const result: { sources: IVideo[]; subtitles: ISubtitle[]; intro?: Intro } = {
        sources: [],
        subtitles: [],
      };

      const decUrl = new URL('https://dec.eatmynerds.live');
      decUrl.searchParams.set('url', videoUrl.href);

      const { data: initialData } = await axios.get(decUrl.toString());

      if (!initialData?.sources?.length) {
        throw new Error('No sources found from the initial request.');
      }

      let masterPlaylistUrl = initialData.sources[0].file;

      let masterPlaylist: string;
      try {
        const { data } = await axios.get(masterPlaylistUrl, {
          headers: {
            Referer: videoUrl.href,
            'User-Agent': USER_AGENT,
          },
          timeout: 10000,
        });
        masterPlaylist = data;
      } catch (httpsError) {
        const httpUrl = masterPlaylistUrl.replace('https://', 'http://');
        try {
          const { data } = await axios.get(httpUrl, {
            headers: {
              Referer: videoUrl.href,
              'User-Agent': USER_AGENT,
            },
            timeout: 10000,
          });
          masterPlaylist = data;
          masterPlaylistUrl = httpUrl;
        } catch (httpError) {
          console.error('Both HTTPS and HTTP failed');
          throw httpsError;
        }
      }

      const sources: IVideo[] = [];

      sources.push({
        url: masterPlaylistUrl,
        isM3U8: true,
        quality: 'auto',
      });

      const playlistRegex = /#EXT-X-STREAM-INF:.*RESOLUTION=(\d+x(\d+)).*\n(.*)/g;
      let match;

      while ((match = playlistRegex.exec(masterPlaylist)) !== null) {
        const quality = `${match[2]}p`;
        let url = match[3];

        if (!url.startsWith('http')) {
          url = new URL(url, masterPlaylistUrl).toString();
        }

        sources.push({
          url: url,
          quality: quality,
          isM3U8: url.includes('.m3u8'),
        });
      }

      result.sources = sources;
      result.subtitles =
        initialData.tracks?.map((s: any) => ({
          url: s.file,
          lang: s.label ?? 'Default',
        })) || [];

      return result;
    } catch (err) {
      throw err;
    }
  };
}

export default VidCloud;
