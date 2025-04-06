import { Book, Hashes } from './base-types';

export interface IProviderStats {
  name: string;
  baseUrl: string;
  lang: string[] | string;
  isNSFW: boolean;
  logo: string;
  classPath: string;
  isWorking: boolean;
}

export interface ITitle {
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
}

export interface IAnimeResult {
  id: string;
  title: string | ITitle;
  url?: string;
  image?: string;
  imageHash?: string;
  cover?: string;
  coverHash?: string;
  status?: MediaStatus;
  rating?: number;
  type?: MediaFormat;
  releaseDate?: string;
  relationType?: string;
  [x: string]: any; // other fields
}

export interface ISearch<T> {
  currentPage?: number;
  hasNextPage?: boolean;
  totalPages?: number;
  /**
   * total results must include results from all pages
   */
  totalResults?: number;
  results: T[];
}

export interface Trailer {
  id: string;
  url?: string;
  site?: string;
  thumbnail?: string;
  thumbnailHash?: string | null;
}

export interface FuzzyDate {
  year?: number;
  month?: number;
  day?: number;
}

export enum MediaFormat {
  TV = 'TV',
  TV_SHORT = 'TV_SHORT',
  TV_SPECIAL = 'TV_SPECIAL',
  MOVIE = 'MOVIE',
  SPECIAL = 'SPECIAL',
  OVA = 'OVA',
  ONA = 'ONA',
  MUSIC = 'MUSIC',
  MANGA = 'MANGA',
  NOVEL = 'NOVEL',
  ONE_SHOT = 'ONE_SHOT',
  PV = 'PV',
  COMIC = 'COMIC',
}

export interface IAnimeInfo extends IAnimeResult {
  malId?: number | string;
  genres?: string[];
  description?: string;
  status?: MediaStatus;
  totalEpisodes?: number;
  /**
   * @deprecated use `hasSub` or `hasDub` instead
   */
  subOrDub?: SubOrSub;
  hasSub?: boolean;
  hasDub?: boolean;
  synonyms?: string[];
  /**
   * two letter representation of coutnry: e.g JP for japan
   */
  countryOfOrigin?: string;
  isAdult?: boolean;
  isLicensed?: boolean;
  /**
   * `FALL`, `WINTER`, `SPRING`, `SUMMER`
   */
  season?: string;
  studios?: string[];
  color?: string;
  cover?: string;
  trailer?: Trailer;
  episodes?: IAnimeEpisode[];
  startDate?: FuzzyDate;
  endDate?: FuzzyDate;
  recommendations?: IAnimeResult[];
  relations?: IAnimeResult[];
}

export interface IAnimeEpisodeV2 {
  [x: string]: {
    id: string;
    season_number: number;
    title: string;
    image: string;
    imageHash: string;
    description: string;
    releaseDate: string;
    isHD: boolean;
    isAdult: boolean;
    isDubbed: boolean;
    isSubbed: boolean;
    duration: number;
  }[];
}

export interface IAnimeEpisode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  isFiller?: boolean;
  isSubbed?: boolean;
  isDubbed?: boolean;
  url?: string;
  image?: string;
  imageHash?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IEpisodeServer {
  name: string;
  url: string;
  [x: string]: unknown;
}

export interface IVideo {
  /**
   * The **MAIN URL** of the video provider that should take you to the video
   */
  url: string;
  /**
   * The Quality of the video should include the `p` suffix
   */
  quality?: string;
  /**
   * make sure to set this to `true` if the video is hls
   */
  isM3U8?: boolean;
  /**
   * set this to `true` if the video is dash (mpd)
   */
  isDASH?: boolean;
  /**
   * size of the video in **bytes**
   */
  size?: number;
  [x: string]: unknown; // other fields
}

