import { sanitize, formatIsoDate, maskSsn } from './helpers';

export const transformDeathCertificateEntry = data => {
  const entry = data || {};
  const name = entry.decendentFullName || {};
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
          value: maskSsn(entry.decendentSsn),
        },
      ],
    },
    {
      heading: "Veteran's death information",
      rows: [
        {
          label: 'Disposition date',
          value: formatIsoDate(entry.decendentDateOfDisposition),
        },
        {
          label: 'Date of death',
          value: formatIsoDate(entry.decendentDateOfDeath),
        },
        { label: 'Cause of death A', value: sanitize(entry.causeOfDeath) },
        {
          label: 'Cause of death B',
          value: sanitize(entry.underlyingCauseOfDeathB),
        },
        {
          label: 'Cause of death C',
          value: sanitize(entry.underlyingCauseOfDeathC),
        },
        {
          label: 'Cause of death D',
          value: sanitize(entry.underlyingCauseOfDeathD),
        },
        { label: 'Manner of death', value: sanitize(entry.mannerOfDeath) },
        {
          label: 'Marital status at time of death',
          value: sanitize(entry.decendentMaritalStatus),
        },
      ],
    },
  ];
};
