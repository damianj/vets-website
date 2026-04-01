import FEATURE_FLAG_NAMES from '@department-of-veterans-affairs/platform-utilities/featureFlagNames';
import SecureMessagingSite from './sm_site/SecureMessagingSite';
import PatientInboxPage from './pages/PatientInboxPage';
import GeneralFunctionsPage from './pages/GeneralFunctionsPage';
import PatientComposePage from './pages/PatientComposePage';
import PatientInterstitialPage from './pages/PatientInterstitialPage';
import PatientRecentRecipientsPage from './pages/PatientRecentRecipientsPage';
import searchSentFolderResponse from './fixtures/searchResponses/search-sent-folder-response.json';
import { AXE_CONTEXT, Data, Paths } from './utils/constants';

describe('SM RECIPIENTS GROUPING ON COMPOSE', () => {
  const updatedFeatureToggles = GeneralFunctionsPage.updateFeatureToggles([
    {
      name: FEATURE_FLAG_NAMES.mhvSecureMessagingRecipientOptGroups,
      value: true,
    },
    {
      name: FEATURE_FLAG_NAMES.mhvSecureMessagingCuratedListFlow,
      value: true,
    },
  ]);

  describe('without recent recipients', () => {
    beforeEach(() => {
      SecureMessagingSite.login(updatedFeatureToggles);
      PatientInboxPage.loadInboxMessages();
      // Navigate through curated list flow: create message -> interstitial -> select care team
      PatientInboxPage.clickCreateNewMessage();
      PatientInterstitialPage.getStartMessageLink().click({ force: true });
      PatientComposePage.verifyHeader('Select care team');
    });

    it('verify groups quantity', () => {
      cy.findByTestId('compose-recipient-combobox')
        .find(`optgroup`)
        .should(`have.length`, 5);

      cy.findByTestId('compose-recipient-combobox')
        .find(`optgroup`)
        .each(el => {
          cy.wrap(el)
            .find(`option`)
            .its(`length`)
            .should(`be.greaterThan`, 0);
        });

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('verify particular group', () => {
      PatientComposePage.verifyRecipientsQuantityInGroup(0, 4);
      PatientComposePage.verifyRecipientsQuantityInGroup(1, 3);
      PatientComposePage.verifyRecipientsQuantityInGroup(2, 1);
      PatientComposePage.verifyRecipientsQuantityInGroup(3, 1);

      PatientComposePage.verifyRecipientsGroupName(
        0,
        'VA Kansas City health care',
      );

      PatientComposePage.verifyRecipientsGroupName(1, 'VA Madison health care');

      PatientComposePage.verifyRecipientsGroupName(
        2,
        'VA Northern Arizona health care',
      );
      PatientComposePage.verifyRecipientsGroupName(
        3,
        'VA Puget Sound health care',
      );

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });

    it('verify recipient is in a correct group', () => {
      PatientComposePage.verifyFacilityNameByRecipientName(
        `TG-7410`,
        'VA Kansas City health care',
      );

      PatientComposePage.verifyFacilityNameByRecipientName(
        `SLC4 PCMM`,
        'VA Kansas City health care',
      );

      PatientComposePage.verifyFacilityNameByRecipientName(
        `OH TG GROUP 002`,
        'VA Spokane health care',
      );

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });

    it('verify option text does not include system names in parentheses', () => {
      cy.findByTestId('compose-recipient-combobox')
        .find('optgroup[label="VA Kansas City health care"]')
        .find('option')
        .each($option => {
          const text = $option.text();
          // Options should NOT have tab + parenthesized system name
          cy.wrap(text).should('not.match', /\t\(.+\)/);
        });

      cy.findByTestId('compose-recipient-combobox')
        .find('optgroup[label="VA Madison health care"]')
        .find('option')
        .each($option => {
          const text = $option.text();
          cy.wrap(text).should('not.match', /\t\(.+\)/);
        });

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });

  describe('with recent recipients, selecting a non-recent care team', () => {
    beforeEach(() => {
      const togglesWithRecent = GeneralFunctionsPage.updateFeatureToggles([
        {
          name: FEATURE_FLAG_NAMES.mhvSecureMessagingRecipientOptGroups,
          value: true,
        },
        {
          name: FEATURE_FLAG_NAMES.mhvSecureMessagingCuratedListFlow,
          value: true,
        },
        {
          name: FEATURE_FLAG_NAMES.mhvSecureMessagingRecentRecipients,
          value: true,
        },
      ]);
      SecureMessagingSite.login(togglesWithRecent);
      PatientInboxPage.loadInboxMessages();

      cy.intercept(
        'POST',
        Paths.INTERCEPT.SENT_SEARCH,
        searchSentFolderResponse,
      ).as('recentRecipients');

      PatientInboxPage.clickCreateNewMessage();
      cy.wait('@recentRecipients');
      PatientInterstitialPage.clickStartMessageLink(true);

      GeneralFunctionsPage.verifyPageHeader(Data.RECENT_RECIPIENTS_HEADER);

      // On recent care teams page, select "A different care team" and continue
      cy.findByLabelText('A different care team').click();
      PatientRecentRecipientsPage.continueButton().click();
    });

    it('properly displays dropdown and input', () => {
      cy.url().should('include', Paths.SELECT_CARE_TEAM);
      cy.contains('h1', Data.RECENT_RECIPIENTS_HEADER).should('not.exist');
      PatientComposePage.verifyHeader('Select care team');
      PatientComposePage.selectComboBoxRecipient('Record Amendment Admin');

      // the combobox input is populated
      PatientComposePage.getComboBox().should(
        'have.value',
        'Record Amendment Admin',
      );
      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__toggle-list')
        .click({ force: true });

      // the combobox dropdown displays the correct groupings and options
      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__list-option--group')
        .contains('Recent care teams')
        .should('exist');

      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__toggle-list')
        .click({ force: true });

      cy.findByTestId('continue-button').click();
      cy.findByText(`Select a different care team`).click();

      // Even with a default value, the combobox input and dropdown behave correctly

      PatientComposePage.getComboBox().should(
        'have.value',
        'Record Amendment Admin',
      );

      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__toggle-list')
        .click({ force: true });

      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__list-option--group')
        .contains('Recent care teams')
        .should('exist');

      cy.get('va-combo-box')
        .shadow()
        .find('.usa-combo-box__toggle-list')
        .click({ force: true });

      cy.injectAxeThenAxeCheck(AXE_CONTEXT);
    });
  });
});
