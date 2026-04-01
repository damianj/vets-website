/**
 * @module utils/date-validation-helpers
 * @description Shared date validation helpers used across 21-4192 form pages.
 */

import { convertToDateField } from 'platform/forms-system/src/js/validation';
import { dateFieldToDate } from 'platform/utilities/date';

/** Minimum age (in years) used by employment-related date rules. */
export const MIN_WORKING_AGE_YEARS = 14;

/** Maximum reasonable age (in years) used by DOB sanity checks. */
export const MAX_REASONABLE_AGE_YEARS = 120;

/**
 * Returns true when the value is a valid Date instance.
 * @param {unknown} date
 * @returns {boolean}
 */
export const isValidDateObject = date =>
  date instanceof Date && !Number.isNaN(date.getTime());

/**
 * Returns a new date shifted by a number of years.
 * @param {Date} date
 * @param {number} years
 * @returns {Date}
 */
export const shiftDateByYears = (date, years) => {
  // Clone first to avoid mutating caller-owned Date objects.
  const shiftedDate = new Date(date);
  shiftedDate.setFullYear(shiftedDate.getFullYear() + years);
  return shiftedDate;
};

/**
 * Normalizes a date to local midnight.
 * @param {Date} date
 * @returns {Date}
 */
export const normalizeDate = date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Parses a YYYY-MM-DD date string into a valid Date.
 * Returns null when the value is missing or invalid.
 * @param {string|undefined|null} value
 * @returns {Date|null}
 */
export const parseDateValue = value => {
  if (!value) {
    return null;
  }

  // Convert web-component date shape into a real Date for comparisons.
  const parsedDate = dateFieldToDate(convertToDateField(value));
  return isValidDateObject(parsedDate) ? parsedDate : null;
};

/**
 * Reads and parses the Veteran date of birth from form data.
 * @param {Object} fullData
 * @returns {Date|null}
 */
export const getVeteranDobFromFormData = fullData =>
  parseDateValue(fullData?.veteranInformation?.dateOfBirth);
