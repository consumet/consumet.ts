import { Hashes } from './base-types';
import { LibgenBook } from './types';

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
