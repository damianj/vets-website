import React from 'react';

import {
  currentOrPastDateUI,
  fullNameNoSuffixUI,
  fullNameNoSuffixSchema,
  ssnUI,
  ssnSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import { veteranFields, FORM_21_4502 } from '../definitions/constants';

const { PERSONAL_INFO: P, COMMON } = FORM_21_4502;

const veteranFullNameUI = fullNameNoSuffixUI();
const veteranFullNameSchema = {
  ...fullNameNoSuffixSchema,
  properties: {
    ...fullNameNoSuffixSchema.properties,
    middle: {
      type: 'string',
      maxLength: 1,
    },
  },
};

const validateDateOfBirth = (errors, value) => {
  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(P.ERROR_DOB_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(P.ERROR_DOB_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(P.ERROR_DOB_PATTERN);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI(P.TITLE, P.PAGE_DESCRIPTION),
    'ui:options': { preserveHiddenData: true },
    [veteranFields.parentObject]: {
      'ui:description': (
        <div>
          <h2>{P.BASIC_INFO_HEADING}</h2>
        </div>
      ),
      [veteranFields.fullName]: {
        ...veteranFullNameUI,
        first: {
          ...veteranFullNameUI.first,
          'ui:title': P.FULL_NAME_LABELS['first or given name'],
          'ui:errorMessages': {
            required: P.ERROR_FIRST_NAME,
          },
        },
        middle: {
          ...veteranFullNameUI.middle,
          'ui:title': P.FULL_NAME_LABELS['middle name'],
        },
        last: {
          ...veteranFullNameUI.last,
          'ui:title': P.FULL_NAME_LABELS['last or family name'],
          'ui:errorMessages': {
            required: P.ERROR_LAST_NAME,
          },
        },
      },

      [veteranFields.dateOfBirth]: {
        ...currentOrPastDateUI({
          title: P.DATE_OF_BIRTH,
          hint: COMMON.HINT_DATE,
          required: () => true,
          errorMessages: {
            required: P.ERROR_DOB_REQUIRED,
            pattern: P.ERROR_DOB_PATTERN,
          },
        }),
        'ui:options': {
          hint: COMMON.HINT_DATE,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          required: P.ERROR_DOB_REQUIRED,
          pattern: P.ERROR_DOB_PATTERN,
        },
        'ui:validations': [validateDateOfBirth],
      },
      [veteranFields.ssn]: {
        ...ssnUI(),
        'ui:errorMessages': {
          pattern: P.ERROR_SSN_PATTERN,
          required: P.ERROR_SSN_REQUIRED,
        },
      },
      [veteranFields.vaFileNumber]: {
        'ui:title': P.VA_FILE_NUMBER,
        'ui:options': {
          hideEmptyValueInReview: true,
        },
      },
      [veteranFields.veteranServiceNumber]: {
        'ui:title': P.VETERAN_SERVICE_NUMBER,
        'ui:options': {
          hideEmptyValueInReview: true,
        },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.fullName]: veteranFullNameSchema,
          [veteranFields.dateOfBirth]: { type: 'string' },
          [veteranFields.ssn]: ssnSchema,
          [veteranFields.vaFileNumber]: { type: 'string', maxLength: 20 },
          [veteranFields.veteranServiceNumber]: {
            type: 'string',
            maxLength: 20,
          },
        },
        required: [
          veteranFields.fullName,
          veteranFields.dateOfBirth,
          veteranFields.ssn,
        ],
      },
    },
  },
};
