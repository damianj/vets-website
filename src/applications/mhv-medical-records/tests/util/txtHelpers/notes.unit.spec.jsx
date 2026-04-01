import { expect } from 'chai';
import { loincCodes } from '../../../util/constants';
import { parseCareSummariesAndNotes } from '../../../util/txtHelpers/notes';

describe('txtHelpers/notes - addenda', () => {
  it('should include addenda text for progress notes', () => {
    const records = [
      {
        name: 'Test Progress Note',
        type: loincCodes.PHYSICIAN_PROCEDURE_NOTE,
        date: 'January 1, 2024',
        location: 'Test Clinic',
        writtenBy: 'DR SMITH',
        signedBy: 'DR SMITH',
        dateSigned: 'January 1, 2024',
        note: 'Main note content',
        addenda: [
          {
            date: '2024-12-18T05:22:40+00:00',
            writtenBy: 'MARCI P MCGUIRE',
            signedBy: 'MARCI P MCGUIRE',
            note: 'SGVsbG8gV29ybGQ=', // "Hello World"
          },
        ],
      },
    ];
    const result = parseCareSummariesAndNotes(records);
    expect(result).to.include('Addendum');
    expect(result).to.include('MARCI P MCGUIRE');
    expect(result).to.include('Hello World');
  });

  it('should include addenda text for discharge summaries', () => {
    const records = [
      {
        name: 'Discharge Summary',
        type: 'discharge_summary',
        location: 'Test Hospital',
        admissionDate: 'January 1, 2024',
        dischargeDate: 'January 5, 2024',
        dischargedBy: 'DR JONES',
        summary: 'Main summary content',
        addenda: [
          {
            date: '2024-12-20T10:00:00+00:00',
            writtenBy: 'DR ADDENDUM',
            signedBy: null,
            note: 'QWRkZW5kdW0gdGV4dA==', // "Addendum text"
          },
        ],
      },
    ];
    const result = parseCareSummariesAndNotes(records);
    expect(result).to.include('Addendum');
    expect(result).to.include('DR ADDENDUM');
    expect(result).to.include('Addendum text');
  });

  it('should not include addenda section when addenda is null', () => {
    const records = [
      {
        name: 'Test Progress Note',
        type: loincCodes.PHYSICIAN_PROCEDURE_NOTE,
        date: 'January 1, 2024',
        location: 'Test Clinic',
        writtenBy: 'DR SMITH',
        signedBy: 'DR SMITH',
        dateSigned: 'January 1, 2024',
        note: 'Main note content',
        addenda: null,
      },
    ];
    const result = parseCareSummariesAndNotes(records);
    expect(result).to.not.include('Addendum');
  });

  it('should not include addenda section when addenda is empty', () => {
    const records = [
      {
        name: 'Test Progress Note',
        type: loincCodes.PHYSICIAN_PROCEDURE_NOTE,
        date: 'January 1, 2024',
        location: 'Test Clinic',
        writtenBy: 'DR SMITH',
        signedBy: 'DR SMITH',
        dateSigned: 'January 1, 2024',
        note: 'Main note content',
        addenda: [],
      },
    ];
    const result = parseCareSummariesAndNotes(records);
    expect(result).to.not.include('Addendum');
  });

  it('should handle multiple addenda', () => {
    const records = [
      {
        name: 'Test Progress Note',
        type: loincCodes.PHYSICIAN_PROCEDURE_NOTE,
        date: 'January 1, 2024',
        location: 'Test Clinic',
        writtenBy: 'DR SMITH',
        signedBy: 'DR SMITH',
        dateSigned: 'January 1, 2024',
        note: 'Main note content',
        addenda: [
          {
            date: '2024-12-18T05:22:40+00:00',
            writtenBy: 'FIRST AUTHOR',
            signedBy: null,
            note: 'Rmlyc3Q=', // "First"
          },
          {
            date: '2024-12-19T10:00:00+00:00',
            writtenBy: 'SECOND AUTHOR',
            signedBy: 'SECOND AUTHOR',
            note: 'U2Vjb25k', // "Second"
          },
        ],
      },
    ];
    const result = parseCareSummariesAndNotes(records);
    expect(result).to.include('FIRST AUTHOR');
    expect(result).to.include('SECOND AUTHOR');
    expect(result).to.include('First');
    expect(result).to.include('Second');
  });
});
