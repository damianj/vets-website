# Dependents Management Team

## Applications

- Add or remove dependents on VA benefits (VA Form 21-686C and 21-674)
- Verify your dependents for disability benefits (VA Form 21-0538)
- View Dependents App

## Transition docs

https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/products/dependents/transition_hub

## Engineering Documents

- [Dependents engineering folder](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/products/dependents/engineering/README.md)
- [Set up backend](https://depo-platform-documentation.scrollhelp.site/developer-docs/base-setup-vets-api) - recommend running [native](https://depo-platform-documentation.scrollhelp.site/developer-docs/native-setup-vets-api) or [hybrid](https://github.com/department-of-veterans-affairs/vets-api/blob/master/docs/setup/hybrid.md)
- [Set up frontend](https://depo-platform-documentation.scrollhelp.site/developer-docs/setting-up-your-local-frontend-environment)
- Run all apps on frontend locally
  ```bash
  yarn watch --env entry=auth,static-pages,login-page,verify,terms-of-use,686C-674-v2,0538-dependents-verification,dependents-view-dependents
  ```
- Run mock server:
  - For 686C-674 or View Dependents, use:
    ```bash
    yarn mock-api --responses ./src/applications/dependents/686c-674/tests/mock-api-full-data.js
    ```
  - For 21-0538, use
    ```bash
    yarn mock-api --responses ./src/applications/dependents/dependents-verification/tests/mock-api-full-data.js
    ```
  - Then in the browser console, run
    ```js
    localStorage.setItem('hasSession', true)
    ```

## VA Form 21-686C and 21-674

- Source code: `/src/applications/dependents/686c-674`
- Entry: http://localhost:3001/manage-dependents/add-remove-form-21-686c-674
- [Frontend summary](./686c-674/README.md)

## Dependents Verification (21-0538)

- Source code: `/src/applications/dependents/dependents-verification`
- Local entry: http://localhost:3001/manage-dependents/verify-dependents-form-21-0538/
- [Frontend summary](./dependents-verification/README.MD)

## View Dependents

- Source code: `/src/applications/dependents/view-dependents`
- Local entry: http://localhost:3001/manage-dependents/view
- [Frontend summary](./view-dependents/README.MD)
