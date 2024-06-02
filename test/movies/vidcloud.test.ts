import { VidCloud } from '../../src/extractors';


async function main() {
  console.log("test start");
  let vidCloud = new VidCloud();
  console.log("vidCloud object created!");
  let url = new URL("https://rabbitstream.net/v2/embed-4/x21Ne4cJOFWC?z=");
  console.log("url created!");
  console.log("extract called!");
  try {
    let res = await vidCloud.extract(url);
    console.log("extract success!")
    console.log(res);
  } catch (error) {
    console.log(error);
  }
}

main();

