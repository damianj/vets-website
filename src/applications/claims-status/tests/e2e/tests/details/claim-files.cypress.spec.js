import { mockFeatureToggles } from '../../support/helpers/mocks';
import { setupClaimTest } from '../../support/helpers/setup';
import { verifyTitleBreadcrumbsHeading } from '../../support/helpers/assertions';
import {
  createBenefitsClaim,
  createEvidenceSubmission,
  createTrackedItem,
  createSupportingDocument,
} from '../../support/fixtures/benefitsClaims';

const FILES_PATH = 'files';

const withinFilesReceivedCard = callback => {
  cy.findByRole('heading', { name: 'Files received', level: 3 })
    .parent()
    .findByRole('listitem')
    .within(callback);
};

describe('Claim files', () => {
  describe('Files page', () => {
    beforeEach(() => {
      mockFeatureToggles();
      cy.login();
      setupClaimTest({ claim: createBenefitsClaim(), path: FILES_PATH });
    });

    it('should have correct page title, breadcrumbs, and heading', () => {
      verifyTitleBreadcrumbsHeading({
        title:
          'Files for January 1, 2025 Compensation Claim | Veterans Affairs',
        thirdBreadcrumb: {
          name: 'Files for your compensation claim',
          href: '#content',
        },
        heading: { name: 'Claim files', level: 2 },
      });

      cy.findByText(
        'If you need to add evidence, you can do that here. You can also review the files associated with this claim.',
      );
      cy.axeCheck();
    });

    it('should display disability exam request alert', () => {
      cy.findByText('Request for an exam')
        .closest('va-alert')
        .within(() => {
          cy.findByText('We made a request for an exam on March 1, 2025');
          cy.findByText(
            'We’ve requested an exam related to your claim. The examiner’s office will contact you to schedule this appointment.',
          );
          cy.findByRole('link', {
            name: 'About this notice for Disability exam for hearing',
          }).should(
            'have.attr',
            'href',
            '/track-claims/your-claims/123456789/needed-from-others/123456',
          );
        });

      cy.axeCheck();
    });

    it('should display request outside the VA alert', () => {
      cy.findByText('Reserve records')
        .closest('va-alert')
        .within(() => {
          cy.findByText('We made a request outside VA on April 1, 2025');
          cy.findByText('You don’t need to do anything.');
          cy.findByText(
            "We've requested your service records or treatment records from your reserve unit.",
          );
          cy.findByRole('link', {
            name: 'About this notice for Reserve records',
          }).should(
            'have.attr',
            'href',
            '/track-claims/your-claims/123456789/needed-from-others/654321',
          );
        });

      cy.axeCheck();
    });

    it('should display additional evidence heading', () => {
      cy.findByRole('heading', {
        name: 'Upload additional evidence',
        level: 3,
      });

      cy.axeCheck();
    });

    it('should display documents filed headings and messaging', () => {
      cy.findByRole('heading', {
        name: 'File submissions in progress',
        level: 3,
      });
      cy.findByText(
        'Documents you submitted for review using this tool, or the VA: Health and Benefits mobile app, that we haven’t received yet. It can take up to 2 days for us to receive them.',
      );
      cy.findByText('You don’t have any file submissions in progress.');

      cy.findByRole('heading', {
        name: 'Files received',
        level: 3,
      });
      cy.findByText(
        'Files we received after you submitted them using this tool or the VA: Health and Benefits mobile app. Files submitted by mail or in person, by you or by others, don’t appear in this tool.',
      );
      cy.findByText('We haven’t received any files yet.');

      cy.axeCheck();
    });

    it('should display other ways to send documents section', () => {
      cy.findByRole('heading', {
        name: 'Other ways to send your documents',
        level: 2,
      });
      cy.findByText(
        'Print a copy of each document and write your Social Security number on the first page. Then resubmit by mail or in person.',
      );

      cy.findByRole('heading', {
        name: 'Option 1: By mail',
        level: 3,
      });
      cy.findByText('Mail the document to this address:');

      cy.findByRole('heading', {
        name: 'Option 2: In person',
        level: 3,
      });
      cy.findByText('Bring the document to a VA regional office.');
      cy.get('va-link[href="/find-locations"]')
        .should('be.visible')
        .shadow()
        .should('have.text', 'Find a VA regional office near you');

      cy.findByRole('heading', {
        name: 'How to confirm we’ve received your documents',
        level: 3,
      });
      cy.findByText(
        'To confirm we’ve received a document you submitted by mail or in person, call us at 800-827-1000 (TTY: 711). We’re here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.',
      );

      cy.axeCheck();
    });

    it('displays "On file" badge for NO_LONGER_REQUIRED status with closedDate', () => {
      setupClaimTest({
        claim: createBenefitsClaim({
          trackedItems: [
            createTrackedItem({
              status: 'NO_LONGER_REQUIRED',
              closedDate: '2025-01-10',
            }),
          ],
        }),
        path: FILES_PATH,
      });

      withinFilesReceivedCard(() => {
        cy.get('va-tag-status[text="On file"]');
        cy.findByText('File name unknown');
      });
      cy.axeCheck();
    });

    it('displays "Reviewed by VA" badge for INITIAL_REVIEW_COMPLETE status', () => {
      setupClaimTest({
        claim: createBenefitsClaim({
          trackedItems: [
            createTrackedItem({ status: 'INITIAL_REVIEW_COMPLETE' }),
          ],
        }),
        path: FILES_PATH,
      });

      withinFilesReceivedCard(() => {
        cy.get('va-tag-status[text="Reviewed by VA"]');
      });
      cy.axeCheck();
    });

    it('displays "Pending review" badge for SUBMITTED_AWAITING_REVIEW status', () => {
      setupClaimTest({
        claim: createBenefitsClaim({
          trackedItems: [
            createTrackedItem({ status: 'SUBMITTED_AWAITING_REVIEW' }),
          ],
        }),
        path: FILES_PATH,
      });

      withinFilesReceivedCard(() => {
        cy.get('va-tag-status[text="Pending review"]');
      });
      cy.axeCheck();
    });

    it('displays "File name unknown" when tracked item has no documents', () => {
      setupClaimTest({
        claim: createBenefitsClaim({
          trackedItems: [createTrackedItem({ status: 'ACCEPTED' })],
        }),
        path: FILES_PATH,
      });

      withinFilesReceivedCard(() => {
        cy.findByText('File name unknown');
        cy.get('va-tag-status[text="Reviewed by VA"]');
      });
      cy.axeCheck();
    });

    it('displays supporting documents with "On file" badge', () => {
      setupClaimTest({
        claim: createBenefitsClaim({
          trackedItems: [],
          supportingDocuments: [
            createSupportingDocument({
              originalFileName: 'additional-evidence.pdf',
              documentTypeLabel: 'Correspondence',
              date: '2025-01-15',
            }),
          ],
        }),
        path: FILES_PATH,
      });

      withinFilesReceivedCard(() => {
        cy.get('va-tag-status[text="On file"]');
        cy.findByText('additional-evidence.pdf');
        cy.findByText('You submitted this file as additional evidence.');
      });
      cy.axeCheck();
    });

    context('when claim is closed', () => {
      beforeEach(() => {
        mockFeatureToggles();
        cy.login();
        setupClaimTest({
          claim: createBenefitsClaim({
            status: 'COMPLETE',
            closeDate: '2025-01-15',
            latestPhaseType: 'COMPLETE',
          }),
          path: FILES_PATH,
        });
      });

      it('should not display upload evidence section', () => {
        cy.findByRole('heading', { name: 'Additional evidence' }).should(
          'not.exist',
        );
        cy.findByRole('heading', { name: 'Upload additional evidence' }).should(
          'not.exist',
        );

        cy.axeCheck();
      });

      it('should display closed claim header text', () => {
        cy.findByText('You can see the files associated with this claim.');
        cy.findByText('If you need to add evidence').should('not.exist');

        cy.axeCheck();
      });

      it('should display closed claim message instead of upload form', () => {
        cy.findByText(
          'The claim is closed so you can no longer submit any additional evidence.',
        );

        cy.axeCheck();
      });
    });

    context('when claim is closed', () => {
      beforeEach(() => {
        mockFeatureToggles();
        cy.login();
        setupClaimTest({
          claim: createBenefitsClaim({
            status: 'COMPLETE',
            closeDate: '2025-01-15',
            latestPhaseType: 'COMPLETE',
          }),
          path: FILES_PATH,
        });
      });

      it('should not display upload evidence section', () => {
        cy.findByRole('heading', { name: 'Additional evidence' }).should(
          'not.exist',
        );
        cy.findByRole('heading', { name: 'Upload additional evidence' }).should(
          'not.exist',
        );

        cy.axeCheck();
      });

      it('should display closed claim header text', () => {
        cy.findByText('You can see the files associated with this claim.');
        cy.findByText('If you need to add evidence').should('not.exist');

        cy.axeCheck();
      });

      it('should display closed claim message instead of upload form', () => {
        cy.findByText(
          'The claim is closed so you can no longer submit any additional evidence.',
        );

        cy.axeCheck();
      });
    });

    describe('Feature flag: cstAlertImprovementsEvidenceRequests', () => {
      context('when enabled', () => {
        beforeEach(() => {
          mockFeatureToggles({
            cstAlertImprovementsEvidenceRequests: true,
          });
        });

        it('should display updated intro text', () => {
          setupClaimTest({
            claim: createBenefitsClaim(),
            path: FILES_PATH,
          });

          cy.findByText(
            "Add evidence or review files you've already uploaded for this claim.",
          );
          cy.axeCheck();
        });

        context('when claim has open evidence requests', () => {
          beforeEach(() => {
            setupClaimTest({
              claim: createBenefitsClaim({
                trackedItems: [
                  createTrackedItem({ id: 1, status: 'NEEDED_FROM_YOU' }),
                  createTrackedItem({ id: 2, status: 'NEEDED_FROM_YOU' }),
                  createTrackedItem({
                    id: 3,
                    status: 'NEEDED_FROM_OTHERS',
                  }),
                ],
              }),
              path: FILES_PATH,
            });
          });

          it('should display the review requests warning alert', () => {
            cy.get('va-alert[status="warning"]').within(() => {
              cy.findByRole('heading', {
                name: 'Review your requests',
                level: 3,
              });
              cy.findByText(
                "You may have evidence requests you haven't responded to yet. Review them before uploading additional evidence here.",
              );
              cy.get('va-link-action[text="Review requests"]').should(
                'be.visible',
              );
            });

            cy.axeCheck();
          });

          it('should not display FilesNeeded cards', () => {
            cy.findByText('Request for evidence').should('not.exist');

            cy.axeCheck();
          });

          it('should still display the upload form', () => {
            cy.findByRole('heading', {
              name: 'Upload additional evidence',
              level: 3,
            });

            cy.axeCheck();
          });

          it('should navigate to the status tab when clicking Review requests', () => {
            cy.get('va-link-action[text="Review requests"]')
              .shadow()
              .find('a')
              .click();

            cy.url().should('contain', '/status');
            cy.axeCheck();
          });
        });

        context('when claim has open requests and failed submissions', () => {
          it('should display both the error alert and the review requests alert', () => {
            setupClaimTest({
              claim: createBenefitsClaim({
                trackedItems: [
                  createTrackedItem({ id: 1, status: 'NEEDED_FROM_YOU' }),
                ],
                evidenceSubmissions: [
                  createEvidenceSubmission({
                    uploadStatus: 'FAILED',
                    failedDate: new Date().toISOString(),
                    acknowledgementDate: '2050-01-01T00:00:00.000Z',
                  }),
                ],
              }),
              path: FILES_PATH,
            });

            cy.get('va-alert[status="error"]').should('be.visible');
            cy.get('va-alert[status="warning"]').should('be.visible');
            cy.findByText('Review your requests');

            cy.axeCheck();
          });
        });

        context('when claim has no open evidence requests', () => {
          it('should not display the review requests alert with empty tracked items', () => {
            setupClaimTest({
              claim: createBenefitsClaim({ trackedItems: [] }),
              path: FILES_PATH,
            });

            cy.findByText('Review your requests').should('not.exist');
            cy.findByRole('heading', {
              name: 'Upload additional evidence',
              level: 3,
            });

            cy.axeCheck();
          });

          it('should not display the alert when only NEEDED_FROM_OTHERS items exist', () => {
            setupClaimTest({
              claim: createBenefitsClaim({
                trackedItems: [
                  createTrackedItem({
                    id: 1,
                    status: 'NEEDED_FROM_OTHERS',
                  }),
                ],
              }),
              path: FILES_PATH,
            });

            cy.findByText('Review your requests').should('not.exist');

            cy.axeCheck();
          });
        });
      });

      context('when disabled', () => {
        beforeEach(() => {
          mockFeatureToggles({
            cstAlertImprovementsEvidenceRequests: false,
          });
        });

        it('should display original intro text', () => {
          setupClaimTest({
            claim: createBenefitsClaim(),
            path: FILES_PATH,
          });

          cy.findByText(
            'If you need to add evidence, you can do that here. You can also review the files associated with this claim.',
          );
          cy.axeCheck();
        });

        it('should display FilesNeeded cards instead of the review requests alert', () => {
          setupClaimTest({
            claim: createBenefitsClaim({
              trackedItems: [
                createTrackedItem({ id: 1, status: 'NEEDED_FROM_YOU' }),
              ],
            }),
            path: FILES_PATH,
          });

          cy.findByText('Provide medical records');
          cy.findByText('Review your requests').should('not.exist');

          cy.axeCheck();
        });
      });
    });
  });
});
