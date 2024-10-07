<h1>MonosChinos</h1>

```ts
const monoschinos = new ANIME.MonosChinos();
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
monoschinos.search("Jujutsu Kaisen").then(data => {
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
            id: 'jujutsu-kaisen-2nd-season-sub-espanol',
            title: 'Jujutsu Kaisen 2nd Season',
            url: 'https://monoschinos2.com/anime/jujutsu-kaisen-2nd-season-sub-espanol',
            image: 'https://monoschinos2.com/public/img/anime.png',
            releaseDate: '2023'
        },
        {
            id: 'jujutsu-kaisen-0-movie-sub-espanol',
            title: 'Jujutsu Kaisen 0 Movie',
            url: 'https://monoschinos2.com/anime/jujutsu-kaisen-0-movie-sub-espanol',
            image: 'https://monoschinos2.com/public/img/anime.png',
            releaseDate: '2021'
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
| totalEpisodes?     | `number` | takes page number as a parameter                                                                          |

Why total episodes? The source to know the total episodes is blocked by a token and,
since urls are similar, they can be built from scratch.

If no value is passed, it will give you 1000 episodes by default.

```ts
monoschinos.fetchAnimeInfo("jujutsu-kaisen-sub-espanol", 24).then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
    id: 'jujutsu-kaisen-sub-espanol',
    title: 'Jujutsu Kaisen',
    url: 'https://monoschinos2.com/anime/jujutsu-kaisen-sub-espanol',
    genres: [ 'Acción', 'Escolares', 'Shonen', 'Sobrenatural' ],
    totalEpisodes: 24,
    image: 'https://monoschinos2.com/public/img/anime.png',
    description: 'En un mundo donde los demonios se alimentan de humanos desprevenidos fragmentos del legendario y temido demonio Ryoumen Sukuna....',
    episodes: [
        {
            id: 'jujutsu-kaisen-episodio-1',
            number: 1,
            url: 'https://monoschinos2.com/ver/jujutsu-kaisen-episodio-1'
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

Doesn't always work as this provider uses many different servers to store the episodes.
Current working servers: Voe, Streamtape.

In this example, we're getting the sources for the first episode of Demon Slayer: Kimetsu no Yaiba Hashira Training Arc.
```ts
monoschinos.fetchEpisodeSources("jujutsu-kaisen-episodio-1").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
    sources: [
        {
            url: 'https://delivery-node-eegpnfut1s580fm4.voe-network.net/engine/hls2/01/11290/adyowzavymfa_,n,.urlset/master.m3u8?t=HvPh3pTk4ZpCEDbOBT62tYjoLACrObb2p9IXPeAp1fU&s=1728306400&e=14400&f=56451279&node=delivery-node-eegpnfut1s580fm4.voe-network.net&i=150.214&sp=2500&asn=198096',
            quality: 'default',
            isM3U8: true
        }
      ],
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
