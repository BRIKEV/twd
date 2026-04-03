---
title: Contract Testing
description: Validate API mocks against OpenAPI specs to catch drift between your tests and the real API
---

# Contract Testing

Frontend teams write mock responses in tests that drift from reality over time. Fields get renamed, removed, or added in the API — but mocks stay frozen. Tests pass, code ships, and the app breaks in production.

Contract testing closes this gap: **test what you own, mock what you don't — then validate the mocks.**

TWD collects every mock registered via `twd.mockRequest()` during the test run. After tests complete, `twd-cli` validates those mocks against your OpenAPI specs using [openapi-mock-validator](https://github.com/BRIKEV/openapi-mock-validator). If a mock response doesn't match the spec, you'll know immediately.

## Setup

### 1. Add your OpenAPI specs

Place your OpenAPI 3.0 or 3.1 spec files (JSON format) somewhere in your project:

```
contracts/
  users-3.0.json
  posts-3.1.json
```

### 2. Configure contracts in `twd.config.json`

```json
{
  "url": "http://localhost:5173",
  "contractReportPath": ".twd/contract-report.md",
  "contracts": [
    {
      "source": "./contracts/users-3.0.json",
      "baseUrl": "/api",
      "mode": "error",
      "strict": true
    },
    {
      "source": "./contracts/posts-3.1.json",
      "baseUrl": "/api",
      "mode": "warn",
      "strict": true
    }
  ]
}
```

### Contract Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | string | — | Path to the OpenAPI spec file (JSON) |
| `baseUrl` | string | `"/"` | Base URL prefix to strip when matching mock URLs to spec paths |
| `mode` | `"error"` \| `"warn"` | `"warn"` | `"error"` fails the test run; `"warn"` reports but doesn't fail |
| `strict` | boolean | `true` | When true, rejects unexpected properties not defined in the spec |

## Example Output

When a mock response doesn't match the spec, you'll see detailed errors:

```
Source: ./contracts/users-3.0.json   ERROR

  ✓ GET /users (200) — mock "getUsers"
  ✗ GET /users/{userId} (200) — mock "getUserBadAddress"
    → response.address.city: missing required property
    → response.address.country: missing required property

  ⚠ GET /users/{userId} (404) — mock "getUserNotFound"
    Status 404 not documented for GET /users/{userId}
```

- **✓** Mock matches the spec
- **✗** Mock has validation errors (fields that fail against the spec)
- **⚠** Warning — the status code or schema isn't documented (mock isn't wrong, but it's not contract-tested either)

## Supported Validations

The validator checks all standard OpenAPI/JSON Schema constraints:

- **Types**: `string`, `number`, `integer`, `boolean`, `array`, `object`
- **String**: `minLength`, `maxLength`, `pattern`, `format` (date, date-time, email, uuid, uri, hostname, ipv4, ipv6)
- **Number/Integer**: `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`
- **Array**: `minItems`, `maxItems`, `uniqueItems`
- **Object**: `required`, `additionalProperties`
- **Composition**: `oneOf`, `anyOf`, `allOf`
- **Enum**: validates against allowed values
- **Nullable**: supports both OpenAPI 3.0 (`nullable: true`) and 3.1 (`type: ["string", "null"]`)

::: tip Strict mode and allOf
Strict mode (`additionalProperties: false`) can conflict with `allOf` schemas. When `allOf` branches define different properties, each branch rejects the other's properties as "additional." Use `{ strict: false }` for endpoints that use `allOf` composition, or define `additionalProperties` explicitly in your spec.
:::

## PR Reports

When `contractReportPath` is set and you use the [GitHub Action](/ci-execution#github-action-recommended) with `contract-report: 'true'`, a summary table is posted as a PR comment:

| Spec | Passed | Failed | Warnings | Mode |
|------|--------|--------|----------|------|
| `users-3.0.json` | 2 | 3 | 1 | `error` |
| `posts-3.1.json` | 2 | 2 | 0 | `warn` |

Failed validations are included in a collapsible details section with a link to the full CI log.

```yaml
- name: Run TWD tests
  uses: BRIKEV/twd-cli/.github/actions/run@main
  with:
    contract-report: 'true'
```

See [CI Execution](/ci-execution#github-action-recommended) for the full workflow setup.

## Next Steps

- Run contract tests in CI with the [GitHub Action](/ci-execution#github-action-recommended)
- Learn how to create mocks with [API Mocking](/api-mocking)
- Collect [Code Coverage](/coverage) alongside contract validation
