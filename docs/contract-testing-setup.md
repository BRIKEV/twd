---
title: Contract Testing Setup
description: Setup, options, validations, and PR reports for TWD contract testing.
---

# Contract Testing Setup

This page covers the reference details for configuring contract testing in TWD. For the overview, audience, and pitch, see [/contract-testing](/contract-testing).

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

Contract results are part of every [run report](/ci-execution#run-report). With the
[GitHub Action](/ci-execution#github-action-recommended) and `contract-report: 'true'`,
the report's `summary.md` is posted as a PR comment, with a link to the full CI run.
The contract counts sit in its table:

| Passed | Failed | Skipped | Contracts | Duration |
|---|---|---|---|---|
| 41 | 0 | 0 | 4 ✓ · 3 ✕ · 1 ⚠ | 38.2s |

Every mock that failed a spec in `error` mode is listed under "Needs attention" with
the field that broke and the test that registered it. Failures in `warn` mode and
undocumented statuses go in a collapsed warnings section. `index.html` in the same
folder groups every result by spec.

`contractReportPath` is deprecated: it still writes its own markdown file, with a
warning on every run, and the PR comment no longer reads it. Remove it from
`twd.config.json`.

```yaml
- name: Run TWD tests
  uses: BRIKEV/twd-cli/.github/actions/run@main
  with:
    contract-report: 'true'
```

See [CI Execution](/ci-execution#github-action-recommended) for the full workflow setup.

### With a sharded run

Each shard of a [sharded run](/sharding) validates only a fraction of the mocks.
`twd-cli merge` writes the joined report, so the PR comment step belongs in the
merge job rather than in the shard jobs:

```yaml
  merge:
    permissions:
      contents: read
      pull-requests: write
    steps:
      # ...checkout, npm ci, download the shard artifacts, then:
      - name: Merge the shard reports
        run: npx twd-cli merge .twd/shards

      - name: Post the report to PR
        if: github.event_name == 'pull_request' && hashFiles('.twd/report/summary.md') != ''
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh pr comment "${{ github.event.pull_request.number }}" --body-file .twd/report/summary.md
```

## Next Steps

- Run contract tests in CI with the [GitHub Action](/ci-execution#github-action-recommended)
- Learn how to create mocks with [API Mocking](/api-mocking)
- Collect [Code Coverage](/coverage) alongside contract validation
- Split a long run across parallel jobs with [Sharding](/sharding)
