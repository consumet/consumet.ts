<h1> ReadManga </h1>

```ts
  const readManga = new MANGA.ReadManga();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMangaInfo](#fetchmangainfo)
- [fetchChapterPages](#fetchchapterpages)
- [fetchNewManga](#fetchnewmanga)
- [fetchTopRatedManga](#fetchtopratedmanga)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class, meaning it is available across most categories.
> 
<h4>Parameters</h4>

| Parameter | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| query     | `string` | query to search for. (*In this case, we're searching for `one piece`*) |

```ts
readManga.search('one piece').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
    results: [
        {
          id: 'one-piece-colored-edition-55493',
          title: 'One Piece (Colored Edition)',
          image: 'https://img.mreadercdn.com/_m/300x400/100/58/59/5859e56db55fb29a12696a926419e815/5859e56db55fb29a12696a926419e815.jpg',
          genres: [ 'Action', 'Adventure', 'Comedy' ]
        },
        {
          id: 'one-piece-3',
          title: 'One Piece',
          image: 'https://img.mreadercdn.com/_m/300x400/100/62/16/6216bad614899d8dc66cf8b2cb8047d9/6216bad614899d8dc66cf8b2cb8047d9.jpg',
          genres: [ 'Action', 'Adventure', 'Comedy' ]
        }
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
readManga.fetchMangaInfo('one-piece-colored-edition-55493').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
      id: 'one-piece-colored-edition-55493',
      title: 'One Piece (Colored Edition)',
      image: 'https://img.mreadercdn.com/_m/300x400/100/58/59/5859e56db55fb29a12696a926419e815/5859e56db55fb29a12696a926419e815.jpg',
      description: 'Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his demise, he confirms the existence of a great treasure, One Piece, located somewhere within the vast ocean known as the Grand Line. Announcing that One Piece can be claimed by anyone worthy enough to reach it, the Pirate King is executed and the Great Age of Pirates begins.  Twenty-two years later, a young man by the name of Monkey D. Luffy is ready to embark on his own adventure, searching for One Piece and striving to become the new Pirate King. Armed with just a straw hat, a small boat, and an elastic body, he sets out on a fantastic journey to gather his own crew and a worthy ship that will take them across the Grand Line to claim the greatest status on the high seas.  [Written by MAL Rewrite]',
      genres: [
        'Action',
        'Adventure',
        'Comedy',
        'Fantasy',
        'Shounen',
        'Super Power'
      ],
      chapters: [
        {
          id: 'one-piece-colored-edition-55493/en/chapter-1004',
          title: 'Chapter 1004: MILLET DUMPLINGS',
          chapter: '1004'
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
readManga.fetchChapterPages('one-piece-colored-edition-55493/en/chapter-1004').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
    {
      img: 'https://c-1.mreadercdn.com/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/e0/18/e018cc272ab186f6107b577862f3b8a2/e018cc272ab186f6107b577862f3b8a2.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557',
      page: 1
    },
    {
      img: 'https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/61/2f/612f6ffee2881ecab50edc61b517efe7/612f6ffee2881ecab50edc61b517efe7.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557',
      page: 2
    },
    {
      img: 'https://c-1.mreadercdn.com/_v2/0/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/22/bd/22bd0c8a5050b3145ad9116cb0b2aca9/22bd0c8a5050b3145ad9116cb0b2aca9.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557',
      page: 3
    },
    {
      img: 'https://c-1.mreadercdn.com/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/c9/00/c900ff8a5ee537e019bf0caedf74a627/c900ff8a5ee537e019bf0caedf74a627.jpg?t=515363393022bbd440b0b7d9918f291a&ttl=1908547557',
      page: 4
    },
    {...},
]
```

### fetchNewManga

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| page     | `number` | page number (default: 1) |

```ts
readManga.fetchNewManga(3).then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
    currentPage: 3,
    results: [
        {
          title: 'Million Times Attack Speed',
          id: 'million-times-attack-speed',
          img: 'https://readmanga.app/uploads/chapter_files/cover/tbn/1718541315_198x0.jpg',
          description: "After being reincarnated into the Tianwu Continent, Ye Yun activated the Multiverse Devouring System and received the reward of a million times attack speed in the beginner's gift package. From then on, he became an invincible powerhouse! As the saying goes, in the world of martial arts, speed is paramount. Do you think I was just picking my nose and cleaning my ears? In fact, I just executed thirty-five thousand people with a single sword strike and eighty-seven thousand people with a single sword swing, while also unleashing various boxing techniques and secret arts.",
          status: 'Ongoing',
          categories: ["Fantasy", "Romance", "Drama", "Comedy", "Adventure"],
          type: 'Chinese',
          views: 887,
          rate: 10
        },
        {
          title: 'Boku no Ikezuna Konyakusha',
          id: 'boku-no-ikezuna-konyakusha',
          img: 'https://readmanga.app/uploads/chapter_files/cover/tbn/1717336514_198x0.jpg',
          description: 'Miyuki-san is a young lady born in Kyoto. My relationship with her cannot be described as good. Because… "You’re very good at flattery." Are those words sincere? Or just for show? A frustrating love story where our feelings for each other keep missing the mark.',
          status: 'Ongoing',
          categories: ["Romance", "School Life", "Comedy", "Slice of Life"],
          type: 'Japanese',
          views: 468,
          rate: NaN
        }
        {...},
    ]
}
```

### fetchTopRatedManga

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                  |
| --------- | -------- | ---------------------------------------------------------------------------- |
| page     | `number` | page number (default: 1) |

```ts
readManga.fetchTopRatedManga().then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
    currentPage: 1,
    results: [
        {
          title: 'Mangaka-san to Assistant-san to 2',
          id: '4616',
          img: 'https://readmanga.app/uploads/chapter_files/cover/tbn/Mangaka-san-to-Assistant-san-to-2_198x0.jpg',
          description: "Its starts from where the last season ends, Aito and Ashisu meets her new assistant. An entry of a new member. what story can she make out of aito and Ashisu's life?",
          status: 'Ongoing',
          categories: ["Ecchi", "Harem", "Romance", "Comedy", "Slice of Life", "Seinen"],
          type: 'Japanese',
          views: 11,
          rate: 20
        },
        {
          title: 'Ookami Rise',
          id: '20999',
          img: 'https://readmanga.app/uploads/chapter_files/cover/tbn/1645643484_198x0.jpg',
          description: '',
          status: 'Ongoing',
          categories: ["Action", "Fantasy", "Psychological", "Horror"],
          type: 'Japanese',
          views: 5,
          rate: 20
        }
        {...},
    ]
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>
