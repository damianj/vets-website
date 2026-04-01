App Name: `Form 21-0538 Dependents Verification`
Form ID (if different from app name): `21-0538` `(FORM_21_0538: '21-0538')`

## Background

The Dependents Verification form (21-0538) is used to verify the status of Veteran dependents to determine if they’re eligible to continue receiving additional compensation based on how many dependents they have.

This form is currently being digitized and a more comprehensive explanation of this applications code will be added here later in the future.

## Entry

- Local: http://localhost:3001/manage-dependents/verify-dependents-form-21-0538
- Staging: https://staging.va.gov/manage-dependents/verify-dependents-form-21-0538
- Production: https://www.va.gov/manage-dependents/verify-dependents-form-21-0538

## Mock users

- [Dependency verification MVP](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Administrative/vagov-users/dependency-verification-MVP-test-users.md)
- [More staging test accounts](https://github.com/department-of-veterans-affairs/va.gov-team-sensitive/blob/master/Administrative/vagov-users/staging-test-accounts-dependents.md)

## Feature toggles

- `va_dependents_verification` - Enables new features (not fully enabled 3/27/2026)
- `dependency_verification_browser_monitoring_enabled` - Enable Datadog Real User Monitoring & Logging

## How the form works for the user

If a Veteran is eligible to receive additional compensation based on their dependents, they need to ensure that their dependents are up-to-date or risk getting overpayments which must be paid back to VA. The VA requires that the Veteran is reminded to update their dependents every 8 years; but this could cause a significant burden on the Veteran if they end up needing to pay back 8 years of overpayments. So, we've added a reminder (warning alert) in the view dependents app that directs them to this form every 6 months. But they have to visit the view dependents app to see it. This form is the only way to update the Veteran's "diary" on the backend which resets the 8 year timer.

The workflow of this form only has two paths: 1. Make a choice that the Veteran's dependents are up-to-date and submit Form 21-09538, or 2. Choose that the dependents need to be updated, and be directed to an exit form page which redirects them to Form 686C-674. The form itself does allow to remove spouse and child dependents, but our team opted to not duplicate the work that 686c-674 is doing. Additionally, Form 21-0538 doesn't allow removal of a dependent parent.

## The Front End Code

The form consists of 3 main chapters:

- Veteran information (Name, SSN, and date of birth)
- Veteran contact information (address, email, and phone)
- Dependents list review & question if the status has changed. The Veteran will either submit the form, or exit to form 686C-674

### Veteran information

This page is currently copying implementations from other apps. In the future, it would be better to use platform code (from `platform/forms-system/src/js/components/PersonalInformation/PersonalInformation.jsx`) to render the page.

[Prefill Data FAQs](https://github.com/department-of-veterans-affairs/va.gov-team/blob/master/products/platform/design-system/patterns/Prefill/Data.md)

### Veteran contact information

This page was built to follow the [Design System recommended pattern to show prefilled information](https://design.va.gov/patterns/help-users-to/update-prefilled-information#prefilled-information-the-user-can-update). At the time of writing, platform is building a web component to perform all the functions of this page, and associated edit pages. So, in the future, this page will need to be updated to use platform's component

### Dependents list

The dependents data uses the same endpoint as the view dependents app and the 686C-674 form. Our team contacted VBMS about including additional information in the endpoint, but discovered that it wasn't possible. Data we thought was essential would be the diary date, any removal date (ignore `removalDate` in the code), or if a child has a permanent disability, etc.

The "Has the status of your dependents changed?" radio input leads to one of two pages. Selecting yes leads to the Exit Form page, which prompts the vet to start an add/remove form 686c-674. The no option leads to the Review & Submit page.

### Exit form

The veteran is only taken here if they indicated that information for their dependent(s) needs to be updated. They are given an explanation of the 686c-674 form and why they will need to fill it out. From this page they can choose to go back or proceed to the 686c-674 form.

## Next steps

If the veteran chose "Yes, I need to update my dependents’ information.", then they will be taken to the `/exit-form` page and prompted to fill out a 686c-674 form with a link to `/manage-dependents/add-remove-form-21-686c-674/introduction`. Docs for this form can be found [here](https://github.com/department-of-veterans-affairs/vets-website/blob/main/src/applications/dependents/686c-674/README.md). At this point we delete the saved in progress form data.

If the veteran chose "No, my dependents’ information is up to date." on the dependents page, they'll be taken to `/review-and-submit`. Information for what happens after submission is found [below](#form-submission).

## The back end code

There are really two separate API endpoints that we use in the 0538 form, one that gets the veteran's list of dependents, and one that receives the form payload on submission. The endpoint for the view dependents list is located at [vets-api/app/controllers/v0/dependents_applications_controller.rb](https://github.com/department-of-veterans-affairs/vets-api/blob/d6a57d2046248013e52a38fc490c1cd6e5cb955c/app/controllers/v0/dependents_applications_controller.rb) and the endpoint for the submission payload is at [vets-api/app/controllers/v0/dependents_verifications_controller.rb](https://github.com/department-of-veterans-affairs/vets-api/blob/d6a57d2046248013e52a38fc490c1cd6e5cb955c/app/controllers/v0/dependents_verifications_controller.rb).

### View dependents

When the Veteran first lands on the Introduction page of the form, a call is made to `vets-api/app/controllers/v0/dependents_applications_controller.rb` where we use BGS as a data source to get a list of the veteran's dependents. We do this with the `show` method call which simply takes the data returned by BGS for the current user and returns an array of `persons` to the front end. If the user has no dependents, it returns an empty array.

### Form submission

After the Veteran fills out the form and submits the payload, it is sent to `vets-api/app/controllers/v0/dependents_verifications_controller.rb` on the back end. The main method we use in that controller is the `create` method, which starts out by creating a `claim` object. The `claim` object is created with the `new` method of the `DependencyVerificationClaim`. We then do a check to make sure that the `claim` was successfully created. If it was not, that means that the form payload has not passed our validation, and we then log the error and raise an exception.

After we create the claim we then send it to central mail for processing. Once the claim has been submitted successfully, we log the `ClaimID` and at this point we clear out the current saved claim data so that this claim doesn't stay in the Veteran's `save in progress` function on the form. We then render JSON to the front end.
