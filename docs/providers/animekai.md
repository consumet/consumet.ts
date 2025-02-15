<h1>AnimeKai</h1>

```ts
const animekai = new ANIME.AnimeKai();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeServers](#fetchEpisodeservers)
- [fetchEpisodeSources](#fetchepisodesources)
- [fetchLatestCompleted](#fetchLatestCompleted)
- [fetchSchedule](#fetchSchedule)
- [fetchSpotlight](#fetchSpotlight)
- [fetchSearchSuggestions](#fetchSearchSuggestions)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.


<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Spy x Family`*) |

```ts
animekai.search("dandadan").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  currentPage: 0,
  hasNextPage: false,
  totalPages: 0,
  results: [
    {
      id: 'dan-da-dan-vmly',  //id to be used in fetchAnimeInfo
      title: 'DAN DA DAN',
      url: 'https://animekai.to/watch/dan-da-dan-vmly',
      image: 'https://static.animekai.to/1c/i/1/e3/6766499c2467e@300.jpg',
      japaneseTitle: 'Dandadan',
      type: 'TV',
      sub: 12,
      dub: 12,
      episodes: 12
    },
    {...}
  ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*) |


```ts
animekai.fetchAnimeInfo("jujutsu-kaisen-4gm6").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object . (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: 'jujutsu-kaisen-4gm6',
  title: 'JUJUTSU KAISEN',
  japaneseTitle: 'Jujutsu Kaisen',
  image: 'https://static.animekai.to/7b/i/f/d2/67664a638ddda.jpg',
  description: 'Idly indulging in baseless paranormal activities with the ....',
  type: 'TV',
  url: 'https://animekai.to/watch/jujutsu-kaisen-4gm6',
  recommendations: [
    {
      id: 'chainsaw-man-2nmr',
      title: 'Chainsaw Man',
      url: 'https://animekai.to/watch/chainsaw-man-2nmr',
      image: 'https://static.animekai.to/e7/i/f/19/676649a842295@300.jpg',
      japaneseTitle: 'Chainsaw Man',
      type: 'TV',
      sub: 12,
      dub: 12,
      episodes: 12
    },
  ],
  relatedAnime: [
    {
      id: 'jujutsu-kaisen-0-xxn3',
      title: 'JUJUTSU KAISEN 0',
      url: 'https://animekai.to/watch/jujutsu-kaisen-0-xxn3',
      image: 'https://static.animekai.to/b7/i/d/0f/67664a6c4ae80@300.jpg',
      japaneseTitle: 'Jujutsu Kaisen 0',
      type: 'MOVIE',
      sub: 1,
      dub: 1,
      episodes: 1
    },
  ],
  subOrDub: 'both',
  hasSub: true,
  hasDub: true,
  genres: [
    'Genres:  School, Shounen, Action, Supernatural, Drama, Magic, Martial Arts, Demons, Super Power'
  ],
  status: 'Completed',
  season: 'Fall 2020',
  totalEpisodes: 24,
  episodes: [
    {
      id: 'jujutsu-kaisen-4gm6#ep=1?token=30nW30ysAuVpjobTutx2',
      number: 1,
      title: 'Ryoumen Sukuna',
      url: 'https://animekai.to/watch/jujutsu-kaisen-4gm6#ep=1'
    },
    {
      id: 'jujutsu-kaisen-4gm6#ep=2?token=lRDAkRGtUbo9jJTQvJxw',
      number: 2,
      title: 'For Myself',
      url: 'https://animekai.to/watch/jujutsu-kaisen-4gm6#ep=2'
    },
    {...}
  ]
}
```

### fetchEpisodeServers

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |
| subOrDub (optional) | `SubOrSub `| takes subOrDub enum as a parameter. (*can be `SubOrSub.SUB` or `SubOrSub.DUB`, default: `SubOrSub.SUB`*) |


```ts
animekai.fetchEpisodeServers("jujutsu-kaisen-4gm6#ep=1?token=30nW30ysAuVpjobTutx2").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
[
  {
    name: 'MegaUp Server 1',
    url: 'https://megaup.cc/e/mIXhIDmsWS2JcOL2GLxI7RXpCQ'
  },
  {
    name: 'MegaUp Server 2',
    url: 'https://megaup.cc/e/mIXhIDmsWSyJcOL2GLxI7RXpCQ'
  }
]
```

### fetchEpisodeSources

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                           |
| --------- | -------- | ------------------------------------------------------------------------------------- |
| episodeId | `string` | takes episode id as a parameter. (*episode id can be found in the anime info object*) |
| server (optional) | `StreamingServers` | takes server enum as a parameter. (*default: `StreamingServers.MegaUp`*) |
| subOrDub (optional) | `SubOrSub `| takes subOrDub enum as a parameter. (*can be `SubOrSub.SUB` or `SubOrSub.DUB`, default: `SubOrSub.SUB`*) |


```ts
animekai.fetchEpisodeSources("jujutsu-kaisen-4gm6#ep=1?token=30nW30ysAuVpjobTutx2").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
  headers: { Referer: 'https://megaup.cc/e/mIXhIDmsWSyJcOL2GLxI7RXpCQ' },
  sources: [
    {
      url: 'https://59g6e.megaup.cc/v3/h1e00e76d6043835a9cc206f447a2563984a4cd132f93c00300ffcba00dd0c85204cd8a70c2d9014636b170eed451dae87dd0deba537d1dea249d16e5cf68f0842b9bc86743047b234e83231397a71934950ebababc02598a0f918c264f36b1d1f2dd3de6ccb889ac93/list.m3u8',
      isM3U8: true
    }
  ],
  subtitles: [
    {
      kind: 'thumbnails',
      url: 'https://59g6e.megaup.cc/v3/h1e00e76d6043835a9cc206f447a2563984a4cd132f93c00300ffcba00dd0c85204cd8a70c2d9014636b170eed451dae87dd0deba537d1dea249d16e5cf68f0842b9bc86743047b234e83231397a71934950ebababc02598a0f918c264f36b1d1f2dd3de6ccb889ac93/thumbnails.vtt'
    }
  ],
  download: 'https://megaup.cc/download/mIXhIDmsWSyJcOL2GLxI7BfqDg'
}
```

### fetchLatestCompleted

<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| page (optional) | `number` | page number (default 1) |

```ts
animekai.fetchLatestCompleted().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{                                                        
  currentPage: 1,
  hasNextPage: true,
  totalPages: 9,
  results: [
    {
      id: 'alya-sometimes-hides-her-feelings-in-russian-vv3k',
      title: 'Alya Sometimes Hides Her Feelings in Russian',
      url: 'https://animekai.to/watch/alya-sometimes-hides-her-feelings-in-russian-vv3k',
      image: 'https://static.animekai.to/31/i/9/e9/67664a739d406@300.jpg',
      japaneseTitle: 'Tokidoki Bosotto Russiago de Dereru Tonari no Alya-san',
      type: 'TV',
      sub: 12,
      dub: 12,
      episodes: 12
    },
    {...}
    ...
  ]
}
```
> Note: The responses from the `fetchRecentlyAdded`, `fetchNewReleases`, `fetchMovie`, `fetchTV`, `fetchONA`, `fetchOVA`, and `fetchSpecial` methods are similar to `fetchLatestCompleted`.

### fetchSchedule

<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| date    | `string` | Date in format 'YYYY-MM-DD'. Defaults to the current date. |

```ts
animekai.fetchSchedule().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  results: [
    {
      id: 'a-record-of-mortals-journey-to-immortality-season-4-40r6',
      title: "A Record of Mortal's Journey to Immortality Season 4",
      japaneseTitle: 'Fanren Xiu Xian Chuan Di Si Ji',
      airingTime: '05:30',
      airingEpisode: '6'
    },
    {
      id: 'the-war-of-cards-e479',
      title: 'The War of Cards',
      japaneseTitle: 'Katu',
      airingTime: '05:30',
      airingEpisode: '13'
    },
    {...}
  ]
}
```

### fetchSpotlight

```ts
animekai.fetchSpotlight().then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  
  results: [
    {
      id: 'rezero-starting-life-in-another-world-season-3-7n80',
      title: 'Re:ZERO -Starting Life in Another World- Season 3',
      japaneseTitle: 'Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season',
      banner: 'https://static.animekai.to/96/i/1/81/6766499de49e4.jpg',
      url: 'https://animekai.to/watch/rezero-starting-life-in-another-world-season-3-7n80',
      type: 'TV',
      genres: [Array],
      releaseDate: '2024',
      quality: 'HD',
      sub: 10,
      dub: 8,
      description: 'One year after the events at the Sanctuary, Subaru Natsuki trains hard to better face future challenges....'
    },
    {
      id: 'case-closed-7qyn',
      title: 'Case Closed',
      japaneseTitle: 'Meitantei Conan',
      banner: 'https://static.animekai.to/5d/i/c/73/676649e5f1832.jpg',
      url: 'https://animekai.to/watch/case-closed-7qyn',
      type: 'TV',
      genres: [Array],
      releaseDate: '1996',
      quality: 'HD',
      sub: 1152,
      dub: 1014,
      description: 'Shinichi Kudou, a high school student of astounding talent in detective work, ...'
    },
    {...}
    ...
  ]
}
```
### fetchSearchSuggestions

```ts
animekai.fetchSearchSuggestions("One Piece").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
  results: [
     {
      id: 'jujutsu-kaisen-season-2-73v2',
      title: 'JUJUTSU KAISEN Season 2',
      url: 'https://animekai.to/watch/jujutsu-kaisen-season-2-73v2',
      image: 'https://static.animekai.to/95/i/9/b8/6766493099d89@100.jpg',
      japaneseTitle: 'Jujutsu Kaisen 2nd Season',
      type: '2023',
      year: 'TV',
      sub: 23,
      dub: 23,
      episodes: 23
    },
    {
      id: 'jujutsu-kaisen-tv-recap-3qrx',
      title: 'Jujutsu Kaisen (TV) Recap',
      url: 'https://animekai.to/watch/jujutsu-kaisen-tv-recap-3qrx',
      image: 'https://static.animekai.to/05/i/0/ba/67664968a62a4@100.jpg',
      japaneseTitle: null,
      type: '2021',
      year: 'TV',
      sub: 2,
      dub: 0,
      episodes: 1
    },
    {...}
  ]
}
```
