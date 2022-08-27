import { NewsParser, INewsFeed, Topics, INewsInfo } from '../../models';
declare class NewsFeed implements INewsFeed {
    title: string;
    id: string;
    uploadedAt: string;
    topics: Topics[];
    preview: INewsFeed['preview'];
    thumbnail: string;
    url: string;
    constructor(title: string, id: string, uploadedAt: string, topics: Topics[], preview: INewsFeed['preview'], thumbnail: string, url: string);
    getInfo(): Promise<INewsInfo>;
}
export default class AnimeNewsNetwork extends NewsParser {
    readonly name = "Anime News Network";
    protected baseUrl: string;
    protected classPath: string;
    protected logo: string;
    /**
     * @param options Options for fetching the feeds
     */
    fetchNewsFeeds: (options?: {
        topic?: Topics;
    }) => Promise<NewsFeed[]>;
    /**
     * @param id ID of the news from Anime News Network
     * @example
     * fetchNewsInfo('2022-08-26/higurashi-no-naku-koro-ni-rei-oni-okoshi-hen-manga-ends/.188996') // --> https://www.animenewsnetwork.com/news/2022-08-26/higurashi-no-naku-koro-ni-rei-oni-okoshi-hen-manga-ends/.188996
     */
    fetchNewsInfo: (id: string) => Promise<INewsInfo>;
}
export {};
