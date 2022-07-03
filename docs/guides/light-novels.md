<h1 align="center">Consumet Extensions</h1>

<h2>LIGHT_NOVELS</h2>

`LIGHT_NOVELS` is a category provider, which provides a list of light novels providers. Each light novel provider must be a subclass of the [`LightNovelParser`](https://github.com/consumet/extensions/blob/master/src/models/lightnovel-parser.ts) class.

By using `LIGHT_NOVELS` category you can interact with the light novel providers. And have access to the light novel providers methods.

```ts
// ESM
import { LIGHT_NOVELS } from '@consumet/extensions';

// <providerName> is the name of the provider you want to use. list of the proivders is below.
const lightnovelProvider = LIGHT_NOVELS.<providerName>();
```


## Light Novels Providers List
This list is in alphabetical order. (except the sub bullet points)

- [ReadLightNovels](../providers/readlightnovels.md)
  - [search](../providers/readlightnovels.md#search)
  - [fetchLightNovelInfo](../providers/readlightnovels.md#fetchlightnovelinfo)
  - [fetchChapterContent](../providers/readlightnovels.md#fetchchaptercontent)


<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>