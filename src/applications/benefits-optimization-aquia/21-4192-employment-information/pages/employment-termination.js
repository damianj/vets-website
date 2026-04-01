/**
 * @module config/form/pages/employment-termination
 * @description Standard form system configuration for Employment Termination page
 * VA Form 21-4192 - Request for Employment Information
 */

import {
  textareaUI,
  currentOrPastDateSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { convertToDateField } from 'platform/forms-system/src/js/validation';
import { dateFieldToDate } from 'platform/utilities/date';
import { MemorableDateUI } from '../components/memorable-date-ui';

const isValidDateObject = date =>
  date instanceof Date && !Number.isNaN(date.getTime());

const toDate = value => {
  if (!value) {
    return null;
  }

  return dateFieldToDate(convertToDateField(value));
};

const validateDateLastWorked = (errors, fieldData, fullData) => {
  const dateLastWorked = toDate(fieldData?.dateLastWorked);
  if (!isValidDateObject(dateLastWorked)) {
    return;
  }

  const beginningDate = toDate(fullData?.employmentDates?.beginningDate);
  const endingDate = toDate(fullData?.employmentDates?.endingDate);

  if (isValidDateObject(beginningDate) && dateLastWorked < beginningDate) {
    errors.dateLastWorked.addError(
      "Date last worked can't be before beginning date of employment",
    );
  } else if (isValidDateObject(endingDate) && dateLastWorked > endingDate) {
    errors.dateLastWorked.addError(
      "Date last worked can't be after ending date of employment",
    );
  }
};

/**
 * uiSchema for Employment Termination page
 * Collects information about employment termination
 */
export const employmentTerminationUiSchema = {
  'ui:title': 'Termination of employment',
  employmentTermination: {
    'ui:validations': [validateDateLastWorked],
    terminationReason: textareaUI({
      title: 'Reason for termination of employment',
      hint:
        'If they retired on disability, please specify the disability(ies).',
      charcount: true,
      required: false,
      errorMessages: {
        maxLength: 'Termination reason must be less than 1000 characters',
      },
    }),
    dateLastWorked: MemorableDateUI({
      title: 'Date last worked',
      dataDogHidden: true,
      required: false,
    }),
  },
};

/**
 * JSON Schema for Employment Termination page
 * Validates termination reason and date last worked fields
 */
export const employmentTerminationSchema = {
  type: 'object',
  required: ['employmentTermination'],
  properties: {
    employmentTermination: {
      type: 'object',
      properties: {
        terminationReason: {
          type: 'string',
          maxLength: 1000,
        },
        dateLastWorked: currentOrPastDateSchema,
      },
    },
  },
};
