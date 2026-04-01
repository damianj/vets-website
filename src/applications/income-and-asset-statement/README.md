# Form 21P-0969 – Income and Asset Statement

## Background

This form is a required supplemental form for VA Forms 21P-527EZ and 21P-534EZ for certain applicants. It is used to report income and net worth information.

## Local development

1. Update `content-build`:

   - Pull latest from `main`
   - Run `yarn fetch-drupal-cache`

2. Update `vets-api`:

   - Pull latest from `master`
   - Ensure it is running locally

3. Update `vets-website`:

   - Pull latest from `main`

4. Start vets-website:
   `yarn watch --env entry=static-pages,auth,login-page,income-and-asset-statement`

5. Enable feature flag:
   http://localhost:3000/flipper/features/income_and_assets_form_enabled

## Base URLs

Local:
http://localhost:3001/supporting-forms-for-claims/submit-income-and-asset-statement-form-21p-0969/

Staging:
https://www.staging.va.gov/supporting-forms-for-claims/submit-income-and-asset-statement-form-21p-0969

Production:
https://www.va.gov/supporting-forms-for-claims/submit-income-and-asset-statement-form-21p-0969

## Content

Chapters and pages are defined in:

- `config/form.js`
- `config/chapters`

## Feature Toggles

Feature toggles can be managed locally at:
http://localhost:3000/flipper/features

Active toggle names:

- `income_and_assets_form_enabled`: Enables the 21P-0969 form
- `income_and_assets_browser_monitoring_enabled`: Enables Datadog RUM monitoring for 21P-0969
- `pbb_forms_require_loa3`: Require LOA3 to access form
- `income_and_assets_content_updates`: Enables plain language and content updates (Deprecated)
- `income_and_assets_error_email_notification`: Enables sending of the 'Action needed' email notification
- `income_and_assets_submitted_email_notification`: Enables sending of the 'Submitted' email notification
- `income_and_assets_email_notification`: Enables sending of the 'In progress' email notification
- `income_and_assets_persistent_attachment_error_email_notification`: Enables sending of the 'Persistent error' email notification

## Implementation notes

- Uses arrayBuilderPages for list-and-loop sections
- Multiple summary pages are conditionally rendered based on claimant type
- Page visibility depends on claimantType and feature flags
- Changing claimant type can introduce new required pages dynamically

## Review and Submit

The Review and Submit page performs validation across all chapters and surfaces any missing required fields.

## Form Submission

Form submission is handled via vets-api with a transform step prior to submission.

After the applicant completes the form and submits the payload is sent to the api endpoint `/income_and_assets/v0/form0969`.

If the submission fails, an error alert is displayed in the UI and an error is logged to the browser console. If the error is `429 Too Many Requests` status code it creates a corresponding error object with additional information about the rate limit reset time.

## Custom Styling

The custom styling in `/sass/income-and-asset-statement.scss` is used to override default styles

## Saving Progress (back end)

The form is saved to the database every time a change is made to the form via an api endpoint `/v0/in_progress_forms/21P-0969` that saves the most recent form data and metadata. When the api responds with a `200 status code` a saved alert is displayed in the UI with a timestamp.

## Documents Upload (back end)

On any step where the applicant has an option to upload required and supporting documents. The documents are uploaded via an api endpoint to `/v0/claim_attachments`. The `vets-api/app/controllers/v0/claim_documents_controller.rb` controller is then responsible for handling the creation of claim documents or attachments.

## API calls

- `/v0/in_progress_forms/21P-0969` - in-progress form
- `/v0/claim_attachments` - Upload documents
- `/income_and_assets/v0/form0969` - Form submission
- `/v0/maintenance_windows` - Used to trigger a refresh of the CSRF token (also called on initial page load by the form system)

## Useful commands

| Command                                                                                                                           | Purpose                                          |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `yarn watch --env entry=static-pages,auth,login-page,income-and-asset-statement`                                                  | Minimal `yarn watch` for faster compilation      |
| `yarn run eslint --quiet --ext .js --ext .jsx src/applications/income-and-asset-statement`                                        | Lint income-and-asset-statement application      |
| `yarn cy:run --spec src/applications/income-and-asset-statement/tests/e2e/income-and-asset-statement-non-veteran.cypress.spec.js` | Run Cypress tests for non-Veteran claimant types |
| `yarn cy:run --spec src/applications/income-and-asset-statement/tests/e2e/income-and-asset-statement-veteran.cypress.spec.js`     | Run Cypress tests for Veteran claimant type      |
| `yarn test:coverage-app income-and-asset-statement`                                                                               | Generate unit test coverage report               |
| `yarn test:unit --app-folder income-and-asset-statement`                                                                          | Run all unit tests for the application           |
| `yarn test:unit {filepath}`                                                                                                       | Run a single unit test file                      |
