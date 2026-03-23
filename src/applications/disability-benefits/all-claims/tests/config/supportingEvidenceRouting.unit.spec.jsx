import { expect } from 'chai';
import { add, format } from 'date-fns';
import { DATE_TEMPLATE } from '../../utils/dates/formatting';
import formConfig from '../../config/form';

const formatDate = date => format(date, DATE_TEMPLATE);
const daysFromToday = days => formatDate(add(new Date(), { days }));

/**
 * Returns all pages from the supportingEvidence chapter as [name, pageConfig]
 * entries for easy iteration.
 */
const getSupportingEvidencePages = () =>
  Object.entries(formConfig.chapters.supportingEvidence.pages);

/**
 * Given formData, returns the ordered list of page names whose `depends`
 * predicate returns true (or that have no `depends`, meaning always shown).
 */
const getVisiblePages = formData =>
  getSupportingEvidencePages()
    .filter(([, page]) => !page.depends || page.depends(formData))
    .map(([name]) => name);

/**
 * Creates BDD form data with a separation date 90 days out (valid BDD window).
 */
const createBDDFormData = (overrides = {}) => ({
  'view:isBddData': true,
  serviceInformation: {
    servicePeriods: [
      {
        dateRange: {
          to: daysFromToday(90),
        },
      },
    ],
  },
  ...overrides,
});

