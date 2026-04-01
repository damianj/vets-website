import moment from 'moment';
import user from '../fixtures/mocks/user.json';
import mockSubmit from '../fixtures/mocks/application-submit.json';
import prefilledForm from '../fixtures/mocks/prefilled-form.json';
import sip from '../fixtures/mocks/sip-put.json';
import formConfig, { SUBMIT_URL } from '../../config/form';
import manifest from '../../manifest.json';

describe('22-0989 keyboard only specs', () => {
  beforeEach(function() {
    if (Cypress.env('CI')) this.skip();

    cy.login(user);
    cy.intercept('PUT', '/v0/in_progress_forms/22-0989', sip);
    cy.intercept('GET', '/v0/in_progress_forms/22-0989', prefilledForm);
    cy.intercept('POST', SUBMIT_URL, mockSubmit);
  });

  it('it is navigable with only the keyboard', () => {
    // Introduction Page
    cy.visit(manifest.rootUrl);
    cy.injectAxeThenAxeCheck();
    cy.get('h1').contains(formConfig.title);
    cy.repeatKey('Tab', 5);
    cy.realPress(['Enter']);

    // Personal Info Page
    cy.url().should(
      'include',
      formConfig.chapters.personalInformationChapter.pages.personalInfoPage
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Personal information');
    cy.contains('MITCHELL G JENKINS');
    cy.contains('1863');
    cy.repeatKey('Tab', 6);
    cy.realPress('Space');

    // Contact Info Page
    cy.url().should(
      'include',
      formConfig.chapters.contactInfoChapter.pages.confirmContactInfo.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Mailing address');
    cy.contains('123 Mailing Address St');
    cy.contains('Home phone number');
    cy.contains('Mobile phone number');
    cy.contains('Email address');
    cy.repeatKey('Tab', 7);
    cy.realPress('Space');

    // Previously Applied Page
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.schoolWasClosed.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('School closures and program suspension');
    cy.selectVaRadioOption('root_schoolWasClosed', 'Y');
    cy.tabToContinueForm();

    // Old school name and address
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages
        .oldSchoolNameAndAddress.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.tabToElement('[name="root_closedSchoolName"]');
    cy.typeInFocused('Fake Org');
    cy.tabToElement('[name="root_closedSchoolAddress_street"]');
    cy.selectVaSelect('root_closedSchoolAddress_country', 'USA');
    cy.tabToElement('[name="root_closedSchoolAddress_street"]');
    cy.typeInFocused('123 Miller Ln');
    cy.repeatKey('Tab', 3);
    cy.typeInFocused('Chicago');
    cy.repeatKey('Tab', 1);
    cy.selectVaSelect('root_closedSchoolAddress_state', 'IL');
    cy.realPress('Tab');
    cy.typeInFocused('54321');
    cy.tabToContinueForm();
    cy.tabToContinueForm();

    // Completed program of study
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages
        .didCompleteProgramOfStudy.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Program information');
    cy.selectVaRadioOption('root_didCompleteProgramOfStudy', 'Y');
    cy.tabToContinueForm();

    // Received credit
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.didReceiveCredit.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Enrollment and credit information');
    cy.selectVaRadioOption('root_didReceiveCredit', 'Y');
    cy.tabToContinueForm();

    // Was enrolled
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages
        .wasEnrolledWhenSchoolClosed.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Enrollment and credit information');
    cy.selectVaRadioOption('root_wasEnrolledWhenSchoolClosed', 'Y');
    cy.tabToContinueForm();

    // Leave of absence
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.wasOnApprovedLeave
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Leave of absence');
    cy.selectVaRadioOption('root_wasOnApprovedLeave', 'Y');
    cy.tabToContinueForm();

    // Withdrawal details
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.withdrewPriorToClosing
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Withdrawal details');
    cy.selectVaRadioOption('root_withdrewPriorToClosing', 'N');
    cy.tabToContinueForm();

    // Enrolled at new school
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.enrolledAtNewSchool
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('New school enrollment');
    cy.selectVaRadioOption('root_enrolledAtNewSchool', 'N');
    cy.tabToContinueForm();

    // Transfer credits
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages
        .schoolDidTransferCredits.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Transfer credits from NCD schools');
    cy.selectVaRadioOption('root_schoolDidTransferCredits', 'Y');
    cy.tabToContinueForm();

    // Last date of attendance
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.lastDateOfAttendance
        .path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains(
      'What was your last date of attendance at the closed or disapproved school or in the new program?',
    );
    cy.fillVaMemorableDate('root_lastDateOfAttendance', '2020-01-02', false);
    cy.tabToContinueForm();

    // Attestation
    cy.url().should(
      'include',
      formConfig.chapters.entitlementDetailsChapter.pages.attestation.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Attestation of Hours Transferred');
    cy.tabToElement('[name="root_attestationName"]');
    cy.typeInFocused('John Doe');
    const today = moment();
    cy.fillVaMemorableDate(
      'root_attestationDate',
      today.format('YYYY-MM-DD'),
      false,
    );
    cy.tabToContinueForm();

    // Remarks
    cy.url().should(
      'include',
      formConfig.chapters.remarksChapter.pages.remarks.path,
    );
    cy.injectAxeThenAxeCheck();
    cy.contains('Enter any remarks you would like to share');
    cy.tabToContinueForm();

    // Review page
    cy.url().should('include', 'review-and-submit');
    cy.injectAxeThenAxeCheck();
    cy.tabToElement('input[id="inputField"]');
    cy.realType('John Doe');
    cy.realPress('Tab');
    cy.realPress('Space');
    cy.repeatKey('Tab', 3);
    cy.realPress('Space');

    // Confirmation page
    cy.url().should('include', '/confirmation');
    cy.injectAxeThenAxeCheck();
    cy.contains('What to expect');
    cy.contains('We’ll confirm when we receive your form in our system');
    cy.contains('We’ll review your form');
  });
});
