# consumet.ts

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

consumet.ts is a Node.js TypeScript library that provides high-level APIs for scraping entertainment media information including anime, manga, books, movies, comics, light novels, and news from various providers.

## Working Effectively

### Prerequisites
- Node.js (tested with v20.19.5)
- Yarn (tested with v1.22.22)  
- All commands should be run from the repository root directory

### Bootstrap and Setup
Run these commands in order to set up the development environment:

1. `yarn install --ignore-engines` -- installs dependencies (40 seconds). NEVER CANCEL.
2. `yarn build` -- compiles TypeScript to JavaScript (5 seconds). **NOTE: May fail with TypeScript errors - see Build Issues section.**
3. Basic functionality test: `node -e "const { ANIME } = require('./dist'); console.log('Providers:', Object.keys(ANIME));"`

### Build Process
- `yarn build` -- compiles TypeScript (5 seconds)
- `yarn lint` -- runs prettier formatting (4 seconds)
- **CRITICAL BUILD ISSUE**: The build may fail with TypeScript errors in `src/extractors/megacloud/megacloud.getsrcs.ts`. If this happens:
  - Add `// @ts-nocheck` at the top of the file after the first comment line
  - This disables type checking for that specific file and allows the build to complete

### Testing
- `yarn test` -- runs full test suite (16 seconds). NEVER CANCEL.
- `yarn test:anime` -- runs anime provider tests only
- `yarn test:books` -- runs book provider tests only  
- `yarn test:movies` -- runs movie provider tests only
- `yarn test:manga` -- runs manga provider tests only
- `yarn test:comics` -- runs comic provider tests only
- `yarn test:lightnovels` -- runs light novel provider tests only
- `yarn test:news` -- runs news provider tests only
- `yarn test:meta` -- runs metadata provider tests only
- **NOTE**: Most tests are integration tests that make real network requests to scraping targets. Test failures are common due to:
  - Network connectivity issues
  - Website structure changes
  - Rate limiting from target sites
  - Provider initialization errors (especially AnimeOwl)

### Key Commands with Timing
- `yarn install --ignore-engines` (40s) - NEVER CANCEL
- `yarn build` (5s) - may require TypeScript fix
- `yarn lint` (4s) 
- `yarn test` (16s) - NEVER CANCEL, failures expected
- Set timeouts to 60+ seconds for install, 30+ seconds for build/test operations

## Validation

### Always validate functionality after making changes:
1. **Build validation**: Run `yarn build` and ensure it completes without errors
2. **Import validation**: Test basic imports: `node -e "console.log('Providers available:', Object.keys(require('./dist').ANIME).length);"`
3. **Lint validation**: Always run `yarn lint` before committing (enforced by pre-commit hooks)

### Manual Testing Scenarios  
When testing provider functionality:
- Verify imports work: Check that `require('./dist')` loads without module errors
- Test provider instantiation by creating instances in Node.js REPL
- Use examples in `examples/` directory as reference (run with `npx ts-node examples/one-piece.ts`)
- Be aware that AnimeOwl provider may show initialization errors in background - this is normal
- Focus on testing code structure and imports rather than network-dependent scraping results

## Common Tasks

### Adding a New Provider
1. Create new file in `src/providers/<category>/<provider-name>.ts`
2. Extend the appropriate parser class from `src/models/<category>-parser.ts`
3. Add provider to `src/providers/<category>/index.ts`
4. Create tests in `test/<category>/<provider-name>.test.ts`
5. Always run `yarn lint && yarn build` after changes

### Testing Provider Changes
- Test basic instantiation before network-dependent functionality
- Use timeouts for network requests (jest timeout is set to 120 seconds)
- Provider tests are in `test/` directory organized by category

### Pre-commit Validation
The repository has pre-commit hooks that run:
1. `yarn lint` (auto-formats code)
2. `yarn build` (must pass)
3. `git add .` (stages formatted files)

Always run these manually before committing: `yarn lint && yarn build` (9 seconds total)

## Repository Structure

```
src/
├── extractors/          # Media stream extractors (VidCloud, etc.)
├── models/             # Base classes and type definitions
├── providers/          # Content providers organized by category
│   ├── anime/         # Anime providers (Gogoanime, Zoro, etc.)
│   ├── books/         # Book providers (Libgen)
│   ├── manga/         # Manga providers (MangaDex, etc.) 
│   ├── movies/        # Movie providers (FlixHQ, etc.)
│   ├── comics/        # Comic providers
│   ├── light-novels/  # Light novel providers
│   ├── meta/          # Metadata providers (AniList, TMDB)
│   └── news/          # News providers
└── utils/             # Shared utilities

test/                  # Integration tests (mirror src structure)
dist/                  # Compiled JavaScript output
docs/                  # Documentation and guides
examples/              # Usage examples (TypeScript)
```

### Key Files to Monitor
- `src/index.ts` - main library exports
- `src/providers/index.ts` - provider category exports  
- `package.json` - dependencies and npm scripts
- `tsconfig.json` - TypeScript configuration
- `.github/workflows/` - CI/CD pipeline definitions

## Known Issues

### Build Issues
- **TypeScript compilation errors in megacloud extractor**: Add `// @ts-nocheck` to fix
- **Strict nullish coalescing errors**: Fixed in current codebase

### Runtime Issues  
- **AnimeOwl provider errors**: Background initialization failures are normal, don't affect other providers
- **Network timeouts**: Common in tests due to scraping external sites
- **Provider failures**: External website changes frequently break scrapers

### Development Workflow
1. Make code changes
2. Run `yarn lint` (auto-fixes formatting)
3. Run `yarn build` (verify compilation)
4. Test basic functionality manually
5. Run relevant test subset if needed
6. Commit (pre-commit hooks will re-run lint and build)

## Performance Notes
- Installation: ~40 seconds (includes dependency compilation)
- Build: ~5 seconds (TypeScript compilation)
- Lint: ~4 seconds (prettier formatting)
- Full test suite: ~16 seconds (with expected failures)
- Basic provider instantiation: <1 second

NEVER CANCEL long-running operations. Always wait for completion and set appropriate timeouts (60+ seconds for installs, 30+ seconds for builds/tests).