/**
 * List of providers
 *
 * add new providers here
 */
export declare const PROVIDERS_LIST: {
    ANIME: (import("../providers/anime/en/gogoanime").default | import("../providers/anime/en/9anime").default)[];
    MANGA: import("../providers/manga/all/mangadex").default[];
    BOOKS: import("../providers/books/libgen").default[];
    COMICS: import("../providers/comics/getComics").default[];
    LIGHT_NOVELS: import("../providers/light-novels/en/readlightnovels").default[];
    OTHERS: never[];
};
