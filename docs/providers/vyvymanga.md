<h1> VyvyManga </h1>

```ts
  const vyvyManga = new MANGA.VyvyManga();
```

<h2>Methods</h2>

- [search](#search)
- [searchApi](#searchapi)
- [fetchMangaInfo](#fetchmangainfo)
- [fetchChapterPages](#fetchchapterpages)

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class, meaning it is available across most categories.
> 
<h4>Parameters</h4>

| Parameter         | Type     | Description                                                                  |
| ------------------| -------- | ---------------------------------------------------------------------------- |
| query             | `string` | query to search for. (*In this case, we're searching for `one piece`*)       |
| page (optional)   | `number` | page number (default: 1)                                                     |

```ts
vyvyManga.search('one piece').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\
output:
```js
{
    results: [
        {
          id: '55',
          title: 'One Piece',
          image: 'https://cdnxyz.xyz/web/cover/55/thumbnail.png',
          lastChapter: "Chapter 1122"
        },
        {
          id: '13713',
          title: 'One Piece x Toriko',
          image: 'https://cdnxyz.xyz/web/cover/13713/thumbnail.png',
          lastChapter: "Chapter 71.1 : Prove It."
        }
        {...},
    ]
}
```

### searchApi
Note: searchApi returns a maximum of 4 entries, these include a lot more info than the normal search, but cannot be paginated

<h4>Parameters</h4>

| Parameter         | Type     | Description                                                                                |
| ------------------| -------- | ------------------------------------------------------------------------------------------ |
| query             | `string` | query to search for. (*In this case, we're searching for `Sora no Otoshimono`*)       |

```ts
vyvyManga.searchApi('Sora no Otoshimono').then(data => {
  console.log(data);
})
```

output:
```js
{
    results: [
        {
          id: '365',
          title: 'Sora no Otoshimono',
          altTitles: ["そらのおとしもの", "Lost Continent of the Sky", "Misplaced by Heaven", "Heaven's Lost Property", "Lost Property of the Sky"],
          description: `For as long as he can remember, Tomoki Sakurai has woken up crying to the same dream: an angel he has never met disappearing into the skies, saying, "The sky has captured me." But one different. Now, the angel descends from the skies, desperately asking Tomoki for his help.

After falling asleep in class, his childhood friend Sohara Mitsuki, wakes him up and notices the tears in his eyes. Worried, she has him consult Eishirou Sugata, their eccentric upperclassman who
"The New Continent"-a flying anomaly whose existence no-one can explain. With the anomaly set to pass over their town, Sugata decides the trio should meet up at midnight in a bid to solve Tomoki's dream as we
information on The New Continent. Being the only one who showed up, Tomoki is about to leave when an angeloid falls from the sky and binds herself to him, declaring him her master. 

Shortly after, Sohara forces him to join the New Continent Discovery Club, whose sole member is Sugata. Together, they work to uncover the secrets behind The New Continent, angeloids, and the girs-but what they discover may be much more sinister than what anyone expected...

[Written by MAL Rewrite]`,
          image: 'https://cdnxyz.xyz/web/cover/365/thumbnail.png',
          status: 'Ongoing',
          score: 8,
          views: 8723,
          votes: 2,
          latestChapterId: 404911,
          lastChapter: 'Vol.14 Chapter Extra : Sora No Otoshimono: The Movie'
        },
        {
          id: '6722',
          title: 'Sora no Otoshimono Pico',
          altTitles: ["そらのおとしものPICO"],
          description: 'The kick-off chapter of the Official Sora no Otoshimono spin-off 4 panel manga. The story revolves around the three Angeloids naming Astrea, Ikaros & Nymph and how they go about their fe on earth.',
          image: 'https://cdnxyz.xyz/web/cover/6722/thumbnail.png',
          status: 'Ongoing',
          score: 0,
          views: 1242,
          votes: 0,
          latestChapterId: 1684114,
          lastChapter: 'Chapter 76'
        }
        {...},
    ]
}
```
returns a promise which resolves into an array of manga. (*[`Promise<ISearch<IMangaResult[]>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L97-L106)*)\

### fetchMangaInfo

<h4>Parameters</h4>

| Parameter | Type     | Description                                                    |
| --------- | -------- | -------------------------------------------------------------- |
| mangaId   | `string` | manga id (*can be found in the manga search results*) |

```ts
vyvyManga.fetchMangaInfo('365').then(data => {
  console.log(data);
})
```
returns a promise which resolves into an manga info object (including the chapters). (*[`Promise<IMangaInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L115-L120)*)\
output:
```js
{
    id: '365',
    title: 'Sora no Otoshimono',
    img: 'https://cdnxyz.xyz/web/cover/365/thumbnail.png',
    author: 'Minazuki, Suu',
    status: 'Ongoing',
    genres: [
    'Drama',
    'Shounen',
    'Comedy',
    'Romance',
    'Ecchi',
    'School life',
    'Sci-fi'
    ],
    description: 'For as long as he can remember, Tomoki Sakurai has woken up crying to the same dream: an angel he has never met disappearing into the skies, saying, "The sky has captured me." But one day,gel descends from the skies, desperately asking Tomoki for his help.\n' +
    '\n' +
    `After falling asleep in class, his childhood friend Sohara Mitsuki, wakes him up and notices the tears in his eyes. Worried, she has him consult Eishirou Sugata, their eccentric upperclassman who is 
flying anomaly whose existence no-one can explain. With the anomaly set to pass over their town, Sugata decides the trio should meet up at midnight in a bid to solve Tomoki's dream as well as gather more info
the only one who showed up, Tomoki is about to leave when an angeloid falls from the sky and binds herself to him, declaring him her master. \n` +
    '\n' +
    'Shortly after, Sohara forces him to join the New Continent Discovery Club, whose sole member is Sugata. Together, they work to uncover the secrets behind The New Continent, angeloids, and the girl beer may be much more sinister than what anyone expected...\n' +
    '\n' +
    '[Written by MAL Rewrite]',
    chapters: [
    {
        id: 'https://summonersky.com/rds/rdsd?data=ajV1V3Q1QkJtenN2WGFMQkZiRDVCVkRESEJVNHFOR3JEQ0RmeW9RcmY4ZVJNc1JDMzBBWnQ2VEFxbTgvWUxTb3BsUTN0bWVLNlV3VXpIMkJXc0VJRy9oQUIrSmlCazhxTHBKT3RRTHB6ZXdCWCsrZDlscDFGcUIyNUFBPT06Oj36AI7zIUTNdCiLjky42QE%3D',
        title: 'Chapter Extra : Tomodas',
        releaseDate: 'Dec 26, 2021'
    },
    {...},
    ]
}
```

### fetchChapterPages

<h4>Parameters</h4>

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| chapterId | `string` | chapter id (*can be found in the manga info*) |

```ts
vyvyManga.fetchChapterPages('https://summonersky.com/rds/rdsd?data=ajV1V3Q1QkJtenN2WGFMQkZiRDVCVkRESEJVNHFOR3JEQ0RmeW9RcmY4ZVJNc1JDMzBBWnQ2VEFxbTgvWUxTb3BsUTN0bWVLNlV3VXpIMkJXc0VJRy9oQUIrSmlCazhxTHBKT3RRTHB6ZXdCWCsrZDlscDFGcUIyNUFBPT06Oj36AI7zIUTNdCiLjky42QE%3D').then(data => {
  console.log(data);
})
```
returns an array of pages. (*[`Promise<IMangaChapterPage[]>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L122-L126)*)\
output:
```js
[
    {
      img: 'https://2.bp.blogspot.com/drive-storage/AJQWtBMVRKoJp-clDe4drPLiVy9BAa_HaTMKwTHKIrJu_QU8JoEUrtFUbVmI9DtujSQ8m1kUdLncWyORMBTSQRDeHXDDKrj8kLBn_bZ28IK3xXHKfew',
      page: 1
    },
    {
      img: 'https://2.bp.blogspot.com/drive-storage/AJQWtBPTWisux6GXquokqOY61nBQQxSFAJssCofcUAyr_5t-wgMYUqwEIK1lCj7gioS2PgNfsx65OzL7U6__tAuTnovoi_NmUhvC4nIHfWXZD_As8Es',
      page: 2
    },
    {
      img: 'https://2.bp.blogspot.com/drive-storage/AJQWtBNpJ_igFttyAFN0n6e8w4-5lp1VsE9fTxB7NDBOpaZETBz1mFrfLOrkgGaMDRjcu3-ude-zaA2sECqTtCY5vbs3PvaP-nMY2Der0C_G_iAsYTE',
      page: 3
    },
    {
      img: 'https://2.bp.blogspot.com/drive-storage/AJQWtBP47Ex-EfnLXazHMll94UUJaU1B-SV-Zeomtw7iRWns_bhsyD9HK5CyBa0uUkEa7zMuvWN41YWt-fGReg35MDhnnlkpLNalzH0qFrESagST1Eg',
      page: 4
    },
    {...},
]
```

<p align="end">(<a href="https://github.com/consumet/extensions/blob/master/docs/guides/manga.md#">Back to Providers List</a>)</p>
