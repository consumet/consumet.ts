import axios from 'axios';
import { CheerioAPI, load } from 'cheerio';
import { val } from 'cheerio/lib/api/attributes';
import { assert, timeEnd } from 'console';
import { stat } from 'fs';


import {
    AnimeParser,
    ISearch,
    IAnimeInfo,
    MediaStatus,
    IAnimeResult,
    ISource,
    IAnimeEpisode,
    SubOrSub,
    IEpisodeServer,
    Genres,
    MangaParser,
    IMangaChapterPage,
    IMangaInfo,
    IMangaResult,
    IMangaChapter,
    ProxyConfig,
    MediaFormat,
    ITitle,
    FuzzyDate,
  } from '../../models';

let substringAfter = function substringAfter(str : string, toFind : string) {
    let index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(index + toFind.length);
}

let substringBefore = function substringBefore(str : string, toFind : string) {
    let index = str.indexOf(toFind);
    return index == -1 ? "" : str.substring(0, index);
}



class Myanimelist extends AnimeParser {
  fetchAnimeInfo(animeId: string, ...args: any): Promise<IAnimeInfo> {
      throw new Error('Method not implemented.');
  }
  fetchEpisodeSources(episodeId: string, ...args: any): Promise<ISource> {
      throw new Error('Method not implemented.');
  }
  fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]> {
      throw new Error('Method not implemented.');
  }
  search(query: string, ...args: any[]): Promise<unknown> {
      throw new Error('Method not implemented.');
  }
  override readonly name = 'Myanimelist';
  protected override baseUrl = 'https://myanimelist.net/';
  protected override logo = 'https://en.wikipedia.org/wiki/MyAnimeList#/media/File:MyAnimeList.png';
  protected override classPath = 'META.MAL';

  /**
   * This class maps anilist to kitsu with any other anime provider.
   * kitsu is used for episode images, titles and description.
   * @param provider anime provider (optional) default: Gogoanime
   * @param proxy proxy config (optional) default: null
   */
  constructor() {
    super();
  }

  malStatusToMediaStatus(status : string) : MediaStatus {
    if(status == "currently airing"){
        return MediaStatus.ONGOING;
    }
    else if(status == "finished airing"){
        return MediaStatus.COMPLETED;
    } else if(status == "not yet aired"){
        return MediaStatus.NOT_YET_AIRED;
    }

    return MediaStatus.UNKNOWN;
  }

  async populateEpisodeList(episodes : IAnimeEpisode[], url : string, count : number = 1) : Promise<void>{
    try{
        let {data}  = await axios.request({
            "method" : "get",
            "url" : `${url}?p=${count}`,
            "headers" : {
                "user-agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35"
            }
        });

        let hasEpisodes : boolean = false;
        let $ : CheerioAPI = load(data);
        for(let elem of $(".video-list").toArray()){
            let href  = $(elem).attr("href");
            let image = $(elem).find("img").attr("data-src");
            let titleDOM = $(elem).find(".episode-title");
            let title = titleDOM?.text();
            titleDOM.remove();

            let numberDOM = $(elem).find(".title").text().split(" ");
            let number= 0;
            if(numberDOM.length > 1){
                number = Number(numberDOM[1]);
            }
            if(href && href.indexOf("myanimelist.net/anime") > -1){
                hasEpisodes = true;
                episodes.push({
                    id : "",
                    number,
                    title,
                    image
                });
            }
        }

        if(hasEpisodes){
            await this.populateEpisodeList(episodes, url, (++count));
        }
    }catch(err){
        console.error(err);
    }
  }
  fetchMalInfoById  = async (id: string) : Promise<IAnimeInfo> => {
    const animeInfo: IAnimeInfo = {
        id: id,
        title: "",
    };


    let { data } = await axios.request({
        "method" : "get",
        "url" : `https://myanimelist.net/anime/${id}`,
        "headers" : {
            "user-agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35"
        }

    });

    let $ = load(data);
    let episodes : IAnimeEpisode[]= [];
    let desc = $('[itemprop="description"]').first().text();
    let imageElem = $('[itemprop="image"]').first();
    let image = imageElem.attr("src") || imageElem.attr("data-image") || imageElem.attr("data-src");
    let genres : string[] = [];
    let genreDOM = $('[itemprop="genre"]').get();

    genreDOM.forEach((elem) => {
            let genreText = $(elem).text();
            genres.push(genreText);
        }
    );

    animeInfo.genres = genres;
    animeInfo.image = image;
    animeInfo.description = desc;
    animeInfo.title = $(".title-name")?.text();
    animeInfo.studios = [];
    animeInfo.episodes = episodes;


    let teaserDOM = $(".video-promotion > a");
    if(teaserDOM.length > 0){
        let teaserURL = $(teaserDOM).attr("href");
        let style = $(teaserDOM).attr("style");
        if(teaserURL){
            animeInfo.trailer = {
                "id" : substringAfter(teaserURL, "embed/").split("?")[0],
                "site" : "https://youtube.com/watch?v=",
                "thumbnail" : style ? substringBefore(substringAfter(style, "url('"), "'") : ""
            };
        }
    }

    let description = $(".spaceit_pad").get();

    description.forEach((elem) =>{
        let text =  $(elem).text().toLowerCase().trim();
        let key = text.split(":")[0];
        let value = substringAfter(text, `${key}:`).trim();
        switch(key){
            case "status":
                animeInfo.status = this.malStatusToMediaStatus(value);
                break;
            case "episodes":
                animeInfo.totalEpisodes = parseInt(value);
                if(isNaN(animeInfo.totalEpisodes)){
                    animeInfo.totalEpisodes = 0;
                }
                break;
            case "premiered":
                animeInfo.season = value.split(" ")[0];
                break;
            case "aired":
                const dates = value.split("to");
                if(dates.length >= 2){
                    let start = dates[0].trim();
                    let end = dates[1].trim();
                    let startDate = new Date(start);
                    let endDate = new Date(end);

                    if(startDate.toString() !== "Invalid Date"){
                        animeInfo.startDate = {
                            "day" : startDate.getDate(),
                            "month" : startDate.getMonth(),
                            "year" : startDate.getFullYear()
                        }
                    }

                    if(endDate.toString() != "Invalid Date"){
                        animeInfo.endDate = {
                            "day" : endDate.getDate(),
                            "month" : endDate.getMonth(),
                            "year" : endDate.getFullYear()
                        }
                    }
                }

                break;

            case "score":
                animeInfo.rating = parseFloat(value);
                break;
            case "synonyms":
                animeInfo.synonyms = value.split(",");
                animeInfo.synonyms = animeInfo.synonyms.map((x) => {
                    return x.trim();
                });
                break;
            case "studios":
                for(let studio of $(elem).find("a")){
                    animeInfo.studios?.push($(studio).text());
                }
                break;
            case "rating":
                animeInfo.ageRating = value;

        }

    });

    // Only works on certain animes, so it is unreliable
    let videoLink = $(".mt4.ar a").attr("href");
    if(videoLink){
        await this.populateEpisodeList(episodes, videoLink);
    }
    return animeInfo;
  }
}

export default Myanimelist;

(async() => {
const mal = new Myanimelist();
    let count = 0;
    let start = performance.now();
    console.log((await mal.fetchMalInfoById("1535")));
    // setInterval(async function(){
    //     let numReqs = 1;
    //     let promises = [];
    //     for(let i = 0; i < numReqs; i++){
    //         promises.push(mal.fetchMalInfoById("28223"));
    //     }
    //     let data : IAnimeInfo[] = await Promise.all(promises);

    //     for(let i = 0; i < numReqs; i++){
    //         assert(data[i].rating === 8.161);
    //     }

    //     count+=numReqs;
    //     console.log("Count: ", count, "Time: ", (performance.now() - start));
    // },1000);
})();
