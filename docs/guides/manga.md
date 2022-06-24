<h1 align="center">Consumet Extensions</h1>

## MANGA
MANGA is a category provider, which provides a list of manga providers. Each manga provider is a subclass of the [`MangaParser`](https://github.com/consumet/extensions/blob/master/src/models/manga-parser.ts) class.

By using `MANGA` category you can interact with the manga providers. And have access to the manga providers methods.

in the examples below, we will use the `MangaDex` provider.
```ts
const mangadex = new MANGA.MangaDex();
```

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.

take a string as a parameter and return a list of manga. In this case, We're searching for `Tomodachi Game`

returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)
```ts
mangadex.search("Tomodachi Game").then(data => {
  console.log(data);
}
```
output:
```js
{
  currentPage: 1,
  results: [
    {
      id: 'b35f67b6-bfb9-4cbd-86f0-621f37e6cb41', // manga id
      title: 'Tomodachi Game',
      altTtitles: [
         { en: 'Friends Games' },
         { ja: 'トモダチゲーム' },
         {...},
         ...
      ],
      descitption: "Katagiri Yuichi believes that friends are more important than money, but he also knows the hardships of not having enough funds. He works hard to save up in ...',
      status: 'ongoing',
      releaseDate: 2013,
      contentRating: 'suggestive',
      lastVolume: null,
      lastChapter: null
    },
    {...}
    ...
  ]
}
```

### fetchMangaInfo
take an manga id as a parameter. (*manga id can be found in the manga search results*)

returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)
```ts
managdex.fetchMangaInfo("b35f67b6-bfb9-4cbd-86f0-621f37e6cb41").then(data => {
  console.log(data);
}
```
output:
```js
{
  id: 'b35f67b6-bfb9-4cbd-86f0-621f37e6cb41',
  title: 'Tomodachi Game',
  altTtitles: [
    { en: 'Friends Games' },
    { ja: 'トモダチゲーム' },
    {...},
    ...
  ],
  descitption: {
    en: "Katagiri Yuichi believes that friends are more important than money, but he also knows the hardships ...',
    pl: 'Dziękujemy za wpłatę dwudziestu milionów jenów! W ten sposób dołączyliście do jedynej w swoim rodzaju gry przyjaciół! Witajcie...",
    ...
  },
  genres: [ 'Psychological', 'Drama', '...' ],
  themes: [ 'Survival' ],
  status: 'Ongoing',
  releaseDate: 2013,
  chapters: [
    {
      id: 'a79255c8-21b5-4a8c-a586-48469fa87020',
      title: 'Accomplice',
      pages: 35
    },
    {
      id: '7633dee8-cd6d-4b6d-9335-1aec7646833e',
      title: "The Game's Origins",
      pages: 37
    },
    {...}
    ...
  ]
}
```

### fetchChapterPages
take an chapter id as a parameter. (*chapter id can be found in the manga info object*)

returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)
```ts
mangadex.fetchChapterPages("a79255c8-21b5-4a8c-a586-48469fa87020").then(data => {
  console.log(data);
}
```
output:
```js
[
  {
    img: 'https://uploads.mangadex.org/data/67823e99a5e1b53bb44761c5bdcc7f33/1-6d943848bde48cdc712585fa45d97bbbe5a0432c8ecdfa4e673d53ea6fb8fb28.png',
    page: 1
  },
  {
    img: 'https://uploads.mangadex.org/data/67823e99a5e1b53bb44761c5bdcc7f33/2-060d75ddda24ef3d0848b5517572c8dc3ff0a5fe44f90798f7c71a4f7ce23fd9.png',
    page: 2
  },
  {...}
  ...
]
```