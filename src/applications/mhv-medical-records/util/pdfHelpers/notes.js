import { EMPTY_FIELD } from '../constants';
import { decodeBase64Report, isArrayAndHasItems } from '../helpers';
import { formatDateTimeInUserTimezone } from '../dateHelpers';

/**
 * Generate PDF result items for addenda.
 * Each addendum becomes a separate item group with header "Addendum".
 */
export const generateAddendaItems = addenda => {
  if (!isArrayAndHasItems(addenda)) return [];
  return addenda.map(addendum => {
    const items = [
      {
        title: 'Date entered',
        value: formatDateTimeInUserTimezone(addendum.date) || EMPTY_FIELD,
        inline: true,
      },
    ];
    if (addendum.writtenBy) {
      items.push({
        title: 'Written by',
        value: addendum.writtenBy,
        inline: true,
      });
    }
    if (addendum.signedBy) {
      items.push({
        title: 'Signed by',
        value: addendum.signedBy,
        inline: true,
      });
    }
    items.push({
      value: decodeBase64Report(addendum.note) || EMPTY_FIELD,
      monospace: true,
    });
    return { header: 'Addendum', items };
  });
};

export const generateNotesIntro = record => {
  return {
    title: `${record.name}`,
    subject: 'VA Medical Record',
  };
};

export const generateDischargeSummaryContent = record => ({
  details: {
    header: 'Details',
    items: [
      {
        title: 'Date admitted',
        value: record.admissionDate,
        inline: true,
      },
      {
        title: 'Location',
        value: record.location,
        inline: true,
      },
      {
        title: 'Date discharged',
        value: record.dischargeDate,
        inline: true,
      },
      {
        title: 'Discharged by',
        value: record.dischargedBy,
        inline: true,
      },
    ],
  },
  results: {
    header: 'Summary',
    items: [
      {
        items: [
          {
            value: record.summary,
            monospace: true,
          },
        ],
      },
      ...generateAddendaItems(record.addenda),
    ],
  },
});

export const generateProgressNoteContent = record => {
  const content = {
    details: {
      header: 'Details',
      items: [
        {
          title: 'Date entered',
          value: record.date,
          inline: true,
        },
        {
          title: 'Location',
          value: record.location,
          inline: true,
        },
        {
          title: 'Written by',
          value: record.writtenBy,
          inline: true,
        },
        {
          title: 'Date signed',
          value: record.dateSigned,
          inline: true,
        },
      ],
    },
    results: {
      header: 'Note',
      items: [
        {
          items: [
            {
              value: record.note,
              monospace: true,
            },
          ],
        },
        ...generateAddendaItems(record.addenda),
      ],
    },
  };

  if (record.signedBy !== EMPTY_FIELD) {
    content.details.items.splice(3, 0, {
      title: 'Signed by',
      value: record.signedBy,
      inline: true,
    });
  }

  return content;
};
