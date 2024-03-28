use reqwest::Client;
use scraper::{Html, Selector};
use url::Url;

use crate::structs::anime::{AnimeInfo, AnimeResult, MediaFormat, SearchResult, SubOrSub};

pub struct Gogoanime {
    client: Client,
    base_url: String,
    ajax_url: String,
}

impl Default for Gogoanime {
    fn default() -> Self {
        Self::new()
    }
}

impl Gogoanime {
    pub fn new() -> Gogoanime {
        Gogoanime {
            client: Client::new(),
            base_url: "https://gogoanime3.co".to_string(),
            ajax_url: "https://ajax.gogocdn.net/ajax".to_string(),
        }
    }

    pub async fn search(&self, query: &str, page: u32) -> Result<SearchResult, reqwest::Error> {
        let url = format!(
            "{}/filter.html?keyword={}&page={}",
            self.base_url, query, page
        );
        let res = self.client.get(&url).send().await?.text().await?;

        let document = Html::parse_document(&res);
        let mut search_result = SearchResult {
            current_page: page,
            has_next_page: false,
            results: Vec::new(),
        };

        let next_page_selector =
            Selector::parse("div.anime_name.new_series > div > div > ul > li.selected + li")
                .unwrap();
        search_result.has_next_page = document.select(&next_page_selector).next().is_some();

        let result_selector = Selector::parse("div.last_episodes > ul > li").unwrap();
        for element in document.select(&result_selector) {
            let id = element
                .select(&Selector::parse("p.name > a").unwrap())
                .next()
                .and_then(|a| a.value().attr("href"))
                .map(|href| href.split('/').nth(2).unwrap_or_default().to_string())
                .unwrap_or_default();

            let title = element
                .select(&Selector::parse("p.name > a").unwrap())
                .next()
                .and_then(|a| a.value().attr("title"))
                .unwrap_or_default()
                .to_string();

            let url = element
                .select(&Selector::parse("p.name > a").unwrap())
                .next()
                .and_then(|a| a.value().attr("href"))
                .map(|href| format!("{}/{}", self.base_url, href))
                .unwrap_or_default();

            let image = element
                .select(&Selector::parse("div > a > img").unwrap())
                .next()
                .and_then(|img| img.value().attr("src"))
                .map(|src| src.to_string());

            let release_date = element
                .select(&Selector::parse("p.released").unwrap())
                .next()
                .map(|date| {
                    date.text()
                        .collect::<Vec<_>>()
                        .join("")
                        .replace("Released: ", "")
                        .trim()
                        .to_string()
                })
                .unwrap_or_default();

            let sub_or_dub = if title.to_lowercase().contains("dub") {
                SubOrSub::Dub
            } else {
                SubOrSub::Sub
            };

            search_result.results.push(AnimeResult {
                id,
                title,
                url,
                image,
                release_date,
                sub_or_dub,
            });
        }

        Ok(search_result)
    }

    pub async fn fetch_anime_info(
        &self,
        id: String,
    ) -> Result<AnimeInfo, Box<dyn std::error::Error>> {
        let id = if !id.contains("gogoanime") {
            format!("{}/category/{}", self.base_url, id)
        } else {
            id
        };

        let res = self.client.get(&id).send().await?.text().await?;
        let document = Html::parse_document(&res);

        let mut anime_info = AnimeInfo {
            id: String::new(),
            title: String::new(),
            url: String::new(),
            image: None,
            release_date: None,
            description: None,
            sub_or_dub: SubOrSub::Sub,
            anime_type: MediaFormat::TV,
            other_name: None,
            genres: Vec::new(),
            episodes: Vec::new(),
            total_episodes: 0,
        };

        anime_info.id = Url::parse(&id)?
            .path_segments()
            .map(|c| c.collect::<Vec<_>>())
            .unwrap_or(vec![])
            .get(1)
            .unwrap_or(&"")
            .to_string();

        anime_info.title = document
            .select(&Selector::parse(
            "section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1",
        )?)
            .next()
            .ok_or("Title element not found")?
            .text()
            .collect::<Vec<_>>()
            .join("")
            .trim()
            .to_string();

        anime_info.url = id;

        anime_info.image = document
            .select(&Selector::parse("div.anime_info_body_bg > img")?)
            .next()
            .and_then(|img| img.value().attr("src"))
            .map(|src| src.to_string());

        Ok(anime_info)
    }
}
