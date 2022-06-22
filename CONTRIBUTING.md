# Contributing

This guide is for the people who are interested in contributing to Consumet Extensions. It is not a complete guide yet, but it should help you get started. If you have any questions or any suggestions, please open a [issue](https://github.com/consumet/extensions/issues/new?assignees=&labels=Bug&template=bug-report.yml&title=%5BBug%5D%3A+) or join the [discord server](https://discord.gg/qTPfvMxzNH).

### Prerequisites
To contribute to Consumet code, you need to have knowledge of the following technologies.
   - [Nodejs](https://nodejs.org/)
   - [TypeScript](https://www.typescriptlang.org/)
   - Web scraping
       - [Cheerio](https://cheerio.js.org/)
       - [Axios](https://axios-http.com/docs/example)
       - [Css Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
       - [DevTools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools)

#### Cloning the repository
1. Clone the repository.
```bash
git clone https://github.com/consumet/extensions.git
```
1. Install dependencies. **Using Yarn**.
```bash
yarn install
```
3. create a new branch using the name of the provider (source) you want to add.
```bash
git checkout -b <provider-name>
```

### Writing a provider
Each provider is a class that extends abstract class. For example, `Libgen` provider extends `BooksParser` class, and `Gogoanime` extends `AnimeParser`. the parser abstract classes can be found in the `src/models/` folder as follows:
```bash
src/models/anime-parser.ts # AnimeParser
src/models/book-parser.ts  # BookParser
src/models/lightnovel-parser.ts  # LightNovelParser
src/models/comic-parser.ts # ComicParser
src/models/manga-parser.ts # MangaParser
```
You are welcome to add anything to the abstract class that you believe will be beneficial.

#### visualization of the abstract classes hierarchy

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
      class BaseParser{
         +search(String query)
      }
      class AnimeParser{
         +fetchAnimeInfo(String animeId)
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


#### Project structure
***\<category>*** is the category of the provider. For example, `anime` or `book`, `etc`.\
***\<provider-name>*** is the name of the provider. For example, `libgen` or `gogoanime`, `etc`. (must be in camel case)


```bash
> tree src/
src/
├── index.ts
├── providers
│   ├── <category>
│   │   ├── index.ts
│   │   └── <provider-name>.ts
│   └── <category>
└── utils
```
#### Setting up the provider
1. Create a new file in the `src/providers/<category>/<provider-name>.ts` folder.
2. Import the abstract class from the `src/models/<category>-parser.ts` file. if you are writing an anime provider, you would need to implement the abstract class `AnimeParser`, which is defined in the `src/models/anime-parser.ts` file.
3. Start writing your provider code.
4. Add the provider to the `src/providers/<category>/index.ts` file.
5. Make a [Pull Request](https://github.com/consumet/extensions/pulls) of the changes.