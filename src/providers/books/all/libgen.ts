import axios, { Axios, AxiosResponse } from 'axios';
import { load } from 'cheerio';
import { BookParser, LibgenBook, LibgenBookObject } from '../../../models';
import { splitAuthor, floorID, formatTitle } from '../../../utils';
import { encode } from 'ascii-url-encoder';

const { get } = axios;

class Libgen extends BookParser {
  private readonly extensions = ['.rs', '.is', '.st'];
  protected override readonly baseUrl = 'http://libgen';
  override readonly name = 'libgen';
  readonly downloadIP = 'http://62.182.86.140';
  fastSearch = async (query: string, maxResults: number) => {
    let page!: AxiosResponse<any, any>;
    let workingExtension = this.extensions[0];
    const containers: LibgenBook[] = [];
    for (let extension of this.extensions) {
      workingExtension = extension;
      page = await get(
        `${this.baseUrl}${extension}/search.php?req=${query}&view=simple&res=${
          maxResults > 0 ? maxResults : 25
        }`
      );
      if (page.status <= 399) break;
    }
    const $ = load(page.data);
    let rawAuthor = '';
    let realLink: string = '';
    $('table tbody tr').each((i, e) => {
      const container: LibgenBook = new LibgenBookObject();
      $(e.children).each((i, e) => {
        if ($(e).text() === '\n\t\t\t\t') return;
        switch (i) {
          case 0:
            container.id = $(e).text();
            break;
          case 2:
            rawAuthor = $(e).text();
            container.authors = splitAuthor(rawAuthor);
            break;
          case 4:
            let potLink: string = '';
            $(e)
              .children()
              .each((i, el) => {
                if (potLink != '') {
                  return;
                }
                if ($(el).attr('href')?.at(0) === 'b') {
                  potLink = $(el).attr('href') || '';
                }
              });
            const fakeLink = `${this.baseUrl}${workingExtension}/${potLink}`;
            for (let i = 0; i < fakeLink.length; i++) {
              if (
                fakeLink[i] === 'm' &&
                fakeLink[i + 1] === 'd' &&
                fakeLink[i + 2] === '5' &&
                fakeLink[i + 3] === '='
              ) {
                realLink = fakeLink.substring(i + 4, fakeLink.length);
                break;
              }
            }
            //containers[i].link = `${this.downloadIP}/main/${floorID(
            //   container.id
            // )}/${realLink.toLowerCase()}/${encode(
            //   `${container.series == '' ? '' : `(${container.series})`} ${rawAuthor} - ${
            //     container.title
            //   }-${container.publisher} (${container.year}).${container.format}`
            // )}`;
            container.title = formatTitle($(e).text());
            container.link = `${this.baseUrl}${workingExtension}/${potLink}`;
          case 6:
            container.publisher = $(e).text();
            break;
          case 8:
            container.year = $(e).text();
            break;
          case 10:
            container.pages = $(e).text();
            break;
          case 12:
            container.language = $(e).text();
            break;
          case 14:
            container.size = $(e).text();
            break;
          case 16:
            container.format = $(e).text();
            break;
        }
      });
      container.link = `${this.downloadIP}/main/${floorID(
        container.id
      )}/${realLink.toLowerCase()}/${encode(
        `${container.series == '' ? '' : `(${container.series})`} ${rawAuthor} - ${
          container.title
        }-${container.publisher} (${container.year}).${container.format}`
      )}`;
      containers[i] = container;
    });
    containers.shift();
    containers.shift();
    containers.shift();
    containers.pop();
    console.log(containers);
    return containers;
  };

