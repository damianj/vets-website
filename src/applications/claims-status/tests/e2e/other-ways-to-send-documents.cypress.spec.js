import TrackClaimsPageV2 from './page-objects/TrackClaimsPageV2';
import claimsList from './fixtures/mocks/lighthouse/claims-list.json';
import claimDetailsOpen from './fixtures/mocks/lighthouse/claim-detail-open.json';
import { MAILING_ADDRESS, CONTACT_INFO, LINKS } from '../../constants';

describe('Other Ways to Send Documents', () => {
  beforeEach(() => {
    const trackClaimsPage = new TrackClaimsPageV2();
    trackClaimsPage.loadPage(claimsList, claimDetailsOpen);
    trackClaimsPage.verifyInProgressClaim(false);

    // Navigate to the files tab using the page object method
    trackClaimsPage.navigateToFilesTab();

    cy.get('.claim-files').should('be.visible');
  });

  it('should display all content correctly', () => {
    cy.get('[data-testid="other-ways-to-send-documents"]').should('be.visible');
    cy.get('[data-testid="other-ways-to-send-documents"] h2').should(
      'contain.text',
      'Other ways to send your documents',
    );

    cy.get('[data-testid="other-ways-to-send-documents"]').should(
      'contain.text',
      'Print a copy of each document and write your Social Security number on the first page. Then resubmit by mail or in person.',
    );

    // Mail Section
    cy.get('.other-ways-mail-section > h3').should(
      'contain.text',
      'Option 1: By mail',
    );

    cy.get('.other-ways-mail-section')
      .should('contain.text', 'Mail the document to this address:')
      .and('contain.text', MAILING_ADDRESS.organization)
      .and('contain.text', MAILING_ADDRESS.department)
      .and('contain.text', MAILING_ADDRESS.poBox)
      .and(
        'contain.text',
        `${MAILING_ADDRESS.city}, ${MAILING_ADDRESS.state} ${
          MAILING_ADDRESS.zip
        }`,
      );

    cy.get('.other-ways-mail-section .va-address-block').should('be.visible');

    // In-Person Section
    cy.get('.other-ways-in-person-section > h3').should(
      'contain.text',
      'Option 2: In person',
    );

    cy.get('.other-ways-in-person-section').should(
      'contain.text',
      'Bring the document to a VA regional office',
    );

    cy.get(`va-link[href="${LINKS.findVaLocations}"]`)
      .should('be.visible')
      .and('have.attr', 'href', LINKS.findVaLocations)
      .and('have.attr', 'text', 'Find a VA regional office near you');

    // Confirmation Section
    cy.get('.other-ways-confirmation-section > h3').should(
      'contain.text',
      'How to confirm we\u2019ve received your documents',
    );

    cy.get('.other-ways-confirmation-section').should(
      'contain.text',
      `To confirm we\u2019ve received a document you submitted by mail or in person, call us at ${
        CONTACT_INFO.phone
      } (TTY: ${CONTACT_INFO.tty}). We\u2019re here ${CONTACT_INFO.hours}.`,
    );

    cy.axeCheck();
  });
});
