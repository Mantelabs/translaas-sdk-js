# Translaas SDK - Documentation Index

This directory contains comprehensive documentation for the Translaas SDK, designed to help developers understand the architecture, features, and implementation details for porting to other languages.

## Documentation Structure

### Core Documentation

#### [Architecture Overview](./ARCHITECTURE.md)

Complete overview of the SDK's architecture, design patterns, and project structure. Essential reading for understanding how all components work together.

**Topics Covered:**

- Project structure and dependencies
- Architecture patterns (DI, Decorator, Strategy, Factory)
- Data flow diagrams
- Key interfaces and configuration models
- Thread safety and performance considerations
- Extension points

#### [API Reference](./API_REFERENCE.md)

Complete reference for all public APIs in the Translaas SDK. Includes method signatures, parameters, return types, and examples.

**Topics Covered:**

- Core interfaces (`ITranslaasClient`, `ITranslaasService`)
- Response models (`TranslationGroup`, `TranslationProject`, `ProjectLocales`)
- Configuration models (`TranslaasOptions`, `OfflineCacheOptions`)
- Error types
- HTTP endpoints
- Authentication

#### [Caching System](./CACHING.md)

Detailed documentation of all caching mechanisms: memory cache, file cache, and hybrid cache.

**Topics Covered:**

- Cache modes (None, Entry, Group, Project)
- Cache expiration (absolute, sliding)
- File-based offline caching
- Hybrid caching (L1 memory + L2 file)
- Cache provider interfaces
- Thread safety
- Error handling

#### [Language Resolution](./LANGUAGE_RESOLUTION.md)

Documentation on automatic language resolution using the provider pattern.

**Topics Covered:**

- Language resolution flow
- Built-in providers (Request, Culture, Default)
- Provider registration order
- Custom providers
- Framework-specific implementations

#### [Git Workflow](./GIT_WORKFLOW.md)

Documentation on Git hooks, commit conventions, and workflow practices.

**Topics Covered:**

- Pre-commit hook (code formatting)
- Git attributes configuration
- Commit message conventions (Conventional Commits)
- Branch naming conventions
- Pull request process
- Setup scripts
- Porting considerations for other languages

### Porting Guides

#### [JavaScript Porting Guide](./PORTING_JAVASCRIPT.md)

Step-by-step guide for porting the Translaas SDK to JavaScript/TypeScript.

**Topics Covered:**

- Project structure (monorepo with packages)
- Type definitions and interfaces
- HTTP client implementation (fetch, axios)
- Caching implementations (memory, file, browser)
- Language resolution
- Error handling
- Usage examples (Node.js, Express, Browser)
- Testing strategies

#### [Python Porting Guide](./PORTING_PYTHON.md)

Step-by-step guide for porting the Translaas SDK to Python.

**Topics Covered:**

- Package structure
- Type hints and protocols
- HTTP client implementation (aiohttp, httpx)
- Caching implementations (memory, file)
- Language resolution
- Error handling
- Usage examples (Flask, FastAPI, Console)
- Testing strategies

### Specifications

#### [Offline Cache Specification](./specs/OFFLINE_CACHE_SPEC.md)

Detailed specification for the offline file-based caching feature.

#### [Offline Cache Issue](./specs/OFFLINE_CACHE_ISSUE.md)

Feature request and implementation plan for offline caching.

## Quick Start Guide

### For .NET Developers

1. Read [Architecture Overview](./ARCHITECTURE.md) to understand the SDK structure
2. Read [API Reference](./API_REFERENCE.md) for API details
3. Review [Caching System](./CACHING.md) for caching options
4. Check [Language Resolution](./LANGUAGE_RESOLUTION.md) for automatic language detection
5. Review [Git Workflow](./GIT_WORKFLOW.md) for development workflow and hooks

### For JavaScript/Python Porters

1. Start with [Architecture Overview](./ARCHITECTURE.md) to understand the overall design
2. Read [API Reference](./API_REFERENCE.md) to understand the API surface
3. Review [Caching System](./CACHING.md) for caching implementation details
4. Read [Language Resolution](./LANGUAGE_RESOLUTION.md) for language detection
5. Review [Git Workflow](./GIT_WORKFLOW.md) for development workflow patterns
6. Follow the appropriate porting guide:
   - [JavaScript Porting Guide](./PORTING_JAVASCRIPT.md)
   - [Python Porting Guide](./PORTING_PYTHON.md)

