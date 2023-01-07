import { ComicParser, ComicRes } from '../../models';
declare class getComics extends ComicParser {
    readonly baseUrl = "https://getcomics.info/";
    readonly name = "GetComics";
    readonly logo = "https://i0.wp.com/getcomics.info/share/uploads/2020/04/cropped-GetComics-Favicon.png?fit=192%2C192&ssl=1";
    readonly classPath = "COMICS.GetComics";
    search: (query: string, page?: number | undefined) => Promise<ComicRes>;
}
export default getComics;
