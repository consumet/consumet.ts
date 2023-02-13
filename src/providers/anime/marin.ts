import axios from 'axios';
import { load } from 'cheerio';

import {
  AnimeParser,
  ISearch,
  IAnimeInfo,
  MediaStatus,
  IAnimeResult,
  ISource,
  IAnimeEpisode,
  IEpisodeServer,
} from '../../models';

/**
 * @attention Cloudflare bypass is **REQUIRED**.
 */
class Marin extends AnimeParser {
  override readonly name = 'Marin';
  protected override baseUrl = 'https://marin.moe';
  protected override logo =
    'https://i.pinimg.com/736x/62/8d/3f/628d3f2e60b0aa8c8fa9598e8dae6320.jpg';
  protected override classPath = 'ANIME.Marin';

  private async getToken(): Promise<string[]> {
    let token: string[] = [];

    let response = await axios.get('https://marin.moe/anime', {
      headers: {
        Referer: 'https://marin.moe/anime',
        Cookie: '__ddg1_=;__ddg2_=;',
      },
    });

    token.push(response.headers['set-cookie']![1].replace('marinmoe_session=', ''));
    token.push(response.headers['set-cookie']![0].replace('XSRF-TOKEN=', ''));

    return token;
  }

  public recentEpisodes = async (page: number = 1): Promise<ISearch<IAnimeResult>> => {
    let token = await this.getToken()
    let data;
    try {
      let response = await axios.post('https://marin.moe/anime',{"page" : page,"sort":"rel-d","filter":{"type":[],"status":[],"content_rating":[],"genre":[],"group":[],"production":[],"source":[],"resolution":[],"audio":[],"subtitle":[]},"search": ""}, {
        headers: {
          Origin: 'https://marin.moe/',
          Referer: 'https://marin.moe/anime',
          Cookie: `__ddg1=;__ddg2_=; XSRF-TOKEN=${token[1]}; marinmoe_session=${token[0]};`,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          "x-xsrf-token": token[1].split(';')[0].replace("%3D", "="),
          "x-inertia": true
        },
      });
      data = await response.data;
    } catch (error) {
      console.log(error)
    }
    let response_data = {
      currentPage: page,
      hasNextPage: data.props.anime_list.meta.last_page > page,
      results: data.props.anime_list.data.map((el: any) => {
        return {
          id: el.slug,
          title: el.title,
          image: el.cover,
          releaseDate: el.year,
          type: el.type
        };
      })
    }
    return response_data;
  };

