<h1>Contributing</h1>

This guide is for the people who are interested in contributing to consumet.ts. It is not a complete guide yet, but it should help you get started. If you have any questions or any suggestions, please open a [issue](https://github.com/consumet/extensions/issues/new?assignees=&labels=Bug&template=bug-report.yml) or join the [discord server](https://discord.gg/qTPfvMxzNH).

See our [informal contributing guide](./docs/guides/contributing.md) for more details on contributing to this project.

<h2>Table of Contents</h2>

- [Prerequisites](#prerequisites)
  - [Cloning the repository](#cloning-the-repository)
- [Writing a provider](#writing-a-provider)
    - [Project structure](#project-structure)
    - [Setting up the provider](#setting-up-the-provider)


## Prerequisites
To contribute to Consumet code, you need to know the following:
   - [Nodejs](https://nodejs.org/)
   - [TypeScript](https://www.typescriptlang.org/)
   - Web scraping
       - [Cheerio](https://cheerio.js.org/)
       - [Axios](https://axios-http.com/docs/example)
       - [Css Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
       - [DevTools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools)

### Cloning the repository
1. Clone the repository.
```bash
git clone https://github.com/consumet/extensions.git
```
2. Install dependencies. **Using Yarn**.
```bash
yarn install
```
3. create a new branch using the name of the provider (source) you want to add.
```bash
git checkout -b <provider-name> # or any name you find suitable
```

## Writing a provider
Each provider is a class that extends abstract class. For example, `Libgen` provider extends `BooksParser` class, and `Gogoanime` extends `AnimeParser`. the parser abstract classes can be found in the `src/models/` folder as follows:
```bash
src/models/anime-parser.ts # AnimeParser
src/models/book-parser.ts  # BookParser
src/models/lightnovel-parser.ts  # LightNovelParser
src/models/comic-parser.ts # ComicParser
src/models/manga-parser.ts # MangaParser
src/models/movie-parser.ts # MovieParser
```
You are welcome to add anything to the abstract class that you believe will be beneficial.

<details>
   <summary>
   visualization of the abstract classes hierarchy
   </summary>

   ```mermaid
   classDiagram
         ProviderBase <|-- BaseParser
         ProviderBase : +String name
         ProviderBase : +String baseUrl
         ProviderBase: +toString()
         BaseParser <|-- AnimeParser
         BaseParser <|-- BookParser
         BaseParser <|-- MangaParser
         BaseParser <|-- LightNovelParser
         BaseParser <|-- ComicParser
         BaseParser <|-- MovieParser
         class BaseParser{
            +search(String query)
         }
         class AnimeParser{
            +fetchAnimeInfo(String animeId)
            +fetchEpisodeSources(String episodeId)
            +fetchEpisodeServers(String episodeId)
         }
         class MovieParser{
            +fetchMediaInfo(String mediaId)
            +fetchEpisodeSources(String episodeId)
            +fetchEpisodeServers(String episodeId)
         }
         class BookParser{
            empty
         }
         class MangaParser{
            +fetchMangaInfo(String mangaId)
            +fetchChapterPages(String chapterId)
         }
         class ComicParser{
            empty
         }
         class LightNovelParser{
            +fetchLighNovelInfo(String lightNovelId)
            +fetchChapterContent(String chapterId)
         }
   ```
</details>


#### Project structure
***\<category>*** is the category of the provider. For example, `anime` or `book`, `etc`.\
***\<provider-name>*** is the name of the provider. For example, `libgen` or `gogoanime`, `etc`. (must be in camel case)


```bash
> tree src/
src/
├── index.ts
|── models
├── providers
│   ├── <category>
│   │   ├── index.ts
│   │   └── <provider-name>.ts
│   └── <category>
└── utils
```
#### Setting up the provider
1. Create a new file in the `src/providers/<category>/<provider-name>.ts` folder.
2. Import the abstract class from the `src/models/<category>-parser.ts` file. for example: if you are writing an anime provider, you would need to implement the abstract class `AnimeParser`, which is defined in the `src/models/anime-parser.ts` file. 
3. Start writing your provider code.
4. Add the provider to the `src/providers/<category>/index.ts` file.
5. Make a [Pull Request](https://github.com/consumet/extensions/pulls) of the changes.