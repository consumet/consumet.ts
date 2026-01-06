import { load } from 'cheerio';
import {
  MangaParser,
  ISearch,
  IMangaInfo,
  IMangaResult,
  IMangaChapterPage,
  IMangaChapter,
  MediaStatus,
} from '../../models';

class MangaKakalot extends MangaParser {
  override readonly name = 'MangaKakalot';
  protected override baseUrl = 'https://www.mangakakalot.gg';
  protected override logo = 'https://www.mangakakalot.gg/favicon.ico';
  protected override classPath = 'MANGA.MangaKakalot';

  // Cookie jar for Cloudflare bypass
  private cookieJar: { [domain: string]: { [name: string]: string } } = {};
  private cookieTimestamps: { [domain: string]: { [name: string]: number } } = {};
  private warmedUp: { [domain: string]: number } = {};
  private readonly COOKIE_MAX_AGE = 15 * 60 * 1000;
  private readonly WARMUP_MAX_AGE = 5 * 60 * 1000;
  private currentUA = 0;

  private readonly userAgents = [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  ];

  private getRotatedUA(): string {
    this.currentUA = (this.currentUA + 1) % this.userAgents.length;
    return this.userAgents[this.currentUA];
  }

  private extractCookies(headers: any, domain: string): void {
    const setCookieHeaders = headers['set-cookie'] || [];
    const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    cookies.forEach((cookie: string) => {
      if (!cookie) return;
      const parts = cookie.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();

      if (!this.cookieJar[domain]) this.cookieJar[domain] = {};
      if (!this.cookieTimestamps[domain]) this.cookieTimestamps[domain] = {};

      this.cookieJar[domain][name] = value;
      this.cookieTimestamps[domain][name] = Date.now();
    });
  }

  private cleanExpiredCookies(domain: string): void {
    if (!this.cookieJar[domain]) return;

    const now = Date.now();
    Object.keys(this.cookieJar[domain]).forEach(name => {
      const timestamp = this.cookieTimestamps[domain]?.[name] || 0;
      if (now - timestamp > this.COOKIE_MAX_AGE) {
        delete this.cookieJar[domain][name];
        delete this.cookieTimestamps[domain][name];
      }
    });
  }

