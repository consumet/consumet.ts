<h1 align="center">Consumet Extensions</h1>

<h2>BOOKS</h2>

`BOOKS` is a category provider, which provides a list of anime providers. Each anime provider must be a subclass of the [`BookParser`](https://github.com/consumet/extensions/blob/master/src/models/book-parsers.ts) class.

By using `BOOKS` category you can interact with the book providers. And have access to the book providers methods.

```ts
// ESM
import { BOOKS } from '@consumet/extensions';

// <providerName> is the name of the provider you want to use. list of the proivders is below.
const bookProvider = BOOKS.<providerName>();
```

## Book Providers List
This list is in alphabetical order. (except the sub bullet points)

- [Libgen](../providers/libgen.md)
- [zLibrary](../providers/zlibrary.md)

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs">back to table of contents</a>)</p>