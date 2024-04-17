import { AnimeParser, ISearch, IAnimeInfo, IEpisodeServer, StreamingServers, IAnimeResult, ISource } from '../../models';
declare class Gogoanime extends AnimeParser {
    readonly name = "Gogoanime";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private readonly ajaxUrl;
    /**
     *
     * @param query search query string
     * @param page page number (default 1) (optional)
     */
    search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    /**
     *
     * @param id anime id
     */
    fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
    /**
     *
     * @param episodeId episode id
     * @param server server type (default 'GogoCDN') (optional)
     */
    fetchEpisodeSources: (episodeId: string, server?: StreamingServers) => Promise<ISource>;
    /**
     *
     * @param episodeId episode link or episode id
     */
    fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
    /**
     *
     * @param episodeId episode link or episode id
     */
    fetchAnimeIdFromEpisodeId: (episodeId: string) => Promise<string>;
    /**
     * @param page page number (optional)
     * @param type type of media. (optional) (default `1`) `1`: Japanese with subtitles, `2`: english/dub with no subtitles, `3`: chinese with english subtitles
     */
    fetchRecentEpisodes: (page?: number, type?: number) => Promise<ISearch<IAnimeResult>>;
    fetchGenreInfo: (genre: string, page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchTopAiring: (page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchRecentMovies: (page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchPopular: (page?: number) => Promise<ISearch<IAnimeResult>>;
    fetchGenreList: () => Promise<{
        id: string | undefined;
        title: string | undefined;
    }[]>;
    fetchDirectDownloadLink: (downloadUrl: string, captchaToken?: string) => Promise<{
        source: string | undefined;
        link: string | undefined;
    }[]>;
    fetchAnimeList: (page?: number) => Promise<ISearch<IAnimeResult>>;
}
export default Gogoanime;
