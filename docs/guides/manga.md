<h1 align="center">Consumet Extensions</h1>

<h2>MANGA</h2>

`MANGA` is a category provider, which provides a list of manga providers. Each manga provider must be a subclass of the [`MangaParser`](https://github.com/consumet/extensions/blob/master/src/models/manga-parser.ts) class.

By using `MANGA` category you can interact with the manga providers. And have access to the manga providers methods.

```ts
// ESM
import { MANGA } from '@consumet/extensions';

// <providerName> is the name of the provider you want to use. list of the proivders is below.
const mangaProvider = MANGA.<providerName>();
```

## Manga Providers List
This list is in alphabetical order. (except the sub bullet points)

- [MangaDex](../providers/mangadex.md)
  - [search](../providers/mangadex.md#search)
  - [fetchMangaInfo](../providers/mangadex.md#fetchmangainfo)
  - [fetchChapterPages](../providers/mangadex.md#fetchchapterpages)


<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>