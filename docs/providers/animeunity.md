<h1>AnimeUnity</h1>

```ts
const animeunity = new ANIME.AnimeUnity();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Jujutsu Kaisen 2`*) |

```ts
animeunity.search("One Piece").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
    hasNextPage: false,
    results: [
        {
            id: '12-one-piece',
            title: 'One Piece',
            url: 'https://www.animeunity.to/anime/12-one-piece',
            image: 'https://cdn.myanimelist.net/images/anime/1810/139965.jpg',
            cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
            subOrDub: 'sub'
        },
        {
            id: '4123-one-piece-film-red',
            title: 'One Piece Movie 15: Red',
            url: 'https://www.animeunity.to/anime/4123-one-piece-film-red',
            image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx141902-fTyoTk8F8qOl.jpg',
            cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/141902-SvnRSXnN7DWC.jpg',
            subOrDub: 'sub'
        },
        {...},
        ...
    ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |
| page?     | `number` | takes page number as a parameter                                                                          |

Why page number? AnimeUnity provides only 120 episodes at a time, how to use:
- page: 1, you'll get episodes info from 1 to 120;
- page: 4, you'll get episodes info from 361 to 480.

If no page number is passed, the first page will be fetched.

```ts
animesaturn.fetchAnimeInfo("12-one-piece", 3).then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
    currentPage: 3,
    hasNextPage: true,
    totalPages: 10,
    id: '12-one-piece',
    title: 'One Piece',
    url: 'https://www.animeunity.to/anime/12-one-piece',
    alID: '21',
    genres: [ 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Shounen' ],
    totalEpisodes: 1095,
    image: 'https://img.animeunity.to/anime/139965.jpg',
    cover: 'https://img.animeunity.to/anime/21-wf37VakJmZqs.jpg',
    description: `Monkey D. Rufy è un giovane pirata sognatore che...`,
    episodes: [
        {
            id: '12-one-piece/6225',
            number: 241,
            url: 'https://www.animeunity.to/anime/12-one-piece/6225'
        },
        {
            id: '12-one-piece/6226',
            number: 242,
            url: 'https://www.animeunity.to/anime/12-one-piece/6226'
        },
        {...},
        ...
    ]
}
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |


In this example, we're getting the sources for the first episode of Jujutsu Kaisen 2.
```ts
animesaturn.fetchEpisodeSources("12-one-piece/6225").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
    sources: [
        {
            url: 'https://vixcloud.co/playlist/163605?token=k3foZ2UVnW80vOgGNXswJA&token360p=&token480p=1JYOeJihE4a9IzvY93O4Fg&token720p=a99ZCcvPp2r-dPhU0vGJ3g&token1080p=&referer=&expires=1714101108',
            isM3U8: true
        }
    ],
    download: 'https://au-d1-01.scws-content.net/download/33/4/05/405f82d3-ff5f-47c6-a907-389f2fc65509/720p.mp4?token=B6Nf0xOc17nc1K5y19r-nQ&expires=1709003508&filename=OnePiece_Ep_0241_SUB_ITA.mp4'
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
