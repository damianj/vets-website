import get from 'platform/utilities/data/get';

export const formValue = (path, fallback = undefined) => formData =>
  get(path, formData) ?? fallback;

/**
 * Negate a predicate, returning `true` when the predicate returns `false`.
 *
 * Commonly used with form config `depends` functions. Args are typically
 * `(formData, index)` when used with array builder pages.
 *
 * @example
 * const sponsorIsDeceased = formData => formData.sponsorIsDeceased === true;
 * const sponsorIsAlive = not(sponsorIsDeceased);
 * // sponsorIsAlive(formData) === true when sponsor is not deceased
 *
 * @param {Function} pred - Predicate function to negate
 * @returns {Function} Negated predicate
 */
export const not = pred => (...args) => !pred(...args);

/**
 * Compose multiple predicates into a single predicate that returns `true`
 * only when **all** predicates return `true`.
 *
 * Commonly used with form config `depends` functions. Args are typically
 * `(formData, index)` when used with array builder pages.
 *
 * @example
 * const isChild = (formData, index) => formData.applicants[index].relationship === 'child';
 * const isCollegeAge = (formData, index) => formData.applicants[index].age >= 18;
 *
 * const depends = whenAll(isChild, isCollegeAge);
 * // depends(formData, index) === true only if both predicates pass
 *
 * @param {...Function} preds - Predicate functions to combine
 * @returns {Function} Combined predicate that requires all conditions
 */
export const whenAll = (...preds) => (...args) => preds.every(p => p(...args));

/**
 * Compose multiple predicates into a single predicate that returns `true`
 * when **any** predicate returns `true`.
 *
 * Commonly used with form config `depends` functions. Args are typically
 * `(formData, index)` when used with array builder pages.
 *
 * @example
 * const hasCertifierAddress = formData => Boolean(formData.certifierAddress?.street);
 * const hasSponsorAddress = formData => Boolean(formData.sponsorAddress?.street);
 *
 * const canSelectAddress = whenAny(hasCertifierAddress, hasSponsorAddress);
 * // canSelectAddress(formData) === true if either address exists
 *
 * @param {...Function} preds - Predicate functions to combine
 * @returns {Function} Combined predicate that requires at least one condition
 */
export const whenAny = (...preds) => (...args) => preds.some(p => p(...args));
