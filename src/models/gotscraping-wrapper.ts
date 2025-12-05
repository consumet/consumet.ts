// gotscraping-wrapper.ts
// Async import wrapper for ESM-only got-scraping module

import type { Response } from 'got';

interface HeaderGeneratorOptions {
  browsers?: Array<{ name: string; minVersion?: number; maxVersion?: number }>;
  devices?: string[];
  locales?: string[];
  operatingSystems?: string[];
}

interface GotScrapingOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  headerGeneratorOptions?: HeaderGeneratorOptions;
  responseType?: 'text' | 'json' | 'buffer';
  [key: string]: unknown;
}

type GotScrapingModule = {
  gotScraping: (options: GotScrapingOptions) => Promise<Response<string>>;
};

let gotScrapingFn: ((options: GotScrapingOptions) => Promise<Response<string>>) | null = null;

async function getGotScraping(): Promise<(options: GotScrapingOptions) => Promise<Response<string>>> {
  if (!gotScrapingFn) {
    const importedModule = (await import('got-scraping')) as GotScrapingModule;
    gotScrapingFn = importedModule.gotScraping;
  }
  return gotScrapingFn;
}

export async function makeRequest(options: GotScrapingOptions): Promise<Response<string>> {
  const got = await getGotScraping();
  return got(options);
}

const wrapper = { makeRequest };
export default wrapper;
