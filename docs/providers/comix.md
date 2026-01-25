<h1> Comix </h1>

```ts
const comix = new MANGA.Comix();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMangaInfo](#fetchmangainfo)
- [fetchChapters](#fetchchapters)
- [fetchChapterPages](#fetchchapterpages)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class, meaning it is available across most categories.
> 
<h4>Parameters</h4>

| Parameter | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| query     | `string` | query to search for. (*In this case, we're searching for `solo leveling`*) |
| page      | `number` | page number (optional, defaults to 1) |

```ts
comix.search('solo leveling', 1).then(data => {
  console.log(data);
})
```
returns a promise which resolves into an object with results and pagination. (*[`Promise<Search<IMangaResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
  results: [
    {
      id: 'solo-leveling',
      title: 'Solo Leveling',
      altTitles: ['나 혼자만 레벨업', 'Only I Level Up', ...],
      image: 'https://static.comix.to/fdec/i/0/88/68e49489355e2.jpg',
      description: 'In a world where hunters...',
      status: 'Completed',
      rating: 8.3,
      views: 49
    },
    {...},
  ],
  pagination: {
    count: 28,
    total: 559,
    per_page: 28,
    current_page: 1,
    last_page: 20,
    from: 1,
    to: 28
  }
}
```

### fetchMangaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| mangaId   | `string` | manga id (*can be found in the manga search results*) |

```ts
comix.fetchMangaInfo('rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior').then(data => {
  console.log(data);
})
```
returns a promise which resolves into a manga info object. (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
  id: 'rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior',
  title: "The Grand Duke's Bride Is a Hellborn Warrior",
  altTitles: ['대공님의 신부는 지옥의 전사', 'Daegongnimui Sinbuneun Jiogui Jeonsa', ...],
  description: 'Alicia, the Marquis\' daughter who missed her chance to marry...',
  genres: ['Drama', 'Fantasy', 'Romance'],
  status: 'Ongoing',
  rating: 7.2,
  views: 4267,
  image: 'https://static.comix.to/3447/i/6/2e/68e4adae72bfb.jpg',
  authors: ['Gaebasi (개바시)', 'Kim Mo An'],
  artist: ['Dicham']
}
```
Note: To get chapters, use the `fetchChapters` method separately.

### fetchChapters

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| hid       | `string` | manga hash id (*the short ID from the manga slug, e.g., `rm2xv` from `rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior`*) |
| page      | `number` | page number (optional, if not provided, fetches all chapters) |

```ts
comix.fetchChapters('rm2xv', 1).then(data => {
  console.log(data);
})
```
returns a promise which resolves into an object with chapters and pagination.\
output:
```js
{
  chapters: [
    {
      id: '7304879',
      title: 'Chapter 44',
      number: 44,
      releaseDate: '2025-01-18T19:09:01.000Z',
      isOfficial: false,
      scanlationGroup: 'ROKARI COMICS'
    },
    {
      id: '7288301',
      title: 'Chapter 43',
      number: 43,
      releaseDate: '2025-01-11T19:09:01.000Z',
      isOfficial: false,
      scanlationGroup: 'ROKARI COMICS'
    },
    {...},
  ],
  pagination: {
    count: 44,
    total: 44,
    per_page: 100,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 44
  }
}
```

### fetchChapterPages

<h4>Parameters</h4>

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| chapterId | `string` | chapter id in format `{hashid-slug}/{chapterid}` (*e.g., `rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior/7304879-chapter-44`*) |

```ts
comix.fetchChapterPages('rm2xv-the-grand-dukes-bride-is-a-hellborn-warrior/7304879-chapter-44').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
  {
    img: 'https://ek10.wowpic2.store/ii/bEqPbYfoMT0GmznlZj6fuBJQyrkZf/01.webp',
    page: 0,
    headersForUrl: 'https://comix.to'
  },
  {
    img: 'https://ek10.wowpic2.store/ii/bEqPbYfoMT0GmznlZj6fuBJQyrkZf/02.webp',
    page: 1,
    headersForUrl: 'https://comix.to'
  },
  {...},
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>
