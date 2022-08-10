/**
 * List of providers
 *
 * add new providers here (order does not matter)
 */
export declare const PROVIDERS_LIST: {
    ANIME: (import("../providers/anime/gogoanime").default | import("../providers/anime/9anime").default | import("../providers/anime/animepahe").default | import("../providers/anime/zoro").default | import("../providers/anime/animxplay").default | import("../providers/anime/animefox").default)[];
    MANGA: (import("../providers/manga/mangadex").default | import("../providers/manga/mangahere").default | import("../providers/manga/mangakakalot").default)[];
    BOOKS: import("../providers/books/libgen").default[];
    COMICS: import("../providers/comics/getComics").default[];
    LIGHT_NOVELS: import("../providers/light-novels/readlightnovels").default[];
    MOVIES: import("../providers/movies/flixhq").default[];
    META: import("../providers/meta/anilist").default[];
    OTHERS: never[];
};
