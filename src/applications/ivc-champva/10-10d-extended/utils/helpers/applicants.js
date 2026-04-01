import { addYears, differenceInYears, format, isMatch, parse } from 'date-fns';
import get from 'platform/utilities/data/get';
import { NOT_SHARED } from '../../components/FormFields/AddressSelectionField';
import { whenAny } from './form-config';
import { hasCertifierAddress } from './signer';
import { hasSponsorAddress } from './sponsor';

/**
 * Normalize a date to UTC midnight to avoid TZ / DST edge cases when comparing
 * day-based values like age thresholds.
 */
const toUtcMidnight = d =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/**
 * Safely parse a supported date string.
 * Accepts:
 * - yyyy-MM-dd
 * - MM-dd-yyyy
 */
const parseSupportedDate = dateStr => {
  if (typeof dateStr !== 'string') return null;

  const formats = ['yyyy-MM-dd', 'MM-dd-yyyy'];

  const matchedFormat = formats.find(dateFormat => {
    if (!isMatch(dateStr, dateFormat)) return false;

    const parsedDate = parse(dateStr, dateFormat, new Date());
    return format(parsedDate, dateFormat) === dateStr;
  });

  return matchedFormat ? parse(dateStr, matchedFormat, new Date()) : null;
};

// Generic accessors
export const getApplicant = (formData, index) => formData?.applicants?.[index];

export const applicantValue = (path, fallback = undefined) => (
  formData,
  index,
) => get(path, getApplicant(formData, index)) ?? fallback;

// Generic applicant predicate helpers
export const applicantFieldEquals = (path, expectedValue) => (
  formData,
  index,
) => applicantValue(path)(formData, index) === expectedValue;

export const applicantFieldIn = (path, allowedValues) => (formData, index) =>
  allowedValues.includes(applicantValue(path)(formData, index));

export const applicantBoolean = path => (formData, index) =>
  Boolean(applicantValue(path)(formData, index));

// Named applicant field accessors
export const applicantDob = applicantValue('applicantDob');
export const applicantRelationship = applicantValue(
  'applicantRelationshipToSponsor.relationshipToVeteran',
);
export const applicantRelationshipOrigin = applicantValue(
  'applicantRelationshipOrigin.relationshipToVeteran',
);
export const applicantDependentStatus = applicantValue(
  'applicantDependentStatus.status',
);
export const applicantSharedAddressWith = applicantValue(
  'view:sharesAddressWith',
);
export const applicantRemarried = applicantValue('applicantRemarried', false);

// Relationship / status predicates
export const applicantRelationshipIs = relationship =>
  applicantFieldEquals(
    'applicantRelationshipToSponsor.relationshipToVeteran',
    relationship,
  );

export const applicantOriginIs = origin =>
  applicantFieldEquals(
    'applicantRelationshipOrigin.relationshipToVeteran',
    origin,
  );

export const applicantDependentStatusIn = statuses =>
  applicantFieldIn('applicantDependentStatus.status', statuses);

// Shared applicant predicates
export const applicantIsChild = applicantRelationshipIs('child');
export const applicantIsSpouse = applicantRelationshipIs('spouse');

// Shared form predicates
export const canSelectApplicantAddress = whenAny(
  hasCertifierAddress,
  hasSponsorAddress,
);

// Address-sharing predicates
export const applicantSharesAddressWith = expected =>
  applicantFieldEquals('view:sharesAddressWith', expected);

export const applicantHasNoSharedAddressSelection = (formData, index) => {
  const sharedWith = applicantSharedAddressWith(formData, index);
  return !sharedWith || sharedWith === NOT_SHARED;
};

// Age helpers
export const getAgeInYears = (dateStr, asOf = new Date()) => {
  const parsedDate = parseSupportedDate(dateStr);
  if (!parsedDate) return NaN;

  const dobUtc = toUtcMidnight(parsedDate);
  const asOfUtc = toUtcMidnight(asOf);
  return differenceInYears(asOfUtc, dobUtc);
};

export const applicantIsCollegeAge = (formData, index) => {
  const age = getAgeInYears(applicantDob(formData, index));
  return age >= 18 && age <= 23;
};

/**
 * Birth certificate rules
 *
 * Require a birth certificate when:
 * - applicant is a child, AND
 *   - origin is not blood, OR
 *   - origin is blood and applicant is a newborn (<= 1 year old)
 */
export const requireBirthCertificate = (formData, index) => {
  if (!getApplicant(formData, index) || !applicantIsChild(formData, index)) {
    return false;
  }

  if (!applicantOriginIs('blood')(formData, index)) return true;

  const dob = parseSupportedDate(applicantDob(formData, index));
  if (!dob) return false;

  const dobUtc = toUtcMidnight(dob);
  const oneYearAgoUtc = toUtcMidnight(addYears(new Date(), -1));

  return dobUtc >= oneYearAgoUtc;
};

// Applicant-specific state predicates
export const applicantHasRemarried = applicantBoolean('applicantRemarried');
