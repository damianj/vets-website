/**
 * @module config/form/pages/veteran-information
 * @description Standard form system configuration for Veteran Information page
 * VA Form 21-4192 - Request for Employment Information
 */

import {
  dateOfBirthUI,
  dateOfBirthSchema,
  fullNameNoSuffixUI,
  fullNameNoSuffixSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { isValidNameLength } from '../../shared/utils/validators/validators';
import {
  MAX_REASONABLE_AGE_YEARS,
  MIN_WORKING_AGE_YEARS,
  normalizeDate,
  parseDateValue,
  shiftDateByYears,
} from '../utils/date-validation-helpers';

const validateVeteranDateOfBirthBusinessRules = (errors, dateOfBirth) => {
  if (!dateOfBirth) {
    return;
  }

  const veteranDob = parseDateValue(dateOfBirth);
  if (!veteranDob) {
    // Base date widget validation handles malformed/partial dates.
    return;
  }

  // Compare at day precision to avoid timezone-related boundary drift.
  const today = normalizeDate(new Date());
  const youngestAllowedDob = shiftDateByYears(today, -MIN_WORKING_AGE_YEARS);
  const oldestAllowedDob = shiftDateByYears(today, -MAX_REASONABLE_AGE_YEARS);

  if (veteranDob > youngestAllowedDob) {
    // Too recent means Veteran would be younger than minimum working age.
    errors.addError(
      `Veteran date of birth must be at least ${MIN_WORKING_AGE_YEARS} years before today`,
    );
  } else if (veteranDob < oldestAllowedDob) {
    // Too old is treated as likely bad input.
    errors.addError(
      `Veteran date of birth can't be more than ${MAX_REASONABLE_AGE_YEARS} years before today`,
    );
  }
};

/**
 * Format title function for veteran's full name fields
 * Customizes labels to match old pattern design
 * @param {string} title - The default title (e.g., 'first name', 'last name')
 * @returns {string} The formatted title
 */
const formatVeteranNameTitle = title => {
  if (title === 'first or given name') return "Veteran's first or given name";
  if (title === 'last or family name') return "Veteran's last or family name";
  if (title === 'middle name') return "Veteran's middle initial";
  return title; // Keep defaults for middle name and suffix
};

const customVeteranNameSchema = {
  ...fullNameNoSuffixSchema,
  properties: {
    ...fullNameNoSuffixSchema.properties,
    middle: {
      type: 'string',
      maxLength: 1,
    },
  },
};

const customVeteranNameUISchema = formatTitle => {
  const baseSchema = fullNameNoSuffixUI(formatTitle);
  return {
    ...baseSchema,
    first: {
      ...baseSchema.first,
      'ui:validations': [
        ...baseSchema.first['ui:validations'],
        (errors = {}, _fieldData, formData) => {
          isValidNameLength(
            errors,
            formData?.veteranInformation?.veteranFullName?.first,
            12,
          );
        },
      ],
    },
    last: {
      ...baseSchema.last,
      'ui:validations': [
        ...baseSchema.last['ui:validations'],
        (errors = {}, _fieldData, formData) => {
          isValidNameLength(
            errors,
            formData?.veteranInformation?.veteranFullName?.last,
            18,
          );
        },
      ],
    },
  };
};

/**
 * uiSchema for Veteran Information page
 * Collects veteran's personal identification information
 */
export const veteranInformationUiSchema = {
  'ui:title': 'Who is the Veteran you are providing information for?',
  veteranInformation: {
    veteranFullName: customVeteranNameUISchema(formatVeteranNameTitle),
    dateOfBirth: dateOfBirthUI({
      title: "Veteran's date of birth",
      dataDogHidden: true,
      validations: [validateVeteranDateOfBirthBusinessRules],
      errorMessages: {
        required: 'Date of birth is required',
      },
    }),
  },
};

/**
 * JSON Schema for Veteran Information page
 * Validates veteran identification fields
 */
export const veteranInformationSchema = {
  type: 'object',
  required: ['veteranInformation'],
  properties: {
    veteranInformation: {
      type: 'object',
      required: ['veteranFullName', 'dateOfBirth'],
      properties: {
        veteranFullName: customVeteranNameSchema,
        dateOfBirth: dateOfBirthSchema,
      },
    },
  },
};
