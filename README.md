<p align="center"><img src="https://raw.githubusercontent.com/consumet/extensions/5c3bc399fd12ebdaa915dc69b7bdf82cbdf4201c/assets/images/consumetlogo.png" width="175"/></p>

<h1 align="center"> Consumet Extensions </h1>

Consumet Extensions is a Node library which provides high-level APIs to get information about several entertainment mediums like books, movies, comics, anime, manga, etc.

<p align="center">
  <a href="https://www.npmjs.com/package/@consumet/extensions">
    <img src="https://img.shields.io/npm/v/@consumet/extensions" alt="npm (scoped)">
  </a>
  <a href="https://github.com/consumet/extensions/actions?query=workflow%3A%2Node.js+CI%22">
    <img src="https://img.shields.io/github/workflow/status/consumet/extensions/Node.js%20CI/master" alt="GitHub Workflow Status (branch)">
  </a>
    <a href="https://discord.gg/qTPfvMxzNH">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="Prs are welcome">
  </a>
    <a href="https://github.com/consumet/extensions/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/consumet/extensions" alt="GitHub">
  </a>
  <a href="https://discord.gg/qTPfvMxzNH">
    <img src="https://img.shields.io/discord/987492554486452315.svg?label=discord&labelColor=7289da&color=2c2f33" alt="Discord">
  </a>
</p>

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Quick Start](#quick-start)
  - [Installation](#installation)
  - [Usage](#usage)
- [Documentation](#documentation)
- [Ecosystem](#ecosystem)
- [Provider Request](#provider-request)
- [Contributing](#contributing)
- [Support](#support)
- [Contributors](#contributors)
- [License](#license)

## Quick Start

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

// Create a new instance of the Libgen provider
const books = new BOOKS.Libgen();
// Search for a book. In this case, "Pride and Prejudice"
const data = books.search('pride and prejudice').then(data => {
  // print results
  console.log(data)
})
```

**Exmaple** - searching for anime using the gogoanime provider.
```ts
import { ANIME } from "@consumet/extensions"

// Create a new instance of the Gogoanime provider
const gogoanime = new ANIME.Gogoanime();
// Search for an anime. In this case, "One Piece"
const results = gogoanime.search("One Piece").then(data => {
  // print results
  console.log(data);
})
```

Do you want to know more? Head to the [`Getting Started`](https://github.com/consumet/extensions/tree/master/docs/guides/getting-started.md).

## Documentation
- [`Getting Started`](./docs/guides/getting-started.md)
- [`Guides`](https://github.com/consumet/extensions/tree/master/docs)
- [`Anime`](./docs/guides/anime.md)
- [`Manga`](./docs/guides/manga.md)
- [`Books`](./docs/guides/books.md)
- [`Movies`](./docs/guides/movies.md)
- [`Light Novels`](./docs/guides/light-novels.md)
- [`Comics`](./docs/guides/comics.md)
- [`Meta`](./docs/guides/meta.md)

## Ecosystem
- [Rest-API Reference](https://docs.consumet.org/) - public rest api documentation
- [Examples](https://github.com/consumet/extentions/tree/master/examples) - examples of using Consumet Extensions.
- [Provider Status](https://github.com/consumet/providers-status/blob/main/README.md) - A list of providers and their status.
- [Changelog](https://github.com/consumet/extensions/blob/master/CHANGELOG.md) - See the latest changes.
- [Discord Server](https://discord.gg/qTPfvMxzNH) - Join our discord server and chat with the maintainers.

## Provider Request
Make a new [issue](https://github.com/consumet/extensions/issues/new?assignees=&labels=provider+request&template=provider-request.yml) with the name of the provider on the title, as well as a link to the provider in the body paragraph.

## Contributing
Check out [contributing guide](https://github.com/consumet/extensions/blob/master/docs/guides/contributing.md) to get an overview of Consumet Extensions development.

## Support
Please join the [discord server](https://discord.gg/qTPfvMxzNH) to ask questions, get help, or report issues.

## Contributors
Thanks to the following people who have contributed to this repo:

[![](https://avatars.githubusercontent.com/u/57333995?s=50)](https://github.com/riimuru) [![](https://avatars.githubusercontent.com/u/80477926?s=50)](https://github.com/prince-ao)

## License
Licensed under [MIT](./LICENSE).
