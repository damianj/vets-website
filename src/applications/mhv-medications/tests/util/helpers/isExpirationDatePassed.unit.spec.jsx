import { expect } from 'chai';
import { isExpirationDatePassed } from '../../../util/helpers';

const daysAgo = days =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = days =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

describe('isExpirationDatePassed function', () => {
  it('should return true when expiration date is in the past', () => {
    expect(isExpirationDatePassed(daysAgo(30))).to.equal(true);
  });

  it('should return true when expiration date is far in the past', () => {
    expect(isExpirationDatePassed(daysAgo(365))).to.equal(true);
  });

  it('should return true when expiration date is today', () => {
    expect(isExpirationDatePassed(new Date().toISOString())).to.equal(true);
  });

  it('should return false when expiration date is in the future', () => {
    expect(isExpirationDatePassed(daysFromNow(30))).to.equal(false);
  });

  it('should return false when expiration date is null', () => {
    expect(isExpirationDatePassed(null)).to.equal(false);
  });

  it('should return false when expiration date is undefined', () => {
    expect(isExpirationDatePassed(undefined)).to.equal(false);
  });

  it('should return false when expiration date is an empty string', () => {
    expect(isExpirationDatePassed('')).to.equal(false);
  });

  it('should return false when expiration date is an invalid string', () => {
    expect(isExpirationDatePassed('not-a-date')).to.equal(false);
  });
});
