# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in TWD, please report it responsibly.

**Do not open a public issue.** Instead, use one of these options:

1. **GitHub Private Vulnerability Reporting** — Go to the [Security Advisories](https://github.com/BRIKEV/twd/security/advisories/new) page and create a new advisory. This keeps the report private until a fix is available.

2. **Email** — Contact the maintainers at hello.brikev@gmail.com with details of the vulnerability.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Any potential impact assessment

### What to expect

- Acknowledgment within 48 hours
- A fix or mitigation plan within 7 days for critical issues
- Credit in the release notes (unless you prefer to remain anonymous)

## Scope

TWD is a development-only testing library. It is not designed to run in production environments. However, we take security seriously because:

- The mock service worker (`mock-sw.js`) intercepts network requests during development
- Test files may contain sensitive mock data or API patterns
- TWD should be installed as a **devDependency** and only loaded in development mode — this is the recommended setup in our docs. If TWD code or `mock-sw.js` reaches production, that is a misconfiguration on the user's side

We encourage responsible disclosure for any issue that could affect developers using TWD in their workflow.
