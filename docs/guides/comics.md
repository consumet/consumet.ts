<h1 align="center">Consumet Extensions</h1>

<h2>COMICS</h2>

`COMICS` is a category provider, which provides a list of anime providers. Each anime provider must be a subclass of the [`ComicParser`](https://github.com/consumet/extensions/blob/master/src/models/comic-parsers.ts) class.

By using `COMICS` category you can interact with the book providers. And have access to the comic providers methods.

```ts
// ESM
import { COMICS } from '@consumet/extensions';

// <providerName> is the name of the provider you want to use. list of the proivders is below.
const comicProvider = COMICS.<providerName>();
```

## Comic Providers List
This list is in alphabetical order. (except the sub bullet points)

- [GetComics](#todo)

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>