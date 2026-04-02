# Mock Form Prefill Minimal

This form demonstrates the prefill pattern with the Minimal Header layout. It reuses the form config from `mock-form-prefill` via `createFormConfig` with its own `rootUrl`.

## Source of Truth

The **`mock-form-prefill`** application remains the single source of truth for the prefill pattern. Refer to it for the complete implementation, including tests, fixtures, and detailed configuration.

## URL
http://localhost:3001/mock-form-prefill-minimal
https://staging.va.gov/mock-form-prefill-minimal

## Common commands
```bash
# Development
yarn watch --env entry=mock-form-prefill-minimal
yarn watch --env entry=mock-form-prefill-minimal,auth,static-pages,login-page,verify,profile
```