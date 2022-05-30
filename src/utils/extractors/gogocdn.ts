import { VideoExtractor, IVideo } from '../../models';

class GogoCDN extends VideoExtractor {
  protected override serverName = 'goload';
  protected override sources: IVideo[] = [];

  //TODO: implement functions
  override extract(videoUrl: string): Promise<IVideo[]> {
    throw new Error('Method not implemented.');
  }
}

export default GogoCDN;
