# Contributing to Translaas SDK

We welcome contributions to the Translaas SDK! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up your development environment**:
   ```bash
   npm install
   npm run build
   ```

## Development Guidelines

### Code Style

- Follow TypeScript/JavaScript coding conventions and style guidelines
- Use meaningful variable and method names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose
- Use `async`/`await` for asynchronous operations
- Use ESLint and Prettier for code formatting (configured in the project)

### Optional: Auto-format on commit (pre-commit hook)

This repo includes an **opt-in** pre-commit hook that will:

- Run ESLint and Prettier on **staged files**
- Format code according to project standards
- Re-stage formatted files so your commit stays consistent

Enable it once per clone:

```bash
# Linux/macOS
./scripts/setup-githooks.sh

# Windows (PowerShell)
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/setup-githooks.ps1
```

### Package Structure

- Keep code organized within the appropriate package:
  - `@translaas/models` - Data transfer objects only
  - `@translaas/client` - Core HTTP client implementation
  - `@translaas/caching` - In-memory caching layer
  - `@translaas/caching-file` - File-based offline caching with hybrid caching support
  - `@translaas/extensions` - Framework integrations and extensions

#### Test File Structure

All test files should be placed alongside source files or in a `__tests__` directory:

```
packages/
├── @translaas/client/
│   ├── src/
│   │   ├── TranslaasClient.ts
│   │   └── __tests__/
│   │       └── TranslaasClient.test.ts
│   └── package.json
```

Or use a separate `tests/` directory at the package root:

```
packages/
├── @translaas/client/
│   ├── src/
│   │   └── TranslaasClient.ts
│   ├── tests/
│   │   └── TranslaasClient.test.ts
│   └── package.json
```

Each test file should:
- Be named `*.test.ts` or `*.spec.ts`
- Use Jest or Vitest as the testing framework
- Include proper mocking for external dependencies
- Use descriptive test names following the pattern: `{MethodName}_{Scenario}_{ExpectedBehavior}`

### Multi-Environment Support

All packages in the Translaas SDK are configured to work in multiple JavaScript environments:
- **Node.js 18+** - Native fetch API support
- **Modern Browsers** - ES2020+ support
- **Deno** - Deno 1.0+ support
- **Bun** - Bun 1.0+ support

#### Package.json Configuration

Each `package.json` file should include:

```json
{
  "name": "@translaas/client",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Key Points

1. **ES Modules**: Use ES modules (`import`/`export`) as primary format
2. **TypeScript**: All source code is written in TypeScript
3. **Build Output**: Each package builds to `dist/` directory
4. **Type Definitions**: TypeScript definitions are included in the package

#### Environment Compatibility

When writing code, be aware of environment differences:

- **Node.js**: 
  - Native `fetch` API available (Node.js 18+)
  - File system access available
  - Use `fs/promises` for async file operations

- **Browser**: 
  - `fetch` API available
  - Use `localStorage` or `IndexedDB` for storage
  - No file system access

- **Deno/Bun**: 
  - Similar to Node.js but may have different APIs
  - Test compatibility when possible

#### Conditional Code

If you need environment-specific code:

```typescript
// Runtime check (preferred)
if (typeof window !== 'undefined') {
  // Browser code
} else {
  // Node.js code
}