  /**
   * @param query Search query
   */
  override search = async (query: string, page: number = 1): Promise<ISearch<IAnimeResult>> => {
    let token = await this.getToken()
    let data;
    try {
      let response = await axios.post('https://marin.moe/anime',{"page" : page,"sort":"az-a","filter":{"type":[],"status":[],"content_rating":[],"genre":[],"group":[],"production":[],"source":[],"resolution":[],"audio":[],"subtitle":[]},"search": query}, {
        headers: {
          Origin: 'https://marin.moe/',
          Referer: 'https://marin.moe/anime',
          Cookie: `__ddg1=;__ddg2_=; XSRF-TOKEN=${token[1]}; marinmoe_session=${token[0]};`,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          "x-xsrf-token": token[1].split(';')[0].replace("%3D", "="),
          "x-inertia": true
        },
      });
      data = await response.data;
    } catch (error) {
      console.log(error)
    }
    let response_data = {
      currentPage: page,
      hasNextPage: data.props.anime_list.meta.last_page > page,
      results: data.props.anime_list.data.map((el: any) => {
        return {
          id: el.slug,
          title: el.title,
          image: el.cover,
          releaseDate: el.year,
          type: el.type
        };
      })
    }
    return response_data;
  };

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    let data;
    try {
      let response = await axios.get(`https://marin.moe/anime/${id}`, {
        headers: {
          Origin: 'https://marin.moe/',
          Referer: `https://marin.moe/anime/${id}`,
          Cookie: `__ddg1=;__ddg2_=;`,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          "x-inertia": true,
          "x-inertia-version": "884345c4d568d16e3bb2fb3ae350cca9",
          "x-requested-with": "XMLHttpRequest",
        },
      });
      data = await response.data;
    } catch (error) {
      console.log(error)
    }
    let episodes: any[] = data.props.episode_list.data
    if(data.props.anime.last_episode > 36) {
      let token = await this.getToken()
      for (let index = 2; index < data.props.anime.last_episode / 36; index++) {
        let response = await axios.post(`https://marin.moe/anime/${id}`, {"filter":{"episodes":true,"specials":true},"eps_page": index}, {
          headers: {
            Origin: 'https://marin.moe/',
            Referer: `https://marin.moe/anime/${id}`,
            Cookie: `__ddg1=;__ddg2_=; XSRF-TOKEN=${token[1]}; marinmoe_session=${token[0]};`,
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            "x-inertia": true,
            "x-inertia-version": "884345c4d568d16e3bb2fb3ae350cca9",
            "x-requested-with": "XMLHttpRequest",
            "x-xsrf-token": token[1].split(';')[0].replace("%3D", "="),
          },
        });
        let data = await response.data;
        episodes = episodes.concat(data.props.episode_list.data);
      }
    }
    //{"filter":{"episodes":true,"specials":true},"eps_page":2}

    let response_data: IAnimeInfo = {
      id: id,
      title: {
        native: data.props.anime.alt_titles["Official Title"][0].text,
        romaji: data.props.anime.title,
        english: data.props.anime.alt_titles["Official Title"][1].text
      },
      synonyms: data.props.anime.alt_titles["Synonym"].map((el: any) => {
        return el.text
      }),
      image: data.props.anime.cover,
      cover: data.props.anime.cover,
      description: data.props.anime.description,
      status: data.props.anime.status.name,
      releaseDate: data.props.anime.release_date,
      totalEpisodes: data.props.anime.last_episode,
      currentEpisode: data.props.anime.last_episode,
      genres: data.props.anime.genre_list.map((el: any) => {
        return el.name
      }),
      studios: data.props.anime.production_list.map((el: any) => {
        return el.name
      }),
      type: data.props.anime.type.name,
      ageRating: data.props.anime.content_rating.name,
      episodes: episodes.map((el: any) => {
        return {
          id: `${id}/${el.sort}`,
          title: el.title,
          number: el.sort,
          image: el.cover,
          airdate: el.release_date
        };
      })
    }

    return response_data;
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeSources = async (id: string, episodeNumber: number): Promise<ISource> => {
    let data;
    try {
      let response = await axios.get(`https://marin.moe/anime/${id}/${episodeNumber}`, {
        headers: {
          Origin: 'https://marin.moe/',
          Referer: `https://marin.moe/anime/${id}/${episodeNumber}`,
          Cookie: `__ddg1=;__ddg2_=;`,
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
          "x-inertia": true,
          "x-inertia-version": "884345c4d568d16e3bb2fb3ae350cca9",
          "x-requested-with": "XMLHttpRequest",
        },
      });
      data = await response.data;
    } catch (error) {
      console.log(error)
    }

    let response_data = {
      sources: data.props.video.data.mirror.map((el: any) => {
        return {
          url: el.code.file,
          quality: el.resolution,
          isM3U8: false,
          duration: el.code.duration,
          thumbnail: el.code.thumbnail
        };
      }),
      sprites: data.props.video.data.mirror[0].code.sprite,
      spriteVtt: data.props.video.data.mirror[0].code.vtt,
    }

    return response_data;
  };

  /**
   *
   * @param episodeId Episode id
   */
  override fetchEpisodeServers = (episodeId: string): Promise<IEpisodeServer[]> => {
    throw new Error('Method not implemented.');
  };
}

export default Marin;

