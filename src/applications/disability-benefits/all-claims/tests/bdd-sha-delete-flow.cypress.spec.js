import path from 'path';

import testForm from 'platform/testing/e2e/cypress/support/form-tester';
import { createTestConfig as _createTestConfig } from 'platform/testing/e2e/cypress/support/form-tester/utilities';

import mockUser from './fixtures/mocks/user.json';

import formConfig from '../config/form';
import manifest from '../manifest.json';
import { setup, pageHooks } from './cypress.helpers';

/**
 * Tests the BDD SHA (Separation Health Assessment) destructive modal workflow.
 *
 * Ensures users can change their answer after uploading SHA files, and that
 * the destructive confirmation modal properly deletes uploaded files:
 *
 * 1. User selects "Yes" to upload SHA and uploads a file
 * 2. User navigates back to the SHA question page
 * 3. User changes answer to "No"
 * 4. Destructive modal appears warning about file deletion
 * 5. User confirms deletion
 * 6. Success alert appears
 * 7. SHA files no longer appear in evidence summary
 */

const createTestConfig = () => {
  const baseHooks = pageHooks(cy, {
    showConfirmationReview: true,
  });

  const customHooks = {
    ...baseHooks,

    'supporting-evidence/separation-health-assessment': ({ afterHook }) => {
      afterHook(() => {}); // Prevent form-tester default post-hook

      cy.get('va-radio-option[value="true"]')
        .find('input[type="radio"]')
        .check({ force: true });
      cy.findByText(/continue/i, { selector: 'button' }).click();

      cy.location('pathname').should(
        'include',
        '/separation-health-assessment-upload',
      );
      cy.get('input[type="file"]').selectFile(
        'src/platform/testing/example-upload.png',
        { force: true },
      );
      cy.get('.schemaform-file-uploading').should('not.exist');
      cy.wait('@uploadFile').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
      });
      cy.findByText(/continue/i, { selector: 'button' }).click();

      cy.location('pathname').should('include', '/service-treatment-records');
      cy.findByText(/^back$/i, { selector: 'button' }).click();

      cy.location('pathname').should(
        'include',
        '/separation-health-assessment-upload',
      );
      cy.findByText(/^back$/i, { selector: 'button' }).click();

      cy.location('pathname').should(
        'match',
        /\/separation-health-assessment$/,
      );
      cy.get('va-radio-option[value="false"]')
        .find('input[type="radio"]')
        .check({ force: true });
      cy.findByText(/continue/i, { selector: 'button' }).click();

      cy.get('va-modal[visible]', { timeout: 10000 }).should('exist');
      cy.contains(
        /your uploaded separation health assessment will be deleted/i,
      ).should('exist');

      cy.get('va-modal').then($modal => {
        $modal[0].dispatchEvent(
          new CustomEvent('primaryButtonClick', {
            bubbles: true,
            composed: true,
          }),
        );
      });

      cy.get('va-alert[status="success"]', { timeout: 10000 }).should(
        'be.visible',
      );
      cy.contains(/we.ve deleted the separation health assessment/i).should(
        'exist',
      );

      cy.findByText(/continue/i, { selector: 'button' }).click();
    },

    'supporting-evidence/separation-health-assessment-upload': ({
      afterHook,
    }) => {
      afterHook(() => {});
      cy.findByText(/continue/i, { selector: 'button' }).click();
    },

    'supporting-evidence/summary': () => {
      cy.contains(/summary of evidence/i).should('exist');
      cy.contains(/Separation Health Assessment Part A/i).should('not.exist');
    },
  };

  return _createTestConfig(
    {
      dataPrefix: 'data',
      useWebComponentFields: true,
      dataSets: ['bdd-sha-delete-flow-test'],

      fixtures: {
        data: path.join(__dirname, 'fixtures', 'data'),
      },

      pageHooks: customHooks,
      setupPerTest: () => {
        cy.login(mockUser);
        setup(cy, {
          toggles: {
            data: {
              type: 'feature_toggles',
              features: [
                { name: 'show526Wizard', value: true },
                {
                  name: 'disability_526_show_confirmation_review',
                  value: true,
                },
                {
                  name:
                    'disability_526_new_bdd_sha_enforcement_workflow_enabled',
                  value: true,
                },
              ],
            },
          },
        });
      },
    },
    manifest,
    formConfig,
  );
};

testForm(createTestConfig());
