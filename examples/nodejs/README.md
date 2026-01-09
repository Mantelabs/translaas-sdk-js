# Node.js Example

This example demonstrates how to use the Translaas SDK in a Node.js application.

## Features Demonstrated

- Basic translation lookups
- Caching configuration
- Error handling
- File-based offline caching

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Translaas API credentials:

```env
TRANSLAAS_API_KEY=your-api-key-here
TRANSLAAS_BASE_URL=https://api.translaas.com
TRANSLAAS_PROJECT=your-project-name
```

3. Run the examples:

```bash
# Basic usage example
npm run basic

# Caching example
npm run caching

# Error handling example
npm run error-handling

# Run all examples
npm start
```

## Examples

### Basic Usage

The `examples/basic-usage.js` file demonstrates:

- Creating a TranslaasService instance
- Fetching translations
- Using pluralization
- Using parameters

### Caching

The `examples/caching.js` file demonstrates:

- Memory caching
- File-based caching
- Hybrid caching (L1 + L2)
- Cache expiration

### Error Handling

The `examples/error-handling.js` file demonstrates:

- Handling API errors
- Handling network errors
- Handling configuration errors
- Graceful fallbacks

## Code Structure

```
examples/nodejs/
├── index.js              # Main entry point (runs all examples)
├── examples/
│   ├── basic-usage.js    # Basic translation examples
│   ├── caching.js        # Caching examples
│   └── error-handling.js # Error handling examples
├── package.json
└── README.md
```

## Learn More

- [SDK Documentation](../../README.md)
- [API Reference](../../docs/api/)
- [Configuration Guide](../../.docs/CONFIGURATION.md)
