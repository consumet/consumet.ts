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
animeunity.search("Jujutsu Kaisen 2").then(data => {
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
            id: '4197-jujutsu-kaisen-2',
            title: 'Jujutsu Kaisen 2',
            url: 'https://www.animeunity.to/anime/4197-jujutsu-kaisen-2',
            image: 'https://cdn.myanimelist.net/images/anime/1732/139397.jpg',
            cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/145064-S7qAgxf6kMrW.jpg',
            subOrDub: 'sub'
        },
        {
            id: '4786-jujutsu-kaisen-2-ita',
            title: 'Jujutsu Kaisen 2 (ITA)',
            url: 'https://www.animeunity.to/anime/4786-jujutsu-kaisen-2-ita',
            image: 'https://cdn.myanimelist.net/images/anime/1732/139397.jpg',
            cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/145064-kH9vbOEitIhl.jpg',
            subOrDub: 'dub'
        }
    ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |


```ts
animesaturn.fetchAnimeInfo("4197-jujutsu-kaisen-2").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
    id: '4197-jujutsu-kaisen-2',
    title: 'Jujutsu Kaisen 2',
    url: 'https://www.animeunity.to/anime/4197-jujutsu-kaisen-2',
    alID: '145064',
    genres: [ 'Action', 'Drama', 'Fantasy', 'School', 'Shounen', 'Supernatural' ],
    totalEpisodes: 23,
    image: 'https://img.animeunity.to/anime/139397.jpg',
    cover: 'https://img.animeunity.to/anime/145064-S7qAgxf6kMrW.jpg',
    description: 'Seconda stagione di Jujutsu Kaisen',
    episodes: [
        {
            id: '4197-jujutsu-kaisen-2/71631',
            number: 1,
            url: 'https://www.animeunity.to/anime/4197-jujutsu-kaisen-2/71631'
        },
        {
            id: '4197-jujutsu-kaisen-2/71717',
            number: 2,
            url: 'https://www.animeunity.to/anime/4197-jujutsu-kaisen-2/71717'
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
animesaturn.fetchEpisodeSources("4197-jujutsu-kaisen-2/71631").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
    sources: [
        {
            url: 'https://vixcloud.co/playlist/159548?token=EgLqNTtoByEjBWoxBnjRhA&token360p=&token480p=SqM7OBHTk2W6iebd18uvrg&token720p=sg9FbKumN1aPHyb1XA0F8w&token1080p=&referer=&expires=1709384998',
            isM3U8: true
        }
    ],
    download: 'https://au-d1-03.scws-content.net/download/3/d/15/d15d70b0-0fe6-46f8-81bd-5a190dae685b/720p.mp4?token=Dzy4_BKCpk1N5bwQQQc8yg&expires=1704287398&filename=JujutsuKaisen2_Ep_01_SUB_ITA.mp4'
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
