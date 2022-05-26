import { Video } from '.';

abstract class VideoExtractor {
  /**
   * The server name of the video provider
   */
  protected abstract serverName: string;
  /**
   * list of videos available
   */
  protected abstract sources: Video[];

  /**
   * takes video link
   *
   * returns video sources (video links) available
   */
  protected abstract extract(videoUrl: string, ...args: any): Promise<Video[]>;
}

export default VideoExtractor;
