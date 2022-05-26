import { VideoExtractor, Video } from '../../models';

class Goload extends VideoExtractor {
  protected override serverName = 'goload';
  protected override sources: Video[] = [];

  //TODO: implement functions
  override extract(videoUrl: string): Promise<Video[]> {
    throw new Error('Method not implemented.');
  }
}

export default Goload;
