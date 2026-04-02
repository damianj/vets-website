import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import { PrivateDetailsConfirmation } from '../../../components/evidence/PrivateDetailsConfirmation';
import { HAS_PRIVATE_LIMITATION } from '../../../constants';
import { confirmationText } from '../../../content/evidence/private';
import { content as authContent } from '../../../components/4142/Authorization';
import { detailsQuestion as limitedConsentDetailsQuestion } from '../../../pages/limitedConsentDetails';
import { promptQuestion as limitedConsentPromptQuestion } from '../../../pages/limitedConsentPrompt';

const buildData = ({
  lcPrompt = false,
  limitedConsent = '',
  privateEvidence = [],
} = {}) => ({
  [HAS_PRIVATE_LIMITATION]: lcPrompt,
  limitedConsent,
  privateEvidence,
});

const buildFacility = ({
  privateTreatmentLocation = 'Test Clinic',
  address = {
    street: '123 Main St',
    street2: '',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    postalCode: '78701',
  },
  issues = { Hypertension: true, Tinnitus: false },
  treatmentStart = '2020-01-15',
  treatmentEnd = '2021-06-20',
} = {}) => ({
  privateTreatmentLocation,
  address,
  issues,
  treatmentStart,
  treatmentEnd,
});

describe('PrivateDetailsConfirmation', () => {
  it('should return null when data is not provided', () => {
    const { container } = render(<PrivateDetailsConfirmation />);
    expect(container.innerHTML).to.equal('');
  });

  it('should return null when data is null', () => {
    const { container } = render(<PrivateDetailsConfirmation data={null} />);
    expect(container.innerHTML).to.equal('');
  });

  describe('authorization and limited consent section', () => {
    it('should render the proper content without limited consent details', () => {
      const data = buildData({ privateEvidence: [buildFacility()] });
      const { container } = render(<PrivateDetailsConfirmation data={data} />);

      const h4s = $$('h4', container);
      const dts = $$('dt', container);
      const dds = $$('dd', container);

      expect(h4s[0].textContent).to.equal(confirmationText.authLCTitle);
      expect(dts[0].textContent).to.equal(authContent.title);
      expect(dds[0].textContent).to.equal(confirmationText.authAcknowledgement);
      expect(dts[1].textContent).to.equal(limitedConsentPromptQuestion);
      expect(dds[1].textContent).to.equal('No');

      const dtTexts = Array.from(dts).map(dt => dt.textContent);
      expect(dtTexts).to.not.include(limitedConsentDetailsQuestion);
    });

    it('should render the proper content with limited consent details', () => {
      const data = buildData({
        lcPrompt: true,
        limitedConsent: 'Only records from 2020',
        privateEvidence: [buildFacility()],
      });

      const { container } = render(<PrivateDetailsConfirmation data={data} />);
      const dts = $$('dt', container);
      const dds = $$('dd', container);

      expect(dds[1].textContent).to.equal('Yes');
      expect(dts[2].textContent).to.equal(limitedConsentDetailsQuestion);
      expect(dds[2].textContent).to.equal(data.limitedConsent);
    });
  });

  describe('private evidence section', () => {
    it('should render the proper content for one facility', () => {
      const data = buildData({ privateEvidence: [buildFacility()] });
      const { container } = render(<PrivateDetailsConfirmation data={data} />);

      const h4s = $$('h4', container);
      const h5 = $('h5', container);

      expect(h4s[1].textContent).to.equal(confirmationText.privateTitle);
      expect(h5.textContent).to.equal('Test Clinic');
    });

    it('should render the proper content multiple facilities', () => {
      const data = buildData({
        privateEvidence: [
          buildFacility({ privateTreatmentLocation: 'Clinic A' }),
          buildFacility({ privateTreatmentLocation: 'Clinic B' }),
          buildFacility({ privateTreatmentLocation: 'Clinic C' }),
        ],
      });
      const { container } = render(<PrivateDetailsConfirmation data={data} />);

      const h5s = $$('h5', container);
      const h4s = $$('h4', container);

      expect(h4s[1].textContent).to.equal(confirmationText.privateTitle);
      expect(h5s.length).to.equal(3);
      expect(h5s[0].textContent).to.equal('Clinic A');
      expect(h5s[1].textContent).to.equal('Clinic B');
      expect(h5s[2].textContent).to.equal('Clinic C');
    });

    it('should add extra bottom margin class to the last facility', () => {
      const data = buildData({
        privateEvidence: [
          buildFacility({ privateTreatmentLocation: 'Clinic A' }),
          buildFacility({ privateTreatmentLocation: 'Clinic B' }),
        ],
      });
      const { container } = render(<PrivateDetailsConfirmation data={data} />);
      const facilityDivs = $$('h5', container).map(h5 => h5.parentElement);
      expect(facilityDivs[0].className).to.not.include(
        'vads-u-margin-bottom--3',
      );
      expect(facilityDivs[1].className).to.include('vads-u-margin-bottom--3');
    });

    it('should add extra bottom margin class when there is only one facility', () => {
      const data = buildData({
        privateEvidence: [buildFacility()],
      });
      const { container } = render(<PrivateDetailsConfirmation data={data} />);
      const facilityDiv = $('h5', container).parentElement;
      expect(facilityDiv.className).to.include('vads-u-margin-bottom--3');
    });
  });
});
