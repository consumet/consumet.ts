import axios from 'axios';

import { VideoExtractor, IVideo, ISubtitle } from '../models';
import { load } from 'cheerio';

class SmashyStream extends VideoExtractor {
  protected override serverName = 'SmashyStream';
  protected override sources: IVideo[] = [];

  private readonly host = 'https://embed.smashystream.com';


  override extract = async (
    videoUrl: URL,
    player: string = 'Player F'
  ): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> => {
    try {
      let result: { sources: IVideo[] } & { subtitles: ISubtitle[] } = {
        sources: [],
        subtitles: [],
      };

      const { data } = await axios.get(videoUrl.href);
      const $ = load(data);

      await Promise.all(
        $('div#_default-servers a.server')
          .map(async (i, el) => {
            const streamLink = $(el).attr('data-id') ?? '';

            if (streamLink.includes('/ffix') && player.toLowerCase() === $(el).text().toLowerCase()) {
              result = await this.invokeSmashyFfix(videoUrl.href);
            }
          })
          .get()
      );

      return result;
    } catch (err) {
      throw err;
    }
  };

  async invokeSmashyFfix(url: string): Promise<{ sources: IVideo[] } & { subtitles: ISubtitle[] }> {
    try {
      const result: { sources: IVideo[]; subtitles: ISubtitle[] } = {
        sources: [],
        subtitles: [],
      };

      const { data } = await axios.get(url, {
        headers: {
          Referer: `${this.host}`,
        },
      });
      const $ = load(data);

      let source = $('script:contains(player =)').text()?.match('[\'"]?file[\'"]?:\\s*"([^"]+)') ?? '';
      let subtitle = $('script:contains(player =)').text()?.match('[\'"]?subtitle[\'"]?:\\s*"([^"]+)') ?? '';

      source[1].split(',').map(links => {
        let quality = links.split(/[\[\]]/)[1];
        let link = links?.replace(`[${quality}]`, '').trim() ?? '';

        if (quality) {
          result.sources.push({
            url: link.replace(/\\/g, ''),
            quality: quality,
            isM3U8: link.includes('.m3u8'),
          });
        }
      });

      subtitle[1].split(',').map(links => {
        let language = links.split(/[\[\]]/)[1];
        let link = links?.replace(`[${language}]`, '').trim() ?? '';

        if (language) {
          result.subtitles.push({
            url: link.replace(/\\/g, ''),
            lang: language,
          });
        }
      });

      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  //   suspend fun invokeSmashyGtop(
  //     name: String,
  //     url: String,
  //     callback: (ExtractorLink) -> Unit
  // ) {
  //     val doc = app.get(url).document
  //     val script = doc.selectFirst("script:containsData(var secret)")?.data() ?: return
  //     val secret =
  //         script.substringAfter("secret = \"").substringBefore("\";").let { base64Decode(it) }
  //     val key = script.substringAfter("token = \"").substringBefore("\";")
  //     val source = app.get(
  //         "$secret$key",
  //         headers = mapOf(
  //             "X-Requested-With" to "XMLHttpRequest"
  //         )
  //     ).parsedSafe<Smashy1Source>() ?: return

  //     val videoUrl = base64Decode(source.file ?: return)
  //     if (videoUrl.contains("/bug")) return
  //     val quality =
  //         Regex("(\\d{3,4})[Pp]").find(videoUrl)?.groupValues?.getOrNull(1)?.toIntOrNull()
  //             ?: Qualities.P720.value
  //     callback.invoke(
  //         ExtractorLink(
  //             "Smashy [$name]",
  //             "Smashy [$name]",
  //             videoUrl,
  //             "",
  //             quality,
  //             videoUrl.contains(".m3u8")
  //         )
  //     )
  // }

  // suspend fun invokeSmashyDude(
  //     name: String,
  //     url: String,
  //     callback: (ExtractorLink) -> Unit
  // ) {
  //     val script =
  //         app.get(url).document.selectFirst("script:containsData(player =)")?.data() ?: return

  //     val source = Regex("file:\\s*(\\[.*]),").find(script)?.groupValues?.get(1) ?: return

  //     tryParseJson<ArrayList<DudetvSources>>(source)?.filter { it.title == "English" }?.map {
  //         M3u8Helper.generateM3u8(
  //             "Smashy [Player 2]",
  //             it.file ?: return@map,
  //             ""
  //         ).forEach(callback)
  //     }

  // }

  // suspend fun invokeSmashyNflim(
  //     name: String,
  //     url: String,
  //     subtitleCallback: (SubtitleFile) -> Unit,
  //     callback: (ExtractorLink) -> Unit,
  // ) {
  //     val script =
  //         app.get(url).document.selectFirst("script:containsData(player =)")?.data() ?: return

  //     val sources = Regex("['\"]?file['\"]?:\\s*\"([^\"]+)").find(script)?.groupValues?.get(1) ?: return
  //     val subtitles = Regex("['\"]?subtitle['\"]?:\\s*\"([^\"]+)").find(script)?.groupValues?.get(1) ?: return

  //     sources.split(",").map { links ->
  //         val quality = Regex("\\[(\\d+)]").find(links)?.groupValues?.getOrNull(1)?.trim()
  //         val trimmedLink = links.removePrefix("[$quality]").trim()
  //         callback.invoke(
  //             ExtractorLink(
  //                 "Smashy [$name]",
  //                 "Smashy [$name]",
  //                 trimmedLink,
  //                 "",
  //                 quality?.toIntOrNull() ?: return@map,
  //                 isM3u8 = true,
  //             )
  //         )
  //     }

  //     subtitles.split(",").map { sub ->
  //         val lang = Regex("\\[(.*?)]").find(sub)?.groupValues?.getOrNull(1)?.trim() ?: return@map
  //         val trimmedSubLink = sub.removePrefix("[$lang]").trim().substringAfter("?url=")
  //         if(lang.contains("\\u")) return@map
  //         subtitleCallback.invoke(
  //             SubtitleFile(
  //                 lang,
  //                 trimmedSubLink
  //             )
  //         )
  //     }

  // }

  // suspend fun invokeSmashyRip(
  //     name: String,
  //     url: String,
  //     subtitleCallback: (SubtitleFile) -> Unit,
  //     callback: (ExtractorLink) -> Unit,
  // ) {
  //     val script =
  //         app.get(url).document.selectFirst("script:containsData(player =)")?.data() ?: return

  //     val source = Regex("file:\\s*\"([^\"]+)").find(script)?.groupValues?.get(1)
  //     val subtitle = Regex("subtitle:\\s*\"([^\"]+)").find(script)?.groupValues?.get(1)

  //     source?.split(",")?.map { links ->
  //         val quality = Regex("\\[(\\d+)]").find(links)?.groupValues?.getOrNull(1)?.trim()
  //         val link = links.removePrefix("[$quality]").substringAfter("dev/").trim()
  //         if (link.isEmpty()) return@map
  //         callback.invoke(
  //             ExtractorLink(
  //                 "Smashy [$name]",
  //                 "Smashy [$name]",
  //                 link,
  //                 "",
  //                 quality?.toIntOrNull() ?: return@map,
  //                 isM3u8 = true,
  //             )
  //         )
  //     }

  //     subtitle?.replace("<br>", "")?.split(",")?.map { sub ->
  //         val lang = Regex("\\[(.*?)]").find(sub)?.groupValues?.getOrNull(1)?.trim()
  //         val link = sub.removePrefix("[$lang]")
  //         subtitleCallback.invoke(
  //             SubtitleFile(
  //                 lang.orEmpty().ifEmpty { return@map },
  //                 link
  //             )
  //         )
  //     }

  // }
}

export default SmashyStream;
