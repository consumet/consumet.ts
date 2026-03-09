import { VideoExtractor, IVideo, ISubtitle, Intro } from '../models';
import { extractMegaCloudSources } from './megacloud-util';

class VidCloud extends VideoExtractor {
  protected override serverName = 'VidCloud';
  protected override sources: IVideo[] = [];

  override extract = async (
    videoUrl: URL,
    referer: string = 'https://flixhq.to/'
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[]; intro?: Intro; outro?: Intro }> => {
    try {
      const result = await extractMegaCloudSources(videoUrl, referer);
      return {
        sources: result.sources,
        subtitles: result.subtitles,
        intro: result.intro,
        outro: result.outro,
      };
    } catch (err) {
      throw err;
    }
  };
}

export default VidCloud;
