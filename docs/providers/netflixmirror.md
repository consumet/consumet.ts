<h1>NetflixMirror</h1>

```ts
const nfmirror = new MOVIES.NetflixMirror();
```

<h2>Methods</h2>

- [search](#search)
- [fetchMediaInfo](#fetchmediainfo)
- [fetchEpisodeSources](#fetchepisodesources)

### search

> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.

<h4>Parameters</h4>

| Parameter       | Type     | Description                                                                 |
| --------------- | -------- | --------------------------------------------------------------------------- |
| query           | `string` | query to search for. (_In this case, We're searching for `jujutsu kaisen`_) |
| page (optional) | `number` | page number (default: 1)                                                    |

```ts
nfmirror.search('jujutsu kaisen').then((data) => {
  console.log(data);
});
```

returns a promise which resolves into an array of movies/tv series. (_[`Promise<ISearch<IMovieResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L233-L241)_)\
output:

```js
{
    "currentPage": 1,
    "hasNextPage": false,
    "results": [
        {
            "id": "81278456",   //mediaId
            "title": "Jujutsu Kaisen",
            "image": "https://imgcdn.media/poster/v/81278456.jpg",
            "type": "TV Series",
            "releaseDate": "2020",
            "seasons": 2
        }
    ]
}
```

### fetchMediaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                                                     |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| mediaId   | `string` | takes media id or url as a parameter. (_media id or url can be found in the media search results as shown on the above method_) |

```ts
nfmirror.fetchMediaInfo('tvshows/jujutsu-kaisen/').then((data) => {
  console.log(data);
});
```

returns a promise which resolves into an anime info object (including the episodes). (_[`Promise<IMovieInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L243-L254)_)\
output:

```js
{
    "id": "81278456",  //mediaId
    "title": "Jujutsu Kaisen",
    "cover": "https://imgcdn.media/poster/h/81278456.jpg",
    "image": "https://imgcdn.media/poster/v/81278456.jpg",
    "description": "With his days numbered, high schooler Yuji decides to hunt down and consume the remaining 19 fingers of a deadly curse so it can die with him.",
    "type": "TV Series",
    "releaseDate": "2020",
    "genres": [
        "Shounen Anime",
        "Sci-Fi & Fantasy Anime",
        "Action Anime",
        "Japanese",
        "Anime Series",
        "TV Shows Based on Manga"
    ],
    "duration": "2 Seasons",
    "episodes": [
        {
            "id": "81342624",  //episodeId
            "title": "Episode 1",
            "season": 1,
            "number": 1,
            "image": "https://imgcdn.media/epimg/150/81342624.jpg"
        },
        {...}
    ]
}
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter         | Type                                                                                                   | Description                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| episodeId         | `string`                                                                                               | takes episode id as a parameter. (_episode id can be found in the media info object_)                                                                     |


```ts
nfmirror.fetchEpisodeSources('episodes/jujutsu-kaisen-1x1/').then((data) => {
  console.log(data);
});
```

returns a promise which resolves into an array of episode sources and subtitles. (_[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L300-L306)_)\
output:

```js
{
    "sources": [
        {
            "url": "https://netfree2.cc/mobile/hls/81144552.m3u8?in=c13d86535b2c2bcbad85ad2e9c5fd88b::dab25e5a90ee6200984516641675bf09::1746106954::ni",
            "quality": "auto",
            "isM3U8": true
        },
        {
            "url": "https://netfree2.cc/mobile/hls/81144552.m3u8?q=720p&in=c13d86535b2c2bcbad85ad2e9c5fd88b::dab25e5a90ee6200984516641675bf09::1746106954::ni",
            "quality": "720p",
            "isM3U8": true
        }
    ],
    "subtitles": [
        {
            "url": "https://subs.nfmirrorcdn.top/files/81144552/81144552-en.srt",
            "lang": "English"
        },
        {
            "url": "https://subs.nfmirrorcdn.top/files/81144552/81144552-id.srt",
            "lang": "Indonesian"
        },
    ]
}
```

