import path from 'path';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import moment from 'moment';
import featureToggles from '../fixtures/mocks/feature-toggles.json';
import user from '../fixtures/mocks/user.json';
import mockSubmit from '../fixtures/mocks/application-submit.json';
import prefilledForm from '../fixtures/mocks/prefilled-form.json';
import sip from '../fixtures/mocks/sip-put.json';
import formConfig from '../../config/form';
import manifest from '../../manifest.json';

const testConfig = createTestConfig(
  {
    dataPrefix: 'data',
    dataSets: ['minimal-test', 'maximal-test'],
    dataDir: path.join(__dirname, '..', 'fixtures', 'data'),
    pageHooks: {
      introduction: ({ afterHook }) => {
        afterHook(() => {
          cy.get('va-link-action[href="#start"]').click();
        });
      },
      'last-date-of-attendance': ({ afterHook }) => {
        afterHook(() => {
          cy.waitForDateInput('root_lastDateOfAttendanceYear');
          cy.fillPage();
          cy.tabToSubmitForm();
        });
      },
      attestation: ({ afterHook }) => {
        afterHook(() => {
          cy.waitForDateInput('root_attestationDateYear');

          const today = moment();
          cy.fillVaTextInput('root_attestationName', 'John Doe');
          cy.fillVaMemorableDate(
            'root_attestationDate',
            today.format('YYYY-MM-DD'),
            false,
          );

          cy.tabToSubmitForm();
        });
      },
      remarks: ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(({ remarks }) => {
            if (remarks) {
              cy.waitForTextarea();
              cy.fillPage();
            }
          });

          cy.tabToSubmitForm();
        });
      },
      'review-and-submit': ({ afterHook }) => {
        afterHook(() => {
          cy.get('va-text-input[id="veteran-signature"]').then(el => {
            cy.fillVaTextInput(el, 'John Doe');
          });
          cy.get('va-checkbox[id="veteran-certify"]').then(el => {
            cy.selectVaCheckbox(el, true);
          });
          cy.tabToSubmitForm();
        });
      },
    },
    setupPerTest: () => {
      cy.intercept('GET', '/v0/user', user);
      cy.intercept('GET', '/v0/feature_toggles?*', featureToggles);
      cy.intercept('POST', formConfig.submitUrl, mockSubmit);
      cy.intercept('GET', '/v0/in_progress_forms/22-0989', prefilledForm);
      cy.intercept('PUT', '/v0/in_progress_forms/22-0989', sip);
      cy.login(user);
      Cypress.Commands.add('waitForTextarea', () => {
        cy.get('#input-type-textarea')
          .should('be.visible')
          .and('not.be.disabled')
          .clear({
            delay: 250,
            waitForAnimations: false,
          });
      });

      Cypress.Commands.add('waitForDateInput', name => {
        cy.get(`input[name="${name}"]`)
          .should('be.visible')
          .and('not.be.disabled')
          .clear({
            delay: 250,
            waitForAnimations: false,
          });
      });
    },
    skip: Cypress.env('CI'), // Skip CI initially until content-build is merged
  },
  manifest,
  formConfig,
);

testForm(testConfig);
