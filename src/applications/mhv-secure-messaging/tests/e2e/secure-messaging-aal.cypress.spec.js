import GeneralFunctionsPage from './pages/GeneralFunctionsPage';
import PatientInboxPage from './pages/PatientInboxPage';
import SecureMessagingSite from './sm_site/SecureMessagingSite';
import { AXE_CONTEXT, Locators, Paths } from './utils/constants';
import mockEhrData from './fixtures/userResponse/vamc-ehr-cerner-mixed.json';
import mockPretransitionedCernerFacilitiesUser from './fixtures/userResponse/user-cerner-mixed-pretransitioned.json';
import mockFacilities from './fixtures/facilityResponse/cerner-facility-mock-data.json';

describe('SECURE MESSAGING AAL', () => {
  describe('AAL tests for non OH user', () => {
    it('should submit API call to log Launch Messages AAL', () => {
      SecureMessagingSite.login();
      cy.intercept('POST', Paths.AAL, {
        statusCode: 204,
      }).as('submitLaunchMessagingAal');
      PatientInboxPage.loadInboxMessages();

      cy.wait('@submitLaunchMessagingAal').then(interception => {
        expect(interception.request.body).to.deep.equal({
          aal: {
            activityType: 'Messages',
            action: 'Launch Messages',
            performerType: 'Self',
            status: '1',
          },
          product: 'sm',
          oncePerSession: true,
        });
      });
      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });

  describe('AAL tests for OH user', () => {
    it('should submit API call to log Launch My VA Health AAL', () => {
      SecureMessagingSite.login(
        GeneralFunctionsPage.updateFeatureToggles([]),
        mockEhrData,
        true,
        mockPretransitionedCernerFacilitiesUser,
        mockFacilities,
      );
      cy.intercept('POST', Paths.AAL, {
        statusCode: 204,
      }).as('submitLaunchMessagingAal');
      PatientInboxPage.loadInboxMessages();

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);

      cy.get(Locators.ALERTS.CERNER_ALERT)
        .find('va-link-action')
        .click();

      cy.get('@submitLaunchMessagingAal.all').then(interceptions => {
        const latestInterception = interceptions[interceptions.length - 1];
        expect(latestInterception.request.body).to.deep.equal({
          aal: {
            activityType: 'Messaging',
            action: 'Launch My VA Health',
            performerType: 'Self',
            status: '1',
          },
          product: 'sm',
        });
      });
    });
  });
});
