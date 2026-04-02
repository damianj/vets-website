import {
  HAS_OTHER_EVIDENCE,
  HAS_PRIVATE_EVIDENCE,
  HAS_VA_EVIDENCE,
  HAS_PRIVATE_LIMITATION,
  MST_OPTION,
  PRIVATE_EVIDENCE_KEY,
  VA_TREATMENT_BEFORE_2005_KEY,
  VA_EVIDENCE_KEY,
} from '../constants';

export const hasPrivateEvidence = formData =>
  !!formData?.[HAS_PRIVATE_EVIDENCE];
export const hasPrivateLimitation = formData =>
  hasPrivateEvidence(formData) && !!formData?.[HAS_PRIVATE_LIMITATION];
export const hasVAEvidence = formData => formData?.[HAS_VA_EVIDENCE];
export const hasOtherEvidence = formData => formData?.[HAS_OTHER_EVIDENCE];
export const hasMstOption = formData => formData?.[MST_OPTION];
export const hasHousingRisk = formData => formData?.housingRisk;
export const hasOtherHousingRisk = formData =>
  !!(hasHousingRisk(formData) && formData?.livingSituation?.other);
export const getVAEvidence = formData =>
  (hasVAEvidence(formData) && formData?.locations) || [];
export const getPrivateEvidence = formData =>
  (hasPrivateEvidence(formData) && formData?.providerFacility) || [];
export const getOtherEvidence = formData =>
  (hasOtherEvidence(formData) && formData?.additionalDocuments) || [];
export const getArrayBuilderVAEvidence = formData =>
  formData?.[VA_EVIDENCE_KEY] || [];
export const hasArrayBuilderVAEvidence = formData =>
  getArrayBuilderVAEvidence(formData)?.length;
export const getArrayBuilderPrivateEvidence = formData =>
  formData?.[PRIVATE_EVIDENCE_KEY] || [];
export const hasArrayBuilderPrivateEvidence = formData =>
  getArrayBuilderPrivateEvidence(formData)?.length;

// VA Evidence List & Loop
export const hasTreatmentBefore2005 = (formData, index) =>
  formData?.[VA_EVIDENCE_KEY]?.[index]?.[VA_TREATMENT_BEFORE_2005_KEY] === 'Y';
