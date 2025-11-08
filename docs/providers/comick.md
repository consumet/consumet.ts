<h1> Comick </h1>

```ts
const comick = new MANGA.Comick();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMangaInfo](#fetchmangainfo)
- [fetchChapterPages](#fetchchapterpages)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class, meaning it is available across most categories.
> 
<h4>Parameters</h4>

| Parameter | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| query     | `string` | query to search for. (*In this case, we're searching for `one piece`*) |
| cursor    | `string` | similar to a page (*can be found at the end of search results*) |

```ts
comick.search('one piece').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<Search<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
    results: [
        {
            id: 'one-piece',
            title: 'One Piece',
            altTitles: [],
            image: 'https://cdn1.comicknew.pictures/one-piece/covers/ec809bee.jpeg'
        },
        {
            id: '02-one-piece-digital-colored-comics',
            title: 'One Piece (Official Colored)',
            altTitles: [],
            image: 'https://cdn1.comicknew.pictures/02-one-piece-digital-colored-comics/covers/101b409e.webp'
        },
        {...}
    ]
    prev_cursor: null,
    next_cursor: 'eyJpdiI6IkVkbmp...'
}
```
Note: Instead of pagination, Comick use cursors.<br/>In other words, you can't individually pick a page to go to, but you can continuously load more manga as you go.<br/>So in practice, it could look something like this
```ts
const page1 = await comick.search('one piece');
const page2 = await comick.search('one piece', page1.data.next_cursor);
```

### fetchMangaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| mangaId   | `string` | manga id (*can be found in the manga search results*) |

```ts
comick.fetchMangaInfo('one-piece').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
    id: 'one-piece',
    title: 'One Piece',
    altTitles: [ 'ワンピース' ],
    description: 'As a child, Monkey D. Luffy was inspired to become a pirate by listening to the tales of the buccaneer "Red-Haired" Shanks. But his life changed when Luffy accidentally ate the Gum-Gum Devil Fruit and gained the power to stretch like rubber...at the cost of never being able to swim again! Years later, still vowing to become the king of the pirates, Luffy sets out on his adventure...one guy alone in a rowboat, in search of the legendary "One Piece," said to be the greatest treasure in the world...',
    genres: [
        'Others',
        'Action',
        'Comedy',
        'Drama',
        'Adaptation',
        'Adventure',
        'Fantasy'
    ],
    status: 'Ongoing',
    image: 'https://cdn1.comicknew.pictures/one-piece/covers/ec809bee.jpeg',
    malId: undefined,
    links: [],
    chapters: [
    {
        id: 'one-piece/J4TXNZa-chapter-1162-en',
        title: '',
        chapterNumber: '1162',
        volumeNumber: null,
        releaseDate: '2025-10-16T12:42:16.000000Z',
        lang: 'en'
    },
    {...}
    ]
}
```
Note: When fetching covers or manga pages, you should use the comic base url as a referer, or else you may get a 403 error.
```ts
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Referer': comick.referer, // comick.referer = http://comick.art
};
const panel = await axios.get("https://cdn1.comicknew.pictures/one-piece/covers/ec809bee.jpeg", { headers: headers });
console.log(picture.panel);
```

### fetchChapterPages

<h4>Parameters</h4>

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| chapterId | `string` | chapter id (*can be found in the manga info*) |

```ts
comick.fetchChapterPages('one-piece/J4TXNZa-chapter-1162-en').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
    {
        img: 'https://cdn1.comicknew.pictures/one-piece/0_1162/en/6f2081b8/0.webp',
        page: 0
    },
    {
        img: 'https://cdn1.comicknew.pictures/one-piece/0_1162/en/6f2081b8/1.webp',
        page: 1
    },
    {
        img: 'https://cdn1.comicknew.pictures/one-piece/0_1162/en/6f2081b8/2.webp',
        page: 2
    },
    {
        img: 'https://cdn1.comicknew.pictures/one-piece/0_1162/en/6f2081b8/3.webp',
        page: 3
    },
    {...},
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>