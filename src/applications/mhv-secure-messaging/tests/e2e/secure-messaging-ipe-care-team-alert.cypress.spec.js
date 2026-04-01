import SecureMessagingSite from './sm_site/SecureMessagingSite';
import PatientInboxPage from './pages/PatientInboxPage';
import PatientInterstitialPage from './pages/PatientInterstitialPage';
import GeneralFunctionsPage from './pages/GeneralFunctionsPage';
import mockUser from './fixtures/userResponse/user.json';
import vamcEhrCerner from './fixtures/vamc-ehr-cerner.json';
import { AXE_CONTEXT, Paths } from './utils/constants';
import { createCernerUser } from './utils/user-helpers';

const TOOLTIP_ID = 'test-tooltip-id-123';
const TOOLTIP_NAME = 'sm_care_team_list_update_ipe';

const ALERT_CONTAINER_TESTID = 'sm-care-team-list-update-ipe-container';
const DISMISS_BUTTON_TESTID = 'sm-care-team-list-update-ipe-stop-showing-hint';

const IPE_ALERT_TEXT =
  'We updated your list of care teams. You may have different care teams in your list. And some of your care team names may have changed.';

/**
 * Creates a tooltip API response for GET /tooltips.
 * @param {boolean} hidden - Whether the tooltip is dismissed
 * @returns {Object} Mock tooltips list response
 */
const mockTooltipResponse = (hidden = false) => [
  {
    id: TOOLTIP_ID,
    tooltipName: TOOLTIP_NAME,
    hidden,
    counter: 1,
  },
];

/**
 * Sets up feature toggles with the curated list flow enabled.
 */
const curatedListToggles = GeneralFunctionsPage.updateFeatureToggles([
  {
    name: 'mhv_secure_messaging_curated_list_flow',
    value: true,
  },
]);

/**
 * Navigates from inbox to the Select Care Team page (which renders RecipientsSelect
 * with the InProductionEducationAlert).
 */
const navigateToSelectCareTeamPage = () => {
  // Mock empty recent recipients to go directly to select-care-team
  cy.intercept('POST', '/my_health/v1/messaging/folders/-1/search*', {
    data: [],
  }).as('recentRecipients');

  PatientInboxPage.clickCreateNewMessage();
  PatientInterstitialPage.getStartMessageLink().click({ force: true });
  cy.wait('@recentRecipients');
  cy.url().should('include', '/select-care-team');
};

describe('SM IPE Care Team List Update Alert', () => {
  describe('Cerner patient with visible tooltip', () => {
    it('displays the IPE alert for a Cerner patient', () => {
      cy.intercept(
        'GET',
        Paths.INTERCEPT.TOOLTIPS,
        mockTooltipResponse(false),
      ).as('getTooltips');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.findByTestId(ALERT_CONTAINER_TESTID).should('exist');
      cy.findByTestId(ALERT_CONTAINER_TESTID).within(() => {
        cy.contains(IPE_ALERT_TEXT).should('exist');
      });

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Cerner patient - alert interactions', () => {
    beforeEach(() => {
      cy.intercept(
        'GET',
        Paths.INTERCEPT.TOOLTIPS,
        mockTooltipResponse(false),
      ).as('getTooltips');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      // Consume the increment-counter PATCH fired by the useEffect on mount
      cy.wait('@patchTooltip');
    });

    it('displays the alert as an aside landmark with correct aria-label', () => {
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('exist');
      cy.findByTestId(ALERT_CONTAINER_TESTID).then($el => {
        expect($el[0].tagName).to.equal('ASIDE');
        expect($el[0]).to.have.attr(
          'aria-label',
          'Tooltip for care team selection',
        );
      });

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('displays the full alert text', () => {
      cy.findByTestId(ALERT_CONTAINER_TESTID).within(() => {
        cy.contains(
          'We updated your list of care teams. You may have different care teams in your list.',
        ).should('exist');
        cy.contains(
          'you can still search by type of care or facility location',
        ).should('exist');
      });

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('displays the "Stop showing this hint" button', () => {
      cy.findByTestId(DISMISS_BUTTON_TESTID).should('exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('hides the alert after clicking "Stop showing this hint"', () => {
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('exist');

      cy.findByTestId(DISMISS_BUTTON_TESTID).click({ force: true });

      cy.wait('@patchTooltip');
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Cerner patient - auto-dismiss after 3 views', () => {
    it('does NOT display the IPE alert when counter reaches 3', () => {
      cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, [
        {
          id: TOOLTIP_ID,
          tooltipName: TOOLTIP_NAME,
          hidden: false,
          counter: 3,
        },
      ]).as('getTooltips');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.wait('@patchTooltip');
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('still displays the IPE alert on the last allowed view (counter: 2)', () => {
      cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, [
        {
          id: TOOLTIP_ID,
          tooltipName: TOOLTIP_NAME,
          hidden: false,
          counter: 2,
        },
      ]).as('getTooltips');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      // Increment PATCH fires on mount
      cy.wait('@patchTooltip');
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });

    it('does NOT display the IPE alert when counter exceeds 3', () => {
      cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, [
        {
          id: TOOLTIP_ID,
          tooltipName: TOOLTIP_NAME,
          hidden: false,
          counter: 5,
        },
      ]).as('getTooltips');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.wait('@patchTooltip');
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Cerner patient - first visit (no existing tooltip)', () => {
    it('creates a new tooltip and displays the IPE alert', () => {
      cy.intercept('GET', Paths.INTERCEPT.TOOLTIPS, []).as('getTooltips');
      cy.intercept('POST', Paths.INTERCEPT.TOOLTIPS, {
        id: TOOLTIP_ID,
        tooltipName: TOOLTIP_NAME,
        hidden: false,
        counter: 0,
      }).as('createTooltip');
      cy.intercept('PATCH', Paths.INTERCEPT.TOOLTIPS_BY_ID, {}).as(
        'patchTooltip',
      );

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.wait('@createTooltip');
      // Increment PATCH fires after creation
      cy.wait('@patchTooltip');
      cy.findByTestId(ALERT_CONTAINER_TESTID).should('exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Non-Cerner patient', () => {
    it('does NOT display the IPE alert for a non-Cerner user', () => {
      cy.intercept(
        'GET',
        Paths.INTERCEPT.TOOLTIPS,
        mockTooltipResponse(false),
      ).as('getTooltips');

      SecureMessagingSite.login(curatedListToggles);
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.findByTestId(ALERT_CONTAINER_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });

  describe('Already-dismissed tooltip', () => {
    it('does NOT display the IPE alert when tooltip is already hidden', () => {
      cy.intercept(
        'GET',
        Paths.INTERCEPT.TOOLTIPS,
        mockTooltipResponse(true),
      ).as('getTooltips');

      SecureMessagingSite.login(
        curatedListToggles,
        vamcEhrCerner,
        true,
        createCernerUser(mockUser),
      );
      PatientInboxPage.loadInboxMessages();
      navigateToSelectCareTeamPage();

      cy.findByTestId(ALERT_CONTAINER_TESTID).should('not.exist');

      cy.injectAxe();
      cy.axeCheck(AXE_CONTEXT);
    });
  });
});
