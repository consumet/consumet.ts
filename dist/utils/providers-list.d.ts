/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export declare const PROVIDERS_LIST: {
    ANIME: (import("../providers/anime/gogoanime").default | import("../providers/anime/9anime").default | import("../providers/anime/animepahe").default | import("../providers/anime/zoro").default | import("../providers/anime/animefox").default | import("../providers/anime/enime").default | import("../providers/anime/crunchyroll").default | import("../providers/anime/bilibili").default | import("../providers/anime/marin").default)[];
    MANGA: (import("../providers/manga/mangadex").default | import("../providers/manga/comick").default | import("../providers/manga/mangahere").default | import("../providers/manga/mangakakalot").default | import("../providers/manga/mangasee123").default | import("../providers/manga/mangapark").default | import("../providers/manga/mangapill").default | import("../providers/manga/mangareader").default | import("../providers/manga/flamescans").default)[];
    BOOKS: import("../providers/books/libgen").default[];
    COMICS: import("../providers/comics/getComics").default[];
    LIGHT_NOVELS: import("../providers/light-novels/readlightnovels").default[];
    MOVIES: (import("../providers/movies/flixhq").default | import("../providers/movies/viewAsian").default | import("../providers/movies/dramacool").default | import("../providers/movies/fmovies").default)[];
    NEWS: import("../providers/news/animenewsnetwork").default[];
    META: (import("../providers/meta/anilist").default | import("../providers/meta/mal").default | import("../providers/meta/tmdb").default)[];
    OTHERS: never[];
};
