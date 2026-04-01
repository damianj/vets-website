import serviceHistory from '@@profile/tests/fixtures/service-history-success.json';
import fullName from '@@profile/tests/fixtures/full-name-success.json';
import disabilityRating from '@@profile/tests/fixtures/disability-rating-success.json';
import error500 from '@@profile/tests/fixtures/500.json';
import { generateFeatureToggles } from '@@profile/mocks/endpoints/feature-toggles';

import { mockUser } from '../fixtures/users/user';
import { nameTagRendersWithoutDisabilityRating } from './helpers';
import { PROFILE_PATHS } from '../../constants';

describe('Profile NameTag', () => {
  beforeEach(() => {
    cy.login(mockUser);
    cy.intercept(
      'GET',
      '/v0/feature_toggles*',
      generateFeatureToggles({
        profile2Enabled: true,
      }),
    ).as('getFeatureToggles');
    cy.intercept('/v0/profile/service_history', serviceHistory);
    cy.intercept('/v0/profile/full_name', fullName);
    cy.intercept(
      '/v0/disability_compensation_form/rating_info',
      disabilityRating,
    );
    // Explicitly mocking these APIs as failures, causes the tests to run MUCH
    // faster. All three tests run in 2-3s instead of 8-9s.
    cy.intercept('/v0/profile/personal_information', error500);
    cy.intercept('/v0/mhv_account', error500);
  });

  it('should render the name and service branch', () => {
    cy.visit(PROFILE_PATHS.PROFILE_ROOT);
    nameTagRendersWithoutDisabilityRating();
    cy.injectAxe();
    cy.axeCheck();
  });
});
