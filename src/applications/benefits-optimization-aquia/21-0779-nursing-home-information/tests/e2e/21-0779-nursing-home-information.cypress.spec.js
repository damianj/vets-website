import path from 'path';
import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';
import { formConfig } from '@bio-aquia/21-0779-nursing-home-information/config';
import manifest from '@bio-aquia/21-0779-nursing-home-information/manifest.json';
import { featureToggles, user, mockSubmit } from '../fixtures/mocks';
import addressValidationConfidence70 from '../../../shared/tests/mocks/address-validation-confidence-70.json';

const testConfig = createTestConfig(
  {
    dataPrefix: 'data',
    dataSets: ['minimal-test', 'maximal-test', 'va-file-number-only'],
    dataDir: path.join(__dirname, '..', 'fixtures', 'data'),
    pageHooks: {
      introduction: ({ afterHook }) => {
        cy.injectAxeThenAxeCheck();
        afterHook(() => {
          // Click the start link rendered by SaveInProgressIntro
          cy.get('a.vads-c-action-link--green').click();
        });
      },
      'nursing-home-address-validation': ({ afterHook }) => {
        afterHook(() => {
          cy.findByText(/we found a similar address to the one you entered/i);
          cy.get('va-radio').should('exist');
          cy.selectVaRadioOption('addressGroup', 'user-entered');
          cy.clickFormContinue();
        });
      },
      'review-and-submit': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@addressValidation.all').should('have.length.greaterThan', 0);

          cy.get('@testData').then(data => {
            const { nursingOfficialInformation } = data;
            const officialName = [
              nursingOfficialInformation.fullName.first,
              nursingOfficialInformation.fullName.last,
            ]
              .filter(Boolean)
              .join(' ');

            // Fill signature field within VaStatementOfTruth component
            cy.get('va-statement-of-truth')
              .shadow()
              .find('input[type="text"]')
              .type(officialName);

            // Check statement of truth checkbox within VaStatementOfTruth component
            cy.get('va-statement-of-truth')
              .shadow()
              .find('input[type="checkbox"]')
              .check({ force: true });

            cy.axeCheck();

            // Submit the form
            cy.findByText(/submit/i, { selector: 'button' }).click();
          });
        });
      },
    },
    setupPerTest: () => {
      // Mock user and authentication
      cy.intercept('GET', '/v0/user', user);

      // Mock feature toggles
      cy.intercept('GET', '/v0/feature_toggles*', featureToggles);

      // Mock USPS address validation (confidence < 100 uses suggestion page)
      cy.intercept(
        'POST',
        '/v0/profile/address_validation',
        addressValidationConfidence70,
      ).as('addressValidation');

      // Mock save-in-progress endpoints
      cy.intercept('GET', '/v0/in_progress_forms/21-0779', {
        statusCode: 200,
        body: {
          formData: {},
          metadata: {},
        },
      });

      cy.intercept('PUT', '/v0/in_progress_forms/21-0779', {
        statusCode: 200,
        body: {
          data: {
            attributes: {
              metadata: {
                version: 0,
                returnUrl: '/nursing-official-information',
              },
            },
          },
        },
      });

      // Mock form submission
      cy.intercept('POST', formConfig.submitUrl, {
        statusCode: 200,
        body: mockSubmit,
      });

      // Login
      cy.login(user);
    },
  },
  manifest,
  formConfig,
);

describe('21-0779 Nursing Home Information E2E Tests', () => {
  testForm(testConfig);
});

describe('21-0779 unauthenticated access', () => {
  it('does not show start link when user is not logged in', () => {
    cy.intercept('GET', '/v0/feature_toggles*', featureToggles);

    cy.visit(manifest.rootUrl);

    // Unauthenticated users should not see the start action link
    cy.get('a.vads-c-action-link--green').should('not.exist');
  });
});
