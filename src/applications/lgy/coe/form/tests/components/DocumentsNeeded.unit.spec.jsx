import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import DocumentsNeeded from '../../components/DocumentsNeeded';
import { serviceStatuses } from '../../constants';

const homeLoanEvidence = 'Evidence a VA loan was paid in full, if applicable';
const multipleDocuments =
  'You may upload any of the recommended listed documents to support your COE application:';
const purpleHeartCertificateCopy = 'A copy of your Purple Heart certificate';
const statementOfService = 'Statement of Service';
const proofOfCharacterOfService =
  'Proof of character of service such as a DD214 with accompanying DD214-1, or Department of Defense Discharge Certificate';
const NGBForm22 =
  'Separation and Report of Service (NGB Form 22) for each period of National Guard service';
const NGBForm23 = 'Retirement Points Accounting (NGB Form 23)';
const yearsServedOrRetirementPoints =
  'Creditable number of years served or Retirement Points Statement or equivalent';
const retirementPointAccounting = 'Retirement Point Accounting';

describe('DocumentsNeeded', () => {
  describe('VETERAN status', () => {
    it('should display single document message without hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.VETERAN,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include(
        'You may upload a copy of your discharge or separation papers (DD214) showing character of service',
      );
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display multiple documents message with hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.VETERAN,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(
        'A copy of your discharge or separation papers (DD214) showing character of service',
      );
      expect(text).to.include(homeLoanEvidence);
    });
  });

  describe('ADSM status', () => {
    it('should display single document message without Purple Heart or restoration', () => {
      const formData = {
        identity: serviceStatuses.ADSM,
        militaryHistory: {
          purpleHeartRecipient: false,
        },
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include('You may upload a Statement of Service');
      expect(text).to.not.include(purpleHeartCertificateCopy);
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display multiple documents with Purple Heart', () => {
      const formData = {
        identity: serviceStatuses.ADSM,
        militaryHistory: {
          purpleHeartRecipient: true,
        },
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(statementOfService);
      expect(text).to.include(purpleHeartCertificateCopy);
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display multiple documents with hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.ADSM,
        militaryHistory: {
          purpleHeartRecipient: false,
        },
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(statementOfService);
      expect(text).to.not.include(purpleHeartCertificateCopy);
      expect(text).to.include(homeLoanEvidence);
    });

    it('should display all documents with Purple Heart and hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.ADSM,
        militaryHistory: {
          purpleHeartRecipient: true,
        },
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(statementOfService);
      expect(text).to.include(purpleHeartCertificateCopy);
      expect(text).to.include(homeLoanEvidence);
    });
  });

  describe('NADNA status', () => {
    it('should display required documents without hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.NADNA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(statementOfService);
      expect(text).to.include(yearsServedOrRetirementPoints);
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display required documents with hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.NADNA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(statementOfService);
      expect(text).to.include(yearsServedOrRetirementPoints);
      expect(text).to.include(homeLoanEvidence);
    });
  });

  describe('DNANA status', () => {
    it('should display required documents without restoration', () => {
      const formData = {
        identity: serviceStatuses.DNANA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(NGBForm22);
      expect(text).to.include(NGBForm23);
      expect(text).to.include(proofOfCharacterOfService);
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display required documents with hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.DNANA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(NGBForm22);
      expect(text).to.include(NGBForm23);
      expect(text).to.include(proofOfCharacterOfService);
      expect(text).to.include(homeLoanEvidence);
    });
  });

  describe('DRNA status', () => {
    it('should display required documents without hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.DRNA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans={false} />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(retirementPointAccounting);
      expect(text).to.include(proofOfCharacterOfService);
      expect(text).to.not.include(homeLoanEvidence);
    });

    it('should display required documents with hadPriorLoans', () => {
      const formData = {
        identity: serviceStatuses.DRNA,
      };
      const { container } = render(
        <DocumentsNeeded formData={formData} hadPriorLoans />,
      );
      const text = container.textContent;
      expect(text).to.include(multipleDocuments);
      expect(text).to.include(retirementPointAccounting);
      expect(text).to.include(proofOfCharacterOfService);
      expect(text).to.include(homeLoanEvidence);
    });
  });
});
