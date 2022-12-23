import { AnimeParser, IAnimeInfo, ISource, IEpisodeServer } from '../../models';
export interface EpisodeData {
    id: string;
    number: number;
    title?: string;
    animeTitle?: string;
    description?: string;
    image?: string;
    releaseDate?: string;
    streamData?: StreamData;
    [x: string]: unknown;
}
export interface StreamData {
    sources?: Source[];
    subtitles?: Subtitle[];
}
export interface Source {
    url: string;
    quality: string;
}
export interface Subtitle {
    url: string;
    lang: string;
}
declare class Crunchyroll extends AnimeParser {
    fetchEpisodeServers(episodeId: string): Promise<IEpisodeServer[]>;
    readonly name = "Crunchyroll";
    protected baseUrl: string;
    protected logo: string;
    protected classPath: string;
    private locale;
    private channelId;
    private languageNames;
    private subOrder;
    search(query: string, locale?: string): Promise<unknown>;
    /**
     * @param id Anime id
     * @param mediaType Anime type (series, movie)
     */
    fetchAnimeInfo: (id: string, mediaType: string, locale?: string, fetchAllSeason?: boolean) => Promise<IAnimeInfo>;
    fetchEpisodeSources: (episodeId: string, locale?: string) => Promise<ISource>;
}
export default Crunchyroll;
