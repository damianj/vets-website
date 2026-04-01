import {
  titleUI,
  yesNoUI,
  yesNoSchema,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { VETERAN_DISABILITY_COMPENSATION: V } = FORM_21_4502;

const validateDisabilityCompensationFields = (errors, formData) => {
  if (formData?.appliedDisabilityCompensation !== true) {
    return;
  }

  if (!formData?.appliedDisabilityCompensationPlace?.trim()) {
    errors.appliedDisabilityCompensationPlace.addError(V.ERROR_IF_YES);
  }

  const { day, month, year } = parseISODate(formData?.dateApplied);
  const hasAnyDatePart = [day, month, year].some(Boolean);

  if (!formData?.dateApplied || !hasAnyDatePart) {
    errors.dateApplied.addError(V.ERROR_DATE_APPLIED_REQUIRED);
  }
};

const validateDateApplied = (errors, value, formData) => {
  if (formData?.applicationInfo?.appliedDisabilityCompensation !== true) {
    return;
  }

  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(V.ERROR_DATE_APPLIED_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(V.ERROR_DATE_APPLIED_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(V.ERROR_DATE_APPLIED_INVALID);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(V.TITLE),
    [applicationInfoFields.parentObject]: {
      'ui:validations': [validateDisabilityCompensationFields],
      // 12A: Applied for disability compensation
      [applicationInfoFields.appliedDisabilityCompensation]: yesNoUI({
        title: V.QUESTION_APPLIED,
        labels: V.LABELS,
        required: () => true,
        errorMessages: {
          required: V.ERROR_APPLIED,
        },
      }),

      [applicationInfoFields.appliedDisabilityCompensationPlace]: {
        'ui:title': V.TITLE_IF_YES,
        'ui:options': {
          classNames: 'applied-disability-compensation-place-field',
          hideIf: formData =>
            formData?.applicationInfo?.appliedDisabilityCompensation !== true,
          hideEmptyValueInReview: true,
        },
        'ui:errorMessages': {
          required: V.ERROR_IF_YES,
        },
      },
      // 12B: Date you applied
      [applicationInfoFields.dateApplied]: {
        ...currentOrPastDateUI({
          title: V.DATE_APPLIED,
          hint: V.HINT_DATE_APPLIED,
          required: formData =>
            formData?.applicationInfo?.appliedDisabilityCompensation === true,
          errorMessages: {
            pattern: V.ERROR_DATE_APPLIED_INVALID,
            required: V.ERROR_DATE_APPLIED_REQUIRED,
          },
        }),
        'ui:options': {
          hint: V.HINT_DATE_APPLIED,
          hideIf: formData =>
            formData?.applicationInfo?.appliedDisabilityCompensation !== true,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          pattern: V.ERROR_DATE_APPLIED_INVALID,
          required: V.ERROR_DATE_APPLIED_REQUIRED,
        },
        'ui:validations': [validateDateApplied],
      },
      // 13: VA office location
      [applicationInfoFields.vaOfficeLocation]: {
        'ui:title': V.VA_OFFICE_LOCATION,
        'ui:options': { hideEmptyValueInReview: true },
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.appliedDisabilityCompensation]: yesNoSchema,
          [applicationInfoFields.appliedDisabilityCompensationPlace]: {
            type: 'string',
            maxLength: 200,
          },
          [applicationInfoFields.dateApplied]: { type: 'string' },
          [applicationInfoFields.vaOfficeLocation]: {
            type: 'string',
            maxLength: 200,
          },
        },
        required: [applicationInfoFields.appliedDisabilityCompensation],
      },
    },
  },
};
