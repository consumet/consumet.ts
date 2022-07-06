# Libgen

## Methods

```ts
/**
 * Scrapes a libgen search page by book query
 * 
 * @param {string} query - the name of the book
 * @param {number} [maxResults=25] - maximum number of results
 * @returns {Promise<LibgenBook[]>}
*/
Libgen.search("One Houndred Years of Solitude", 30);

/**
 * scrapes a ligen search page by book query
 * 
 * @remarks
 * this method is faster the, but doesn't scrape as much data as libgen.search()
 * 
 * @param {string} query - the name of the book
 * @param {number} [maxresults=25] - maximum number of results
 * @returns {Promise<LibgenBook[]>}
*/
Libgen.fastSearch("One Houndred Years of Solitude", 30);

/**
 * scrapes a ligen search page by page url
 * 
 * @param {string} bookUrl - ligen search url
 * @param {number} [maxresults=25] - maximum number of results
 * @returns {Promise<LibgenBook[]>}
*/
Libgen.scrapePage("http://libgen.rs/search.php?req=batman", 40);

/**
 * scrapes a ligen search page by page url
 * 
 * @remarks
 * this method is faster, but doesn't scrape as much data as libgen.search()
 * 
 * @param {string} bookUrl - ligen search url
 * @param {number} [maxresults=25] - maximum number of results
 * @returns {Promise<LibgenBook[]>}
*/
Libgen.fastScrapePage("http://libgen.rs/search.php?req=batman", 40);

/**
 * scrapes a ligen book page by book page url
 * 
 * @param {string} bookUrl - ligen book page url
 * @returns {Promise<LibgenBook>}
*/
Libgen.scrapeBook(
  "http://libgen.rs/book/index.php?md5=262BFA73B8090B6AA3DBD2FBCDC4B91D"
);
```

## Variables

```ts
/**
 * @type {string}
*/
Libgen.name; // the name of the provider.
/**
 * @type {boolean}
*/
Libgen.isNSFW; // if NSFW
/**
 * @type {boolean}
*/
Libgen.isWorking; // if provider is working
```