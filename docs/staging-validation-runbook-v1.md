# Aria Staging Validation Runbook v1

## Goal
Validate that the release candidate behaves like production before public release.

## Staging Scope
- Desktop web build and desktop release package validation
- Website release page validation
- API runtime validation with production-safe flags
- Smoke, evidence, and UAT validation

## Required Environment
- `NODE_ENV=production`
- `ARIA_AUTH_MODE=external`
- `ARIA_EXTERNAL_AUTH_SHARED_SECRET=<strong shared secret>`
- `ARIA_ENABLE_GUEST_AUTH=false`
- `ARIA_ENABLE_DEMO_ENDPOINTS=false`
- `ARIA_TOKEN_SECRET=<strong secret>`
- `ARIA_DATA_FILE=runtime-state.json`

## Validation Steps
1. Run `bash scripts/check-production-readiness.sh`
2. Run `npm run release:uat`
3. Validate website release page and download metadata
4. Validate one desktop install package end-to-end
5. Validate one real execution flow with verifiable evidence
6. Record results and unresolved risks

## Exit Criteria
- All automated checks pass
- No P0/P1 issue remains open
- Desktop install path works
- Website release content matches artifacts
- Evidence flows remain trustworthy
