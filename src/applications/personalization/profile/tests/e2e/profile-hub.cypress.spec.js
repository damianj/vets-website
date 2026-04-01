import directDeposits from '@@profile/mocks/endpoints/direct-deposits';
import mockUser from '../fixtures/users/user-36.json';
import { PROFILE_PATHS } from '../../constants';
import { mockProfileLOA3 } from './helpers';
import { generateFeatureToggles } from '../../mocks/endpoints/feature-toggles';
import user from '../../mocks/endpoints/user';

describe('Profile - Hub page', () => {
  beforeEach(() => {
    cy.login(mockUser);
    mockProfileLOA3(
      generateFeatureToggles({
        profile2Enabled: true,
        profileHideHealthCareContacts: false,
      }),
    );
  });

  it('should render the correct content', () => {
    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    cy.findByText('Profile', { selector: 'h1' }).should('exist');
    cy.get('va-link[text="Personal information"]').should('exist');
    cy.get('va-link[text="Contact information"]').should('exist');
    cy.get('va-link[text="Service history information"]').should('exist');
    cy.get('va-link[text="Financial information"]').should('exist');
    cy.get('va-link[text="Health care settings"]').should('exist');
    cy.get('va-link[text="Dependents and contacts"]').should('exist');
    cy.get('va-link[text="Letters and documents"]').should('exist');
    cy.get('va-link[text="Email and text notifications"]').should('exist');
    cy.get('va-link[text="Account security"]').should('exist');

    cy.url().should('not.include', 'personal-information');

    cy.injectAxeThenAxeCheck();
  });

  it('should render the bad address indicator on the Hub, for a user with a bad address', () => {
    cy.intercept('v0/user', user.badAddress);

    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    cy.findByText('Profile', { selector: 'h1' }).should('exist');

    // heading of the bad address indicator alert
    cy.findByText('Review your mailing address').should('exist');

    // link text for the bad address indicator alert
    cy.findByText('Review the mailing address in your profile').should('exist');

    cy.url().should('not.include', 'personal-information');

    cy.injectAxeThenAxeCheck();
  });

  it('should render blocked profile content when user is deceased', () => {
    cy.intercept(
      'v0/feature_toggles*',
      generateFeatureToggles({
        profile2Enabled: true,
        profileLighthouseDirectDeposit: true,
      }),
    );

    cy.intercept('/v0/profile/direct_deposits', directDeposits.isDeceased);

    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    cy.findByText('We can’t show your information').should('exist');

    cy.url().should('include', 'profile/account-security');

    cy.injectAxeThenAxeCheck();
  });
});
