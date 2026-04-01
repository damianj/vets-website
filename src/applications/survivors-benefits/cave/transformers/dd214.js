import { sanitize, formatIsoDate, maskSsn } from './helpers';

export const transformDd214Entry = data => {
  const entry = data || {};
  const name = entry.veteranName || {};
  return [
    {
      heading: "Veteran's information",
      rows: [
        { label: 'First name', value: sanitize(name.first) },
        { label: 'Middle name', value: sanitize(name.middle) },
        { label: 'Last name', value: sanitize(name.last) },
        { label: 'Suffix', value: sanitize(name.suffix) },
        {
          label: 'Social Security number',
          value: maskSsn(entry.veteranSsn),
        },
        { label: 'Date of birth', value: formatIsoDate(entry.veteranDob) },
      ],
    },
    {
      heading: 'Service information',
      rows: [
        {
          label: 'Branch of service',
          value: sanitize(entry.branchOfService),
        },
        {
          label: 'Grade, rate, or rank',
          value: sanitize(entry.gradeRateRank),
        },
        { label: 'Pay grade', value: sanitize(entry.payGrade) },
        { label: 'Date inducted', value: formatIsoDate(entry.dateInducted) },
        {
          label: 'Date entered active service',
          value: formatIsoDate(entry.dateEnteredActiveService),
        },
        {
          label: 'Date separated active service',
          value: formatIsoDate(entry.dateSeparatedFromService),
        },
        {
          label: 'Cause of separation',
          value: sanitize(entry.causeOfSeparation),
        },
        { label: 'Separation type', value: sanitize(entry.separationType) },
        { label: 'Separation code', value: sanitize(entry.separationCode) },
      ],
    },
  ];
};
