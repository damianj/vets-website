import { expect } from 'chai';
import { formatInTimeZone } from 'date-fns-tz';

import { FORMAT_YMD_DATE_FNS, FORMAT_READABLE_DATE_FNS } from '../../constants';
import {
  getReadableDateFromTimestamp,
  parseDateToDateObj,
  parseDate,
  parseDateWithOffset,
  getReadableDate,
  getCurrentUTCStartOfDay,
  formatDateToReadableString,
  formatMonthYearToReadableString,
} from '../../utils/dates';

const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

describe('getReadableDateFromTimestamp', () => {
  it('should format an ISO 8601 timestamp as a readable date', () => {
    expect(getReadableDateFromTimestamp('2026-03-17T18:00:00.000Z')).to.eq(
      'March 17, 2026',
    );
  });

  it('should convert a near-midnight UTC timestamp to the local timezone date', () => {
    // March 17 in UTC, March 16 in US
    const isoString = '2026-03-17T02:00:00.000Z';
    const expected = formatInTimeZone(
      new Date(isoString),
      LOCAL_TZ,
      'MMMM d, yyyy',
    );
    expect(getReadableDateFromTimestamp(isoString)).to.eq(expected);
  });

  it('should convert a UTC midnight timestamp to the correct local date', () => {
    // Exactly midnight UTC — any timezone behind UTC sees the previous day
    const isoString = '2025-01-01T00:00:00.000Z';
    const expected = formatInTimeZone(
      new Date(isoString),
      LOCAL_TZ,
      'MMMM d, yyyy',
    ); // December 31, 2024

    expect(getReadableDateFromTimestamp(isoString)).to.eq(expected);
  });
});

describe('parseDateToDateObj', () => {
  const dateString = '2021-02-10';
  const dateIsoString = '2021-02-10T00:00:00';
  const result = 'Wed Feb 10 2021';

  it('should return null', () => {
    expect(parseDateToDateObj('', FORMAT_YMD_DATE_FNS)).to.be.null;
    expect(parseDateToDateObj('T', FORMAT_YMD_DATE_FNS)).to.be.null;
    expect(parseDateToDateObj(new Date('abcd'))).to.be.null;
  });

  it('should start with a date object and return a date object with timezone adjustments', () => {
    expect(parseDateToDateObj(new Date(dateString)).toString()).to.contain(
      result,
    );
    expect(parseDateToDateObj(new Date(dateIsoString)).toString()).to.contain(
      result,
    );
  });

  it('should start with a date string and return a date object', () => {
    expect(parseDateToDateObj(dateIsoString).toString()).to.contain(result);
    // Adding a format template fixes the problem
    expect(
      parseDateToDateObj(dateString, FORMAT_YMD_DATE_FNS).toString(),
    ).to.contain(result);
    expect(
      parseDateToDateObj(
        'February 10, 2021',
        FORMAT_READABLE_DATE_FNS,
      ).toString(),
    ).to.contain(result);
  });
});

describe('parseDate', () => {
  it('should return null for invalid dates', () => {
    expect(parseDate('')).to.be.null;
    expect(parseDate({})).to.be.null;
    expect(parseDate('abcd')).to.be.null;
    expect(parseDate('2024-13-32')).to.be.null;
    expect(parseDate('2024-13-32T00:00:00.000-06:00')).to.be.null;
    expect(parseDate('1712854521628')).to.be.null;
    expect(parseDate('2000-1-1')).to.be.null; // Non-ISO8601 format without passing in current format
    expect(parseDate('02-03-2024')).to.be.null; // Non-ISO8601 format without passing in current format
  });
  it('should return a formatted date string', () => {
    expect(parseDate(1712854521628)).to.eq('2024-04-11');
    // one off date example if you don't include the time
    expect(parseDate(new Date('2024-05-06T00:00:00.000'))).to.eq('2024-05-06');
    expect(parseDate('2023-06-17T12:34:56.000-06:00')).to.eq('2023-06-17');
    expect(parseDate(1712854521628, FORMAT_READABLE_DATE_FNS)).to.eq(
      'April 11, 2024',
    );
    // Non-ISO8601 format example
    expect(
      parseDate('2024-02-03', FORMAT_READABLE_DATE_FNS, FORMAT_YMD_DATE_FNS),
    ).to.eq('February 3, 2024');
    // one off date example if you don't include the time
    expect(
      parseDate(new Date('2024-05-06T00:00:00.000'), FORMAT_READABLE_DATE_FNS),
    ).to.eq('May 6, 2024');
    expect(
      parseDate('2023-06-17T12:34:56.000-06:00', FORMAT_READABLE_DATE_FNS),
    ).to.eq('June 17, 2023');
  });
});

