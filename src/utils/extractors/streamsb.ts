import { VideoExtractor, Video } from '../../models';

class StreamSB extends VideoExtractor {
  protected override serverName = 'streamsb';
  protected override sources: Video[] = [];

  //TODO: implement functions
  override extract(videoUrl: string): Promise<Video[]> {
    throw new Error('Method not implemented.');
  }
}

export default StreamSB;
