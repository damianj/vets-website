import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import {
  $,
  $$,
} from '@department-of-veterans-affairs/platform-forms-system/ui';
import { LivingSituation } from '../../components/LivingSituation';
import {
  housingRiskTitle,
  livingSituationTitle,
  otherHousingRisksLabel,
  pointOfContactNameLabel,
  pointOfContactPhoneLabel,
} from '../../content/livingSituation';

describe('LivingSituation', () => {
  describe('when housingRisk is false', () => {
    it('should render only the housing risk question with No', () => {
      const data = { housingRisk: false };
      const { container } = render(<LivingSituation data={data} />);

      const dts = $$('dt', container);
      const dds = $$('dd', container);

      expect(dts.length).to.equal(1);
      expect(dts[0].textContent).to.equal(housingRiskTitle);
      expect(dds[0].textContent).to.equal('No');
    });
  });

  describe('when housingRisk is true', () => {
    it('should render the proper content when some fields are skipped', () => {
      const data = {
        housingRisk: true,
        livingSituation: { friendOrFamily: true },
      };

      const { container } = render(<LivingSituation data={data} />);

      const dts = $$('dt', container);
      const dds = $$('dd', container);

      expect(dts.length).to.equal(4);
      expect(dts[0].textContent).to.equal(housingRiskTitle);
      expect(dds[0].textContent).to.equal('Yes');
      expect(dts[1].textContent).to.equal(livingSituationTitle);
      expect(dts[2].textContent).to.equal(pointOfContactNameLabel);
      expect(dds[2].textContent).to.equal('Nothing entered');
      expect(dts[3].textContent).to.equal(pointOfContactPhoneLabel);
      expect(dds[3].textContent).to.equal('Nothing entered');
    });

    it('should render "None selected" when no living situations are selected', () => {
      const data = { housingRisk: true, livingSituation: {} };
      const { container } = render(<LivingSituation data={data} />);

      const dds = $$('dd', container);
      expect(dds[1].textContent).to.equal('None selected');
    });

    it('should render other housing risks when the content is given', () => {
      const data = {
        housingRisk: true,
        livingSituation: { other: true },
        otherHousingRisks: 'Lorem ipsum',
      };

      const { container } = render(<LivingSituation data={data} />);

      const dts = $$('dt', container);
      const dds = $$('dd', container);

      expect(dts.length).to.equal(5);
      expect(dts[2].textContent).to.equal(otherHousingRisksLabel);
      expect(dds[2].textContent).to.equal('Lorem ipsum');
    });

    it('should render "Nothing entered" when otherHousingRisks is empty', () => {
      const data = {
        housingRisk: true,
        livingSituation: { other: true },
      };
      const { container } = render(<LivingSituation data={data} />);

      const dds = $$('dd', container);
      expect(dds[2].textContent).to.equal('Nothing entered');
    });

    it('should render va-telephone element when pointOfContactPhone is provided', () => {
      const data = {
        housingRisk: true,
        livingSituation: { friendOrFamily: true },
        pointOfContactName: 'John Doe',
        pointOfContactPhone: '8005551212',
      };

      const { container } = render(<LivingSituation data={data} />);

      const dds = $$('dd', container);
      expect(dds[2].textContent).to.equal('John Doe');
      expect($('va-telephone', container)).to.exist;
      expect($('va-telephone', container).getAttribute('contact')).to.equal(
        '8005551212',
      );
    });
  });
});