describe('Supporting Evidence Routing — Scenario Validation', () => {
  describe('Scenario 1: BDD + Enhancement + SHA-only', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: true,
      disability526SupportingEvidenceEnhancement: true,
      disability526SupportingEvidenceFileInputV3: true,
      'view:hasSeparationHealthAssessment': true,
      'view:hasMedicalRecords': false,
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': false,
        'view:hasPrivateMedicalRecords': false,
        'view:hasOtherEvidence': false,
      },
      'view:uploadPrivateRecordsQualifier': {
        'view:hasPrivateRecordsToUpload': false,
      },
    });

    it('should show SHA pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('separationHealthAssessment');
      expect(visible).to.include('separationHealthAssessmentUpload');
    });

    it('should show BDD evidence types page', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceTypesBDD');
    });

    it('should NOT show enhancement intro page (evidenceChoiceIntro)', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceChoiceIntro');
    });

    it('should NOT show enhancement evidence request or medical records pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceRequest');
      expect(visible).to.not.include('medicalRecords');
    });

    it('should NOT show legacy evidence types page', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceTypes');
    });

    it('should show summary of evidence', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('summaryOfEvidence');
    });

    it('should produce the expected full page sequence', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.deep.equal([
        'orientation',
        'separationHealthAssessment',
        'separationHealthAssessmentUpload',
        'serviceTreatmentRecords',
        'evidenceTypesBDD',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('Scenario 2: BDD + Enhancement + SHA + Other Evidence', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: true,
      disability526SupportingEvidenceEnhancement: true,
      disability526SupportingEvidenceFileInputV3: true,
      'view:hasSeparationHealthAssessment': true,
      'view:hasMedicalRecords': true,
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': true,
        'view:hasPrivateMedicalRecords': false,
        'view:hasOtherEvidence': true,
      },
      'view:uploadPrivateRecordsQualifier': {
        'view:hasPrivateRecordsToUpload': false,
      },
    });

    it('should show SHA pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('separationHealthAssessment');
      expect(visible).to.include('separationHealthAssessmentUpload');
    });

    it('should show BDD evidence types and VA medical records pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceTypesBDD');
      expect(visible).to.include('vaMedicalRecords');
    });

    it('should NOT show enhancement intro or enhancement evidence request pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceChoiceIntro');
      expect(visible).to.not.include('evidenceRequest');
      expect(visible).to.not.include('medicalRecords');
    });

    it('should show enhancement additional documents upload (hasOtherEvidence + enhancement + v3)', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceChoiceAdditionalDocuments');
    });

    it('should NOT show legacy evidence types or legacy additional documents', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceTypes');
      expect(visible).to.not.include('additionalDocuments');
    });

    it('should produce the expected full page sequence', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.deep.equal([
        'orientation',
        'separationHealthAssessment',
        'separationHealthAssessmentUpload',
        'serviceTreatmentRecords',
        'evidenceTypesBDD',
        'vaMedicalRecords',
        'evidenceChoiceAdditionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('Scenario 3: BDD Non-Enhancement (baseline)', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: true,
      disability526SupportingEvidenceEnhancement: false,
      disability526SupportingEvidenceFileInputV3: false,
      'view:hasSeparationHealthAssessment': true,
      'view:hasMedicalRecords': false,
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': false,
        'view:hasPrivateMedicalRecords': false,
        'view:hasOtherEvidence': false,
      },
      'view:uploadPrivateRecordsQualifier': {
        'view:hasPrivateRecordsToUpload': false,
      },
    });

    it('should show SHA pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('separationHealthAssessment');
      expect(visible).to.include('separationHealthAssessmentUpload');
    });

    it('should show BDD evidence types page', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceTypesBDD');
    });

    it('should NOT show enhancement pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceChoiceIntro');
      expect(visible).to.not.include('evidenceRequest');
      expect(visible).to.not.include('medicalRecords');
      expect(visible).to.not.include('evidenceChoiceAdditionalDocuments');
      expect(visible).to.not.include('evidenceChoiceAdditionalDocumentsV1');
    });

    it('should NOT show legacy non-BDD evidence types page', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceTypes');
    });

    it('should produce the expected full page sequence', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.deep.equal([
        'orientation',
        'separationHealthAssessment',
        'separationHealthAssessmentUpload',
        'serviceTreatmentRecords',
        'evidenceTypesBDD',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('Scenario 4: Non-BDD Enhancement (baseline)', () => {
    const formData = {
      'view:isBddData': false,
      disability526NewBddShaEnforcementWorkflowEnabled: false,
      disability526SupportingEvidenceEnhancement: true,
      disability526SupportingEvidenceFileInputV3: true,
      'view:hasSeparationHealthAssessment': false,
      'view:hasMedicalRecords': true,
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': true,
        'view:hasPrivateMedicalRecords': false,
        'view:hasOtherEvidence': true,
      },
      'view:uploadPrivateRecordsQualifier': {
        'view:hasPrivateRecordsToUpload': false,
      },
    };

    it('should NOT show BDD-specific pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('separationHealthAssessment');
      expect(visible).to.not.include('separationHealthAssessmentUpload');
      expect(visible).to.not.include('serviceTreatmentRecords');
      expect(visible).to.not.include('serviceTreatmentRecordsAttachments');
      expect(visible).to.not.include('evidenceTypesBDD');
    });

    it('should show enhancement evidence request and medical records pages', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceRequest');
      expect(visible).to.include('medicalRecords');
    });

    it('should show enhancement intro page (evidenceChoiceIntro)', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('evidenceChoiceIntro');
    });

    it('should show VA medical records page', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.include('vaMedicalRecords');
    });

    it('should NOT show legacy evidence types or legacy additional documents', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.not.include('evidenceTypes');
      expect(visible).to.not.include('additionalDocuments');
    });

    it('should produce the expected full page sequence', () => {
      const visible = getVisiblePages(formData);
      expect(visible).to.deep.equal([
        'orientation',
        'evidenceRequest',
        'medicalRecords',
        'vaMedicalRecords',
        'evidenceChoiceIntro',
        'evidenceChoiceAdditionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('Mutual exclusivity: BDD vs Enhancement evidence selection', () => {
    it('should never show both evidenceTypesBDD and evidenceChoiceIntro for the same user', () => {
      const scenarios = [
        // BDD + Enhancement
        createBDDFormData({
          disability526NewBddShaEnforcementWorkflowEnabled: true,
          disability526SupportingEvidenceEnhancement: true,
        }),
        // BDD only
        createBDDFormData({
          disability526NewBddShaEnforcementWorkflowEnabled: true,
          disability526SupportingEvidenceEnhancement: false,
        }),
        // Enhancement only
        {
          disability526NewBddShaEnforcementWorkflowEnabled: false,
          disability526SupportingEvidenceEnhancement: true,
        },
        // Neither
        {
          disability526NewBddShaEnforcementWorkflowEnabled: false,
          disability526SupportingEvidenceEnhancement: false,
        },
      ];

      scenarios.forEach(formData => {
        const visible = getVisiblePages(formData);
        const hasBDD = visible.includes('evidenceTypesBDD');
        const hasEnhancementIntro = visible.includes('evidenceChoiceIntro');
        expect(
          hasBDD && hasEnhancementIntro,
          `Both evidenceTypesBDD and evidenceChoiceIntro shown for formData: ${JSON.stringify(
            formData,
            null,
            2,
          )}`,
        ).to.be.false;
      });
    });

    it('should never show both evidenceTypesBDD and evidenceRequest for the same user', () => {
      const scenarios = [
        createBDDFormData({
          disability526SupportingEvidenceEnhancement: true,
        }),
        createBDDFormData({
          disability526SupportingEvidenceEnhancement: false,
        }),
        { disability526SupportingEvidenceEnhancement: true },
        { disability526SupportingEvidenceEnhancement: false },
      ];

      scenarios.forEach(formData => {
        const visible = getVisiblePages(formData);
        const hasBDD = visible.includes('evidenceTypesBDD');
        const hasRequest = visible.includes('evidenceRequest');
        expect(
          hasBDD && hasRequest,
          `Both evidenceTypesBDD and evidenceRequest shown for formData: ${JSON.stringify(
            formData,
            null,
            2,
          )}`,
        ).to.be.false;
      });
    });

    it('should never show both legacy evidenceTypes and enhancement evidenceRequest for the same user', () => {
      const scenarios = [
        { disability526SupportingEvidenceEnhancement: true },
        { disability526SupportingEvidenceEnhancement: false },
        createBDDFormData({
          disability526SupportingEvidenceEnhancement: true,
        }),
        createBDDFormData({
          disability526SupportingEvidenceEnhancement: false,
        }),
      ];

      scenarios.forEach(formData => {
        const visible = getVisiblePages(formData);
        const hasLegacy = visible.includes('evidenceTypes');
        const hasRequest = visible.includes('evidenceRequest');
        expect(
          hasLegacy && hasRequest,
          `Both evidenceTypes and evidenceRequest shown for formData: ${JSON.stringify(
            formData,
            null,
            2,
          )}`,
        ).to.be.false;
      });
    });
  });
});
