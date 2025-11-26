# Contributing

Thank you for your interest in contributing to consumet.ts! This guide will help you get started with contributing to the project. Whether you're fixing a bug, adding a new provider, or improving documentation, we appreciate your help.

If you have any questions or suggestions, please open an [issue](https://github.com/consumet/extensions/issues/new?assignees=&labels=Bug&template=bug-report.yml) or join our [Discord server](https://discord.gg/qTPfvMxzNH).

For additional details, see our [informal contributing guide](./docs/guides/contributing.md).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Cloning the Repository](#cloning-the-repository)
  - [Installing Dependencies](#installing-dependencies)
  - [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Writing a Provider](#writing-a-provider)
  - [Setting up the Provider](#setting-up-the-provider)
  - [Provider Examples](#provider-examples)
- [Updating the Codebase](#updating-the-codebase)
  - [Updating Documentation](#updating-documentation)
  - [Fixing a Provider](#fixing-a-provider)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Getting Help](#getting-help)


## Prerequisites

To contribute to consumet.ts, you should have knowledge of:

- **[Node.js](https://nodejs.org/)** - JavaScript runtime (v16 or higher recommended)
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **Web Scraping** (for provider development):
  - [Cheerio](https://cheerio.js.org/) - jQuery-like HTML parsing
  - [Axios](https://axios-http.com/docs/example) - HTTP client
  - [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) - For selecting HTML elements
  - [Browser DevTools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools) - For inspecting web pages
- **Git** - Version control system

## Getting Started

### Cloning the Repository
1. [Fork the repository](https://github.com/consumet/consumet.ts/fork)
2. Clone your fork to your local machine using the following command **(make sure to change `<your-username>` to your GitHub username)**:
```sh
git clone https://github.com/<your-username>/consumet.ts.git
```
3. Navigate to the project directory:
```sh
cd consumet.ts
```
4. Create a new branch:
```sh
git checkout -b <new-branch-name>
```

### Installing Dependencies

Install the required dependencies using npm:

```sh
npm install
```

### Running the Project

Build the project:
```sh
npm run build
```

Run tests:
```sh
npm test
```

For development with auto-rebuild:
```sh
npm run dev
```

## Project Structure

Understanding the project structure will help you navigate and contribute more effectively.

**Key terminology:**
- **`<category>`** - The category of the provider (e.g., `anime`, `manga`, `book`, `movie`)
- **`<provider-name>`** - The name of the provider in camelCase (e.g., `gogoanime`, `libgen`, `anilist`)

```sh
> tree
docs/
├── guides/
|   ├── ...
|   ├── anime.md
|   ├── getting-started.md
│   └── contributing.md (informal guide)
├── providers/
│   └── <provider-name>.md (provider documentation)
├── README.md
src/
├── index.ts
|── models
├── providers
│   ├── <category>
│   │   ├── index.ts
│   │   └── <provider-name>.ts
│   └── <category>
└── utils
```

## Writing a Provider

Each provider is a class that extends an abstract parser class. For example, the `Libgen` provider extends the `BookParser` class, and `Gogoanime` extends `AnimeParser`.

The parser abstract classes can be found in the `src/models/` folder:
```sh
src/models/anime-parser.ts # AnimeParser
src/models/book-parser.ts  # BookParser
src/models/lightnovel-parser.ts  # LightNovelParser
src/models/comic-parser.ts # ComicParser
src/models/manga-parser.ts # MangaParser
src/models/movie-parser.ts # MovieParser
```
Feel free to propose additions to the abstract classes if you believe they would be beneficial to other providers.

<details>
   <summary>
   visualization of the abstract classes hierarchy
   </summary>

   ```mermaid
   classDiagram
         Proxy <|-- BaseProvider
         BaseProvider <|-- BaseParser
         BaseProvider : +String name
         BaseProvider : +String baseUrl
         BaseProvider: +toString()
         BaseParser <|-- AnimeParser
         BaseParser <|-- BookParser
         BaseParser <|-- MangaParser
         BaseParser <|-- LightNovelParser
         BaseParser <|-- ComicParser
         BaseParser <|-- MovieParser
         class Proxy{
            ProxyConfig
         }
         class BaseParser{
            +search(String query)
         }
         class AnimeParser{
            +fetchAnimeInfo(String animeId)
            +fetchEpisodeSources(String episodeId)
            +fetchEpisodeServers(String episodeId)
         }
         class MovieParser{
            +fetchMediaInfo(String mediaId)
            +fetchEpisodeSources(String episodeId)
            +fetchEpisodeServers(String episodeId)
         }
         class BookParser{
            empty
         }
         class MangaParser{
            +fetchMangaInfo(String mangaId)
            +fetchChapterPages(String chapterId)
         }
         class ComicParser{
            empty
         }
         class LightNovelParser{
            +fetchLighNovelInfo(String lightNovelId)
            +fetchChapterContent(String chapterId)
         }
   ```
</details>


### Setting up the Provider

1. **Create the provider file**: Create a new file in `src/providers/<category>/<provider-name>.ts`

2. **Import the abstract class**: Import the appropriate parser class from `src/models/<category>-parser.ts`. For example, if you're writing an anime provider, import `AnimeParser` from `src/models/anime-parser.ts`.

3. **Implement the provider**: Extend the abstract class and implement all required methods:
   - `search()` - Search for content
   - Category-specific methods (e.g., `fetchAnimeInfo()`, `fetchEpisodeSources()` for anime)

4. **Export the provider**: Add your provider to `src/providers/<category>/index.ts`

5. **Document the provider**: Create documentation in `docs/providers/<provider-name>.md`

### Provider Examples

For reference, check existing providers:
- Anime: `src/providers/anime/hianime.ts`
- Manga: `src/providers/manga/mangadex.ts`
- Light Novels: `src/providers/light-novels/novelupdates.ts`


## Updating the Codebase

### Updating Documentation

1. Make your changes to the relevant documentation files in `docs/`
2. Ensure all links and references are correct
3. Follow the existing documentation style
4. Test any code examples you include
5. [Commit your changes](#commit-guidelines)

### Fixing a Provider

1. Identify the issue (e.g., selector changes, API updates)
2. Update the provider code in `src/providers/<category>/<provider-name>.ts`
3. Test the provider to ensure it works correctly
4. Update the provider's documentation if needed
5. [Commit your changes](#commit-guidelines)

## Testing

Before submitting your changes, make sure to test them:

```sh
# Run all tests
npm test

# Run tests for a specific provider (if available)
npm test -- <provider-name>

# Build the project to check for TypeScript errors
npm run build
```

If you're adding a new provider, consider adding tests in the `test/` directory.

## Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistency with existing code
- Use async/await for asynchronous operations
- Handle errors appropriately

The project uses ESLint and Prettier for code formatting. Run:

```sh
npm run format  # Format code with Prettier
npm run lint    # Check for linting issues
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This helps maintain a clean and organized commit history.

### Commit Message Format

Each commit message should have a **type** and a **description**:

```
<type>: <description>

[optional body]
```

### Commit Types

- `feat:` A new feature or enhancement
- `fix:` A bug fix
- `refactor:` Code refactoring without changing functionality
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates, etc.
- `perf:` Performance improvements
- `style:` Code style changes (formatting, missing semicolons, etc.)

### Examples

```
feat: add support for Crunchyroll provider
fix: resolve search issue in Gogoanime
docs: update contributing guidelines
refactor: simplify episode fetching logic in Anilist
test: add tests for Mangadex provider
chore: update dependencies
```

### Tips

- Keep the description short and descriptive (50 characters or less)
- Use the imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- Don't end with a period

For more details, read [this guide](https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/).

## Submitting a Pull Request

Once you've made your changes and committed them, you're ready to submit a pull request (PR):

1. **Push your changes** to your fork:
   ```sh
   git push origin <your-branch-name>
   ```

2. **Create a Pull Request**:
   - Go to the [consumet.ts repository](https://github.com/consumet/consumet.ts)
   - Click "Pull Requests" → "New Pull Request"
   - Click "compare across forks"
   - Select your fork and branch
   - Click "Create Pull Request"

3. **Fill out the PR template**:
   - Provide a clear title following commit conventions
   - Describe what changes you made and why
   - Reference any related issues (e.g., "Fixes #123")
   - List any breaking changes
   - Add screenshots/examples if applicable

4. **Wait for review**:
   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, your PR will be merged

### PR Best Practices

- Keep PRs focused on a single feature or fix
- Ensure all tests pass before submitting
- Update documentation if needed
- Respond to review comments promptly
- Be respectful and patient

## Getting Help

Need assistance? Here are your options:

- **Discord**: Join our [Discord server](https://discord.gg/qTPfvMxzNH) for real-time help
- **Issues**: Open an [issue](https://github.com/consumet/consumet.ts/issues/new/choose) for bugs or feature requests
- **Discussions**: Use [GitHub Discussions](https://github.com/consumet/consumet.ts/discussions) for questions
- **Documentation**: Check the [docs](./docs) folder for guides and examples

Thank you for contributing to consumet.ts! 🎉
