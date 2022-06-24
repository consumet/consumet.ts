<h1 align="center">Consumet Extensions</h1>

## LIGHT_NOVELS
LIGHT_NOVELS is a category provider, which provides a list of light novels providers. Each light novel provider is a subclass of the [`LightNovelParser`](https://github.com/consumet/extensions/blob/master/src/models/lightnovel-parser.ts) class.

By using `LIGHT_NOVELS` category you can interact with the light novel providers. And have access to the light novel providers methods.

in the examples below, we will use the `ReadLightNovels` provider.
```ts
const readlightnovels = new LIGHT_NOVELS.ReadLightNovels();
```

### search
> Note: This method is a subclass of the [`BaseParser`](https://github.com/consumet/extensions/blob/master/src/models/base-parser.ts) class. meaning it is available across most categories.

take a string as a parameter and return a list of light novels. In this case, We're searching for `Classrrom of the Elite`

returns a promise which resolves into an array of light novels. (*[`Promise<ISearch<ILightNovelResult>>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L128-L134)*)
```ts
readlightnovels.search("Classrrom of the Elite").then(data => {
  console.log(data);
}
```
output:
```json
{
  results: [
    {
      id: 'youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e', // the light novel id
      title: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e Novel (Classroom of the Elite Novel)',
      url: 'https://readlightnovels.net/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e.html',
      image: 'https://readlightnovels.net/wp-content/uploads/2020/01/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e.jpg'
    },
    {...}
    ...
  ]
}
```

### fetchLightNovelInfo
take an light novel id or url as a parameter. (*light novel id or url can be found in the light novel search results*)

returns a promise which resolves into an light novel info object (including the chapters or volumes). (*[`Promise<ILightNovelInfo>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L148-L156)*)
```ts
readlightnovels.fetchLightNovelInfo("youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e").then(data => {
  console.log(data);
}
```
output:
```json
{
  id: 'youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e',
  title: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e Novel (Classroom of the Elite Novel)',
  url: 'https://readlightnovels.net/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e.html',
  image: 'https://readlightnovels.net/wp-content/uploads/2020/01/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e.jpg',
  author: 'Kinugasa Shougo衣笠彰梧',
  genres: [
    'Drama',
    'Harem',
    '...'
  ],
  rating: 8.6,
  views: 651729,
  description: 'Kōdo Ikusei Senior High School, a leading prestigious school with state-of-the-art facilities where nearly...',
  status: 'Ongoing',
  pages: 13,
  chapters: [
    {
      id: 'youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/volume-1-prologue-the-structure-of-japanese-society',
      title: 'Volume 1, Prologue: The structure of Japanese society',
      url: 'https://readlightnovels.net/youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/volume-1-prologue-the-structure-of-japanese-society.html'
    },
    {...}
    ...
```

### fetchChapterContent
take an chapter id as a parameter. (*chapter id can be found in the light novel info object*)

returns a content object. (*[`Promise<ILightNovelChapterContent>`](https://github.com/consumet/extensions/blob/master/src/models/types.ts#L143-L146)*)
```ts
readlightnovels.fetchChapterContent("youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e/volume-1-prologue-the-structure-of-japanese-society").then(data => {
  console.log(data);
}
```
output:
```json
{
  text: '\n' +
    'It’s a bit sudden,...',
  html: '<p></p><p>It’s a bit sudden, but listen seriously to the question I’m about to ask and think about...'
}
```