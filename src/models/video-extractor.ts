import { IVideo, ISource, ISubtitle, ProxyConfig } from '.';
import Proxy from '../models/proxy';
import { AxiosAdapter } from "axios";

abstract class VideoExtractor extends Proxy.Extractor {
  constructor(proxyConfig?: ProxyConfig, adapter?: AxiosAdapter) {
    super(proxyConfig, adapter);
  }

  /**
   * The server name of the video provider
   */
  protected abstract serverName: string;

  /**
   * list of videos available
   */
  protected abstract sources: IVideo[];

  /**
   * takes video link
   *
   * returns video sources (video links) available
   */
  protected abstract extract(videoUrl: URL, ...args: any): Promise<IVideo[] | ISource>;
}

export default VideoExtractor;
