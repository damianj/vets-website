import {
  titleUI,
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export default {
  uiSchema: {
    ...titleUI('Separation'),
    militaryHistory: {
      separatedDueToDisability: yesNoUI({
        title:
          'Have you been discharged, retired, or separated from service because of a disability?',
        errorMessages: {
          required: 'Select yes or no',
        },
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      militaryHistory: {
        type: 'object',
        properties: {
          separatedDueToDisability: yesNoSchema,
        },
        required: ['separatedDueToDisability'],
      },
    },
  },
};
