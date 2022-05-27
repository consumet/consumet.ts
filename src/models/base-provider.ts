import { IProviderStats } from '.';

abstract class BaseProvider {
  /**
   * Name of the provider
   */
  abstract readonly name: string;
  /**
   * The main URL of the provider
   */
  protected abstract readonly baseUrl: string;
  /**
   * Most providers are english based, but if the provider is not english based override this value
   */
  protected readonly languages: string[] | string = 'en';

  /**
   * override as `true` if the provider **only** supports NSFW content
   */
  readonly isNSFW: boolean = false;

  /**
   * returns provider stats
   */
  get toString(): IProviderStats {
    return {
      name: this.name,
      baseUrl: this.baseUrl,
      lang: this.languages,
      isNSFW: this.isNSFW,
    };
  }
}

export default BaseProvider;
