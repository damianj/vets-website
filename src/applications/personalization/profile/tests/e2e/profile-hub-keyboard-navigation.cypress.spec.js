import mockUser from '../fixtures/users/user-36.json';
import { PROFILE_PATHS } from '../../constants';
import { mockProfileLOA3 } from './helpers';
import { generateFeatureToggles } from '../../mocks/endpoints/feature-toggles';

describe('Profile - Hub page, Keyboard navigation', () => {
  const PROFILE_HREFS = [
    PROFILE_PATHS.PERSONAL_INFORMATION,
    PROFILE_PATHS.CONTACT_INFORMATION,
    PROFILE_PATHS.SERVICE_HISTORY_INFORMATION,
    PROFILE_PATHS.FINANCIAL_INFORMATION,
    PROFILE_PATHS.HEALTH_CARE_SETTINGS,
    PROFILE_PATHS.DEPENDENTS_AND_CONTACTS,
    PROFILE_PATHS.LETTERS_AND_DOCUMENTS,
    PROFILE_PATHS.NOTIFICATION_SETTINGS,
    PROFILE_PATHS.ACCOUNT_SECURITY,
  ];

  it('should allow tabbing through all links on the page, in order', () => {
    cy.login(mockUser);

    mockProfileLOA3(
      generateFeatureToggles({ profileHideHealthCareContacts: false }),
    );

    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    const [firstHref, ...hrefs] = PROFILE_HREFS;
    cy.tabToElement(`a[href^="${firstHref}"]`);
    hrefs.forEach(href => {
      cy.realPress('Tab');
      // using the cy.focused() method as described in the documentation
      // https://docs.cypress.io/api/commands/focused#Make-an-assertion-on-the-focused-element
      /* eslint-disable-next-line cypress/unsafe-to-chain-command */
      cy.focused().should('have.attr', 'href', href);
    });

    cy.injectAxeThenAxeCheck();
  });
});
