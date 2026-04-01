import {
  titleUI,
  textUI,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { VETERAN_STATUS_INFORMATION: V } = FORM_21_4502;

const validateDateOfRelease = (errors, value) => {
  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(V.ERROR_DATE_RELEASE_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(V.ERROR_DATE_RELEASE_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(V.ERROR_DATE_RELEASE_INVALID);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(V.TITLE),
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.placeOfRelease]: textUI({
        title: V.PLACE_OF_RELEASE,
        required: () => true,
        errorMessages: {
          required: V.ERROR_PLACE_OF_RELEASE,
        },
      }),
      [applicationInfoFields.dateOfRelease]: {
        ...currentOrPastDateUI({
          title: V.DATE_OF_RELEASE,
          hint: V.HINT_DATE_OF_RELEASE,
          required: () => true,
          errorMessages: {
            pattern: V.ERROR_DATE_RELEASE_INVALID,
            required: V.ERROR_DATE_RELEASE_REQUIRED,
          },
        }),
        'ui:options': {
          hint: V.HINT_DATE_OF_RELEASE,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          pattern: V.ERROR_DATE_RELEASE_INVALID,
          required: V.ERROR_DATE_RELEASE_REQUIRED,
        },
        'ui:validations': [validateDateOfRelease],
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.placeOfRelease]: {
            type: 'string',
            maxLength: 100,
          },
          [applicationInfoFields.dateOfRelease]: { type: 'string' },
        },
        required: [
          applicationInfoFields.placeOfRelease,
          applicationInfoFields.dateOfRelease,
        ],
      },
    },
  },
};
