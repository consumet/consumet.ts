const puppeteer = require('puppeteer');

async function getAnimeKaiToken(animeId) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  const targetUrl = `/ajax/episodes/list`;

  await page.goto(`https://animekai.to/watch/${animeId}`, { waitUntil: "domcontentloaded", timeout: 60000 });

  const request = await page.waitForRequest(req => req.url().includes(targetUrl), { timeout: 10000 });

  await browser.close();

  if (!request) throw new Error("❌ Token request not captured");
  
  const urlParams = new URL(request.url()).searchParams;
  const token = urlParams.get("_");
  if (!token) throw new Error("❌ Token not found");

  return token;
}

module.exports = { getAnimeKaiToken };
