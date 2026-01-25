import axios, { AxiosError } from 'axios';
import { IMangaChapterPage, IMangaInfo, IMangaResult, ISearch, MangaParser, MediaStatus } from '../../models';
import { load } from 'cheerio';

class Comix extends MangaParser {
  override readonly name = 'Comix';
  protected override baseUrl = 'https://comix.to';
  protected override classPath = 'MANGA.Comix';

  private readonly apiUrl = 'https://comick.art/api';
  public referer = 'https://comix.to';

  private baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Sec-GPC': '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    Priority: 'u=0, i',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
  };

  /**
   * @description Fetches info about the manga
   * @param mangaId just the id
   * @returns Promise<IMangaInfo>
   */
  override fetchMangaInfo = async (mangaId: string): Promise<IMangaInfo> => {
    try {
      const { data } = await axios.get(`${this.baseUrl}/title/${mangaId}`, {
        headers: this.baseHeaders,
      });

      const $ = load(data);

      let extractedData: any = null;

      $('script').each((_, el) => {
        const content = $(el).html() || '';
        const pushMatches = Array.from(content.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g));

        for (const match of pushMatches) {
          let payloadString = match[1];
          try {
            const unescaped = JSON.parse(`"${payloadString}"`);

            if (unescaped.startsWith('d:')) {
              const jsonPart = unescaped.substring(2);
              const data = JSON.parse(jsonPart);

              if (Array.isArray(data)) {
                for (const item of data) {
                  if (item && typeof item === 'object') {
                    if (item.manga) {
                      extractedData = item.manga;
                      if (item.scanlationGroups) extractedData.scanlationGroups = item.scanlationGroups;
                    }
                  }
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      });

      if (!extractedData) {
        throw new Error('Failed to extract manga data');
      }

      const mangaInfo: IMangaInfo = {
        id: mangaId,
        title: extractedData.title,
        altTitles: extractedData.alt_titles,
        description: extractedData.synopsis,
        genres: extractedData.genre?.map((g: any) => g.title) || [],
        status:
          extractedData.status?.toLowerCase() === 'releasing' ? MediaStatus.ONGOING : MediaStatus.COMPLETED,
        rating: extractedData.rated_avg,
        views: extractedData.follows_total,
        image: extractedData.poster?.large,
        authors: extractedData.author?.map((a: any) => a.title) || [],
        artist: extractedData.artist?.map((a: any) => a.title) || [],
      };

      return mangaInfo;
    } catch (err) {
      if ((err as AxiosError).code == 'ERR_BAD_REQUEST')
        throw new Error(`[${this.name}] Bad request. Make sure you have entered a valid query.`);

      throw new Error((err as Error).message);
    }
  };

  async fetchChapters(hid: string, page?: number): Promise<{ chapters: any[]; pagination: any }> {
    const chapters: any[] = [];
    let currentPage = page || 1;
    let hasNextPage = true;
    let pagination: any = undefined;

    // If page is provided, we only fetch that page.
    // If not provided, we loop.
    const loop = !page;

    while (hasNextPage) {
      try {
        const { data } = await axios.get(`${this.baseUrl}/api/v2/manga/${hid}/chapters`, {
          params: {
            limit: 100, // fetching more at once
            page: currentPage,
            'order[number]': 'desc',
          },
          headers: this.baseHeaders,
        });

        if (data.result && data.result.items) {
          data.result.items.forEach((item: any) => {
            chapters.push({
              id: item.chapter_id.toString(), // Using chapter_id as key
              title: item.name || `Chapter ${item.number}`,
              number: item.number,
              releaseDate: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
              isOfficial: item.is_official === 1,
              scanlationGroup: item.scanlation_group?.name,
            });
          });

          pagination = data.result.pagination;

          if (loop && pagination && pagination.current_page < pagination.last_page) {
            currentPage++;
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
      } catch (e) {
        console.error('Error fetching chapters page', currentPage, e);
        hasNextPage = false;
      }
    }
    return { chapters, pagination };
  }

  /**
   *
   * @param chapterId Chapter ID '{hashid-slug}/{chapterid}'
   * @returns Promise<IMangaChapterPage[]>
   */
  override fetchChapterPages = async (chapterId: string): Promise<IMangaChapterPage[]> => {
    try {
      const { data } = await axios.get(`${this.baseUrl}/title/${chapterId}`, {
        headers: this.baseHeaders,
      });

      const $ = load(data);

      let images: any[] = [];

      $('script').each((_, el) => {
        const content = $(el).html() || '';
        const pushMatches = Array.from(content.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g));

        for (const match of pushMatches) {
          let payloadString = match[1];
          try {
            const unescaped = JSON.parse(`"${payloadString}"`);

            if (unescaped.startsWith('d:')) {
              const jsonPart = unescaped.substring(2);
              const data = JSON.parse(jsonPart);

              if (Array.isArray(data)) {
                for (const item of data) {
                  if (item && typeof item === 'object') {
                    // Check for chapter data with images
                    if (item.chapter && Array.isArray(item.chapter.images)) {
                      images = item.chapter.images;
                    }
                  }
                }
              }
            }
          } catch (e) {
            // ignore
          }
        }
      });

      if (images.length === 0) {
        throw new Error('Failed to extract chapter images');
      }

      return images.map((image: { url: string }, index: number) => ({
        img: image.url,
        page: index,
        headersForUrl: this.baseUrl,
      }));
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  /**
   * @param query search query
   * @param page page number (default: 1)
   * @param limit limit of results to return (default: 20) (max: 100) (min: 1)
   */
  override search = async (query: string, page?: number): Promise<Search<IMangaResult>> => {
    try {
      const { data } = await axios.get(`${this.baseUrl}/api/v2/manga`, {
        params: {
          'order[relevance]': 'desc',
          keyword: query,
          genres_mode: 'or',
          limit: 28,
          page: page,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
          Accept: '*/*',
          Referer: `${this.baseUrl}/browser?keyword=${encodeURIComponent(
            query
          )}&order=relevance%3Adesc&genres_mode=or`,
          'Content-Type': 'application/json',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          Connection: 'keep-alive',
        },
      });

      const results: Search<IMangaResult> = {
        results: [],
      };

      if (data.result && data.result.items) {
        data.result.items.forEach((item: any) => {
          results.results.push({
            id: item.slug,
            title: item.title,
            altTitles: item.alt_titles || [],
            image: item.poster?.large,
            description: item.synopsis,
            status: item.status === 'releasing' ? MediaStatus.ONGOING : MediaStatus.COMPLETED,
            rating: item.rated_avg,
            views: item.follows_total,
          });
        });

        if (data.result.pagination) {
          results.pagination = data.result.pagination;
        }
      }

      return results;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };
}

//IIFE
// (async () => {
// const comix = new Comix();
// const search = await comix.search('solo leveling');
// console.log(search)
// const manga = await comix.fetchMangaInfo("rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior");
// console.log(manga)
// const { chapters, pagination } = await comix.fetchChapters("rm2xv", 1);
// console.log(chapters, pagination);
// const pages = await comix.fetchChapterPages("rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior/7304879-chapter-44");
// console.log(pages);
// })();

export default Comix;

interface Search<T> {
  results: T[];
  pagination?: any;
}
