import {
  mockClaimsEndpoint,
  mockAppealsEndpoint,
  mockFeatureToggles,
  mockStemEndpoint,
} from './support/helpers/mocks';
import { verifyTitleBreadcrumbsHeading } from './support/helpers/assertions';
import { LINKS } from '../../constants';

const ITF_PAGE_URL = '/track-claims/your-claims/intent-to-file';

const setupItfPage = (cstIntentsToFile = true) => {
  mockFeatureToggles({ cstIntentsToFile });
  mockClaimsEndpoint();
  mockAppealsEndpoint();
  mockStemEndpoint();
  cy.login();
  cy.visit(ITF_PAGE_URL);
  cy.injectAxe();
};

const expectVaLink = (text, href) => {
  cy.get(`va-link[text="${text}"]`)
    .should('have.attr', 'href', href)
    .and('not.have.attr', 'external');
};

describe('Intent to File - List Page', () => {
  context('when cstIntentsToFile feature toggle is enabled', () => {
    beforeEach(() => {
      setupItfPage(true);
    });

    it('should have correct page title, breadcrumbs, and heading', () => {
      verifyTitleBreadcrumbsHeading({
        title: 'Your Intents To File | Veterans Affairs',
        thirdBreadcrumb: {
          name: 'Your intents to file',
          href: '#content',
        },
        heading: { name: 'Your intents to file' },
      });

      cy.axeCheck();
    });

    it('should display the empty state for intents to file on record', () => {
      cy.findByRole('heading', {
        name: 'Intents to file on record',
        level: 2,
      });

      cy.findByText(
        'We don’t have any intents to file on record for you in our system.',
      );

      cy.axeCheck();
    });

    it('should display the "Start a new intent to file" section', () => {
      cy.findByRole('heading', {
        name: 'Start a new intent to file',
        level: 2,
      });

      cy.findByText(
        'You can create an intent to file if you plan to file a claim for these types of benefits:',
      );

      expectVaLink(
        'Start a claim for disability compensation online',
        LINKS.disabilityCompensationClaimIntro,
      );
      expectVaLink(
        'Start an application for Veterans Pension online',
        LINKS.veteransPensionOnlineIntro,
      );
      expectVaLink(
        'Submit an intent to file online',
        LINKS.intentToFileForm0966,
      );
      expectVaLink(
        'Submit an intent to file (VA Form 21-0966) online',
        LINKS.intentToFileForm0966,
      );

      cy.contains('Disability compensation');
      cy.contains('Veterans pension');
      cy.contains('Dependency and Indemnity Compensation (DIC)');
      cy.findByText(
        'For any of these benefits, you can submit a separate form to let us know that you intend to file a claim.',
      );
      cy.findByText(
        'If you have an accredited representative, they may also create an intent to file for you.',
      );

      cy.axeCheck();
    });

    it('should display the "Why can’t I find my intent to file?" section', () => {
      cy.findByRole('heading', {
        name: 'Why can’t I find my intent to file?',
        level: 2,
      });

      cy.contains(
        'p',
        /An intent to file expires 1 year after it’s recorded\. If you think you have an active intent to file that isn’t available here, call us at/,
      );

      cy.axeCheck();
    });

    it('should display the "What is an intent to file?" section', () => {
      cy.findByRole('heading', {
        name: 'What is an intent to file?',
        level: 2,
      });

      expectVaLink(
        'Learn more about an intent to file a claim',
        LINKS.intentToFileAboutClaim,
      );

      cy.axeCheck();
    });
  });

  context('when cstIntentsToFile feature toggle is disabled', () => {
    it('should redirect to the claims index page', () => {
      setupItfPage(false);

      cy.url().should('include', '/your-claims');
      cy.url().should('not.include', '/intent-to-file');

      cy.findByRole('heading', {
        name: 'Check your claim, decision review, or appeal status',
        level: 1,
      });

      cy.axeCheck();
    });
  });
});
