import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import UploadInformation from '../../components/UploadInformation';
import { serviceStatuses } from '../../constants';

describe('UploadInformation component', () => {
  describe('accordion display', () => {
    const statusesWithStatementOfServiceAccordion = [
      serviceStatuses.VETERAN,
      serviceStatuses.ADSM,
      serviceStatuses.NADNA,
    ];

    const statusesWithoutStatementOfServiceAccordion = [
      serviceStatuses.DNANA,
      serviceStatuses.DRNA,
    ];

    statusesWithStatementOfServiceAccordion.forEach(status => {
      it(`should display Statement of service accordion item for ${status} service status`, () => {
        const { getByTestId } = render(
          <UploadInformation formData={{ identity: status }} />,
        );
        const accordion = getByTestId('document-upload-accordion');
        expect(accordion).to.exist;
        expect(accordion.textContent).to.include('Statement of service');
      });
    });

    statusesWithoutStatementOfServiceAccordion.forEach(status => {
      it(`should not display accordion for ${status} service status when user does not have a VA home loan`, () => {
        const { container } = render(
          <UploadInformation formData={{ identity: status }} />,
        );
        const accordion = container.querySelector(
          '[data-testid="document-upload-accordion"]',
        );
        expect(accordion).to.not.exist;
      });
    });

    it('should display loan evidence accordion item when user has a property with a VA home loan', () => {
      const { getByTestId } = render(
        <UploadInformation
          formData={{ identity: serviceStatuses.VETERAN }}
          hadPriorLoans
        />,
      );
      const accordion = getByTestId('document-upload-accordion');
      expect(accordion).to.exist;
      expect(accordion.textContent).to.include(
        'Type of evidence to show a VA loan was paid in full',
      );
    });

    it('should display accordion for DNANA when user has a property with a VA home loan', () => {
      const { getByTestId } = render(
        <UploadInformation
          formData={{ identity: serviceStatuses.DNANA }}
          hadPriorLoans
        />,
      );
      const accordion = getByTestId('document-upload-accordion');
      expect(accordion).to.exist;
      expect(accordion.textContent).to.include(
        'Type of evidence to show a VA loan was paid in full',
      );
    });

    it('should display both accordion items for VETERAN when user has a property with a VA home loan', () => {
      const { getByTestId } = render(
        <UploadInformation
          formData={{ identity: serviceStatuses.VETERAN }}
          hadPriorLoans
        />,
      );
      const accordion = getByTestId('document-upload-accordion');
      expect(accordion).to.exist;
      expect(accordion.textContent).to.include('Statement of service');
      expect(accordion.textContent).to.include(
        'Type of evidence to show a VA loan was paid in full',
      );
    });
  });
});
