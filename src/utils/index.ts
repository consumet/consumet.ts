import { GogoCDN, StreamSB, UpCloud, MixDrop } from './extractors';
import {
  USER_AGENT,
  splitAuthor,
  floorID,
  formatTitle,
  genElement,
  capitalizeFirstLetter,
} from './utils';
import { parsePostInfo } from './getComics';
import { getSize, splitStar } from './zLibrary';

export {
  USER_AGENT,
  GogoCDN,
  StreamSB,
  splitAuthor,
  floorID,
  formatTitle,
  parsePostInfo,
  getSize,
  splitStar,
  genElement,
  capitalizeFirstLetter,
  UpCloud,
  MixDrop,
};
