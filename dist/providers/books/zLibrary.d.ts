import { BookParser, ZLibrary } from '../../models';
declare class Zlibrary extends BookParser {
    protected readonly baseUrl = "https://3lib.net";
    readonly name = "ZLibrary";
    protected classPath: string;
    protected logo: string;
    isWorking: boolean;
    private headers;
    search: (bookTitle: string, page?: number) => Promise<{
        containers: ZLibrary[];
        page: number;
    } | undefined>;
}
export default Zlibrary;
