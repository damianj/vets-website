import {
  EXPENSE_TYPES,
  PROOF_OF_ATTENDANCE_FILENAME,
  STATUSES,
} from '../constants';

// Not exported intentionally — use getAcceptedFileTypes() so the heic extension
// logic is never accidentally for the base array.
const BASE_ACCEPTED_FILE_TYPES = Object.freeze([
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.doc',
  '.docx',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
]);

/**
 * Returns the list of accepted file types for document uploads.
 * When the HEIC conversion feature flag is enabled, .heic and .heif are included.
 * @param {boolean} heicConversionEnabled
 * @returns {string[]}
 */
export function getAcceptedFileTypes(heicConversionEnabled) {
  return heicConversionEnabled
    ? [...BASE_ACCEPTED_FILE_TYPES, '.heic', '.heif']
    : [...BASE_ACCEPTED_FILE_TYPES];
}

/**
 * Get an expense type object by key
 * @param {string} typeKey - The expense type key (e.g., 'mileage')
 * @returns {{name: string, title: string}|null} - The matching expense type object or null if not found
 */
export function getExpenseType(typeKey) {
  if (!typeKey) return null;
  // Try exact match first
  if (EXPENSE_TYPES[typeKey]) return EXPENSE_TYPES[typeKey];

  // Try case-insensitive match
  const foundKey = Object.keys(EXPENSE_TYPES).find(
    key => key.toLowerCase() === typeKey.toLowerCase(),
  );

  return foundKey ? EXPENSE_TYPES[foundKey] : null;
}

/**
 * Formats a number to always have 2 decimal places
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted amount with 2 decimal places
 */
export function formatAmount(amount) {
  if (amount === null || amount === undefined || Number.isNaN(amount))
    return '0.00';
  return Number(amount).toFixed(2);
}

/**
 * Checks if there are any documents that are not associated with any expenses.
 * Proof of attendance documents are intentionally unassociated and are excluded.
 * @param {Array} documents - Array of document objects with expenseId
 * @returns {boolean} - True if there are unassociated documents, false otherwise
 */
export function hasUnassociatedDocuments(documents = []) {
  return (documents || [])
    .filter(doc => doc.mimetype) // ignore clerk notes (no mimetype)
    .filter(
      doc =>
        !doc.filename
          ?.toLowerCase()
          .startsWith(`${PROOF_OF_ATTENDANCE_FILENAME}`),
    ) // ignore POA docs
    .some(doc => !doc.expenseId); // any remaining doc without expenseId
}

/**
 * Checks if a claim status is Incomplete or Saved
 * @param {string} claimStatus - The claim status to check
 * @returns {boolean} - True if the claim status is Incomplete or Saved, false otherwise
 */
export function isClaimIncompleteOrSaved(claimStatus) {
  return (
    claimStatus === STATUSES.Incomplete.name ||
    claimStatus === STATUSES.Saved.name
  );
}