## Key Concepts

### Core Features

1. **Translation API**: Get translations by group/entry, group, project, or locales
2. **Caching**: Multiple cache modes (Entry, Group, Project) with memory and file storage
3. **Offline Support**: File-based caching for offline operation
4. **Language Resolution**: Automatic language detection from multiple sources
5. **Pluralization**: Support for plural forms with CLDR categories
6. **Named Parameters**: Placeholder replacement in translation strings

### Design Principles

1. **Modularity**: Split into multiple packages (Models, Client, Caching, Extensions)
2. **Dependency Injection**: All components designed for DI integration
3. **Async/Await**: All I/O operations are asynchronous
4. **Strongly Typed**: Full type safety with IntelliSense support
5. **Multi-Framework**: Support for multiple .NET frameworks

### Porting Considerations

When porting to JavaScript/Python, maintain:

1. **Same API Structure**: Keep method signatures similar
2. **Same Configuration Model**: Use similar options classes
3. **Same Caching Strategy**: Implement same cache modes
4. **Same Error Types**: Use similar exception hierarchy
5. **Same Language Resolution**: Implement same provider pattern

## Feature Matrix

| Feature               | .NET SDK     | JavaScript      | Python        |
| --------------------- | ------------ | --------------- | ------------- |
| Core API              | ✅           | ✅              | ✅            |
| Memory Caching        | ✅           | ✅              | ✅            |
| File Caching          | ✅           | ✅              | ✅            |
| Hybrid Caching        | ✅           | ✅              | ✅            |
| Language Resolution   | ✅           | ✅              | ✅            |
| Pluralization         | ✅           | ✅              | ✅            |
| Named Parameters      | ✅           | ✅              | ✅            |
| Offline Sync          | ✅           | ✅              | ✅            |
| Framework Integration | ASP.NET Core | Express/Fastify | Flask/FastAPI |

## API Endpoints

All SDKs communicate with the same Translaas API endpoints:

| Endpoint                    | Method | Purpose                             |
| --------------------------- | ------ | ----------------------------------- |
| `/api/translations/text`    | GET    | Get single translation entry        |
| `/api/translations/group`   | GET    | Get all translations for a group    |
| `/api/translations/project` | GET    | Get all translations for a project  |
| `/api/translations/locales` | GET    | Get available locales for a project |

**Note:** All endpoints use GET requests with JSON request bodies.

## Authentication

All SDKs use API key authentication via the `X-Api-Key` header:

```
X-Api-Key: your-api-key-here
```

## Examples

### Basic Usage (.NET)

```csharp
var client = new TranslaasClient(options);
string translation = await client.GetEntryAsync("common", "welcome", "en");
```

### Basic Usage (JavaScript)

```typescript
const client = new TranslaasClient(options);
const translation = await client.getEntryAsync('common', 'welcome', 'en');
```

### Basic Usage (Python)

```python
client = TranslaasClient(options)
translation = await client.get_entry_async("common", "welcome", "en")
```

## Testing

All SDKs should include:

- **Unit Tests**: Test each component in isolation
- **Integration Tests**: Test with real HTTP client (test server)
- **Framework Compatibility Tests**: Test on all supported frameworks/versions

## Contributing

When contributing to porting efforts:

1. Follow the architecture patterns described in [Architecture Overview](./ARCHITECTURE.md)
2. Maintain API compatibility as described in [API Reference](./API_REFERENCE.md)
3. Implement caching as described in [Caching System](./CACHING.md)
4. Follow language resolution patterns in [Language Resolution](./LANGUAGE_RESOLUTION.md)
5. Use the porting guides as reference:
   - [JavaScript Porting Guide](./PORTING_JAVASCRIPT.md)
   - [Python Porting Guide](./PORTING_PYTHON.md)

## Additional Resources

- [Main README](../README.md): Quick start guide and installation
- [Translation Structure](../TRANSLATION_STRUCTURE.md): Sample translation structure
- [Contributing Guidelines](../CONTRIBUTING.md): Development guidelines
- [Git Workflow](./GIT_WORKFLOW.md): Git hooks, commit conventions, and workflow

## Questions?

If you have questions about porting or implementation:

1. Check the relevant documentation file
2. Review the porting guide for your target language
3. Look at the existing .NET implementation for reference
4. Open an issue on GitHub for clarification

---

**Last Updated:** 2025-01-XX  
**SDK Version:** 1.0.0