// Or use feature detection
if (typeof fetch !== 'undefined') {
  // fetch is available
}
```

### Test-Driven Development (TDD)

We follow **Test-Driven Development (TDD)** practices. This means:

1. **Write tests first** - Before implementing any feature, write a failing test
2. **Make it pass** - Write the minimum code to make the test pass
3. **Refactor** - Improve the code while keeping tests green

#### TDD Workflow

```
Red → Green → Refactor
```

- **Red**: Write a failing test that describes the desired behavior
- **Green**: Write the minimum code to make the test pass
- **Refactor**: Improve code quality while keeping tests passing

### Testing

- **Follow TDD** - Write tests before implementation
- **Every package must have tests** - Test files are located alongside source files or in `tests/` directory
- **Test file naming**: `*.test.ts` or `*.spec.ts` (e.g., `TranslaasClient.test.ts`)
- Write unit tests for all public APIs
- Test both success and failure scenarios
- Ensure all tests pass before submitting a pull request
- Maintain or improve code coverage (aim for 80%+)
- Test against all target environments when possible
- Use proper test naming: `{MethodName}_{Scenario}_{ExpectedBehavior}`

### Dependencies

- Minimize external dependencies
- Use native JavaScript APIs when possible (e.g., `fetch`, `Map`, `Set`)
- Prefer built-in Node.js APIs over third-party libraries
- Document any new dependencies and their justification
- Use `@types/*` packages for TypeScript definitions when needed

## Pull Request Process

1. **Follow TDD workflow**:
   - Write failing tests first (Red)
   - Implement code to make tests pass (Green)
   - Refactor while keeping tests green
2. **Create test file** if adding a new module:
   - Create test file alongside source file or in `tests/` directory
   - Name it `{ModuleName}.test.ts`
   - Add appropriate test dependencies (Jest/Vitest, mocking libraries)
3. **Create a changeset** if your changes should be versioned:
   ```bash
   npm run changeset
   ```
   - Select the packages that changed
   - Choose the version bump type (major/minor/patch)
   - Write a summary of the changes
   - Commit the changeset file with your PR
4. **Update documentation** if you're adding features or changing behavior
5. **Ensure test coverage**:
   - All public APIs have tests
   - Both success and failure scenarios are tested
   - Tests follow naming convention: `{MethodName}_{Scenario}_{ExpectedBehavior}`
6. **Run the build** to ensure everything compiles:
   ```bash
   npm run build
   ```
7. **Run type checking** to ensure TypeScript is happy:
   ```bash
   npm run type-check
   ```
8. **Run tests** and ensure all pass:
   ```bash
   npm test
   ```
9. **Run linting** to ensure code style is correct:
   ```bash
   npm run lint
   ```
10. **Update the README** if you're adding new features or changing usage
11. **Write a clear PR description**:
    - What changes were made
    - Why the changes were made
    - How to test the changes
    - Any breaking changes
    - Test coverage information

## Commit Messages

Use clear, descriptive commit messages following conventional commits:

```
feat: Add support for custom cache providers
fix: Resolve timeout issue in retry policy
docs: Update README with caching examples
refactor: Simplify HTTP client configuration
test: Add unit tests for retry policy
chore: Update dependencies
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, etc.
- `build`: Build system changes
- `ci`: CI/CD changes

## Reporting Issues

When reporting bugs or requesting features:

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce (for bugs)
- Specify the Node.js version and environment you're using
- Include relevant code samples or error messages
- Use appropriate labels if you have permission

### Issue Templates

When creating an issue, please use the appropriate template:
- **Bug Report**: For reporting bugs
- **Feature Request**: For requesting new features
- **Question**: For asking questions about usage or implementation

## Code Review Process

1. All pull requests require at least one approval
2. Ensure CI/CD checks pass
3. Address review feedback promptly
4. Keep pull requests focused and reasonably sized
5. Rebase on main branch if requested

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Be patient with questions and learning curves

## Questions?

If you have questions about contributing, please:
- Open an issue with the `question` label
- Check existing issues and discussions
- Review the codebase to understand patterns and conventions

## Testing Resources

### Creating a Test File

To create a new test file:

```bash
# Navigate to package directory
cd packages/@translaas/client

# Create test file
touch src/__tests__/MyModule.test.ts
```

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TranslaasClient, TranslaasOptions } from '../TranslaasClient';

describe('TranslaasClient', () => {
  let client: TranslaasClient;

  beforeEach(() => {
    const options: TranslaasOptions = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com',
    };
    client = new TranslaasClient(options);
  });

  it('should return translation when entry exists', async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => 'Save',
    });

    // Act
    const result = await client.getEntryAsync('ui', 'button.save', 'en');

    // Assert
    expect(result).toBe('Save');
  });

  it('should throw exception when API returns error', async () => {
    // Arrange
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // Act & Assert
    await expect(
      client.getEntryAsync('ui', 'button.save', 'en')
    ).rejects.toThrow('API request failed');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=@translaas/client

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run type checking
npm run type-check
```

## Additional Resources

- [SDK Guidelines](.cursor/rules/translaas-sdk-rules.mdc) - Comprehensive development guidelines including TDD practices
- [Architecture Documentation](docs/ARCHITECTURE.md) - Architecture overview and design patterns
- [API Reference](docs/API_REFERENCE.md) - Complete API reference
- [JavaScript Porting Guide](docs/PORTING_JAVASCRIPT.md) - Detailed porting guide

## Release Notes and Version Management

### Version Management with Changesets

The SDK uses [Changesets](https://github.com/changesets/changesets) for version management. Changesets enables **independent versioning** of packages while maintaining dependency relationships automatically.

#### How Changesets Works

1. **Create a changeset** when you make changes that should be versioned
2. **Changesets are committed** to the repository
3. **CI automatically** creates a version PR when changesets are merged
4. **Merging the version PR** triggers automated publishing to npm

#### Creating a Changeset

When you make changes that should be versioned, create a changeset:

```bash
npm run changeset
```

This interactive command will:
1. Ask which packages changed
2. Ask what type of change (major, minor, patch)
3. Ask for a summary of the changes
4. Create a changeset file in `.changeset/`

**Example changeset file** (`.changeset/short-name.md`):
```markdown
---
"@translaas/client": patch
"@translaas/models": patch
---

Fixed timeout issue in retry policy for HTTP requests
```

#### Changeset Types

- **Major** (`major`): Breaking changes that require users to update their code
- **Minor** (`minor`): New features that are backward compatible
- **Patch** (`patch`): Bug fixes that are backward compatible

#### When to Create a Changeset

Create a changeset for:
- ✅ New features
- ✅ Bug fixes
- ✅ Breaking changes
- ✅ Documentation updates that affect usage
- ✅ Dependency updates that affect behavior

**Don't create a changeset for:**
- ❌ Internal refactoring with no user-facing changes
- ❌ Test-only changes
- ❌ Build system changes that don't affect published packages
- ❌ Documentation-only changes (unless they affect API usage)

#### Version Release Process

**Automated Process (Recommended):**

1. **Create and commit changesets** with your PR:
   ```bash
   npm run changeset
   git add .changeset/
   git commit -m "feat: add new feature"
   ```

2. **Merge your PR** to `main`

3. **CI automatically**:
   - Detects changesets
   - Creates a "Version Packages" PR
   - Updates package versions
   - Updates changelogs

4. **Review and merge** the "Version Packages" PR

5. **CI automatically publishes** to npm when the version PR is merged

**Manual Process (If needed):**

If you need to manually release:

```bash
# 1. Update versions based on changesets
npm run changeset:version

# 2. Build all packages
npm run build

# 3. Publish to npm
npm run changeset:publish
```

#### Version Numbering

We follow [Semantic Versioning](https://semver.org/) (SemVer):
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.Y.0): New features, backward compatible
- **PATCH** (0.0.Z): Bug fixes, backward compatible

#### Independent Package Versioning

Each package in the monorepo can be versioned independently:
- `@translaas/models` can be at `1.2.0`
- `@translaas/client` can be at `1.3.0`
- `@translaas/caching` can be at `1.1.5`

Changesets automatically:
- Updates dependent packages when their dependencies change
- Maintains version consistency across the monorepo
- Generates changelogs for each package

#### Changeset Scripts

Available npm scripts:

- `npm run changeset` - Create a new changeset interactively
- `npm run changeset:version` - Update package versions based on changesets
- `npm run changeset:publish` - Publish packages to npm
- `npm run version` - Alias for `changeset:version`
- `npm run release` - Build and publish (combines build + publish)

#### CI Integration

The GitHub Actions workflow (`.github/workflows/release.yml`) automatically:
- ✅ Checks for changesets on every push to `main`
- ✅ Creates a "Version Packages" PR when changesets are detected
- ✅ Publishes packages to npm when the version PR is merged
- ✅ Updates changelogs automatically

**Required Secrets:**
- `NPM_TOKEN` - npm authentication token for publishing

#### Changelog Generation

Changesets automatically generates changelogs:
- Each package gets its own `CHANGELOG.md`
- Changelogs are updated when versions are bumped
- Format follows [Keep a Changelog](https://keepachangelog.com/) conventions

#### Pre-Release Versions

For pre-release versions, use version numbers like:
- `0.1.0` - Initial pre-release
- `0.2.0` - Pre-release with new features
- `0.1.1` - Pre-release bug fix

Once stable, release `1.0.0` as the first stable version.

---

### Release Notes

## Version 0.1.0 (Pre-Release)

### Initial Pre-Release

This is the initial pre-release of the Translaas SDK for JavaScript/TypeScript. This version is still under active development and may have breaking changes before the 1.0.0 release.

### Packages Included

- **@translaas/models** (0.1.0) - Data transfer objects (DTOs) for the Translaas Translation Delivery API
- **@translaas/client** (0.1.0) - Core HTTP client implementation with caching support
- **@translaas/caching** (0.1.0) - In-memory caching abstractions and implementations
- **@translaas/caching-file** (0.1.0) - File-based offline caching with hybrid caching support
- **@translaas/extensions** (0.1.0) - Framework integrations (Express, Next.js, etc.)
- **@translaas/core** (0.1.0) - Main package (re-exports all)

### Features

- ✅ Strongly-typed API with full TypeScript support
- ✅ Convenience API via `TranslaasService` with `t()` method
- ✅ Framework integrations for Express.js and Next.js
- ✅ Flexible caching with configurable cache modes (None, Entry, Group, Project)
- ✅ Offline caching with file-based storage (Node.js) or browser storage (browser)
- ✅ Hybrid caching (memory L1 + file L2) for optimal performance
- ✅ Multi-environment support (Node.js, Browser, Deno, Bun)
- ✅ Fully asynchronous API for optimal performance
- ✅ Modular design - use only what you need

### Supported Environments

- Node.js 18+
- Modern Browsers (ES2020+)
- Deno 1.0+
- Bun 1.0+

### Installation

```bash
# Full package (recommended)
npm install @translaas/core

# Or install individual packages
npm install @translaas/client
npm install @translaas/models
npm install @translaas/caching
npm install @translaas/caching-file
npm install @translaas/extensions
```

### Documentation

- [README.md](README.md) - Getting started guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [GitHub Repository](https://github.com/acuencadev/translaas-sdk-js)

### Breaking Changes

None - This is the initial pre-release.

### Known Issues

None at this time.

---

### Template for Future Releases

When adding a new release, add it at the top of the "Release Notes" section above, following this template:

```markdown
## Version X.Y.Z

### Added
- New features added in this release

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Deprecated
- Features that will be removed in a future release

### Removed
- Features removed in this release

### Security
- Security fixes
```

Thank you for contributing to Translaas SDK! 🎉
