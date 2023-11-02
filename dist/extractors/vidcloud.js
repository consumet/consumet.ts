"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
const models_1 = require("../models");
const utils_1 = require("../utils");
class VidCloud extends models_1.VideoExtractor {
    constructor() {
        super(...arguments);
        this.serverName = 'VidCloud';
        this.sources = [];
        this.host = 'https://megacloud.tv';
        this.host2 = 'https://rabbitstream.net';
        this.extract = async (videoUrl, isAlternative = false) => {
          const result = {
              sources: [],
              subtitles: [],
              intro: {},
              outro: {},
          };

          try {
              const id = videoUrl.href.split('/').pop()?.split('?')[0];
              const options = {
                  headers: {
                      'X-Requested-With': 'XMLHttpRequest',
                      Referer: videoUrl.href,
                      'User-Agent': utils_1.USER_AGENT,
                  },
              };

              const res = await this.client.get(`${isAlternative ? this.host2 : this.host}/embed-2/ajax/e-1/getSources?id=${id}`, options);

              let sources = [];

              if (!(0, utils_1.isJson)(res.data.sources)) {
                  let { data: key } = await this.client.get('https://github.com/enimax-anime/key/blob/e6/key.txt');
                  key = (0, utils_1.substringBefore)((0, utils_1.substringAfter)(key, '"blob-code blob-code-inner js-file-line">'), '</td>');
                  if (!key) {
                      key = await (await this.client.get('https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt')).data;
                  }

                  const sourcesArray = res.data.sources.split("");
                  let extractedKey = "";

                  for (const index of key) {
                      for (let i = Number(index[0]); i < Number(index[1]); i++) {
                          extractedKey += sourcesArray[i];
                          sourcesArray[i] = "";
                      }
                  }

                  key = extractedKey;
                  res.data.sources = sourcesArray.join("");

                  const decryptedVal = crypto_js_1.default.AES.decrypt(res.data.sources, key).toString(crypto_js_1.default.enc.Utf8);
                  sources = (0, utils_1.isJson)(decryptedVal) ? JSON.parse(decryptedVal) : [{ file: res.data.sources }];
              } else {
                  sources = JSON.parse(res.data.sources);
              }

              for (const source of sources) {
                  if (source.type === "hls") {
                      const { data } = await this.client.get(source.file);
                      const resolutions = data.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);

                      resolutions?.forEach((res) => {
                          const index = source.file.lastIndexOf("/");
                          const quality = res.split("\n")[0].split("x")[1].split(",")[0];
                          const url = source.file.slice(0, index);

                          result.sources.push({
                              url: url + "/" + res.split("\n")[1],
                              quality: quality + "p",
                          });
                      });
                  }
              }

              if (res.data.intro.end > 1) {
                  result.intro = {
                      start: res.data.intro.start,
                      end: res.data.intro.end,
                  };
              }

              if (res.data.outro.end > 1) {
                  result.outro = {
                      start: res.data.outro.start,
                      end: res.data.outro.end,
                  };
              }

              result.sources.push({
                  url: sources[0].file,
                  quality: "auto",
              });

              result.subtitles = res.data.tracks?.map((s) => ({
                  url: s.file,
                  lang: s.label ? s.label : "Thumbnails",
              }));

              return result;
          } catch (err) {
              throw err;
          }
      };
    }
}
exports.default = VidCloud;
//# sourceMappingURL=vidcloud.js.map
