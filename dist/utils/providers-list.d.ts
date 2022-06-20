/**
 * List of providers
 *
 * add new providers here
 */
export declare const PROVIDERS_LIST: {
    ANIME: (import("../providers/anime/gogoanime").default | import("../providers/anime/9anime").default)[];
    MANGA: import("../providers/manga/mangadex").default[];
    BOOKS: import("../providers/books/libgen").default[];
    COMICS: import("../providers/comics/getComics").default[];
    LIGHT_NOVELS: import("../providers/light-novels/readlightnovels").default[];
    OTHERS: never[];
};
