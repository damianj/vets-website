import { expect } from 'chai';
import {
  normalizeCharacterOfService,
  normalizePayGrade,
  normalizeSeparationCode,
  normalizeFreeText,
  normalizeSections,
} from '../../../../cave/transformers/normalize';

describe('cave/transformers/normalize', () => {
  // ---------------------------------------------------------------------------
  // normalizeCharacterOfService
  // ---------------------------------------------------------------------------
  describe('normalizeCharacterOfService', () => {
    it('returns null for null', () => {
      expect(normalizeCharacterOfService(null)).to.be.null;
    });

    it('returns empty string for blank input', () => {
      expect(normalizeCharacterOfService('')).to.equal('');
      expect(normalizeCharacterOfService('   ')).to.equal('');
    });

    it('maps full-form value (case-insensitive)', () => {
      expect(normalizeCharacterOfService('Honorable')).to.equal('Honorable');
      expect(normalizeCharacterOfService('honorable')).to.equal('Honorable');
    });

    it('maps abbreviation "OTH" to full form', () => {
      expect(normalizeCharacterOfService('OTH')).to.equal(
        'Other Than Honorable',
      );
    });

    it('maps abbreviation "BCD" to full form', () => {
      expect(normalizeCharacterOfService('BCD')).to.equal(
        'Bad Conduct Discharge',
      );
    });

    it('maps abbreviation case-insensitively', () => {
      expect(normalizeCharacterOfService('oth')).to.equal(
        'Other Than Honorable',
      );
    });

    it('returns null for unrecognized value', () => {
      expect(normalizeCharacterOfService('Excellent')).to.be.null;
    });
  });

  // ---------------------------------------------------------------------------
  // normalizePayGrade
  // ---------------------------------------------------------------------------
  describe('normalizePayGrade', () => {
    it('returns null for null', () => {
      expect(normalizePayGrade(null)).to.be.null;
    });

    it('returns empty string for blank input', () => {
      expect(normalizePayGrade('')).to.equal('');
    });

    it('maps hyphenated canonical form "E-4" through itself', () => {
      expect(normalizePayGrade('E-4')).to.equal('E-4');
    });

    it('is case-insensitive', () => {
      expect(normalizePayGrade('e-4')).to.equal('E-4');
      expect(normalizePayGrade('o-2')).to.equal('O-2');
    });

    it('returns null for unrecognized value', () => {
      expect(normalizePayGrade('X9')).to.be.null;
    });
  });

  // ---------------------------------------------------------------------------
  // normalizeSeparationCode
  // ---------------------------------------------------------------------------
  describe('normalizeSeparationCode', () => {
    it('returns null for null', () => {
      expect(normalizeSeparationCode(null)).to.be.null;
    });

    it('returns empty string for blank input', () => {
      expect(normalizeSeparationCode('')).to.equal('');
    });

    it('returns the code for a valid separation code', () => {
      expect(normalizeSeparationCode('MBK')).to.equal('MBK');
    });

    it('returns the code for another valid code', () => {
      expect(normalizeSeparationCode('JHJ')).to.equal('JHJ');
    });

    it('trims whitespace', () => {
      expect(normalizeSeparationCode('  MBK  ')).to.equal('MBK');
    });

    it('returns null for an unrecognized code', () => {
      expect(normalizeSeparationCode('ZZZ')).to.be.null;
    });

    it('returns null for a code in wrong case', () => {
      // Codes are stored uppercase; lowercase should not match
      expect(normalizeSeparationCode('mbk')).to.be.null;
    });
  });

  // ---------------------------------------------------------------------------
  // normalizeFreeText
  // ---------------------------------------------------------------------------
  describe('normalizeFreeText', () => {
    it('returns null for null', () => {
      expect(normalizeFreeText(null)).to.be.null;
    });

    it('returns null for non-string', () => {
      expect(normalizeFreeText(42)).to.be.null;
    });

    it('returns empty string for blank string', () => {
      expect(normalizeFreeText('')).to.equal('');
      expect(normalizeFreeText('   ')).to.equal('');
    });

    it('trims and returns the value', () => {
      expect(normalizeFreeText('  hello world  ')).to.equal('hello world');
    });

    it('returns the value when under max', () => {
      expect(normalizeFreeText('hello', 10)).to.equal('hello');
    });

    it('returns the value when exactly at max', () => {
      expect(normalizeFreeText('hello', 5)).to.equal('hello');
    });

    it('returns null when trimmed value exceeds max', () => {
      expect(normalizeFreeText('hello world', 5)).to.be.null;
    });

    it('returns value when no max is provided', () => {
      expect(normalizeFreeText('a'.repeat(10000))).to.equal('a'.repeat(10000));
    });
  });

  // ---------------------------------------------------------------------------
  // normalizeSections (integration: full pipeline)
  // ---------------------------------------------------------------------------
  describe('normalizeSections', () => {
    it('returns empty arrays for empty input', () => {
      const result = normalizeSections();
      expect(result.dd214).to.deep.equal([]);
      expect(result.deathCertificates).to.deep.equal([]);
    });

    it('normalizes a DD-214 entry end-to-end', () => {
      const raw = {
        VETERAN_NAME: 'John Q Smith',
        VETERAN_SSN: '123-45-6789',
        VETERAN_DOB: '03/15/1950',
        BRANCH_OF_SERVICE: 'ARMY USAR',
        PAY_GRADE: 'E-4',
        DATE_ENTERED_ACTIVE_SERVICE: '02/15/1970',
        DATE_SEPARATED_FROM_SERVICE: '02/14/1974',
        SEPARATION_CODE: 'MBK',
      };
      const { dd214 } = normalizeSections({ dd214: [raw] });
      expect(dd214).to.have.length(1);
      const entry = dd214[0];
      expect(entry.veteranName).to.deep.equal({
        first: 'John',
        middle: 'Q',
        last: 'Smith',
        suffix: undefined,
      });
      expect(entry.veteranSsn).to.equal('123456789');
      expect(entry.veteranDob).to.equal('1950-03-15');
      expect(entry.branchOfService).to.equal('ARMY USAR');
      expect(entry.payGrade).to.equal('E-4');
      expect(entry.dateEnteredActiveService).to.equal('1970-02-15');
      expect(entry.dateSeparatedFromService).to.equal('1974-02-14');
      expect(entry.separationCode).to.equal('MBK');
    });

    it('normalizes a death certificate entry end-to-end', () => {
      const raw = {
        DECENDENT_FULL_NAME: 'Pat A Veteran',
        DECENDENT_SSN: '987654321',
        DECENDENT_DATE_OF_DEATH: '03/01/2020',
        DECENDENT_DATE_OF_DISPOSITION: '03/10/2020',
        CAUSE_OF_DEATH: 'Natural causes',
      };
      const { deathCertificates } = normalizeSections({
        deathCertificates: [raw],
      });
      expect(deathCertificates).to.have.length(1);
      const entry = deathCertificates[0];
      expect(entry.decendentFullName).to.deep.equal({
        first: 'Pat',
        middle: 'A',
        last: 'Veteran',
        suffix: undefined,
      });
      expect(entry.decendentSsn).to.equal('987654321');
      expect(entry.decendentDateOfDeath).to.equal('2020-03-01');
      expect(entry.decendentDateOfDisposition).to.equal('2020-03-10');
      expect(entry.causeOfDeath).to.equal('Natural causes');
    });

    it('passes through free-text branch of service verbatim', () => {
      const raw = { BRANCH_OF_SERVICE: 'COAST GUARD USCGR' };
      const { dd214 } = normalizeSections({ dd214: [raw] });
      expect(dd214[0].branchOfService).to.equal('COAST GUARD USCGR');
    });

    it('sets null for an invalid SSN', () => {
      const raw = { VETERAN_SSN: '12345' };
      const { dd214 } = normalizeSections({ dd214: [raw] });
      expect(dd214[0].veteranSsn).to.be.null;
    });

    it('sets null for an unparseable date', () => {
      const raw = { VETERAN_DOB: 'not-a-date' };
      const { dd214 } = normalizeSections({ dd214: [raw] });
      expect(dd214[0].veteranDob).to.be.null;
    });

    it('sets null for a name that is null', () => {
      const raw = { VETERAN_NAME: null };
      const { dd214 } = normalizeSections({ dd214: [raw] });
      expect(dd214[0].veteranName).to.be.null;
    });

    it('handles multiple entries in both arrays', () => {
      const result = normalizeSections({
        dd214: [{ VETERAN_NAME: 'John Smith' }, { VETERAN_NAME: 'Jane Doe' }],
        deathCertificates: [{ DECENDENT_FULL_NAME: 'Pat Veteran' }],
      });
      expect(result.dd214).to.have.length(2);
      expect(result.deathCertificates).to.have.length(1);
    });
  });
});
