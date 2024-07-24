<h1>AnimeDrive</h1>

```ts
const animedrive = new ANIME.AnimeDrive();
```

<h2>Methods</h2>

- [search](#search)
- [fetchAnimeInfo](#fetchanimeinfo)
- [fetchEpisodeSources](#fetchepisodesources)

### search

<h4>Parameters</h4>

| Parameter | Type     | Description                                                              |
| --------- | -------- | ------------------------------------------------------------------------ |
| query     | `string` | query to search for. (*In this case, We're searching for `Call of the Night`*) |

```ts
animedrive.search("Yofukashi no Uta").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of anime. (*[`Promise<ISearch<IAnimeResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L13-L26)*)\
output:
```js
{
      currentPage: 1,
      hasNextPage: false,
      results: [
        {
          id: '1031',
          title: 'Yofukashi no Uta',
          image: 'https://animedrive.hu/cover/1031.webp',
          url: 'https://animedrive.hu/anime/?id=1031',
          subOrDub: 'sub'
        }
        {...},
        ...
      ]
}
```

### fetchAnimeInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                                                               |
| --------- | -------- | --------------------------------------------------------------------------------------------------------- |
| id        | `string` | takes anime id as a parameter. (*anime id can be found in the anime search results or anime info object*)

```ts
animedrive.fetchAnimeInfo("1031").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an anime info object (including the episodes). (*[`Promise<IAnimeInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L28-L42)*)\
output:
```js
{
  id: '1031',
  title: 'Yofukashi no Uta',
  image: 'https: //animedrive.hu/cover/1031.webp',
  description: 'Yamori Kou látszatra egy teljesen átlagos, középiskolás tanuló. Viszonylag jók a tanulmányi eredményei, kedves az osztálytársaival. Sok energiát fektet bele, hogy fenntartsa ezt a látszatot. Egy nap azonban belefárad ebbe, és többé nem jár be az iskolába. Inszomniában szenved, mivel napközben semmit sem csinál, amivel levezethetné az energiáját. Amikor sétálni megy éjszaka, egy picit jobban érzi magát, azonban tudja, hogy az álmatlansága egy komoly probléma. Egy ilyen esti séta közben Kou találkozik egy furcsa lánnyal, Nanakusa Nazunával, aki megállapítja az álmatlanságának okát: habár változtatott az életvitelén, még mindig visszafogja magát, és nem tapasztalja meg az igazi szabadságot. Azt mondja neki a lány, hogy nem fog tudni aludni, amíg nem lesz elégedett azzal, hogyan tölti az ébrenlétének idejét. Amikor végre úgy tűnik, hogy megoldódott a jelenlegi problémája, a lány felhívja őt a lakására, hogy együtt aludjanak. Egy idő után, amikor a lány nem tudja, hogy a fiú tetteti az alvást, közelebb hajol hozzá és... beleharap a nyakába.',
  type: 'TV',
  releaseYear: '2022-07-08',
  status: 'Completed',
  totalEpisodes: 13,
  url: 'https: //animedrive.hu/anime/?id=1031',
  episodes: [
    {
      id: '?id=1031&ep=1',
      number: 1,
      title: 'Yofukashi no Uta Episode 1',
      url: 'https: //animedrive.hu/watch/?id=1031&ep=1'
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


In this example, we're getting the sources for the first episode of Call of the Night.
```ts
animedrive.fetchEpisodeSources("?id=1031&ep=1").then(data => {
  console.log(data);
})
```

returns a promise which resolves into an array of episode sources. (*[`Promise<ISource>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L210-L214)*)\
output:
```js
{
      sources: [
        {
          url: 'https://hugh.cdn.rumble.cloud/video/s8/2/p/A/k/5/pAk5o.oaa.mp4',
          quality: '240p',
          isM3U8: false
        },
        {
          url: 'https://hugh.cdn.rumble.cloud/video/s8/2/p/A/k/5/pAk5o.baa.mp4',
          quality: '360p',
          isM3U8: false
        },
        {
          url: 'https://hugh.cdn.rumble.cloud/video/s8/2/p/A/k/5/pAk5o.caa.mp4',
          quality: '480p',
          isM3U8: false
        },
        {
          url: 'https://hugh.cdn.rumble.cloud/video/s8/2/p/A/k/5/pAk5o.gaa.mp4',
          quality: '720p',
          isM3U8: false
        },
        {
          url: 'https://hugh.cdn.rumble.cloud/video/s8/2/p/A/k/5/pAk5o.haa.mp4',
          quality: '1080p',
          isM3U8: false
        }
    ]
}
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/anime.md#">back to anime providers list</a>)</p>
