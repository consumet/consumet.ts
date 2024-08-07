<h1> AsuraScans </h1>

```ts
  const asuraScans = new MANGA.AsuraScans();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMangaInfo](#fetchmangainfo)
- [fetchChapterPages](#fetchchapterpages)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class, meaning it is available across most categories.
> 
<h4>Parameters</h4>

| Parameter         | Type     | Description                                                                                |
| ------------------| -------- | ------------------------------------------------------------------------------------------ |
| query             | `string` | query to search for. (*In this case, we're searching for `Omniscient Reader’s Viewpoint`*) |
| page (optional)   | `number` | page number (default: 1)                                                                   |

```ts
asuraScans.search('Omniscient Reader’s Viewpoint').then(data => {
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
        id: 'series/omniscient-readers-viewpoint-b88a351c',
        title: 'Omniscient Reader’s Viewpoint',
        image: 'https://gg.asuracomic.net/storage/media/105/conversions/9b59fdec-thumb-small.webp',
        status: 'Ongoing',
        latestChapter: 'Chapter 222',
        rating: '10'
    }
    ]
}
```

### fetchMangaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| mangaId   | `string` | manga id (*can be found in the manga search results*)          |

```ts
asuraScans.fetchMangaInfo('series/solo-max-level-newbie-d9977a85').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
    id: '/series/solo-max-level-newbie-d9977a85',
      title: 'Solo Max-Level Newbie',
      image: 'https://gg.asuracomic.net/storage/media/1/conversions/047bc0bb-optimized.webp',
      rating: '9.9',
      status: 'Ongoing',
      description: 'Jinhyuk, a gaming Nutuber, was the only person who saw the ending of the game [Tower of Trials].\n' +
        "However, when the game's popularity declined, it became difficult for him to continue making a living as a gaming Nutuber.\n" +
        `Since he already saw the ending of the game, he was about to quit playing. But that day, [Tower of Trials] became reality, and Jinhyuk, who knew about every single thing in the game, took over everything faster than anyone possibly could! "I'll show you what a true pro is like."`,
      authors: [ 'Maslow' ],
      artist: 'Swingbat',
      updatedOn: 'August 7th 2024',
      genres: [ 'Action', 'Adventure', 'Comedy', 'Fantasy', 'Game', 'Tower' ],
      chapters: [
        {
          id: 'solo-max-level-newbie-d9977a85/chapter/165',
          title: 'Chapter 165 The Most Powerful Ally (1)',
          releaseDate: 'August 1st 2024'
        },
        {
          id: 'solo-max-level-newbie-d9977a85/chapter/164',
          title: 'Chapter 164',
          releaseDate: 'July 25th 2024'
        },
        {
          id: 'solo-max-level-newbie-d9977a85/chapter/163',
          title: 'Chapter 163 Wailing Witch (1)',
          releaseDate: 'July 18th 2024'
        },
        {
          id: 'solo-max-level-newbie-d9977a85/chapter/162',
          title: 'Chapter 162 Daily Life in Europe Vlog (2)',
          releaseDate: 'July 14th 2024'
        },
        {...},
    ]
    recommendations: [
        {
          id: '/series/regressor-instruction-manual-1b1dc3a8',
          title: 'Regressor Instruction Manual',
          image: 'https://gg.asuracomic.net/storage/media/276/conversions/01J4CG9ADBTWY617STXHGNTBKP-optimized.webp',
          latestChapter: 'Chapter 103',
          status: 'Ongoing',
          rating: '10'
        },
        {
          id: '/series/the-s-classes-that-i-raised-424cbecc',
          title: 'The S-Classes That I Raised',
          image: 'https://gg.asuracomic.net/storage/media/8/conversions/9b10db26-optimized.webp',
          latestChapter: 'Chapter 147',
          status: 'Ongoing',
          rating: '9.9'
        },
        {
          id: '/series/return-of-the-shattered-constellation-1b655e30',
          title: 'Return Of The Shattered Constellation',
          image: 'https://gg.asuracomic.net/storage/media/13/conversions/5cfa2551-optimized.webp',
          latestChapter: 'Chapter 120',
          status: 'Ongoing',
          rating: '9.8'
        },
        {
          id: '/series/duke-pendragon-9dfcab6a',
          title: 'Duke Pendragon',
          image: 'https://gg.asuracomic.net/storage/media/18/conversions/44b24afa-optimized.webp',
          latestChapter: 'Chapter 120',
          status: 'Ongoing',
          rating: '9.9'
        }
    ]
}
```

### fetchChapterPages

<h4>Parameters</h4>

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| chapterId | `string` | chapter id (*can be found in the manga info*)            |

```ts
asuraScans.fetchChapterPages('solo-max-level-newbie-d9977a85/chapter/66').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/01.webp',
        page: 1
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/02.webp',
        page: 2
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/03.webp',
        page: 3
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/04.webp',
        page: 4
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/05.webp',
        page: 5
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/06.webp',
        page: 6
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/07.webp',
        page: 7
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/08.webp',
        page: 8
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/09.webp',
        page: 9
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/10.webp',
        page: 10
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/11.webp',
        page: 11
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/12.webp',
        page: 12
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/13.webp',
        page: 13
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/14.webp',
        page: 14
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/15.webp',
        page: 15
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/16.webp',
        page: 16
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/17.webp',
        page: 17
    },
    {
        img: 'https://gg.asuracomic.net/storage/comics/3/6d12ee5d-ce6f-4d3a-8074-3d977efdc422/18.webp',
        page: 18
    }
    {...},
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>
