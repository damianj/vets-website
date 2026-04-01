import React from 'react';
import {
  arrayBuilderItemSubsequentPageTitleUI,
  currentOrPastMonthYearDateSchema,
  currentOrPastMonthYearDateUI,
  numberSchema,
  numberUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { PropertyAddress } from '../components/PropertyAddress';

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      () => 'Property with VA home loan: Loan details',
      ({ formData }) => <PropertyAddress formData={formData} />,
    ),
    loanDate: currentOrPastMonthYearDateUI({
      title: 'Loan date',
      hint:
        "Enter the closing date of your loan. If you don't know the exact date, enter your best guess",
    }),
    vaLoanNumber: {
      ...numberUI({
        title: 'VA home loan number',
        hint: 'Enter a 12-digit loan number',
        errorMessages: {
          max: 'Make sure you include 12 digits.',
          pattern: 'Enter numbers only',
        },
        width: 'md',
      }),
      'ui:validations': [
        (errors, formData, uiSchema, schema, errorMessages) => {
          if (!formData) return;
          if (!/^[0-9]*$/.test(formData)) {
            errors.addError(errorMessages?.pattern);
            return;
          }
          if (formData.length !== 12) {
            errors.addError(errorMessages?.max);
          }
        },
      ],
    },
  },
  schema: {
    type: 'object',
    properties: {
      loanDate: currentOrPastMonthYearDateSchema,
      vaLoanNumber: numberSchema,
    },
  },
};
