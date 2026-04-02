import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import { VaDetailsConfirmation } from '../../../components/evidence/VaDetailsConfirmation';
import {
  BEFORE_2005,
  LATER_THAN_2005,
  confirmationText,
} from '../../../content/evidence/va';

const buildLocation = ({
  vaTreatmentLocation = 'Test VA Facility',
  treatmentBefore2005 = 'N',
  treatmentMonthYear = '2020-03',
} = {}) => ({
  vaTreatmentLocation,
  treatmentBefore2005,
  treatmentMonthYear,
});

describe('VaDetailsConfirmation', () => {
  it('should return null when list is not provided', () => {
    const { container } = render(<VaDetailsConfirmation />);
    expect(container.innerHTML).to.equal('');
  });

  it('should return null when list is empty', () => {
    const { container } = render(<VaDetailsConfirmation list={[]} />);
    expect(container.innerHTML).to.equal('');
  });

  describe('VA evidence section', () => {
    it('should render the proper content for one location', () => {
      const list = [buildLocation()];
      const { container } = render(<VaDetailsConfirmation list={list} />);

      const h4s = $$('h4', container);
      const h5 = $('h5', container);

      expect(h4s[0].textContent).to.equal(confirmationText.title);
      expect(h5.textContent).to.equal('Test VA Facility');
    });

    it('should render the proper content for multiple locations', () => {
      const list = [
        buildLocation({ vaTreatmentLocation: 'Facility A' }),
        buildLocation({ vaTreatmentLocation: 'Facility B' }),
        buildLocation({ vaTreatmentLocation: 'Facility C' }),
      ];
      const { container } = render(<VaDetailsConfirmation list={list} />);

      const h4s = $$('h4', container);
      const h5s = $$('h5', container);

      expect(h4s[0].textContent).to.equal(confirmationText.title);
      expect(h5s.length).to.equal(3);
      expect(h5s[0].textContent).to.equal('Facility A');
      expect(h5s[1].textContent).to.equal('Facility B');
      expect(h5s[2].textContent).to.equal('Facility C');
    });

    it('should render treatment date as 2005 or later when treatmentBefore2005 is not Y', () => {
      const list = [buildLocation({ treatmentBefore2005: 'N' })];
      const { container } = render(<VaDetailsConfirmation list={list} />);

      const p = $('p', container);
      expect(p.textContent).to.equal(LATER_THAN_2005);
    });

    it('should render treatment date with Before 2005 prefix when treatmentBefore2005 is Y', () => {
      const list = [
        buildLocation({
          treatmentBefore2005: 'Y',
          treatmentMonthYear: '2003-06',
        }),
      ];
      const { container } = render(<VaDetailsConfirmation list={list} />);

      const p = $('p', container);
      expect(p.textContent).to.include(BEFORE_2005);
    });

    it('should add extra bottom margin class to the last location', () => {
      const list = [
        buildLocation({ vaTreatmentLocation: 'Facility A' }),
        buildLocation({ vaTreatmentLocation: 'Facility B' }),
      ];
      const { container } = render(<VaDetailsConfirmation list={list} />);
      const locationDivs = $$('h5', container).map(h5 => h5.parentElement);
      expect(locationDivs[0].className).to.not.include(
        'vads-u-margin-bottom--3',
      );
      expect(locationDivs[1].className).to.include('vads-u-margin-bottom--3');
    });

    it('should add extra bottom margin class when there is only one location', () => {
      const list = [buildLocation()];
      const { container } = render(<VaDetailsConfirmation list={list} />);
      const locationDiv = $('h5', container).parentElement;
      expect(locationDiv.className).to.include('vads-u-margin-bottom--3');
    });
  });
});
