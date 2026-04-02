import {
  titleUI,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const schema = {
  type: 'object',
  properties: {
    doesLiveWithSpouse: {
      type: 'object',
      properties: {
        spouseIncome: radioSchema(['Y', 'N']),
      },
    },
  },
};

export const uiSchema = {
  ...titleUI('Spouse’s income'),
  doesLiveWithSpouse: {
    spouseIncome: radioUI({
      title: 'Has your spouse received income in the last 365 days?',
      labels: {
        Y: 'Yes',
        N: 'No',
      },
      required: () => true,
    }),
  },
};
