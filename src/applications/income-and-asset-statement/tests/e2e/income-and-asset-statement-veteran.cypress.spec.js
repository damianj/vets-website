import path from 'path';

import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';

import { fillDateWebComponentPattern } from './helpers';
import {
  SUBMISSION_DATE,
  SUBMISSION_CONFIRMATION_NUMBER,
  UPLOAD_IMG_DETAILS,
} from './helpers/constants';

import mockUser from '../fixtures/mocks/user.json';
import formConfig from '../../config/form';
import manifest from '../../manifest.json';

Cypress.config('waitForAnimations', true);

const mockPrefill = {
  formData: {
    veteranSsnLastFour: '7821',
    veteranVaFileNumberLastFour: '7821',
  },
  metadata: {
    version: 0,
    prefill: true,
    returnUrl: '/form/21P-0969',
  },
};

const testConfig = createTestConfig(
  {
    useWebComponentFields: true,
    appName: '21P-0969 Income and Asset Statement Form',
    dataPrefix: 'data',
    dataSets: ['test-data-veteran'],
    dataDir: path.join(__dirname, 'fixtures', 'data'),
    pageHooks: {
      introduction: ({ afterHook }) => {
        afterHook(() => {
          cy.clickStartForm();
        });
      },
      'claimant/reporting-period': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(data => {
            const { incomeNetWorthDateRange } = data;
            fillDateWebComponentPattern(
              'incomeNetWorthDateRange_from',
              incomeNetWorthDateRange.from,
            );
            fillDateWebComponentPattern(
              'incomeNetWorthDateRange_to',
              incomeNetWorthDateRange.to,
            );
            cy.clickFormContinue();
          });
        });
      },
      'property-and-business/0/document-upload': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(() => {
            cy.fillVaFileInput('root_uploadedDocuments', UPLOAD_IMG_DETAILS);
            cy.wait('@uploadFile');
            cy.axeCheck();
            cy.clickFormContinue();
          });
        });
      },
      'trusts/0/document-upload': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(() => {
            cy.fillVaFileInputMultiple(
              'root_uploadedDocuments',
              UPLOAD_IMG_DETAILS,
            );
            cy.wait('@uploadFile');
            cy.axeCheck();
            cy.clickFormContinue();
          });
        });
      },
      'review-and-submit': ({ afterHook }) => {
        afterHook(() => {
          cy.get('@testData').then(() => {
            // Target the va-privacy-agreement component
            cy.get('va-privacy-agreement[name="statementOfTruthCertified"]')
              .shadow()
              .find('input[type="checkbox"]')
              .click({ force: true });

            cy.clickFormContinue(); // Submit
          });
        });
      },
    },
    setupPerTest: () => {
      cy.intercept('GET', '/v0/feature_toggles?*', {
        data: {
          features: [
            {
              name: 'income_and_assets_form_enabled',
              value: true,
            },
            {
              name: 'income_and_assets_browser_monitoring_enabled',
              value: true,
            },
          ],
        },
      });
      cy.intercept('GET', '/v0/user', mockUser);
      cy.get('@testData').then(testData => {
        const data = {
          metadata: mockPrefill,
          formData: {
            ...testData,
            unassociatedIncomes: [],
            associatedIncomes: [],
            ownedAssets: [],
            royaltiesAndOtherProperties: [],
            assetTransfers: [],
            trusts: [],
            annuities: [],
            unreportedAssets: [],
            discontinuedIncomes: [],
            incomeReceiptWaivers: [],
          },
        };

        cy.intercept('GET', '/v0/in_progress_forms/21P-0969', data);
        cy.intercept('PUT', '/v0/in_progress_forms/21P-0969', data);
      });
      cy.intercept('POST', '/v0/claim_attachments', {
        data: { attributes: { confirmationCode: '5' } },
      }).as('uploadFile');
      cy.intercept('POST', `income_and_assets/v0/${formConfig.submitUrl}`, {
        data: {
          id: 'mock-id',
          type: 'saved_income_and_asset_claim',
          attributes: {
            submittedAt: SUBMISSION_DATE,
            regionalOffice: [
              'Attention:  Philadelphia Pension Center',
              'P.O. Box 5206',
              'Janesville, WI 53547-5206',
            ],
            confirmationNumber: SUBMISSION_CONFIRMATION_NUMBER,
            guid: '01e77e8d-79bf-4991-a899-4e2defff11e0',
            form: '21P-0969',
          },
        },
      }).as('submitApplication');

      cy.login(mockUser);
    },
  },
  manifest,
  formConfig,
);

testForm(testConfig);
