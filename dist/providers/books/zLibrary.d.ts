import { BookParser } from '../../models';
declare class Zlibrary extends BookParser {
    protected readonly baseUrl = "https://3lib.net";
    readonly name = "ZLibrary";
    protected classPath: string;
    protected logo: string;
    isWorking: boolean;
    search: (bookUrl: string) => Promise<void>;
}
export default Zlibrary;
