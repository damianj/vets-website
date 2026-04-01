/**
 * @module tests/date-test-helpers
 * @description Shared test helpers for date-based unit tests.
 */

/**
 * Creates a YYYY-MM-DD string offset from today by the provided year delta.
 * Negative values generate past dates, positive values generate future dates.
 * @param {number} yearsOffset
 * @returns {string}
 */
export const createDateStringFromToday = yearsOffset => {
  // Use relative dates so business-rule tests stay stable over time.
  const today = new Date();
  const date = new Date(today);
  date.setFullYear(date.getFullYear() + yearsOffset);
  return date.toISOString().split('T')[0];
};
