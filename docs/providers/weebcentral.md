<h1> WeebCentral </h1>

```ts
const weebCentral = new MANGA.WeebCentral();
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
| query     | `string` | query to search for. (*In this case, we're searching for `bleach`*) |
| page      | `number` | page number (optional, defaults to 1) |

```ts
weebCentral.search('bleach').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
  currentPage: 1,
  hasNextPage: false,
  results: [
    {
      id: '01J76XY7E4JCPK14V53BVQWD9Y/Bleach',
      title: 'Bleach',
      image: 'https://temp.compsci88.com/cover/normal/01J76XY7E4JCPK14V53BVQWD9Y.webp'
    },
    {
      id: '01J76XYEVQ0ZFHSDZBTNA55Y1F/Bleach-Color',
      title: 'Bleach (Color)',
      image: 'https://temp.compsci88.com/cover/normal/01J76XYEVQ0ZFHSDZBTNA55Y1F.webp'
    },
    {...},
  ]
}
```

### fetchMangaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| mangaId   | `string` | manga id (*can be found in the manga search results*) |

```ts
weebCentral.fetchMangaInfo('01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
  id: '01J76XY7VSG3R5ANYPDWTXDVP6/Kingdom',
  title: 'Kingdom',
  image: 'https://temp.compsci88.com/cover/normal/01J76XY7VSG3R5ANYPDWTXDVP6.webp',
  description: 'Millions of years have passed since the times of legends, when the worlds of man and gods were still the same...',
  authors: ['Yasuhisa Hara'],
  genres: ['Action', 'Drama', 'Historical', 'Military', 'Seinen'],
  status: 'ongoing',
  releaseDate: '2006',
  chapters: [
    {
      id: '01K8VEAEHDBSVQ6PJ3MNBDH7D7',
      title: 'Chapter 855',
      releaseDate: '2024-09-07T17:04:15.717Z'
    },
    {
      id: '01J76XZ8GD6BSR9HKQ6SYXQB86',
      title: 'Chapter 796',
      releaseDate: '2024-09-07T17:04:15.717Z'
    },
    {...},
  ]
}
```
Note: The `headerForImage` property might be useful when getting the image to display.

### fetchChapterPages

<h4>Parameters</h4>

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| chapterId | `string` | chapter id (*can be found in the manga info*) |

```ts
weebCentral.fetchChapterPages('01K8VEAEHDBSVQ6PJ3MNBDH7D7').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
  {
    img: 'https://scans-hot.planeptune.us/manga/Kingdom/0855-001.png',
    page: 1,
    headerForImage: 'https://weebcentral.com'
  },
  {
    img: 'https://scans-hot.planeptune.us/manga/Kingdom/0855-002.png',
    page: 2,
    headerForImage: 'https://weebcentral.com'
  },
  {
    img: 'https://scans-hot.planeptune.us/manga/Kingdom/0855-003.png',
    page: 3,
    headerForImage: 'https://weebcentral.com'
  },
  {
    img: 'https://scans-hot.planeptune.us/manga/Kingdom/0855-004.png',
    page: 4,
    headerForImage: 'https://weebcentral.com'
  },
  {...},
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>
