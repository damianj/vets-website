import {
  titleUI,
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';

export default {
  uiSchema: {
    ...titleUI('Previous VA home loans'),
    loanHistory: {
      hadPriorLoans: yesNoUI({
        title: 'Have you used the VA home loan program before?',
        labels: {
          Y: 'Yes',
          N: 'No',
        },
      }),
    },
  },
  schema: {
    type: 'object',
    properties: {
      loanHistory: {
        type: 'object',
        properties: {
          hadPriorLoans: yesNoSchema,
        },
        required: ['hadPriorLoans'],
      },
    },
  },
};
