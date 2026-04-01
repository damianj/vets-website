import { txtLineDotted } from '@department-of-veterans-affairs/mhv/exports';
import { loincCodes, EMPTY_FIELD } from '../constants';
import { decodeBase64Report, isArrayAndHasItems } from '../helpers';
import { formatDateTimeInUserTimezone } from '../dateHelpers';

/**
 * Format addenda for TXT output.
 * @param {Array|null} addenda - Array of raw addendum objects
 * @returns {string} Formatted addenda text or empty string
 */
export const formatAddendaTxt = addenda => {
  if (!isArrayAndHasItems(addenda)) return '';
  return addenda
    .map(addendum => {
      const dateEntered =
        formatDateTimeInUserTimezone(addendum.date) || EMPTY_FIELD;
      const writtenBy = addendum.writtenBy
        ? `  Written by: ${addendum.writtenBy}\n`
        : '';
      const signedBy = addendum.signedBy
        ? `  Signed by: ${addendum.signedBy}\n`
        : '';
      const noteText = decodeBase64Report(addendum.note) || EMPTY_FIELD;
      return `
Addendum
  Date entered: ${dateEntered}
${writtenBy}${signedBy}  ${noteText}`;
    })
    .join('');
};

export const parseCareSummariesAndNotes = (records, index = 2) => {
  return `
${index}) Care summaries and notes

This report only includes care summaries and notes from 2013 and later.
For after-visit summaries, (summaries of your appointments with VA providers), go to your appointment records.

${records
    .map(
      record =>
        `${
          record.type === loincCodes.PHYSICIAN_PROCEDURE_NOTE ||
          record.type === loincCodes.CONSULT_RESULT
            ? `
${record.name}
${txtLineDotted}

Details
  
  Date: ${record.date}
  Location: ${record.location}
  Written by: ${record.writtenBy}
  Signed by: ${record.signedBy}
  Date signed: ${record.dateSigned}

Notes
  ${record.note}
${formatAddendaTxt(record.addenda)}
`
            : `

${record.name}
${txtLineDotted}

Details
  Location: ${record.location}
  Date admitted: ${record.admissionDate}
  Date discharged: ${record.dischargeDate}
  Discharged by: ${record.dischargedBy}

Summary
  ${record.summary}
${formatAddendaTxt(record.addenda)}
              `
        }`,
    )
    .join('')}

`;
};
