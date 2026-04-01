import {
  titleUI,
  yesNoUI,
  yesNoSchema,
  currentOrPastDateUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  currentYear,
  parseISODate,
} from 'platform/forms-system/src/js/helpers';
import VaDateField from 'platform/forms-system/src/js/web-component-fields/VaDateField';
import VaTextInputField from 'platform/forms-system/src/js/web-component-fields/VaTextInputField';
import { isValidDate } from 'platform/forms-system/src/js/utilities/validations';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { PREVIOUS_VEHICLE_APPLICATION: P } = FORM_21_4502;

const validatePreviousApplicationDate = (errors, value, formData) => {
  if (formData?.applicationInfo?.previouslyAppliedConveyance !== true) {
    return;
  }

  const { day, month, year } = parseISODate(value);
  const hasAnyDatePart = [day, month, year].some(Boolean);
  const hasCompleteDate = [day, month, year].every(Boolean);

  if (!value || !hasAnyDatePart) {
    errors.addError(P.ERROR_DATE_REQUIRED);
    return;
  }

  if (!hasCompleteDate) {
    errors.addError(P.ERROR_DATE_INCOMPLETE);
    return;
  }

  if (
    Number(year) < 1900 ||
    Number(year) > currentYear ||
    !isValidDate(day, month, year)
  ) {
    errors.addError(P.ERROR_DATE_PATTERN);
  }
};

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(P.TITLE, P.PAGE_DESCRIPTION),
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.previouslyAppliedConveyance]: yesNoUI({
        title: P.QUESTION_PREVIOUSLY_APPLIED,
        labels: P.LABELS_PREVIOUSLY_APPLIED,
        required: () => true,
        errorMessages: {
          required: P.ERROR_PREVIOUSLY_APPLIED,
        },
      }),
      [applicationInfoFields.previouslyAppliedDate]: {
        ...currentOrPastDateUI({
          title: P.TITLE_PREVIOUSLY_APPLIED_DATE,
          hint: P.HINT_DATE,
          required: formData =>
            formData?.applicationInfo?.previouslyAppliedConveyance === true,
          errorMessages: {
            pattern: P.ERROR_DATE_PATTERN,
            required: P.ERROR_DATE_REQUIRED,
          },
        }),
        'ui:options': {
          hint: P.HINT_DATE,
          hideIf: formData =>
            formData?.applicationInfo?.previouslyAppliedConveyance !== true,
        },
        'ui:webComponentField': VaDateField,
        'ui:errorMessages': {
          pattern: P.ERROR_DATE_PATTERN,
          required: P.ERROR_DATE_REQUIRED,
        },
        'ui:validations': [validatePreviousApplicationDate],
      },
      [applicationInfoFields.previouslyAppliedPlace]: {
        'ui:title': P.TITLE_PREVIOUSLY_APPLIED_PLACE,
        'ui:options': {
          hideIf: formData =>
            formData?.applicationInfo?.previouslyAppliedConveyance !== true,
        },
        'ui:required': formData =>
          formData?.applicationInfo?.previouslyAppliedConveyance === true,
        'ui:errorMessages': {
          required: P.ERROR_PLACE_REQUIRED,
        },
        'ui:webComponentField': VaTextInputField,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.previouslyAppliedConveyance]: yesNoSchema,
          [applicationInfoFields.previouslyAppliedDate]: { type: 'string' },
          [applicationInfoFields.previouslyAppliedPlace]: {
            type: 'string',
            maxLength: 100,
          },
        },
        required: [applicationInfoFields.previouslyAppliedConveyance],
      },
    },
  },
};