describe('parseDateWithOffset', () => {
  it('should return null', () => {
    expect(parseDateWithOffset({}, '')).to.be.null;
    expect(parseDateWithOffset({ months: 1 }, '')).to.be.null;
    expect(parseDateWithOffset({ months: 1 }, new Date('abcd'))).to.be.null;
  });
  it('should return a date string from offset settings', () => {
    const date = new Date('2024-01-01');
    expect(parseDateWithOffset({}, date)).to.contain('2024-01-01');
    expect(parseDateWithOffset({ years: -1 }, date)).to.contain('2023-01-01');
    expect(parseDateWithOffset({ years: 1 }, date)).to.contain('2025-01-01');
    expect(
      parseDateWithOffset({ months: -1 }, date, FORMAT_READABLE_DATE_FNS),
    ).to.contain('December 1, 2023');
    expect(
      parseDateWithOffset(
        { days: 3, months: 1 },
        date,
        FORMAT_READABLE_DATE_FNS,
      ),
    ).to.contain('February 4, 2024');
  });
});

describe('getReadableDate', () => {
  it('should return null', () => {
    expect(getReadableDate('')).to.be.null;
    expect(getReadableDate('2022')).to.be.null;
    expect(getReadableDate('2023-03')).to.be.null;
  });
  it('should return a readable date', () => {
    expect(getReadableDate('2023-10-15')).to.eq('October 15, 2023');
    expect(getReadableDate('2024-06-04')).to.eq('June 4, 2024');
  });
});

describe('getCurrentUTCStartOfDay', () => {
  it('should return current date in UTC at start of day (midnight)', () => {
    const result = getCurrentUTCStartOfDay();
    const now = new Date();

    expect(result).to.be.instanceOf(Date);
    expect(result.getTime()).to.not.be.NaN;

    expect(result.getUTCFullYear()).to.equal(now.getUTCFullYear());
    expect(result.getUTCMonth()).to.equal(now.getUTCMonth());
    expect(result.getUTCDate()).to.equal(now.getUTCDate());

    expect(result.getUTCHours()).to.equal(0);
    expect(result.getUTCMinutes()).to.equal(0);
    expect(result.getUTCSeconds()).to.equal(0);
    expect(result.getUTCMilliseconds()).to.equal(0);
  });
});

describe('formatDateToReadableString', () => {
  describe('VA.gov style month formatting', () => {
    it('should NOT abbreviate March per VA.gov style guide', () => {
      const marchDate = new Date(2025, 2, 15, 12, 0, 0); // March 15, 2025
      const result = formatDateToReadableString(marchDate);
      expect(result).to.equal('March 15, 2025');
    });

    it('should abbreviate December with period per VA.gov style guide', () => {
      const decemberDate = new Date(2025, 11, 10, 12, 0, 0); // December 10, 2025
      const result = formatDateToReadableString(decemberDate);
      expect(result).to.equal('Dec. 10, 2025');
    });
  });
});

describe('formatMonthYearToReadableString', () => {
  it('should return the input for null, undefined, or empty string', () => {
    expect(formatMonthYearToReadableString(null)).to.be.null;
    expect(formatMonthYearToReadableString(undefined)).to.be.undefined;
    expect(formatMonthYearToReadableString('')).to.equal('');
  });

  it('should return the input when length is not 7', () => {
    expect(formatMonthYearToReadableString('2025')).to.equal('2025');
    expect(formatMonthYearToReadableString('2025-01-01')).to.equal(
      '2025-01-01',
    );
  });

  it('should not abbreviate long-form months per VA.gov style guide', () => {
    expect(formatMonthYearToReadableString('2025-03')).to.equal('March 2025');
    expect(formatMonthYearToReadableString('2025-04')).to.equal('April 2025');
    expect(formatMonthYearToReadableString('2025-05')).to.equal('May 2025');
    expect(formatMonthYearToReadableString('2025-06')).to.equal('June 2025');
    expect(formatMonthYearToReadableString('2025-07')).to.equal('July 2025');
  });

  it('should abbreviate short-form months with a period', () => {
    expect(formatMonthYearToReadableString('2025-01')).to.equal('Jan. 2025');
    expect(formatMonthYearToReadableString('2025-02')).to.equal('Feb. 2025');
    expect(formatMonthYearToReadableString('2025-08')).to.equal('Aug. 2025');
    expect(formatMonthYearToReadableString('2025-10')).to.equal('Oct. 2025');
    expect(formatMonthYearToReadableString('2025-11')).to.equal('Nov. 2025');
    expect(formatMonthYearToReadableString('2025-12')).to.equal('Dec. 2025');
  });

  it('should abbreviate September as Sept. per VA.gov style guide', () => {
    expect(formatMonthYearToReadableString('2025-09')).to.equal('Sept. 2025');
  });
});