  private buildCookieHeader(domain: string): string {
    const domainCookies = this.cookieJar[domain] || {};
    return Object.entries(domainCookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  private isCloudflareChallenge(response: any): boolean {
    const html = typeof response.data === 'string' ? response.data : '';
    return (
      response.status === 403 ||
      response.status === 503 ||
      html.includes('cf-challenge') ||
      html.includes('cf-browser-verification') ||
      html.includes('Checking your browser') ||
      html.includes('Just a moment')
    );
  }

  private buildHeaders(url: string, isJson = false, referer?: string): Record<string, string> {
    const userAgent = this.userAgents[this.currentUA];
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    const headers: Record<string, string> = {
      'User-Agent': userAgent,
      'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
      'Sec-Fetch-Mode': isJson ? 'cors' : 'navigate',
      'Sec-Fetch-Dest': isJson ? 'empty' : 'document',
      'Cache-Control': 'max-age=0',
      Referer: referer || parsedUrl.origin,
    };

    if (!referer) {
      headers['Sec-Fetch-User'] = '?1';
    }

    if (isJson) {
      headers['Accept'] = 'application/json, text/javascript, */*; q=0.01';
      headers['X-Requested-With'] = 'XMLHttpRequest';
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    } else {
      headers['Accept'] =
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';
    }

    const cookieHeader = this.buildCookieHeader(domain);
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    return headers;
  }

  private async warmupDomain(force = false): Promise<boolean> {
    const domain = new URL(this.baseUrl).hostname;
    this.cleanExpiredCookies(domain);

    if (!force && this.warmedUp[domain] && Date.now() - this.warmedUp[domain] < this.WARMUP_MAX_AGE) {
      return true;
    }

    try {
      const homeResponse = await this.client.get(this.baseUrl, {
        headers: this.buildHeaders(this.baseUrl),
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      this.extractCookies(homeResponse.headers, domain);
      await this.delay(1500);

      try {
        const listResponse = await this.client.get(`${this.baseUrl}/manga-list`, {
          headers: this.buildHeaders(`${this.baseUrl}/manga-list`, false, this.baseUrl),
          timeout: 30000,
          maxRedirects: 5,
          validateStatus: () => true,
        });
        this.extractCookies(listResponse.headers, domain);
        await this.delay(800);
      } catch {
        // Ignore warmup list errors
      }

      this.warmedUp[domain] = Date.now();
      return true;
    } catch (error) {
      console.error(`[MangaKakalot] Warmup failed:`, (error as Error).message);
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async proxyRequest(
    url: string,
    options: { isJson?: boolean; maxRetries?: number; retryDelay?: number } = {}
  ): Promise<any> {
    const domain = new URL(url).hostname;
    const isJson = url.includes('/json') || url.includes('/api/') || options.isJson;
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 2000;

    await this.warmupDomain();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.get(url, {
          headers: this.buildHeaders(url, isJson, this.baseUrl),
          timeout: 30000,
          maxRedirects: 5,
          validateStatus: () => true,
        });

        this.extractCookies(response.headers, domain);

        if (this.isCloudflareChallenge(response)) {
          if (attempt < maxRetries) {
            this.cookieJar[domain] = {};
            this.getRotatedUA();
            await this.warmupDomain(true);
            await this.delay(retryDelay);
            continue;
          } else {
            throw new Error('Cloudflare challenge persists after all retries');
          }
        }

        if (response.status >= 200 && response.status < 300) {
          return response;
        }

        if (response.status >= 400) {
          if (attempt < maxRetries) {
            await this.delay(retryDelay);
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        await this.delay(retryDelay);
      }
    }
  }

  /**
   * Search for manga
   * @param query Search query
   * @param page Page number (default: 1)
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IMangaResult>> => {
    try {
      const searchQuery = query.replace(/-/g, '_');
      const url = `${this.baseUrl}/search/story/${encodeURIComponent(searchQuery)}?page=${page}`;

      const response = await this.proxyRequest(url);
      const $ = load(response.data);

      const results: IMangaResult[] = [];

      $('.panel_story_list .story_item').each((_, el) => {
        const target = $(el);
        const href = target.find('a').first().attr('href') || '';
        const pathParts = href.split('/').filter(Boolean);
        const mangaId = pathParts[pathParts.length - 1];
        const title = target.find('h3 a').text().trim();
        const image = target.find('a:first img').attr('src') || '';

        if (mangaId && title) {
          results.push({
            id: mangaId,
            title: title,
            image: image,
            headerForImage: { Referer: this.baseUrl },
          });
        }
      });

      // Check for next page
      const lastPageText = $('.panel_page_number .group_page .page_last').text();
      const totalPagesMatch = lastPageText.match(/Last\((\d+)\)/);
      const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1]) : 1;

      return {
        currentPage: page,
        hasNextPage: page < totalPages,
        totalPages: totalPages,
        results: results,
      };
    } catch (err) {
      throw new Error(`[MangaKakalot] Search failed: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch manga info including chapters
   * @param mangaId Manga ID from search results
   */
  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const url = `${this.baseUrl}/manga/${mangaId}`;
      const response = await this.proxyRequest(url);
      const $ = load(response.data);

      const target = $('.manga-info-top');

      const title = target.find('.manga-info-text li:eq(0) h1').text().trim();
      const image = target.find('.manga-info-pic img').attr('src') || '';
      const author = target.find('.manga-info-text li:eq(1) a').text().trim();
      const statusText = target.find('.manga-info-text li:eq(2)').text().split(':')[1]?.trim() || '';
      const description = $('#noidungm').text().trim();
      const genresText = target.find('.manga-info-text li:eq(6)').text().split(':')[1]?.trim() || '';
      const genres = genresText
        .split(',')
        .map(g => g.trim())
        .filter(g => g);

      let status: MediaStatus;
      switch (statusText.toLowerCase()) {
        case 'ongoing':
          status = MediaStatus.ONGOING;
          break;
        case 'completed':
          status = MediaStatus.COMPLETED;
          break;
        default:
          status = MediaStatus.UNKNOWN;
      }

      // Parse chapters
      const chapters: IMangaChapter[] = [];

      $('.row').each((_, el) => {
        const target = $(el);
        const link = target.find('span a');

        if (link.length === 0) return;

        const fullPath = link.attr('href') || '';
        const pathParts = fullPath.split('/').filter(Boolean);
        const chapterId = pathParts[pathParts.length - 1];
        const chapterName = link.text().trim();
        const views = target.find('span:eq(1)').text().trim();
        const releaseDate = target.find('span:eq(2)').text().trim();

        if (chapterId) {
          chapters.push({
            id: `${mangaId}/${chapterId}`,
            title: chapterName,
            views: views,
            releaseDate: releaseDate,
          });
        }
      });

      const mangaInfo: IMangaInfo = {
        id: mangaId,
        title: title,
        image: image,
        headerForImage: { Referer: this.baseUrl },
        authors: author ? [author] : [],
        status: status,
        genres: genres,
        description: description,
        chapters: chapters,
      };

      return mangaInfo;
    } catch (err) {
      throw new Error(`[MangaKakalot] fetchMangaInfo failed: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch chapter pages (images)
   * @param chapterId Chapter ID in format "mangaId/chapterId"
   */
  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const url = `${this.baseUrl}/manga/${chapterId}`;
      const response = await this.proxyRequest(url);
      const $ = load(response.data);

      const pages: IMangaChapterPage[] = [];

      $('.container-chapter-reader > img').each((index, el) => {
        const src = $(el).attr('src');
        if (!src) return;

        const title = $(el).attr('title') || $(el).attr('alt') || '';

        pages.push({
          img: src,
          page: index + 1,
          title: title,
          headerForImage: { Referer: this.baseUrl },
        });
      });

      return pages;
    } catch (err) {
      throw new Error(`[MangaKakalot] fetchChapterPages failed: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch latest manga updates
   * @param page Page number (default: 1)
   */
  fetchLatestUpdates = async (page: number = 1): Promise<ISearch<IMangaResult>> => {
    try {
      const url = `${this.baseUrl}/manga-list/latest-manga?page=${page}`;
      const response = await this.proxyRequest(url);
      const $ = load(response.data);

      const results: IMangaResult[] = [];

      $('.list-comic-item-wrap').each((_, el) => {
        const target = $(el);
        const href =
          target.find('a.list-story-item').attr('href') || target.find('a:first').attr('href') || '';
        const pathParts = href.split('/').filter(Boolean);
        const mangaId = pathParts[pathParts.length - 1];
        const image =
          target.find('a.list-story-item img').attr('data-src') ||
          target.find('a.list-story-item img').attr('src') ||
          target.find('a:first img').attr('src') ||
          '';
        const title = target.find('h3 a').text().trim();
        const latestChapter = target.find('a.list-story-item-wrap-chapter').text().trim();
        const views = target.find('.aye_icon').text().trim();
        const description = target.find('p').text().replace('More.\n', ' ... \n').trim();

        if (mangaId && title) {
          results.push({
            id: mangaId,
            title: title,
            image: image,
            headerForImage: { Referer: this.baseUrl },
            latestChapter: latestChapter,
            views: views,
            description: description,
          });
        }
      });

      // Parse pagination
      const lastPageText = $('.panel_page_number .group_page .page_last').text();
      const totalPagesMatch = lastPageText.match(/Last\((\d+)\)/);
      const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1]) : 1;

      return {
        currentPage: page,
        hasNextPage: page < totalPages,
        totalPages: totalPages,
        results: results,
      };
    } catch (err) {
      throw new Error(`[MangaKakalot] fetchLatestUpdates failed: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch manga by genre
   * @param genre Genre slug (e.g., "action", "romance")
   * @param page Page number (default: 1)
   */
  fetchByGenre = async (genre: string, page: number = 1): Promise<ISearch<IMangaResult>> => {
    try {
      const url = `${this.baseUrl}/genre/${genre}?page=${page}`;
      const response = await this.proxyRequest(url);
      const $ = load(response.data);

      const results: IMangaResult[] = [];

      $('.list-comic-item-wrap').each((_, el) => {
        const target = $(el);
        const href =
          target.find('a.list-story-item').attr('href') || target.find('a:first').attr('href') || '';
        const pathParts = href.split('/').filter(Boolean);
        const mangaId = pathParts[pathParts.length - 1];
        const image =
          target.find('a.list-story-item img').attr('data-src') ||
          target.find('a.list-story-item img').attr('src') ||
          target.find('a:first img').attr('src') ||
          '';
        const title = target.find('h3 a').text().trim();
        const latestChapter = target.find('a.list-story-item-wrap-chapter').text().trim();

        if (mangaId && title) {
          results.push({
            id: mangaId,
            title: title,
            image: image,
            headerForImage: { Referer: this.baseUrl },
            latestChapter: latestChapter || undefined,
          });
        }
      });

      const lastPageText = $('.panel_page_number .group_page .page_last').text();
      const totalPagesMatch = lastPageText.match(/Last\((\d+)\)/);
      const totalPages = totalPagesMatch ? parseInt(totalPagesMatch[1]) : 1;

      return {
        currentPage: page,
        hasNextPage: page < totalPages,
        totalPages: totalPages,
        results: results,
      };
    } catch (err) {
      throw new Error(`[MangaKakalot] fetchByGenre failed: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch suggestions (autocomplete)
   * @param query Search term
   */
  fetchSuggestions = async (query: string): Promise<IMangaResult[]> => {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const url = `${this.baseUrl}/home/search/json?searchword=${encodeURIComponent(query)}`;
      const response = await this.proxyRequest(url, { isJson: true });

      const items = Array.isArray(response.data) ? response.data : [];

      return items
        .slice(0, 10)
        .map((item: any) => ({
          id: item.slug || item.alias || '',
          title: (item.name || item.title || '').trim(),
          image: item.thumb || item.image || item.cover || '',
          headerForImage: { Referer: this.baseUrl },
          author: item.author || undefined,
          latestChapter: item.chapterLatest || undefined,
        }))
        .filter((s: IMangaResult) => s.id && s.title);
    } catch (err) {
      throw new Error(`[MangaKakalot] fetchSuggestions failed: ${(err as Error).message}`);
    }
  };
}

export default MangaKakalot;
