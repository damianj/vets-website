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
});
