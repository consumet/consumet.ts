use consumet::anime::Gogoanime;

#[tokio::main]
async fn main() {
    let scraper = Gogoanime::new();
    // match scraper.search("Kimetsu no Yaiba", 1).await {
    //     Ok(search_result) => {
    //         println!("Current Page: {}", search_result.current_page);
    //         println!("Has Next Page: {}", search_result.has_next_page);
    //
    //         for result in search_result.results {
    //             println!("ID: {}", result.id);
    //             println!("Title: {}", result.title);
    //             println!("URL: {}", result.url);
    //             println!("Image: {:?}", result.image);
    //             println!("Release Date: {}", result.release_date);
    //             println!("Sub or Dub: {:?}", result.sub_or_dub);
    //             println!("----------------------------------");
    //         }
    //     }
    //     Err(e) => eprintln!("Error: {:?}", e),
    // }

    match scraper
        .fetch_anime_info("kimetsu-no-yaiba-yuukaku-hen".to_string())
        .await
    {
        Ok(anime_info) => {
            println!("ID: {}", anime_info.id);
            println!("Title: {}", anime_info.title);
            println!("URL: {}", anime_info.url);
            println!("Image: {:?}", anime_info.image.unwrap());
            //     println!("Release Date: {:?}", anime_info.release_date);
            //     println!("Description: {:?}", anime_info.description);
            //     println!("Sub or Dub: {:?}", anime_info.sub_or_dub);
            //     println!("Anime Type: {:?}", anime_info.anime_type);
            //     println!("Other Name: {:?}", anime_info.other_name);
            //     println!("Genres: {:?}", anime_info.genres);
            //     println!("Total Episodes: {:?}", anime_info.total_episodes);
            //     for episode in anime_info.episodes {
            //         println!("ID: {}", episode.id);
            //         println!("Number: {}", episode.number);
            //         println!("URL: {}", episode.url);
            //         println!("----------------------------------");
            //     }
        }
        Err(e) => eprintln!("Error: {:?}", e),
    }
}
