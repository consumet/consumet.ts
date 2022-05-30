# Consumet Extentions
to build the consumet extension privately you need to run the following command:
```
tsc
```
And then on the consumet repository run:
```
yarn add path/to/consumet-extension // find the path to the consumet-extension
```

```mermaid
classDiagram
      ProviderBase <|-- BaseParser
      ProviderBase : +String name
      ProviderBase : +String baseUrl
      ProviderBase: +toString()
      BaseParser <|-- AnimeParser
      BaseParser <|-- BookParser
      BaseParser <|-- MangaParser
      class BaseParser{
         +search(String url)
      }
      class AnimeParser{
         +fetchAnimeInfo(String animeUrl)
         +fetchEpisodeSources(String episodeUrl)
         +fetchEpisodeServers(String episodeUrl)
      }
      class BookParser{
         +fetchBookInfo(String bookUrl)
      }
            class MangaParser{
         +fetchMangaInfo(String mangaUrl)
      }

```
```mermaid
flowchart
    A(src)-->B(models)
    A-->C(providers);
    A-->D(utils);
    B-->base-parser.ts
    B-->anime-parser.ts
    B-->book-parser.ts
    B-->manga-parser.ts
    B-->view-extractor.ts
    B-->types.ts
    C-->H(anime)
    C-->I(books)
    C-->J(manga)
    C-->K(others)
    D-->E(extractors)
    E-->gogocdn.ts
    E-->streamsb.ts
    D-->utils.ts
    H-->F(all)
    H-->G(en)
    I-->L(all)
    I-->M(en)
    J-->N(all)
    J-->O(en)
    K-->P(all)
    K-->Q(en)
    G-->gogoanime.ts
    G-->9anime.ts
    L-->lebgen.ts
    

```

# Requests

# Contributing
