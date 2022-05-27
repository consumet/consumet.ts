export interface Book {
  title: string;
  authors: string[];
  publisher: string;
  year: string;
  edition: string;
  volume: string;
  series: string;
  isbn: string[];
  link: string;
}

export interface Hashes {
  AICH: string;
  CRC32: string;
  eDonkey: string;
  MD5: string;
  SHA1: string;
  SHA256: string[];
  TTH: string;
}
