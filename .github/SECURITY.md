# Security Policy

## Supported Versions

We actively support the following versions of the Translaas SDK with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. **Do NOT** disclose the vulnerability publicly until it has been addressed
3. Email security details to: [security@translaas.com](mailto:security@translaas.com)

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Suggested fix (if any)

## Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Release**: Depends on severity, typically within 30 days for critical issues

## Security Best Practices

When using the Translaas SDK:

1. **Keep dependencies updated**: Regularly update the SDK to the latest version
2. **Use environment variables**: Store API keys in environment variables, not in source code
3. **Validate inputs**: Always validate user inputs before passing them to SDK methods
4. **Use HTTPS**: Always use HTTPS when making API calls
5. **Review dependencies**: Regularly review and update your project dependencies

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 0.1.0 → 0.1.1)
- Documented in the CHANGELOG.md
- Announced via GitHub releases
- Tagged with the `security` label

## Acknowledgments

We appreciate the security research community's efforts to help keep the Translaas SDK secure. Security researchers who responsibly disclose vulnerabilities will be acknowledged (with permission) in our security advisories.
