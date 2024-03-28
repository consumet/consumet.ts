#[derive(Debug)]
pub struct SearchResult {
    pub current_page: u32,
    pub has_next_page: bool,
    pub results: Vec<AnimeResult>,
}

#[derive(Debug)]
pub struct AnimeResult {
    pub id: String,
    pub title: String,
    pub url: String,
    pub image: Option<String>,
    pub release_date: String,
    pub sub_or_dub: SubOrSub,
}

#[derive(Debug)]
pub enum SubOrSub {
    Dub,
    Sub,
}

#[derive(Debug)]
pub struct AnimeInfo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub image: Option<String>,
    pub release_date: Option<String>,
    pub description: Option<String>,
    pub sub_or_dub: SubOrSub,
    pub anime_type: MediaFormat,
    // pub status: MediaStatus,
    pub other_name: Option<String>,
    pub genres: Vec<String>,
    pub episodes: Vec<Episode>,
    pub total_episodes: u32,
}

#[derive(Debug)]
pub struct Episode {
    pub id: String,
    pub number: f32,
    pub url: String,
}

#[derive(Debug)]
pub enum MediaFormat {
    TV,
    Movie,
    OVA,
    Special,
    ONA,
    Music,
}

#[derive(Debug)]
pub enum MediaStatus {
    Ongoing,
    Completed,
    NotYetAired,
    Unknown,
}
