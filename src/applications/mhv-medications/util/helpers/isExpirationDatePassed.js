import { isValid, startOfDay, isAfter } from 'date-fns';

/**
 * Checks whether a prescription's expiration date is today or in the past.
 * Uses startOfDay to avoid time-of-day sensitivity.
 *
 * @param {string|null} expirationDate - ISO date string
 * @returns {boolean}
 */
export const isExpirationDatePassed = expirationDate => {
  if (!expirationDate) return false;
  const expiry = new Date(expirationDate);
  if (!isValid(expiry)) return false;
  return !isAfter(startOfDay(expiry), startOfDay(new Date()));
};
