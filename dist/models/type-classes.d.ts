import { Hashes } from './base-types';
import { LibgenBook } from './types';
export declare class LibgenBookObject implements LibgenBook {
    title: string;
    authors: never[];
    publisher: string;
    year: string;
    edition: string;
    volume: string;
    series: string;
    isbn: never[];
    link: string;
    id: string;
    language: string;
    format: string;
    size: string;
    pages: string;
    image: string;
    description: string;
    tableOfContents: string;
    topic: string;
    hashes: HashesObject;
}
declare class HashesObject implements Hashes {
    AICH: string;
    CRC32: string;
    eDonkey: string;
    MD5: string;
    SHA1: string;
    SHA256: never[];
    TTH: string;
}
export {};
