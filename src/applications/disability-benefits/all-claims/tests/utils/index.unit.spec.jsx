import { expect } from 'chai';
import sinon from 'sinon';
import {
  isCompletingModern4142,
  baseDoNew4142Logic,
  onFormLoaded,
  redirectLegacyToEnhancement,
  redirectEnhancementToLegacy,
  normalizeReturnUrlForResume,
} from '../../utils';

describe('utils', () => {
  describe('isCompletingModern4142', () => {
    it('should return true if disability526Enable2024Form4142 is true', () => {
      const formData = { disability526Enable2024Form4142: true };
      expect(isCompletingModern4142(formData)).to.be.true;
    });

    it('should return false if disability526Enable2024Form4142 is false', () => {
      const formData = { disability526Enable2024Form4142: false };
      expect(isCompletingModern4142(formData)).to.be.false;
    });
  });

  describe('baseDoNew4142Logic', () => {
    it('should return true if all conditions are met', () => {
      const formData = {
        disability526Enable2024Form4142: true,
        'view:hasEvidence': true,
        'view:selectableEvidenceTypes': {
          'view:hasPrivateMedicalRecords': true,
        },
        'view:patientAcknowledgement': { 'view:acknowledgement': true },
        'view:uploadPrivateRecordsQualifier': {
          'view:hasPrivateRecordsToUpload': false,
        },
        patient4142Acknowledgement: false,
      };
      expect(baseDoNew4142Logic(formData)).to.be.true;
    });

    it('should return false if any condition is not met', () => {
      const formData = {
        disability526Enable2024Form4142: false,
      };
      expect(baseDoNew4142Logic(formData)).to.be.false;
    });
  });

  describe('onFormLoaded', () => {
    const expectRedirect = ({ returnUrl, formData, expected }) => {
      const router = { push: sinon.spy() };
      onFormLoaded({ returnUrl, formData, router });
      expect(router.push.calledWith(expected)).to.be.true;
    };

    it('should redirect to modern 4142 choice if conditions are met', () => {
      const router = { push: sinon.spy() };
      const formData = {
        disability526Enable2024Form4142: true,
        'view:hasEvidence': true,
        'view:patientAcknowledgement': { 'view:acknowledgement': true },
        'view:uploadPrivateRecordsQualifier': {
          'view:hasPrivateRecordsToUpload': false,
        },
        'view:selectableEvidenceTypes': {
          'view:hasPrivateMedicalRecords': true,
        },
        patient4142Acknowledgement: false,
      };
      onFormLoaded({ formData, router });
      expect(
        router.push.calledWith('/supporting-evidence/private-medical-records'),
      ).to.be.true;
    });

    it('should redirect to evidence-request when legacy upload to enhancement transition needed', () => {
      expectRedirect({
        returnUrl: '/supporting-evidence/private-medical-records-upload',
        formData: { disability526SupportingEvidenceEnhancement: true },
        expected: '/supporting-evidence/evidence-request',
      });
    });

    it('should redirect to evidence-types when enhancement to legacy transition needed', () => {
      expectRedirect({
        returnUrl: '/supporting-evidence/evidence-request',
        formData: { disability526SupportingEvidenceEnhancement: false },
        expected: '/supporting-evidence/evidence-types',
      });
    });
  });

  describe('redirectLegacyToEnhancement', () => {
    const legacyUrls = [
      '/supporting-evidence/evidence-types',
      '/supporting-evidence/private-medical-records-upload',
      '/supporting-evidence/additional-evidence',
    ];

    it('should return true when returnUrl matches legacy pages and formData indicates enhancement flow', () => {
      legacyUrls.forEach(url => {
        expect(
          redirectLegacyToEnhancement({
            returnUrl: url,
            formData: { disability526SupportingEvidenceEnhancement: true },
          }),
        ).to.be.true;
      });
    });

    it('should return false otherwise', () => {
      const cases = [
        {
          returnUrl: '/supporting-evidence/evidence-request',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/evidence-types',
          formData: { disability526SupportingEvidenceEnhancement: false },
        },
        {
          returnUrl:
            '/supporting-evidence/private-medical-records-upload?someParam=true',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/private-medical-records-upload',
          formData: { disability526SupportingEvidenceEnhancement: false },
        },
      ];

      cases.forEach(testCase => {
        expect(redirectLegacyToEnhancement(testCase)).to.be.false;
      });
    });
  });

  describe('redirectEnhancementToLegacy', () => {
    it('should return true when returnUrl matches enhancement pages and formData indicates legacy flow', () => {
      const enhancementUrls = [
        '/supporting-evidence/evidence-request',
        '/supporting-evidence/medical-records',
        '/supporting-evidence/private-medical-records-upload-evidence',
        '/supporting-evidence/private-medical-records-upload-file',
        '/supporting-evidence/additional-evidence-intro',
        '/supporting-evidence/additional-evidence-upload-file',
        '/supporting-evidence/additional-evidence-upload',
      ];

      enhancementUrls.forEach(url => {
        expect(
          redirectEnhancementToLegacy({
            returnUrl: url,
            formData: { disability526SupportingEvidenceEnhancement: false },
          }),
        ).to.be.true;
      });
    });

    it('should return false otherwise', () => {
      const cases = [
        {
          returnUrl: '/supporting-evidence/evidence-request',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/evidence-types',
          formData: { disability526SupportingEvidenceEnhancement: false },
        },
        {
          returnUrl:
            '/supporting-evidence/private-medical-records-upload-evidence',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/private-medical-records-upload-file',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/additional-evidence-intro',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/additional-evidence-enhancement',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
        {
          returnUrl: '/supporting-evidence/additional-evidence-enhancement-v1',
          formData: { disability526SupportingEvidenceEnhancement: true },
        },
      ];

      cases.forEach(testCase => {
        expect(redirectEnhancementToLegacy(testCase)).to.be.false;
      });
    });
  });

  describe('normalizeReturnUrlForResume', () => {
    it('rewrites traumatic event item pages to events-summary', () => {
      expect(
        normalizeReturnUrlForResume('/mental-health-form-0781/0/event-details'),
      ).to.equal('/mental-health-form-0781/events-summary');
      expect(
        normalizeReturnUrlForResume('/mental-health-form-0781/1/event-report'),
      ).to.equal('/mental-health-form-0781/events-summary');
    });

    it('rewrites conditions item pages to conditions/summary', () => {
      expect(normalizeReturnUrlForResume('/conditions/0/condition')).to.equal(
        '/conditions/summary',
      );
      expect(
        normalizeReturnUrlForResume('/conditions/1/new-condition-date'),
      ).to.equal('/conditions/summary');
      expect(normalizeReturnUrlForResume('/conditions/1/cause-new')).to.equal(
        '/conditions/summary',
      );
      expect(
        normalizeReturnUrlForResume('/conditions/1/cause-secondary'),
      ).to.equal('/conditions/summary');
    });

    it('returns unchanged URL for non-item pages', () => {
      const url = '/mental-health-form-0781/events-summary';
      expect(normalizeReturnUrlForResume(url)).to.equal(url);
    });

    it('returns unchanged for undefined or empty', () => {
      expect(normalizeReturnUrlForResume(undefined)).to.be.undefined;
      expect(normalizeReturnUrlForResume('')).to.equal('');
    });
  });
});
