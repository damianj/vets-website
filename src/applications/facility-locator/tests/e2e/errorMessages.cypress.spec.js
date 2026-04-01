/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import mockGeocodingData from '../../constants/mock-geocoding-data.json';
import FacilityHelpers from './helpers/facility-helpers-cypress';
import FeaturesHelpers from './helpers/features-helpers-cypress';
import CcpHelpers from './helpers/ccp-helpers-cypress';

import {
  enabledFeatures,
  featureCombinationsTogglesToTest,
} from './featureTogglesToTest';
import * as h from './helpers';

const featureSets = featureCombinationsTogglesToTest([
  'facilities_use_fl_progressive_disclosure',
]);

for (const featureSet of featureSets) {
  describe(`Facility search error messages ${enabledFeatures(
    featureSet,
  )}`, () => {
    const addrErrorMessage =
      'Enter a zip code or a city and state in the search box';
    const faciltyErrorMessage = 'Select a facility type';
    const serviceErrorMessage = 'ErrorStart typing and select a service type';

    beforeEach(() => {
      cy.intercept('GET', '/v0/maintenance_windows', []);
      FeaturesHelpers.initApplicationMock(featureSet);
      CcpHelpers.initApplicationMock('1223X2210X', 'mockDentists');
      FacilityHelpers.initApplicationMock();

      cy.visit(h.ROOT_URL);
      cy.injectAxeThenAxeCheck();
    });

    it('shows error message in location field on invalid search', () => {
      cy.injectAxeThenAxeCheck();
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);
      h.elementIsFocused(h.CITY_STATE_ZIP_INPUT);
    });

    it('shows error message on leaving location field empty on submit', () => {
      h.focusElement(h.CITY_STATE_ZIP_INPUT);
      h.findSelectInVaSelect(h.FACILITY_TYPE_DROPDOWN).focus();

      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);
    });

    it('shows error message when leaving facility type field empty on submit', () => {
      h.typeInCityStateInput('Austin, TX', true);
      h.findSelectInVaSelect(h.FACILITY_TYPE_DROPDOWN).focus();
      h.submitSearchForm();

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .contains('Select a facility type');

      h.errorMessageContains2(faciltyErrorMessage);

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('select')
        .select('VA health');
    });

    it('focuses internal select when facility type error is triggered on submit', () => {
      h.typeInCityStateInput('Austin, TX', true);
      h.submitSearchForm();

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('select')
        .should('be.focused');
    });

    it('focuses internal select on repeat submit without facility type', () => {
      h.typeInCityStateInput('Austin, TX', true);
      h.submitSearchForm();

      // First submit: error shows
      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('.usa-error-message')
        .should('exist');

      // Blur the field
      cy.get('body').click();

      // Second submit: focus should return
      h.submitSearchForm();

      cy.get(h.FACILITY_TYPE_DROPDOWN)
        .shadow()
        .find('select')
        .should('be.focused');
    });

    it('shows location and service type errors simultaneously for CC provider without location', () => {
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);
      cy.wait('@mockServices');
      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);

      h.submitSearchForm();

      h.errorMessageContains(addrErrorMessage);
      h.errorMessageContains(serviceErrorMessage);
      h.elementIsFocused(h.CITY_STATE_ZIP_INPUT);
    });

    it('preserves location error after selecting a facility type', () => {
      h.submitSearchForm();
      h.errorMessageContains(addrErrorMessage);

      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.HEALTH);

      h.errorMessageContains(addrErrorMessage);
    });

    it('shows error message when leaving service type field empty on submit', () => {
      h.typeInCityStateInput('Austin, TX');
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);

      // Wait for services to be saved to state and input field to not be disabled
      cy.wait('@mockServices');

      h.verifyElementIsNotDisabled(h.CCP_SERVICE_TYPE_INPUT);
      h.submitSearchForm();
      h.errorMessageContains(serviceErrorMessage);
      h.typeAndSelectInCCPServiceTypeInput('Clinic/Center - Urgent Care');
    });

    it('shows error message when typing in `back pain`, NOT selecting a service type, and attempting to search', () => {
      h.typeInCityStateInput('Austin, TX');
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);

      // Wait for services to be saved to state and input field to not be disabled
      cy.wait('@mockServices');

      h.typeInCCPServiceTypeInput('back pain');
      h.submitSearchForm();

      h.errorMessageContains(serviceErrorMessage);
    });

    it('does not show error message when selecting a service type, then tab-ing/focusing back to the facility type field, then tab-ing forward to service type field', () => {
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);

      // Wait for services to load before interacting with typeahead
      cy.wait('@mockServices');

      h.typeAndSelectInCCPServiceTypeInput('Clinic/Center - Urgent Care');
      h.findSelectInVaSelect(h.FACILITY_TYPE_DROPDOWN).focus();

      h.verifyElementExists(h.CCP_SERVICE_TYPE_INPUT);
      h.verifyElementDoesNotExist(h.SEARCH_FORM_ERROR_MESSAGE_2);
    });

    it('shows error message when deleting service after search', () => {
      cy.intercept('GET', '/geocoding/**/*', mockGeocodingData);
      h.typeInCityStateInput('Austin, TX');
      h.selectFacilityTypeInDropdown(h.FACILITY_TYPES.CC_PRO);

      cy.wait('@mockServices');

      h.typeAndSelectInCCPServiceTypeInput('Dentist - Orofacial Pain');
      h.submitSearchForm();

      h.verifyElementShouldContainString(
        h.SEARCH_RESULTS_SUMMARY,
        /(Showing|results).*Community providers.*Dentist - Orofacial Pain.*Austin, Texas/i,
      );

      h.clearInput(h.CCP_SERVICE_TYPE_INPUT);
      h.submitSearchForm();
      h.errorMessageContains(serviceErrorMessage);
    });
  });
}
