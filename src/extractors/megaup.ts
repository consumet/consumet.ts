import { ISource, IVideo, VideoExtractor } from '../models';
import { AxiosAdapter } from 'axios';
import { ProxyConfig } from '../models/types';

export class MegaUp extends VideoExtractor {
  protected serverName: string = 'MegaUp';
  protected sources: IVideo[] = [];
  private KAICODEX: any = {}; // Disabled KAICODEX
  private kaicodexReady: Promise<void>;

  constructor(protected proxyConfig?: ProxyConfig, protected adapter?: AxiosAdapter) {
    super(proxyConfig, adapter);
    this.kaicodexReady = this.loadKAICODEX();
  }

  private async loadKAICODEX(): Promise<void> {
    return; // Disabled loading KAICODEX
  }

  GenerateToken = (n: string) => {
    return ''; // Disabled encoding function
  };

  DecodeIframeData = (n: string) => {
    return ''; // Disabled decoding function
  };

  Decode = (n: string) => {
    return ''; // Disabled decoding function
  };

  override extract = async (videoUrl: URL): Promise<ISource> => {
    try {
      await this.kaicodexReady;

      const url = videoUrl.href.replace(/\/(e|e2)\//, '/media/');
      const res = await this.client.get(url);

      // Since KAICODEX is disabled, the decryption step is skipped
      const data: ISource = {
        sources: [], // No sources extracted
        subtitles: [], // No subtitles extracted
        download: '',
      };
      return data;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };
}