/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export declare const PROVIDERS_LIST: {
    ANIME: (import("../providers/anime/gogoanime").default | import("../providers/anime/animepahe").default | import("../providers/anime/anify").default | import("../providers/anime/bilibili").default | import("../providers/anime/animesaturn").default | import("../providers/anime/animekai").default | import("../providers/anime/kickassanime").default)[];
    MANGA: (import("../providers/manga/mangadex").default | import("../providers/manga/comick").default | import("../providers/manga/mangahere").default | import("../providers/manga/mangapill").default | import("../providers/manga/mangareader").default)[];
    COMICS: import("../providers/comics/getComics").default[];
    LIGHT_NOVELS: never[];
    MOVIES: (import("../providers/movies/dramacool").default | import("../providers/movies/flixhq").default | import("../providers/movies/goku").default | import("../providers/movies/turkish123").default | import("../providers/movies/sflix").default | import("../providers/movies/himovies").default)[];
    NEWS: import("../providers/news/animenewsnetwork").default[];
    META: import("../providers/meta/tmdb").default[];
    OTHERS: never[];
};