export enum StreamingServers {
  AsianLoad = 'asianload',
  GogoCDN = 'gogocdn',
  StreamSB = 'streamsb',
  MixDrop = 'mixdrop',
  Mp4Upload = 'mp4upload',
  UpCloud = 'upcloud',
  VidCloud = 'vidcloud',
  StreamTape = 'streamtape',
  VizCloud = 'vizcloud',
  // same as vizcloud
  MyCloud = 'mycloud',
  Filemoon = 'filemoon',
  VidStreaming = 'vidstreaming',
  BuiltIn = 'builtin',
  SmashyStream = 'smashystream',
  StreamHub = 'streamhub',
  StreamWish = 'streamwish',
  VidHide = 'vidhide',
  VidMoly = 'vidmoly',
  Voe = 'voe',
  MegaUp = 'megaup',
}

export enum MediaStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  HIATUS = 'Hiatus',
  CANCELLED = 'Cancelled',
  NOT_YET_AIRED = 'Not yet aired',
  UNKNOWN = 'Unknown',
}

export enum WatchListType {
  WATCHING = 'watching',
  ONHOLD = 'on-hold',
  PLAN_TO_WATCH = 'plan to watch',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
  NONE = 'none',
}

export enum SubOrSub {
  SUB = 'sub',
  DUB = 'dub',
  BOTH = 'both',
}

export interface IMangaResult {
  id: string;
  title: string | [lang: string][] | ITitle;
  altTitles?: string | string[] | [lang: string][];
  image?: string;
  description?: string | [lang: string][] | { [lang: string]: string };
  status?: MediaStatus;
  releaseDate?: number | string;
  [x: string]: unknown; // other fields
}

