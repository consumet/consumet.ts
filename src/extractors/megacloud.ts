import { VideoExtractor, IVideo, ISubtitle } from '../models';
import { extractMegaCloudSources } from './megacloud-util';

class MegaCloud extends VideoExtractor {
  protected override serverName = 'MegaCloud';
  protected override sources: IVideo[] = [];

  override extract = async (
    videoUrl: URL
  ): Promise<{ sources: IVideo[]; subtitles: ISubtitle[]; intro?: any; outro?: any }> => {
    try {
      const result = await extractMegaCloudSources(videoUrl);
      return {
        sources: result.sources,
        subtitles: result.subtitles,
        intro: result.intro,
        outro: result.outro,
      };
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

export default MegaCloud;
