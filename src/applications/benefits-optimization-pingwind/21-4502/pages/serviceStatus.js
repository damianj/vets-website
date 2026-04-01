import {
  titleUI,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { SERVICE_STATUS: S } = FORM_21_4502;

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(S.TITLE),
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.activeDutyStatus]: yesNoUI({
        title: S.QUESTION,
        labels: S.LABELS,
        required: () => true,
        errorMessages: {
          required: S.ERROR,
        },
        hideLabelText: true,
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.activeDutyStatus]: yesNoSchema,
        },
        required: [applicationInfoFields.activeDutyStatus],
      },
    },
  },
};
