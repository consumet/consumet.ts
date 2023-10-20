import { META } from "..";

const anilist = new META.Anilist();
anilist.fetchAnimeInfo("21").then(data => {
    console.log(data);
  })
