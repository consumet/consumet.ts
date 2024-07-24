import { VidCloud } from '../../src/extractors';

async function main() {
  console.log('test start');
  const vidCloud = new VidCloud();
  console.log('vidCloud object created!');
  const url = new URL('https://rabbitstream.net/v2/embed-4/kkVdC2yyQZlm?z=');
  console.log('url created!');
  console.log('extract called!');
  try {
    const res = await vidCloud.extract(url);
    console.log('extract success!');
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}

main();