  override search = async (query: string, maxResults: number) => {
    let page!: AxiosResponse<any, any>;
    let workingExtension = this.extensions[0];
    const containers: LibgenBook[] = [];
    for (let extension of this.extensions) {
      workingExtension = extension;
      page = await get(
        `${this.baseUrl}${extension}/search.php?req=${query}&view=simple&res=${
          maxResults > 0 ? maxResults : 25
        }`
      );
      if (page.status <= 399) break;
    }
    const $ = load(page.data);
    let rawAuthor = '';
    $('table tbody tr').each((i, e) => {
      const container: LibgenBook = new LibgenBookObject();
      $(e.children).each((i, e) => {
        if ($(e).text() === '\n\t\t\t\t') return;
        switch (i) {
          case 0:
            container.id = $(e).text();
            break;
          case 2:
            rawAuthor = $(e).text();
            container.authors = splitAuthor(rawAuthor);
            break;
          case 4:
            let potLink: string = '';
            $(e)
              .children()
              .each((i, el) => {
                if (potLink != '') {
                  return;
                }
                if ($(el).attr('href')?.at(0) === 'b') {
                  potLink = $(el).attr('href') || '';
                }
              });
            container.link = `${this.baseUrl}${workingExtension}/${potLink}`;
          case 6:
            container.publisher = $(e).text();
            break;
          case 8:
            container.year = $(e).text();
            break;
          case 10:
            container.pages = $(e).text();
            break;
          case 12:
            container.language = $(e).text();
            break;
          case 14:
            container.size = $(e).text();
            break;
          case 16:
            container.format = $(e).text();
            break;
        }
      });
      containers[i] = container;
    });
    containers.shift();
    containers.shift();
    containers.shift();
    containers.pop();
    for (let i = 0; i < containers.length; i++) {
      if (containers[i].link == '') {
        containers.filter((val) => val != containers[i]);
        continue;
      }
      const data = await get(containers[i].link);
      const $ = load(data.data);
      let tempTitle = '';
      let tempVolume = '';
      $('tbody > tr:eq(1)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 2:
              tempTitle = $(el).text();
              break;
            case 4:
              tempVolume = $(el).text();
          }
        });
      containers[i].title = tempTitle;
      containers[i].volume = tempVolume;
      containers[i].image = `${this.baseUrl}${workingExtension}` + $('img').attr('src');
      let tempIsbn: string[] = [];
      $('tbody > tr:eq(15)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempIsbn = $(el).text().split(', ');
              break;
          }
        });
      containers[i].isbn = tempIsbn;
      containers[i].description = $('tbody > tr:eq(31)').text() || '';
      containers[i].tableOfContents = $('tbody > tr:eq(32)').text() || '';
      let tempSeries = '';
      $('tbody > tr:eq(11)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempSeries = $(el).text();
              break;
          }
        });
      containers[i].series = tempSeries;
      let tempTopic = '';
      $('tbody > tr:eq(22)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempTopic = $(el).text();
              break;
          }
        });
      containers[i].topic = tempTopic;
      let tempEdition = '';
      $('tbody > tr:eq(13)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 3:
              tempEdition = $(el).text();
              break;
          }
        });
      containers[i].edition = tempEdition;
      for (let p = 2; p <= 8; p++) {
        let temp = '';
        $(`tbody tr:eq(${p})`)
          .children()
          .each((i, el) => {
            switch (i) {
              case 1:
                temp = $(el).text();
            }
          });
        switch (p) {
          case 2:
            containers[i].hashes.AICH = temp;
            break;
          case 3:
            containers[i].hashes.CRC32 = temp;
            break;
          case 4:
            containers[i].hashes.eDonkey = temp;
            break;
          case 5:
            containers[i].hashes.MD5 = temp;
            break;
          case 6:
            containers[i].hashes.SHA1 = temp;
            break;
          case 7:
            containers[i].hashes.SHA256 = temp.split(' ');
            break;
          case 8:
            containers[i].hashes.TTH = temp;
            break;
        }
      }
      let realLink: string = '';
      const fakeLink = containers[i].link;
      for (let i = 0; i < fakeLink.length; i++) {
        if (
          fakeLink[i] === 'm' &&
          fakeLink[i + 1] === 'd' &&
          fakeLink[i + 2] === '5' &&
          fakeLink[i + 3] === '='
        ) {
          realLink = fakeLink.substring(i + 4, fakeLink.length);
          break;
        }
      }
      containers[i].link = `${this.downloadIP}/main/${floorID(
        containers[i].id
      )}/${realLink.toLowerCase()}/${encode(
        `${containers[i].series == '' ? '' : `(${containers[i].series})`} ${rawAuthor} - ${
          containers[i].title
        }-${containers[i].publisher} (${containers[i].year}).${containers[i].format}`
      )}`;
    }
    return containers;
  };

  override scrapePage = async (pageUrl: string) => {
    let page!: AxiosResponse<any, any>;
    let workingExtension = this.extensions[0];
    const containers: LibgenBook[] = [];
    for (let extension of this.extensions) {
      workingExtension = extension;
      try {
        page = await get(pageUrl);
      } catch (e: any) {
        throw Error(e);
      }
      if (page.status <= 399) break;
    }
    const $ = load(page.data);
    let rawAuthor = '';
    $('table tbody tr').each((i, e) => {
      const container: LibgenBook = new LibgenBookObject();
      $(e.children).each((i, e) => {
        if ($(e).text() === '\n\t\t\t\t') return;
        switch (i) {
          case 0:
            container.id = $(e).text();
            break;
          case 2:
            rawAuthor = $(e).text();
            container.authors = splitAuthor(rawAuthor);
            break;
          case 4:
            let potLink: string = '';
            $(e)
              .children()
              .each((i, el) => {
                if (potLink != '') {
                  return;
                }
                if ($(el).attr('href')?.at(0) === 'b') {
                  potLink = $(el).attr('href') || '';
                }
              });
            container.link = `${this.baseUrl}${workingExtension}/${potLink}`;
          case 6:
            container.publisher = $(e).text();
            break;
          case 8:
            container.year = $(e).text();
            break;
          case 10:
            container.pages = $(e).text();
            break;
          case 12:
            container.language = $(e).text();
            break;
          case 14:
            container.size = $(e).text();
            break;
          case 16:
            container.format = $(e).text();
            break;
        }
      });
      containers[i] = container;
    });
    containers.shift();

    console.log('containers: ');
    console.log(containers);
    for (let i = 0; i < containers.length; i++) {
      const data = await get(containers[i].link);
      const $ = load(data.data);
      let tempTitle = '';
      let tempVolume = '';
      $('tbody > tr:eq(1)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 2:
              tempTitle = $(el).text();
              break;
            case 4:
              tempVolume = $(el).text();
          }
        });
      containers[i].title = tempTitle;
      containers[i].volume = tempVolume;
      containers[i].image = `${this.baseUrl}${workingExtension}` + $('img').attr('src');
      let tempIsbn: string[] = [];
      $('tbody > tr:eq(15)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempIsbn = $(el).text().split(', ');
              break;
          }
        });
      containers[i].isbn = tempIsbn;
      containers[i].description = $('tbody > tr:eq(31)').text() || '';
      containers[i].tableOfContents = $('tbody > tr:eq(32)').text() || '';
      let tempSeries = '';
      $('tbody > tr:eq(11)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempSeries = $(el).text();
              break;
          }
        });
      containers[i].series = tempSeries;
      let tempTopic = '';
      $('tbody > tr:eq(22)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 1:
              tempTopic = $(el).text();
              break;
          }
        });
      containers[i].topic = tempTopic;
      let tempEdition = '';
      $('tbody > tr:eq(13)')
        .children()
        .each((i, el) => {
          switch (i) {
            case 3:
              tempEdition = $(el).text();
              break;
          }
        });
      containers[i].edition = tempEdition;
      for (let p = 2; p <= 8; p++) {
        let temp = '';
        $(`tbody tr:eq(${p})`)
          .children()
          .each((i, el) => {
            switch (i) {
              case 1:
                temp = $(el).text();
            }
          });
        switch (p) {
          case 2:
            containers[i].hashes.AICH = temp;
            break;
          case 3:
            containers[i].hashes.CRC32 = temp;
            break;
          case 4:
            containers[i].hashes.eDonkey = temp;
            break;
          case 5:
            containers[i].hashes.MD5 = temp;
            break;
          case 6:
            containers[i].hashes.SHA1 = temp;
            break;
          case 7:
            containers[i].hashes.SHA256 = temp.split(' ');
            break;
          case 8:
            containers[i].hashes.TTH = temp;
            break;
        }
      }
      let realLink: string = '';
      const fakeLink = containers[i].link;
      for (let i = 0; i < fakeLink.length; i++) {
        if (
          fakeLink[i] === 'm' &&
          fakeLink[i + 1] === 'd' &&
          fakeLink[i + 2] === '5' &&
          fakeLink[i + 3] === '='
        ) {
          realLink = fakeLink.substring(i + 4, fakeLink.length);
          break;
        }
      }
      containers[i].link = `${this.downloadIP}/main/${floorID(
        containers[i].id
      )}/${realLink.toLowerCase()}/${encode(
        `${containers[i].series == '' ? '' : `(${containers[i].series})`} ${rawAuthor} - ${
          containers[i].title
        }-${containers[i].publisher} (${containers[i].year}).${containers[i].format}`
      )}`;
    }
    return containers;
  };
}

export default Libgen;
