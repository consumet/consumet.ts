import axios, { AxiosError } from 'axios';
import fs from 'fs';

const main = async () => {
  let output = '# Provider Status\n';
  output += '| **provider** | **Status** | **Time** |\n|:--------:|:------:|:----:|\n';
  output = await checkLibgen({ output });
  output = await checkGetComics({ output });

  fs.writeFileSync('./provider_status/README.md', output);
};

const checkLibgen = async (output: { output: string }) => {
  const libgenSite = 'http://libgen.rs/';
  const libgenDownload = 'http://62.182.86.140';

  try {
    const t0 = performance.now();
    const { status } = await axios.get(libgenSite, { timeout: 3000 });
    const t1 = performance.now();
    output.output += `| Libgen | 🟩 ${status} | ${((t1 - t0) / 1000).toPrecision(3)}s |\n`;

    const t2 = performance.now();
    let res = await axios.get(libgenDownload, { timeout: 3000 });
    const t3 = performance.now();
    output.output += `| Libgen Download | 🟩 ${res.status} | ${(t3 - t2) / 1000}s |\n`;

    return output.output;
  } catch (e: any) {
    if (e.config.url == libgenDownload) {
      output.output += `| Libgen Download | 🟥 500 | 3s |\n`;
    }
  }
  return output.output;
};

const checkGetComics = async (output: { output: string }) => {
  const getComicsSite = 'https://getcomics.info/';

  try {
    const t0 = performance.now();
    const { status } = await axios.get(getComicsSite, { timeout: 3000 });
    const t1 = performance.now();
    output.output += `| GetComics | 🟩 ${status} | ${((t1 - t0) / 1000).toPrecision(3)}s |\n`;
  } catch (e: any) {
    output.output += `| GetComics | 🟥 500 | 3s |\n`;
  }
  return output.output;
};

main();
