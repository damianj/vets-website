App Name: `View Dependents`

Form ID: N/A - not a form

# Background

The View Dependents application requires a Veteran to be authenticated to view the page. Once logged in, the Veteran can view both their active and inactive dependents. And they will see a link to add or remove a dependent (Form 686C-674).

In 2025, a warning alert was added to the top of the page. This warning only appears if the Veteran has a rating disability of 30% or more, and has active dependents. The alert is closable, and stores the date of closing in local storage. After 6 months, the local storage will get cleared and show the alert again. This alert informs the Veteran that they can avoid overpayments to VA if they keep their dependents up-to-date. A link inside the alert directs them to the Dependents Verification form (21-0538) which updates VAs internal diary date.

Back in 2021, a different team embedded form 0538 into the view-dependents app. This form uses expandable fields to allow answering a series of questions - this is not great for accessibility, and may likely be why the embedded form was never released.

## Entry

- Local: http://localhost:3001/manage-dependents/view
- Staging: https://staging.va.gov/manage-dependents/view
- Production: https://www.va.gov/manage-dependents/view

## Mock users

- [Picklist (v3) users](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Administrative/vagov-users/dependents-picklist-test-users.md)
- [Dependency verification MVP](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Administrative/vagov-users/dependency-verification-MVP-test-users.md)
- [More staging test accounts](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Administrative/vagov-users/staging-test-accounts-dependents.md)

## Feature toggles

- `va_dependents_browser_monitoring_enabled` - enables Datadog RUM & logging
- `va_dependents_verification` - Switch between page layouts
- `dependents_management` (renamed to `manage_dependents` on the frontend) - enable embedded form 0538
- `dependents_module_enabled` - Use legacy or module fetch dependents API

## How this app works for the user

This app is meant to show the Veteran all the dependents VA has on file for them. This includes current (active) dependents and inactive dependents. There is content on the page that explains why and when dependents need to be updated along with a link to form 686C-674.

A previous team embedded a method to fill out form 0538 from this app by clicking on a "Remove this dependent" button within each active dependent card. This can only be seen if the `dependents_management` feature toggle is enabled. This feature is not active in staging nor production, and we don't know the state of progress for this change (code complete, UAT complete, etc). One thing to note is that it's not implemented in an ideal way because it uses progressive disclosures; this is not the best pattern to use to keep forms accessible.

## The frontend code

The view dependents app is not using the form system. It is a stand-alone app that makes two API calls:

- `/v0/dependents_applications/show` (legacy), or `/dependents_benefits/v0/claims/show` when `dependents_module_enabled` toggle is enabled. This contains a list of all (active and inactive) dependents associated with the Veteran.

- `/v0/disability_compensation_form/rating_info` is called to check the Veteran's disability rating. If the Veteran has rating of at least 30%, and they have active dependents, then a warning will appear at the top of the page.

  The warning alert informs the Veteran that they should verify their dependents yearly, or risk having overpayments. The warning includes a link to the Dependents Verification form (21-0538). If the Veteran closes the warning, the close date is stored in local storage. After 6 months, the local storage is cleared and the Veteran will again see the warning. Our stakeholder did not want us to store this date on the server, so we opted to use local storage after informing them of the limitations. Additionally, there is no API or method available to retreive the diary date (8 year timer that VA uses to send out a letter).
