import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import {
  $,
  $$,
} from '@department-of-veterans-affairs/platform-forms-system/ui';
import ConfirmationPage from '../../components/ConfirmationPage';
import comprehensiveTest from '../fixtures/data/pre-api-comprehensive-test.json';
import noEvidenceTest from '../fixtures/data/pre-api-no-evidence-test.json';
import { verifyHeader } from '../unit-test-helpers';
import { title995 } from '../../content/title';
import { content as evidenceSummaryContent } from '../../content/evidence/summary';
import { confirmationText as vaConfirmationText } from '../../content/evidence/va';
import { confirmationText as privateConfirmationText } from '../../content/evidence/private';
import { content as content5103 } from '../../content/notice5103';

describe('ConfirmationPage', () => {
  const makeStore = (data, { featureToggles = {} } = {}) => ({
    subscribe: () => {},
    dispatch: () => {},
    getState: () => ({
      featureToggles,
      user: {
        profile: {
          userFullName: {
            first: 'Michael',
            middle: 'Thomas',
            last: 'Wazowski',
            suffix: 'Esq.',
          },
          dob: '1990-02-03',
        },
      },
      form: {
        formId: '20-0995',
        submission: {
          response: new Date().toISOString(),
        },
        data,
      },
    }),
  });

  const createConfirmationPage = (data, storeOptions) => {
    return render(
      <Provider store={makeStore(data, storeOptions)}>
        <ConfirmationPage />
      </Provider>,
    );
  };

  describe('when evidence is present', () => {
    it('should render the proper content', () => {
      const { container } = createConfirmationPage(comprehensiveTest.data);

      const h2s = $$('h2', container);
      const h3s = $$('h3', container);
      const h4s = $$('h4', container);

      // For sections that have their own component files,
      // we just check that they're present (that their header is rendered)
      // and leave the implementation details to their own unit tests
      verifyHeader(h2s, 0, title995);
      verifyHeader(h2s, 1, 'Your Supplemental Claim submission is in progress');
      verifyHeader(h2s, 2, 'Print a copy of your Supplemental Claim');
      expect($$('va-alert[status="success"]', container)).to.exist;
      verifyHeader(h3s, 0, 'Personal information');
      verifyHeader(h3s, 1, 'Living situation');
      verifyHeader(h3s, 2, 'Issues for review');

      // Check 5103
      const response5103 = $$(
        '[data-testid="confirmation-form-5103"]',
        container,
      )?.[0];

      expect(response5103.textContent).to.equal(`Yes, ${content5103.label}`);

      // Check facility types
      const facilityTypes = $(
        '[data-testid="confirmation-facility-types"]',
        container,
      );

      const facilityItems = $$('li', facilityTypes);

      expect(facilityItems.length).to.equal(7);
      expect(facilityItems[0].textContent).to.equal(
        'VA medical center (also called a VAMC)',
      );

      // Evidence is present, validate that "no evidence" header is not there
      const noEvidenceHeader = $$(
        '[data-testid="confirmation-no-evidence-header"]',
      );

      expect(noEvidenceHeader.length).to.equal(0);

      // Evidence (old flows)
      verifyHeader(h4s, 0, evidenceSummaryContent.vaTitle);
      verifyHeader(h4s, 1, evidenceSummaryContent.privateTitle);
      verifyHeader(h4s, 2, evidenceSummaryContent.otherTitle);

      // VHA / MST
      expect(h3s.includes('VHA indicator'));

      const responseMst = $$(
        '[data-testid="confirmation-mst-response"]',
        container,
      )?.[0];

      expect(responseMst.textContent).to.equal('Yes');

      const indicatorMst = $$(
        '[data-testid="confirmation-mst-option-indicator"]',
        container,
      )?.[0];

      expect(indicatorMst.textContent).to.equal(
        'I gave permission in the past, but I want to revoke (or cancel) my permission',
      );
    });
  });

  describe('when no evidence is present', () => {
    it('should render the proper content', () => {
      const { container } = createConfirmationPage(noEvidenceTest.data);

      const h2s = $$('h2', container);
      const h3s = $$('h3', container);

      verifyHeader(h2s, 0, title995);
      verifyHeader(h2s, 1, 'Your Supplemental Claim submission is in progress');
      verifyHeader(h2s, 2, 'Print a copy of your Supplemental Claim');
      expect($$('va-alert[status="success"]', container)).to.exist;
      verifyHeader(h3s, 0, 'Personal information');
      verifyHeader(h3s, 1, 'Living situation');
      verifyHeader(h3s, 2, 'Issues for review');

      // Check 5103
      const response5103 = $$(
        '[data-testid="confirmation-form-5103"]',
        container,
      )?.[0];

      expect(response5103.textContent).to.equal(`Yes, ${content5103.label}`);

      // Check facility types
      const facilityTypes = $(
        '[data-testid="confirmation-facility-types"]',
        container,
      );

      const facilityItems = $$('li', facilityTypes);

      expect(facilityItems.length).to.equal(1);
      expect(facilityItems[0].textContent).to.equal(
        'VA medical center (also called a VAMC)',
      );

      const noEvidenceHeader = $$('.no-evidence', container)?.[0];

      expect(noEvidenceHeader.textContent).to.equal(
        evidenceSummaryContent.missingEvidenceReviewText,
      );

      // VHA / MST
      expect(h3s.includes('VHA indicator'));

      const responseMst = $$(
        '[data-testid="confirmation-mst-response"]',
        container,
      )?.[0];

      expect(responseMst.textContent).to.equal('Yes');

      const indicatorMst = $$(
        '[data-testid="confirmation-mst-option-indicator"]',
        container,
      )?.[0];

      expect(indicatorMst.textContent).to.equal(
        'I gave permission in the past, but I want to revoke (or cancel) my permission',
      );
    });
  });

  describe('when myVADisplayEnabled toggle is on', () => {
    it('should render SubmissionAlert instead of ConfirmationAlert', () => {
      const { container } = createConfirmationPage(comprehensiveTest.data, {
        featureToggles: {
          // eslint-disable-next-line camelcase
          my_va_display_decision_reviews_forms: true,
        },
      });

      const alert = $(
        'va-alert.confirmation-submission-alert-section',
        container,
      );

      expect(alert).to.exist;
      expect($('h2[slot="headline"]', alert).textContent).to.equal(
        'Your Supplemental Claim submission is in progress',
      );

      expect($('va-link-action[href="/my-va#benefit-applications"]', alert)).to
        .exist;
    });
  });

  describe('when scRedesign is active', () => {
    const redesignData = {
      ...comprehensiveTest.data,
      scRedesign: true,
      vaEvidence: [
        {
          vaTreatmentLocation: 'Test VA Center',
          treatmentBefore2005: 'N',
          treatmentMonthYear: '2020-03',
        },
      ],
      privateEvidence: [
        {
          privateTreatmentLocation: 'Test Private Clinic',
          address: {
            street: '100 Oak St',
            street2: '',
            city: 'Dallas',
            state: 'TX',
            country: 'USA',
            postalCode: '75001',
          },
          issues: { Hypertension: true },
          treatmentStart: '2020-01-01',
          treatmentEnd: '2021-01-01',
        },
      ],
    };

    it('should render the proper content through the evidence sections', () => {
      const { container } = createConfirmationPage(redesignData);

      const h2s = $$('h2', container);
      const h3s = $$('h3', container);
      const h4s = $$('h4', container);
      const h4Texts = Array.from(h4s).map(h4 => h4.textContent);

      verifyHeader(h2s, 0, title995);
      verifyHeader(h2s, 1, 'Your Supplemental Claim submission is in progress');
      verifyHeader(h2s, 2, 'Print a copy of your Supplemental Claim');
      expect($$('va-alert[status="success"]', container)).to.exist;
      verifyHeader(h3s, 0, 'Personal information');
      verifyHeader(h3s, 1, 'Living situation');
      verifyHeader(h3s, 2, 'Issues for review');

      // Check 5103
      const response5103 = $$(
        '[data-testid="confirmation-form-5103"]',
        container,
      )?.[0];

      expect(response5103.textContent).to.equal(`Yes, ${content5103.label}`);

      // Check facility types
      const facilityTypes = $(
        '[data-testid="confirmation-facility-types"]',
        container,
      );

      const facilityItems = $$('li', facilityTypes);

      expect(facilityItems.length).to.equal(7);
      expect(facilityItems[0].textContent).to.equal(
        'VA medical center (also called a VAMC)',
      );

      expect(h4Texts).to.include(vaConfirmationText.title);
      expect(h4Texts).to.include(privateConfirmationText.privateTitle);
    });
  });

  describe('MST section', () => {
    it('should not render the option indicator when mstOption is false', () => {
      const data = { ...noEvidenceTest.data, mstOption: false };
      const { container } = createConfirmationPage(data);

      const responseMst = $(
        '[data-testid="confirmation-mst-response"]',
        container,
      );

      expect(responseMst.textContent).to.equal('No');

      const indicatorMst = $(
        '[data-testid="confirmation-mst-option-indicator"]',
        container,
      );

      expect(indicatorMst).to.not.exist;
    });

    it('should render None selected when mstOption is true but optionIndicator is missing', () => {
      const data = {
        ...noEvidenceTest.data,
        mstOption: true,
        optionIndicator: undefined,
      };

      const { container } = createConfirmationPage(data);

      const indicatorMst = $(
        '[data-testid="confirmation-mst-option-indicator"]',
        container,
      );

      expect(indicatorMst.textContent).to.equal('None selected');
    });
  });
});
