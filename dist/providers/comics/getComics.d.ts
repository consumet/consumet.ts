import { ComicParser, ComicRes } from '../../models';
declare class getComics extends ComicParser {
    readonly baseUrl = "https://getcomics.info/";
    readonly name = "GetComics";
    readonly logo = "https://scontent-lga3-1.xx.fbcdn.net/v/t31.18172-8/10923821_1548503832063793_2041220008970231476_o.png?_nc_cat=102&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=aQyuLlPZtQAAX8dJviD&_nc_ht=scontent-lga3-1.xx&oh=00_AT_yPS4uuNDGirSqXnTwl2VGS9leFv4-Ujt7l6l5_FZeLw&oe=62D00D68";
    readonly classPath = "COMICS.GetComics";
    search: (query: string, page?: number | undefined) => Promise<ComicRes>;
}
export default getComics;
