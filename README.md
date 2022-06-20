# Consumet Extentions

Consumet Extensons is a Node library which provides high-level APIs to get information about several entertainment mediums like books, movies, comics, anime, manga, etc.

<p align="center">
<a href="https://www.npmjs.com/package/@consumet/extensions">
    <img src="https://img.shields.io/npm/v/@consumet/extensions?style=flat-square" alt="npm (scoped)">
  </a>
  <a href="https://github.com/consumet/extensions/actions?query=workflow%3A%2Node.js+CI%22">
    <img src="https://img.shields.io/github/workflow/status/consumet/extensions/Node.js%20CI/master?style=flat-square" alt="GitHub Workflow Status (branch)">
  </a>
    <a href="https://discord.gg/qTPfvMxzNH">
    <img src="https://img.shields.io/discord/987492554486452315.svg?label=discord&labelColor=7289da&color=2c2f33" alt="Discord">
  </a>
</p>

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
import { BOOKS } from "@consumet/extensions"


const main = async () => {
  const books = new BOOKS.Libgen();

  const data = await books.search('pride and prejudice');

  for (let v of data) {
    console.log(v.title);
  }
};

main();
```

**Exmaple** - searching for anime using the gogoanime provider.
```ts
import { ANIME } from "@consumet/extensions"

const main = async () => {
  const gogoanime = new ANIME.en.Gogoanime();

  const onePiece = await gogoanime.search("One Piece");

  console.log(onePience);
}
```

## Resources
* [API Documentation](https://github.com/consumet/extensions/tree/master/docs)
* [Examples](https://github.com/consumet/extentions/tree/master/examples)
* [Provider Status](https://github.com/consumet/providers-status/blob/main/README.md)
* [Changelog](https://github.com/consumet/extensions/blob/master/CHANGELOG.md)

## Provider Request
Make a new issue with the label `Provider Request`, And the name of the provider on the title, as well as a link to the provider in the body paragraph.

## Contributing to Consumet Extensions
Check out [contributing guide](https://consumet.org/docs/contributing/how-to-contribute/#contribute-to-code) to get an overview of Consumet Extensions development.