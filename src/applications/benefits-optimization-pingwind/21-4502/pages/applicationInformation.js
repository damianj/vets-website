import {
  textUI,
  radioUI,
  radioSchema,
  currentOrPastDateUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import {
  applicationInfoFields,
  BRANCH_OF_SERVICE,
  FORM_21_4502,
} from '../definitions/constants';

const { APPLICATION_INFORMATION: AI } = FORM_21_4502;

const validateDateOfEntry = (errors, value) => {
  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(AI.ERROR_DATE_ENTRY_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(AI.ERROR_DATE_ENTRY_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(AI.ERROR_DATE_ENTRY_INVALID);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(AI.TITLE, AI.PAGE_DESCRIPTION),
    [applicationInfoFields.parentObject]: {
      // 9: Branch of service
      [applicationInfoFields.branchOfService]: radioUI({
        title: AI.BRANCH_OF_SERVICE,
        labels: BRANCH_OF_SERVICE,
        required: () => true,
        errorMessages: {
          required: AI.ERROR_BRANCH_OF_SERVICE,
        },
      }),
      // 11A: Place of entry into active duty
      [applicationInfoFields.placeOfEntry]: textUI({
        title: AI.PLACE_OF_ENTRY,
        required: () => true,
        errorMessages: {
          required: AI.ERROR_PLACE_OF_ENTRY,
        },
      }),
      // 11B: Date of entry into active duty
      [applicationInfoFields.dateOfEntry]: {
        ...currentOrPastDateUI({
          title: AI.DATE_OF_ENTRY,
          hint: AI.HINT_DATE_OF_ENTRY,
          required: () => true,
          errorMessages: {
            pattern: AI.ERROR_DATE_ENTRY_INVALID,
            required: AI.ERROR_DATE_ENTRY_REQUIRED,
          },
        }),
        'ui:options': {
          hint: AI.HINT_DATE_OF_ENTRY,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          pattern: AI.ERROR_DATE_ENTRY_INVALID,
          required: AI.ERROR_DATE_ENTRY_REQUIRED,
        },
        'ui:validations': [validateDateOfEntry],
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.branchOfService]: radioSchema(
            Object.keys(BRANCH_OF_SERVICE),
          ),
          [applicationInfoFields.placeOfEntry]: {
            type: 'string',
            maxLength: 100,
          },
          [applicationInfoFields.dateOfEntry]: { type: 'string' },
        },
        required: [
          applicationInfoFields.branchOfService,
          applicationInfoFields.placeOfEntry,
          applicationInfoFields.dateOfEntry,
        ],
      },
    },
  },
};
