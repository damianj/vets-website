import { formatFullName } from '../utils/helpers';
import { formatIsoDate, maskSsn, sanitize } from './transformers/helpers';
import { normalizeSsn } from './transformers/normalize';
import { servicesOptions } from '../utils/labels';

const normalizeName = str =>
  (str || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

// Looks up the human-readable label for a 534 service branch value.
// Falls back to sanitize() for unrecognized values.
const formatBranchLabel = val =>
  servicesOptions.find(o => o.value === val)?.label ?? sanitize(val);

export const VETERAN_INFO_FIELDS = [
  {
    label: 'Veteran name',
    editPath: 'veteran',
    getFormValue: formData => formData.veteranFullName,
    normalize: val => normalizeName(formatFullName(val || {})),
    formatValue: val => formatFullName(val || {}),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      veteranFullName: {
        ...(formData.veteranFullName || {}),
        ...canonicalValue,
      },
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        getArtifactValue: entry =>
          entry.veteranName?.first && entry.veteranName?.last
            ? entry.veteranName
            : null,
        formatArtifactValue: val => formatFullName(val || {}),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          veteranName: canonicalValue,
        }),
      },
      {
        artifactKey: 'deathCertificates',
        docTypeLabel: 'death certificate',
        getArtifactValue: entry =>
          entry.decendentFullName?.first && entry.decendentFullName?.last
            ? entry.decendentFullName
            : null,
        formatArtifactValue: val => formatFullName(val || {}),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          decendentFullName: canonicalValue,
        }),
      },
    ],
  },
  {
    label: 'Social Security number',
    editPath: 'veteran-identification',
    getFormValue: formData => formData.veteranSocialSecurityNumber?.ssn,
    // Both form and artifacts store bare 9 digits (schema: "^[0-9]{9}$").
    normalize: val => val || '',
    formatValue: val => maskSsn(val),
    // canonicalValue is bare 9 digits; write it as-is to match the schema pattern.
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      veteranSocialSecurityNumber: {
        ...(formData.veteranSocialSecurityNumber || {}),
        ssn: canonicalValue || '',
      },
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        getArtifactValue: entry => normalizeSsn(entry.veteranSsn) || null,
        formatArtifactValue: val =>
          maskSsn((val || '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          veteranSsn: (canonicalValue || '').replace(/\D/g, ''),
        }),
      },
      {
        artifactKey: 'deathCertificates',
        docTypeLabel: 'death certificate',
        getArtifactValue: entry => normalizeSsn(entry.decendentSsn) || null,
        formatArtifactValue: val =>
          maskSsn((val || '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          decendentSsn: (canonicalValue || '').replace(/\D/g, ''),
        }),
      },
    ],
  },
  {
    label: 'Date of birth',
    editPath: 'veteran',
    getFormValue: formData => formData.veteranDateOfBirth,
    // Both form and artifact use ISO YYYY-MM-DD after normalization.
    normalize: val => val || '',
    formatValue: val => formatIsoDate(val),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      veteranDateOfBirth: canonicalValue,
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        getArtifactValue: entry => entry.veteranDob || null,
        formatArtifactValue: val => formatIsoDate(val),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          veteranDob: canonicalValue,
        }),
      },
    ],
  },
  {
    label: 'Date of death',
    editPath: 'veteran-additional-information',
    getFormValue: formData => formData.veteranDateOfDeath,
    normalize: val => val || '',
    formatValue: val => formatIsoDate(val),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      veteranDateOfDeath: canonicalValue,
    }),
    artifacts: [
      {
        artifactKey: 'deathCertificates',
        docTypeLabel: 'death certificate',
        getArtifactValue: entry => entry.decendentDateOfDeath || null,
        formatArtifactValue: val => formatIsoDate(val),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          decendentDateOfDeath: canonicalValue,
        }),
      },
    ],
  },
];

export const MILITARY_HISTORY_FIELDS = [
  {
    label: 'Branch of service',
    editPath: 'service-period',
    getFormValue: formData => formData.serviceBranch,
    // Both form and artifact are 534 values ('army', 'airForce', etc.) after
    // normalization, so exact match is sufficient.
    normalize: val => val || '',
    formatValue: val => formatBranchLabel(val),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      serviceBranch: canonicalValue,
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        // normalizeSections mapped the IDP string to a 534 value
        getArtifactValue: entry => entry.branchOfService || null,
        formatArtifactValue: val => formatBranchLabel(val),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          branchOfService: canonicalValue,
        }),
      },
    ],
  },
  {
    label: 'Date entered active service',
    editPath: 'service-period',
    getFormValue: formData => formData.activeServiceDateRange?.from,
    normalize: val => val || '',
    formatValue: val => formatIsoDate(val),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      activeServiceDateRange: {
        ...(formData.activeServiceDateRange || {}),
        from: canonicalValue,
      },
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        getArtifactValue: entry => entry.dateEnteredActiveService || null,
        formatArtifactValue: val => formatIsoDate(val),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          dateEnteredActiveService: canonicalValue,
        }),
      },
    ],
  },
  {
    label: 'Date separated from service',
    editPath: 'service-period',
    getFormValue: formData => formData.activeServiceDateRange?.to,
    normalize: val => val || '',
    formatValue: val => formatIsoDate(val),
    applyToForm: (formData, canonicalValue) => ({
      ...formData,
      activeServiceDateRange: {
        ...(formData.activeServiceDateRange || {}),
        to: canonicalValue,
      },
    }),
    artifacts: [
      {
        artifactKey: 'dd214',
        docTypeLabel: 'DD-214',
        getArtifactValue: entry => entry.dateSeparatedFromService || null,
        formatArtifactValue: val => formatIsoDate(val),
        setArtifactValue: (entry, canonicalValue) => ({
          ...entry,
          dateSeparatedFromService: canonicalValue,
        }),
      },
    ],
  },
];
