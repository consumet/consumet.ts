# Consumet Extentions

> Consumet Extensons is a Node library which provides high-level APIs to get information about several entertainment mediums like books, movies, comics, anime, manga, etc.

## Get Started

### Installation

To use Consumet Extensions in your project, run:
```bash
yarn add @consumet/extensions
# or "npm i @consumet/extensions"
```

### Usage

**Example** - searching for a book using the libgen provider.
```ts
import { BOOKS, COMICS } from "@consumet/extensions"

const book = new BOOKS.Libgen();

console.log(books.search("One Hundred Years of Solitude"));
```

## Resources
* [API Documentation](https://github.com/consumet/extentions/blob/master/docs/api.md)
* [Examples](https://github.com/consumet/extentions/tree/master/examples)
* [Provider Status](https://github.com/consumet/providers-status/blob/main/README.md)

## Source Request
Make a new issue with the label `Source Request` And the name of the source next to it, as well as a link to the source in the body paragraph.

## Contributing to Consumet Extensions
Check out [contributing guide](https://github.com/consumet/extentions/blob/master/CONTRIBUTING.md) to get an overview of Consumet Extensions development.