export interface IMangaChapter {
  id: string;
  title: string;
  volume?: number;
  pages?: number;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IMangaInfo extends IMangaResult {
  malId?: number | string;
  authors?: string[];
  genres?: string[];
  links?: string[];
  characters?: any[];
  recommendations?: IMangaResult[];
  chapters?: IMangaChapter[];
}

export interface IMangaChapterPage {
  img: string;
  page: number;
  [x: string]: unknown; // other fields
}

export interface ILightNovelResult {
  id: string;
  title: string | ITitle;
  url: string;
  image?: string;
  [x: string]: unknown; // other fields
}

export interface ILightNovelChapter {
  id: string;
  title: string;
  volume?: number | string;
  url?: string;
}

export interface ILightNovelChapterContent {
  novelTitle: string;
  chapterTitle: string;
  text: string;
}

export interface ILightNovelInfo extends ILightNovelResult {
  authors?: string[];
  genres?: string[];
  description?: string;
  chapters?: ILightNovelChapter[];
  status?: MediaStatus;
  views?: number;
  rating?: number;
}

export interface LibgenBook extends Book {
  id: string;
  language: string;
  format: string;
  size: string;
  pages: string;
  tableOfContents: string;
  topic: string;
  hashes: Hashes;
}

export interface LibgenResult {
  result: LibgenBook[];
  hasNextPage: boolean;
}

export interface GetComicsComics {
  image: string;
  title: string;
  year: string;
  size: string;
  excerpt: string;
  category: string;
  description: string;
  download: string;
  ufile: string;
  mega: string;
  mediafire: string;
  zippyshare: string;
  readOnline: string;
}

export interface ComicRes {
  containers: GetComicsComics[];
  hasNextPage: boolean;
}

export interface ISubtitle {
  /**
   * The id of the subtitle. **not** required
   */
  id?: string;
  /**
   * The **url** that should take you to the subtitle **directly**.
   */
  url: string;
  /**
   * The language of the subtitle
   */
  lang: string;
}

/**
 * The start, and the end of the intro or opening in seconds.
 */
export interface Intro {
  start: number;
  end: number;
}

export interface ISource {
  headers?: { [k: string]: string };
  intro?: Intro;
  outro?: Intro;
  subtitles?: ISubtitle[];
  sources: IVideo[];
  download?: string;
  embedURL?: string;
}

/**
 * Used **only** for movie/tvshow providers
 */
export enum TvType {
  TVSERIES = 'TV Series',
  MOVIE = 'Movie',
  ANIME = 'Anime',
  PEOPLE = 'People',
}

export interface IMovieEpisode {
  id: string;
  title: string;
  url?: string;
  number?: number;
  season?: number;
  description?: string;
  image?: string;
  releaseDate?: string;
  [x: string]: unknown; // other fields
}

export interface IMovieResult {
  id: string;
  title: string | ITitle;
  url?: string;
  image?: string;
  releaseDate?: string;
  type?: TvType;
  [x: string]: unknown; // other unkown fields
}

export interface IPeopleResult {
  id: string;
  name: string;
  rating?: string;
  image?: string;
  movies: IMovieResult[];
  [x: string]: unknown; // other unkown fields
}

export interface INewsFeed extends INews {
  /** topics of the feed */
  topics: Topics[];
  /** preview of the news feed */
  preview: INewsFeedPreview;
}

export interface INewsInfo extends INews {
  /** intro of the news */
  intro: string;
  /** description of the news */
  description: string;
}

interface INews {
  /** id of the news */
  id: string;
  /** title of the news */
  title: string;
  /** time at which the news was uploaded */
  uploadedAt: string;
  /** thumbnail image URL of the news */
  thumbnail: string;
  /** thumbnail image blurhash code of the news */
  thumbnailHash: string;
  /** URL of the news */
  url: string;
}

interface INewsFeedPreview {
  /** intro of the feed */
  intro: string;
  /** some contents of the feed */
  full: string;
}

export interface IMovieInfo extends IMovieResult {
  cover?: string;
  recommendations?: IMovieResult[];
  genres?: string[];
  description?: string;
  rating?: number;
  status?: MediaStatus;
  duration?: string;
  production?: string;
  casts?: string[];
  tags?: string[];
  totalEpisodes?: number;
  trailer?: Trailer;
  seasons?: { season: number; image?: string; episodes: IMovieEpisode[] }[];
  episodes?: IMovieEpisode[];
}

export enum Genres {
  ACTION = 'Action',
  ADVENTURE = 'Adventure',
  CARS = 'Cars',
  COMEDY = 'Comedy',
  DRAMA = 'Drama',
  FANTASY = 'Fantasy',
  HORROR = 'Horror',
  MAHOU_SHOUJO = 'Mahou Shoujo',
  MECHA = 'Mecha',
  MUSIC = 'Music',
  MYSTERY = 'Mystery',
  PSYCHOLOGICAL = 'Psychological',
  ROMANCE = 'Romance',
  SCI_FI = 'Sci-Fi',
  SLICE_OF_LIFE = 'Slice of Life',
  SPORTS = 'Sports',
  SUPERNATURAL = 'Supernatural',
  THRILLER = 'Thriller',
}

export enum Tags {
  FOUR_KOMA = '4-koma',
  ACHROMATIC = 'Achromatic',
  ACHRONOLOGICAL_ORDER = 'Achronological Order',
  ACROBATICS = 'Acrobatics',
  ACTING = 'Acting',
  ADOPTION = 'Adoption',
  ADVERTISEMENT = 'Advertisement',
  AFTERLIFE = 'Afterlife',
  AGE_GAP = 'Age Gap',
  AGE_REGRESSION = 'Age Regression',
  AGENDER = 'Agender',
  AGRICULTURE = 'Agriculture',
  AIRSOFT = 'Airsoft',
  ALCHEMY = 'Alchemy',
  ALIENS = 'Aliens',
  ALTERNATE_UNIVERSE = 'Alternate Universe',
  AMERICAN_FOOTBALL = 'American Football',
  AMNESIA = 'Amnesia',
  AMPUTATION = 'Amputation',
  ANACHRONISM = 'Anachronism',
  ANCIENT_CHINA = 'Ancient China',
  ANGELS = 'Angels',
  ANIMALS = 'Animals',
  ANTHOLOGY = 'Anthology',
  ANTHROPOMORPHISM = 'Anthropomorphism',
  ANTI_HERO = 'Anti-Hero',
  ARCHERY = 'Archery',
  AROMANTIC = 'Aromantic',
  ARRANGED_MARRIAGE = 'Arranged Marriage',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  ASEXUAL = 'Asexual',
  ASSASSINS = 'Assassins',
  ASTRONOMY = 'Astronomy',
  ATHLETICS = 'Athletics',
  AUGMENTED_REALITY = 'Augmented Reality',
  AUTOBIOGRAPHICAL = 'Autobiographical',
  AVIATION = 'Aviation',
  BADMINTON = 'Badminton',
  BAND = 'Band',
  BAR = 'Bar',
  BASEBALL = 'Baseball',
  BASKETBALL = 'Basketball',
  BATTLE_ROYALE = 'Battle Royale',
  BIOGRAPHICAL = 'Biographical',
  BISEXUAL = 'Bisexual',
  BLACKMAIL = 'Blackmail',
  BOARD_GAME = 'Board Game',
  BOARDING_SCHOOL = 'Boarding School',
  BODY_HORROR = 'Body Horror',
  BODY_SWAPPING = 'Body Swapping',
  BOWLING = 'Bowling',
  BOXING = 'Boxing',
  BOYS_LOVE = "Boys' Love",
  BULLYING = 'Bullying',
  BUTLER = 'Butler',
  CALLIGRAPHY = 'Calligraphy',
  CAMPING = 'Camping',
  CANNIBALISM = 'Cannibalism',
  CARD_BATTLE = 'Card Battle',
  CARS = 'Cars',
  CENTAUR = 'Centaur',
  CGI = 'CGI',
  CHEATING = 'Cheating',
  CHEERLEADING = 'Cheerleading',
  CHIBI = 'Chibi',
  CHIMERA = 'Chimera',
  CHUUNIBYOU = 'Chuunibyou',
  CIRCUS = 'Circus',
  CLASS_STRUGGLE = 'Class Struggle',
  CLASSIC_LITERATURE = 'Classic Literature',
  CLASSICAL_MUSIC = 'Classical Music',
  CLONE = 'Clone',
  COASTAL = 'Coastal',
  COLLEGE = 'College',
  COMING_OF_AGE = 'Coming of Age',
  CONSPIRACY = 'Conspiracy',
  COSMIC_HORROR = 'Cosmic Horror',
  COSPLAY = 'Cosplay',
  COWBOYS = 'Cowboys',
  CRIME = 'Crime',
  CRIMINAL_ORGANIZATION = 'Criminal Organization',
  CROSSDRESSING = 'Crossdressing',
  CROSSOVER = 'Crossover',
  CULT = 'Cult',
  CULTIVATION = 'Cultivation',
  CURSES = 'Curses',
  CUTE_BOYS_DOING_CUTE_THINGS = 'Cute Boys Doing Cute Things',
  CUTE_GIRLS_DOING_CUTE_THINGS = 'Cute Girls Doing Cute Things',
  CYBERPUNK = 'Cyberpunk',
  CYBORG = 'Cyborg',
  CYCLING = 'Cycling',
  DANCING = 'Dancing',
  DEATH_GAME = 'Death Game',
  DELINQUENTS = 'Delinquents',
  DEMONS = 'Demons',
  DENPA = 'Denpa',
  DESERT = 'Desert',
  DETECTIVE = 'Detective',
  DINOSAURS = 'Dinosaurs',
  DISABILITY = 'Disability',
  DISSOCIATIVE_IDENTITIES = 'Dissociative Identities',
  DRAGONS = 'Dragons',
  DRAWING = 'Drawing',
  DRUGS = 'Drugs',
  DULLAHAN = 'Dullahan',
  DUNGEON = 'Dungeon',
  DYSTOPIAN = 'Dystopian',
  E_SPORTS = 'E-Sports',
  ECO_HORROR = 'Eco-Horror',
  ECONOMICS = 'Economics',
  EDUCATIONAL = 'Educational',
  ELDERLY_PROTAGONIST = 'Elderly Protagonist',
  ELF = 'Elf',
  ENSEMBLE_CAST = 'Ensemble Cast',
  ENVIRONMENTAL = 'Environmental',
  EPISODIC = 'Episodic',
  ERO_GURO = 'Ero Guro',
  ESPIONAGE = 'Espionage',
  ESTRANGED_FAMILY = 'Estranged Family',
  EXORCISM = 'Exorcism',
  FAIRY = 'Fairy',
  FAIRY_TALE = 'Fairy Tale',
  FAKE_RELATIONSHIP = 'Fake Relationship',
  FAMILY_LIFE = 'Family Life',
  FASHION = 'Fashion',
  FEMALE_HAREM = 'Female Harem',
  FEMALE_PROTAGONIST = 'Female Protagonist',
  FEMBOY = 'Femboy',
  FENCING = 'Fencing',
  FILMMAKING = 'Filmmaking',
  FIREFIGHTERS = 'Firefighters',
  FISHING = 'Fishing',
  FITNESS = 'Fitness',
  FLASH = 'Flash',
  FOOD = 'Food',
  FOOTBALL = 'Football',
  FOREIGN = 'Foreign',
  FOUND_FAMILY = 'Found Family',
  FUGITIVE = 'Fugitive',
  FULL_CGI = 'Full CGI',
  FULL_COLOR = 'Full Color',
  FUTANARI = 'Futanari',
  GAMBLING = 'Gambling',
  GANGS = 'Gangs',
  GENDER_BENDING = 'Gender Bending',
  GHOST = 'Ghost',
  GO = 'Go',
  GOBLIN = 'Goblin',
  GODS = 'Gods',
  GOLF = 'Golf',
  GORE = 'Gore',
  GUNS = 'Guns',
  GYARU = 'Gyaru',
  HANDBALL = 'Handball',
  HENSHIN = 'Henshin',
  HETEROSEXUAL = 'Heterosexual',
  HIKIKOMORI = 'Hikikomori',
  HIP_HOP_MUSIC = 'Hip-hop Music',
  HISTORICAL = 'Historical',
  HOMELESS = 'Homeless',
  HORTICULTURE = 'Horticulture',
  HUMAN_PET = 'Human Pet',
  ICE_SKATING = 'Ice Skating',
  IDOL = 'Idol',
  INN = 'Inn',
  ISEKAI = 'Isekai',
  IYASHIKEI = 'Iyashikei',
  JAZZ_MUSIC = 'Jazz Music',
  JOSEI = 'Josei',
  JUDO = 'Judo',
  KAIJU = 'Kaiju',
  KARUTA = 'Karuta',
  KEMONOMIMI = 'Kemonomimi',
  KIDS = 'Kids',
  KINGDOM_MANAGEMENT = 'Kingdom Management',
  KONBINI = 'Konbini',
  KUUDERE = 'Kuudere',
  LACROSSE = 'Lacrosse',
  LANGUAGE_BARRIER = 'Language Barrier',
  LGBTQ_THEMES = 'LGBTQ+ Themes',
  LOST_CIVILIZATION = 'Lost Civilization',
  LOVE_TRIANGLE = 'Love Triangle',
  MAFIA = 'Mafia',
  MAGIC = 'Magic',
  MAHJONG = 'Mahjong',
  MAIDS = 'Maids',
  MAKEUP = 'Makeup',
  MALE_HAREM = 'Male Harem',
  MALE_PREGNANCY = 'Male Pregnancy',
  MALE_PROTAGONIST = 'Male Protagonist',
  MARRIAGE = 'Marriage',
  MARTIAL_ARTS = 'Martial Arts',
  MATCHMAKING = 'Matchmaking',
  MATRIARCHY = 'Matriarchy',
  MEDICINE = 'Medicine',
  MEMORY_MANIPULATION = 'Memory Manipulation',
  MERMAID = 'Mermaid',
  META = 'Meta',
  METAL_MUSIC = 'Metal Music',
  MILITARY = 'Military',
  MIXED_GENDER_HAREM = 'Mixed Gender Harem',
  MONSTER_BOY = 'Monster Boy',
  MONSTER_GIRL = 'Monster Girl',
  MOPEDS = 'Mopeds',
  MOTORCYCLES = 'Motorcycles',
  MOUNTAINEERING = 'Mountaineering',
  MUSICAL_THEATER = 'Musical Theater',
  MYTHOLOGY = 'Mythology',
  NATURAL_DISASTER = 'Natural Disaster',
  NECROMANCY = 'Necromancy',
  NEKOMIMI = 'Nekomimi',
  NINJA = 'Ninja',
  NO_DIALOGUE = 'No Dialogue',
  NOIR = 'Noir',
  NON_FICTION = 'Non-fiction',
  NUN = 'Nun',
  OFFICE = 'Office',
  OFFICE_LADY = 'Office Lady',
  OIRAN = 'Oiran',
  OJOU_SAMA = 'Ojou-sama',
  ORPHAN = 'Orphan',
  OTAKU_CULTURE = 'Otaku Culture',
  OUTDOOR = 'Outdoor',
  PANDEMIC = 'Pandemic',
  PARENTHOOD = 'Parenthood',
  PARKOUR = 'Parkour',
  PARODY = 'Parody',
  PHILOSOPHY = 'Philosophy',
  PHOTOGRAPHY = 'Photography',
  PIRATES = 'Pirates',
  POKER = 'Poker',
  POLICE = 'Police',
  POLITICS = 'Politics',
  POLYAMOROUS = 'Polyamorous',
  POST_APOCALYPTIC = 'Post-Apocalyptic',
  POV = 'POV',
  PREGNANT = 'Pregnant',
  PRIMARILY_ADULT_CAST = 'Primarily Adult Cast',
  PRIMARILY_ANIMAL_CAST = 'Primarily Animal Cast',
  PRIMARILY_CHILD_CAST = 'Primarily Child Cast',
  PRIMARILY_FEMALE_CAST = 'Primarily Female Cast',
  PRIMARILY_MALE_CAST = 'Primarily Male Cast',
  PRIMARILY_TEEN_CAST = 'Primarily Teen Cast',
  PRISON = 'Prison',
  PROXY_BATTLE = 'Proxy Battle',
  PUPPETRY = 'Puppetry',
  RAKUGO = 'Rakugo',
  REAL_ROBOT = 'Real Robot',
  REHABILITATION = 'Rehabilitation',
  REINCARNATION = 'Reincarnation',
  RELIGION = 'Religion',
  RESTAURANT = 'Restaurant',
  REVENGE = 'Revenge',
  ROBOTS = 'Robots',
  ROCK_MUSIC = 'Rock Music',
  ROTOSCOPING = 'Rotoscoping',
  ROYAL_AFFAIRS = 'Royal Affairs',
  RUGBY = 'Rugby',
  RURAL = 'Rural',
  SADISM = 'Sadism',
  SAMURAI = 'Samurai',
  SATIRE = 'Satire',
  SCHOOL = 'School',
  SCHOOL_CLUB = 'School Club',
  SCUBA_DIVING = 'Scuba Diving',
  SEINEN = 'Seinen',
  SHAPESHIFTING = 'Shapeshifting',
  SHIPS = 'Ships',
  SHOGI = 'Shogi',
  SHOUJO = 'Shoujo',
  SHOUNEN = 'Shounen',
  SHRINE_MAIDEN = 'Shrine Maiden',
  SKATEBOARDING = 'Skateboarding',
  SKELETON = 'Skeleton',
  SLAPSTICK = 'Slapstick',
  SLAVERY = 'Slavery',
  SNOWSCAPE = 'Snowscape',
  SOFTWARE_DEVELOPMENT = 'Software Development',
  SPACE = 'Space',
  SPACE_OPERA = 'Space Opera',
  SPEARPLAY = 'Spearplay',
  STEAMPUNK = 'Steampunk',
  STOP_MOTION = 'Stop Motion',
  SUCCUBUS = 'Succubus',
  SUICIDE = 'Suicide',
  SUMO = 'Sumo',
  SUPER_POWER = 'Super Power',
  SUPER_ROBOT = 'Super Robot',
  SUPERHERO = 'Superhero',
  SURFING = 'Surfing',
  SURREAL_COMEDY = 'Surreal Comedy',
  SURVIVAL = 'Survival',
  SWEAT = 'Sweat',
  SWIMMING = 'Swimming',
  SWORDPLAY = 'Swordplay',
  TABLE_TENNIS = 'Table Tennis',
  TANKS = 'Tanks',
  TANNED_SKIN = 'Tanned Skin',
  TEACHER = 'Teacher',
  TENNIS = 'Tennis',
  TERRORISM = 'Terrorism',
  TIME_LOOP = 'Time Loop',
  TIME_MANIPULATION = 'Time Manipulation',
  TIME_SKIP = 'Time Skip',
  TOKUSATSU = 'Tokusatsu',
  TOMBOY = 'Tomboy',
  TORTURE = 'Torture',
  TRAGEDY = 'Tragedy',
  TRAINS = 'Trains',
  TRANSGENDER = 'Transgender',
  TRAVEL = 'Travel',
  TRIADS = 'Triads',
  TSUNDERE = 'Tsundere',
  TWINS = 'Twins',
  UNREQUITED_LOVE = 'Unrequited Love',
  URBAN = 'Urban',
  URBAN_FANTASY = 'Urban Fantasy',
  VAMPIRE = 'Vampire',
  VETERINARIAN = 'Veterinarian',
  VIDEO_GAMES = 'Video Games',
  VIKINGS = 'Vikings',
  VILLAINESS = 'Villainess',
  VIRTUAL_WORLD = 'Virtual World',
  VOCAL_SYNTH = 'Vocal synth',
  VOLLEYBALL = 'Volleyball',
  VTUBER = 'VTuber',
  WAR = 'War',
  WEREWOLF = 'Werewolf',
  WITCH = 'Witch',
  WORK = 'Work',
  WRESTLING = 'Wrestling',
  WRITING = 'Writing',
  WUXIA = 'Wuxia',
  YAKUZA = 'Yakuza',
  YANDERE = 'Yandere',
  YOUKAI = 'Youkai',
  YURI = 'Yuri',
  ZOMBIE = 'Zombie',
}

export enum Topics {
  ANIME = 'anime',
  ANIMATION = 'animation',
  MANGA = 'manga',
  GAMES = 'games',
  NOVELS = 'novels',
  LIVE_ACTION = 'live-action',
  COVID_19 = 'covid-19',
  INDUSTRY = 'industry',
  MUSIC = 'music',
  PEOPLE = 'people',
  MERCH = 'merch',
  EVENTS = 'events',
}

export interface ProxyConfig {
  /**
   * The proxy URL
   * @example https://proxy.com
   **/
  url: string | string[];
  /**
   * X-API-Key header value (if any)
   **/
  key?: string;
  /**
   * The proxy rotation interval in milliseconds. (default: 5000)
   */
  rotateInterval?: number;
}

export interface IRoles {
  id: string;
  title: ITitle;
  type?: string;
  image: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  color?: string;
}

export interface IStaff {
  id: string;
  name: {
    first?: string;
    last?: string;
    native?: string;
    full?: string;
  };
  image?: {
    large?: string;
    medium?: string;
  };
  description?: string;
  siteUrl?: string;
  roles?: IRoles[];
}

export interface IAnilistAdvancedSearchProps {
  query?: string | null;
  type?: string | null;
  page?: number;
  perPage?: number;
  format?: string | null;
  sort?: string[];
  genres?: (Genres | string)[] | null;
  tags?: (Tags | string)[] | null;
  year?: string | number;
  id?: string | number;
  status?: string;
  season?: string;
}

export type AnilistAdvancedSearchVariablesType = Omit<IAnilistAdvancedSearchProps, 'query' | 'perPage'> & {
  search?: IAnilistAdvancedSearchProps['query'];
  size?: IAnilistAdvancedSearchProps['perPage'];
};
