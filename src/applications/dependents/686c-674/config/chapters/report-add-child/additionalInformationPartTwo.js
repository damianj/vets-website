import {
  arrayBuilderItemSubsequentPageTitleUI,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const additionalInformationPartTwo = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) => `${formData?.fullName?.first || 'Child'}’s income`,
      null,
      false,
    ),
    incomeInLastYear: radioUI({
      title: 'Has this child received income in the last 365 days?',
      labels: {
        Y: 'Yes',
        N: 'No',
      },
      required: () => true,
    }),
  },
  schema: {
    type: 'object',
    properties: {
      incomeInLastYear: radioSchema(['Y', 'N']),
    },
  },
};
