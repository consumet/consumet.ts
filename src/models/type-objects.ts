import { Hashes } from './base-types';
import { GetComicsComics, LibgenBook, ZLibrary } from './types';

export class LibgenBookObject implements LibgenBook {
  title = '';
  authors = [];
  publisher = '';
  year = '';
  edition = '';
  volume = '';
  series = '';
  isbn = [];
  link = '';
  id = '';
  language = '';
  format = '';
  size = '';
  pages = '';
  image = '';
  description = '';
  tableOfContents = '';
  topic = '';
  hashes = new HashesObject();
}

class HashesObject implements Hashes {
  AICH = '';
  CRC32 = '';
  eDonkey = '';
  MD5 = '';
  SHA1 = '';
  SHA256 = [];
  TTH = '';
}

export class GetComicsComicsObject implements GetComicsComics {
  image = '';
  title = '';
  year = '';
  size = '';
  excerpt = '';
  description = '';
  download = '';
  category = '';
  ufile = '';
  mega = '';
  mediafire = '';
  zippyshare = '';
  readOnline = '';
}

export class ZLibraryObject implements ZLibrary {
  bookRating = '';
  bookQuality = '';
  description = '';
  title = '';
  authors: string[] = [];
  publisher = '';
  year = '';
  edition = '';
  volume = '';
  series = '';
  isbn = [];
  link = '';
  id = '';
  language = '';
  size = '';
  pages = '';
  image = '';
}
