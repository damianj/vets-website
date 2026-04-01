import {
  titleUI,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { applicationInfoFields, FORM_21_4502 } from '../definitions/constants';

const { CURRENT_SERVICE_STATUS: C } = FORM_21_4502;

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(C.TITLE),
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.currentlyOnActiveDuty]: yesNoUI({
        title: C.QUESTION,
        labels: C.LABELS,
        required: () => true,
        errorMessages: {
          required: C.ERROR,
        },
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.currentlyOnActiveDuty]: yesNoSchema,
        },
        required: [applicationInfoFields.currentlyOnActiveDuty],
      },
    },
  },
};
