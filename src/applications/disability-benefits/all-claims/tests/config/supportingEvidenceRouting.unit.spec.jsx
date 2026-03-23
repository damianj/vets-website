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
  /**
   * Truth table: BDD users with STR upload + other evidence selected.
   * 2×2 grid of SHA workflow × Supporting Evidence Enhancement flags.
   */
  describe('BDD + SHA OFF + Enhancement OFF', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: false,
      disability526SupportingEvidenceEnhancement: false,
      disability526SupportingEvidenceFileInputV3: false,
      'view:hasSeparationHealthAssessment': false,
      'view:hasMedicalRecords': false,
      'view:uploadServiceTreatmentRecordsQualifier': {
        'view:hasServiceTreatmentRecordsToUpload': true,
      },
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': false,
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
        'serviceTreatmentRecords',
        'serviceTreatmentRecordsAttachments',
        'evidenceTypesBDD',
        'additionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('BDD + SHA ON + Enhancement OFF', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: true,
      disability526SupportingEvidenceEnhancement: false,
      disability526SupportingEvidenceFileInputV3: false,
      'view:hasSeparationHealthAssessment': true,
      'view:hasMedicalRecords': false,
      'view:uploadServiceTreatmentRecordsQualifier': {
        'view:hasServiceTreatmentRecordsToUpload': true,
      },
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': false,
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
        'serviceTreatmentRecordsAttachments',
        'evidenceTypesBDD',
        'additionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('BDD + SHA OFF + Enhancement ON', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: false,
      disability526SupportingEvidenceEnhancement: true,
      disability526SupportingEvidenceFileInputV3: true,
      'view:hasSeparationHealthAssessment': false,
      'view:hasMedicalRecords': false,
      'view:uploadServiceTreatmentRecordsQualifier': {
        'view:hasServiceTreatmentRecordsToUpload': true,
      },
      'view:selectableEvidenceTypes': {
        'view:hasVaMedicalRecords': false,
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
        'serviceTreatmentRecords',
        'serviceTreatmentRecordsAttachments',
        'evidenceTypesBDD',
        'evidenceChoiceAdditionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('BDD + SHA ON + Enhancement ON', () => {
    const formData = createBDDFormData({
      disability526NewBddShaEnforcementWorkflowEnabled: true,
      disability526SupportingEvidenceEnhancement: true,
      disability526SupportingEvidenceFileInputV3: true,
      'view:hasSeparationHealthAssessment': true,
      'view:hasMedicalRecords': false,
      'view:uploadServiceTreatmentRecordsQualifier': {
        'view:hasServiceTreatmentRecordsToUpload': true,
      },
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
        'serviceTreatmentRecordsAttachments',
        'evidenceTypesBDD',
        'vaMedicalRecords',
        'evidenceChoiceAdditionalDocuments',
        'summaryOfEvidence',
        'howClaimsWork',
      ]);
    });
  });

  describe('Non-BDD Enhancement (baseline)', () => {
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
