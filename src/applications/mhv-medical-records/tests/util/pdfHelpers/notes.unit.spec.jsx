import { expect } from 'chai';
import { EMPTY_FIELD } from '../../../util/constants';
import {
  generateAddendaItems,
  generateProgressNoteContent,
  generateDischargeSummaryContent,
} from '../../../util/pdfHelpers/notes';

describe('pdfHelpers/notes', () => {
  describe('generateAddendaItems', () => {
    it('should return an empty array when addenda is null', () => {
      expect(generateAddendaItems(null)).to.deep.equal([]);
    });

    it('should return an empty array when addenda is undefined', () => {
      expect(generateAddendaItems(undefined)).to.deep.equal([]);
    });

    it('should return an empty array when addenda is an empty array', () => {
      expect(generateAddendaItems([])).to.deep.equal([]);
    });

    it('should generate items for a single addendum with all fields', () => {
      const addenda = [
        {
          date: '2024-12-18T05:22:40+00:00',
          writtenBy: 'MARCI P MCGUIRE',
          signedBy: 'MARCI P MCGUIRE',
          note: 'SGVsbG8gV29ybGQ=', // "Hello World" in base64
        },
      ];
      const result = generateAddendaItems(addenda);
      expect(result).to.have.lengthOf(1);
      expect(result[0].header).to.equal('Addendum');
      expect(result[0].items).to.have.lengthOf(4);
      expect(result[0].items[0].title).to.equal('Date entered');
      expect(result[0].items[1].title).to.equal('Written by');
      expect(result[0].items[1].value).to.equal('MARCI P MCGUIRE');
      expect(result[0].items[2].title).to.equal('Signed by');
      expect(result[0].items[2].value).to.equal('MARCI P MCGUIRE');
      expect(result[0].items[3].value).to.equal('Hello World');
      expect(result[0].items[3].monospace).to.be.true;
    });

    it('should omit writtenBy and signedBy when null', () => {
      const addenda = [
        {
          date: '2024-12-18T05:22:40+00:00',
          writtenBy: null,
          signedBy: null,
          note: 'SGVsbG8=', // "Hello"
        },
      ];
      const result = generateAddendaItems(addenda);
      expect(result[0].items).to.have.lengthOf(2);
      expect(result[0].items[0].title).to.equal('Date entered');
      expect(result[0].items[1].value).to.equal('Hello');
    });

    it('should return EMPTY_FIELD for invalid date', () => {
      const addenda = [
        {
          date: null,
          writtenBy: null,
          signedBy: null,
          note: 'SGVsbG8=',
        },
      ];
      const result = generateAddendaItems(addenda);
      expect(result[0].items[0].value).to.equal(EMPTY_FIELD);
    });

    it('should handle multiple addenda', () => {
      const addenda = [
        {
          date: '2024-12-18T05:22:40+00:00',
          writtenBy: 'DOCTOR A',
          signedBy: null,
          note: 'Rmlyc3Q=', // "First"
        },
        {
          date: '2024-12-19T10:00:00+00:00',
          writtenBy: 'DOCTOR B',
          signedBy: 'DOCTOR B',
          note: 'U2Vjb25k', // "Second"
        },
      ];
      const result = generateAddendaItems(addenda);
      expect(result).to.have.lengthOf(2);
      expect(result[0].header).to.equal('Addendum');
      expect(result[1].header).to.equal('Addendum');
    });

    it('should return EMPTY_FIELD when note is null', () => {
      const addenda = [
        {
          date: '2024-12-18T05:22:40+00:00',
          writtenBy: null,
          signedBy: null,
          note: null,
        },
      ];
      const result = generateAddendaItems(addenda);
      expect(result[0].items[1].value).to.equal(EMPTY_FIELD);
    });
  });

  describe('generateProgressNoteContent with addenda', () => {
    it('should include addenda in results.items when present', () => {
      const record = {
        date: 'January 1, 2024',
        location: 'Test Location',
        writtenBy: 'DR TEST',
        signedBy: EMPTY_FIELD,
        dateSigned: 'January 1, 2024',
        note: 'Test note content',
        addenda: [
          {
            date: '2024-12-18T05:22:40+00:00',
            writtenBy: 'MARCI P MCGUIRE',
            signedBy: null,
            note: 'SGVsbG8=',
          },
        ],
      };
      const content = generateProgressNoteContent(record);
      // 1 for the main note + 1 for the addendum
      expect(content.results.items).to.have.lengthOf(2);
      expect(content.results.items[1].header).to.equal('Addendum');
    });

    it('should not add extra items when addenda is null', () => {
      const record = {
        date: 'January 1, 2024',
        location: 'Test Location',
        writtenBy: 'DR TEST',
        signedBy: EMPTY_FIELD,
        dateSigned: 'January 1, 2024',
        note: 'Test note content',
        addenda: null,
      };
      const content = generateProgressNoteContent(record);
      expect(content.results.items).to.have.lengthOf(1);
    });
  });

  describe('generateDischargeSummaryContent with addenda', () => {
    it('should include addenda in results.items when present', () => {
      const record = {
        admissionDate: 'January 1, 2024',
        location: 'Test Location',
        dischargeDate: 'January 5, 2024',
        dischargedBy: 'DR TEST',
        summary: 'Test summary',
        addenda: [
          {
            date: '2024-12-18T05:22:40+00:00',
            writtenBy: 'MARCI P MCGUIRE',
            signedBy: 'MARCI P MCGUIRE',
            note: 'SGVsbG8=',
          },
        ],
      };
      const content = generateDischargeSummaryContent(record);
      expect(content.results.items).to.have.lengthOf(2);
      expect(content.results.items[1].header).to.equal('Addendum');
    });

    it('should not add extra items when addenda is empty', () => {
      const record = {
        admissionDate: 'January 1, 2024',
        location: 'Test Location',
        dischargeDate: 'January 5, 2024',
        dischargedBy: 'DR TEST',
        summary: 'Test summary',
        addenda: [],
      };
      const content = generateDischargeSummaryContent(record);
      expect(content.results.items).to.have.lengthOf(1);
    });
  });
});
