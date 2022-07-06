# Libgen

```ts
const zLibrary = new BOOKS.ZLibrary();
```

## Methods

```ts
/**
 * Scrapes a libgen search page by book query
 * 
 * @param {string} bookTitle - the name of the book
 * @param {number} [page=1] - maximum number of results
 * @returns {Promise<{containers: ZLibrary[], page: number}>}
*/
ZLibrary.search("One Houndred Years of Solitude", 30);
```

## Variables

```ts
/**
 * @type {string}
*/
ZLibrary.name; // the name of the provider.
/**
 * @type {boolean}
*/
ZLibrary.isNSFW; // if NSFW
/**
 * @type {boolean}
*/
Libgen.isWorking; // if provider is working
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/books.md#">back to book providers list</a>)</p>