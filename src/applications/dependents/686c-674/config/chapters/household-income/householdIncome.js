import React from 'react';
import {
  titleUI,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { whatAreAssets, netWorthTitle, netWorthDescription } from './helpers';
import { NetWorthFooter } from '../../../components/PensionContent';

// Radio option values
const HOUSEHOLD_INCOME_YES = 'Y';
const HOUSEHOLD_INCOME_NO = 'N';

export const schema = {
  type: 'object',
  properties: {
    'view:householdIncome': radioSchema([
      HOUSEHOLD_INCOME_YES,
      HOUSEHOLD_INCOME_NO,
    ]),
    'view:householdIncomeFooter': {
      type: 'object',
      properties: {},
    },
  },
};

// Labels for radio options
const getLabels = () => ({
  [HOUSEHOLD_INCOME_YES]: 'Yes',
  [HOUSEHOLD_INCOME_NO]: 'No',
});

export const uiSchema = {
  ...titleUI('Your net worth'),
  'ui:description': () => (
    <>
      <p>{netWorthDescription()}</p>
      {whatAreAssets}
    </>
  ),
  'ui:options': {
    updateSchema: (formData, formSchema) => {
      // Use 'view:householdIncome' as UI value and householdIncome as RBPS value
      // Map string values to boolean for RBPS:
      //  'Y' -> true, 'N' -> false, '' -> undefined

      const updated = formData;
      const viewValue = formData['view:householdIncome'];

      // If view:householdIncome is defined, set householdIncome based on selection
      switch (viewValue) {
        case HOUSEHOLD_INCOME_YES:
          updated.householdIncome = true;
          break;
        case HOUSEHOLD_INCOME_NO:
          updated.householdIncome = false;
          break;
        case undefined:
          // If householdIncome is defined but view:householdIncome is undefined
          // (user hasn't seen the question yet but in-progress form exists),
          // set view:householdIncome based on householdIncome value
          if (formData.householdIncome !== undefined) {
            updated['view:householdIncome'] = formData.householdIncome
              ? HOUSEHOLD_INCOME_YES
              : HOUSEHOLD_INCOME_NO;
          }
          break;
        default:
          // Empty value - don't set householdIncome (pass nothing)
          delete updated.householdIncome;
      }

      return {
        ...formSchema,
        properties: {
          ...formSchema.properties,
          'view:householdIncome': {
            type: 'string',
            enum: [HOUSEHOLD_INCOME_YES, HOUSEHOLD_INCOME_NO],
          },
        },
      };
    },
  },
  'view:householdIncome': radioUI({
    tile: true,
    title: netWorthTitle(),
    labels: getLabels(),
    enableAnalytics: true,
  }),
  'view:householdIncomeFooter': {
    'ui:description': NetWorthFooter,
  },
};
