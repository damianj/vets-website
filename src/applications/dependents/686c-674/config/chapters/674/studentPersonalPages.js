import {
  arrayBuilderItemSubsequentPageTitleUI,
  addressUI,
  addressSchema,
  radioUI,
  radioSchema,
  yesNoUI,
  yesNoSchema,
  currentOrPastDateUI,
  currentOrPastDateSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { asciiValidation } from '../../helpers';

/** @returns {PageSchema} */
export const studentIncomePage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) =>
        `${formData?.fullName?.first || 'this student'}’s income information`,
      null,
      false,
    ),
    studentIncome: radioUI({
      title: 'Did this student have an income in the last 365 days?',
      labels: {
        Y: 'Yes',
        N: 'No',
      },
      required: () => true,
      updateUiSchema: () => ({
        'ui:options': {
          hint: '',
        },
      }),
    }),
  },
  schema: {
    type: 'object',
    properties: {
      studentIncome: radioSchema(['Y', 'N']),
    },
  },
};

/** @returns {PageSchema} */
export const studentAddressPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) =>
        `${formData?.fullName?.first || 'this student'}’s address`,
      null,
      false,
    ),
    address: {
      ...addressUI({
        title: '',
        omit: ['street3'],
        labels: {
          street2: 'Apartment or unit number',
          militaryCheckbox:
            'The student receives mail outside of the United States on a U.S. military base.',
        },
      }),
      city: {
        ...addressUI().city,
        'ui:validations': [
          (errors, city, formData) => {
            const address = formData?.address;
            const cityStr = city?.trim().toUpperCase();

            if (city?.length > 30) {
              errors.addError('City must be 30 characters or less');
            }

            if (
              address &&
              ['APO', 'FPO', 'DPO'].includes(cityStr) &&
              address.isMilitary !== true
            ) {
              errors.addError('Enter a valid city name');
            }
          },
          asciiValidation,
        ],
      },
    },
  },
  schema: {
    type: 'object',
    required: ['address'],
    properties: {
      address: addressSchema({ omit: ['street3'] }),
    },
  },
};

/** @returns {PageSchema} */
export const studentMaritalStatusPage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) =>
        `${formData?.fullName?.first || 'this student'}’s marital status`,
      null,
      false,
    ),
    wasMarried: {
      ...yesNoUI('Has this student ever been married?'),
      'ui:required': () => true,
    },
  },
  schema: {
    type: 'object',
    required: ['wasMarried'],
    properties: {
      wasMarried: yesNoSchema,
    },
  },
};

/** @returns {PageSchema} */
export const studentMarriageDatePage = {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      ({ formData }) =>
        `${formData?.fullName?.first || 'this student'}’s marriage date`,
      null,
      false,
    ),
    marriageDate: currentOrPastDateUI({
      title: 'Date of marriage',
      required: () => true,
    }),
    'ui:options': {
      updateSchema: (formData, schema, _uiSchema, index) => {
        const itemData = formData?.studentInformation?.[index] || {};

        if (itemData?.wasMarried !== true) {
          itemData.marriageDate = undefined;
          return schema;
        }

        return {
          ...schema,
          required: ['marriageDate'],
        };
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      marriageDate: currentOrPastDateSchema,
    },
  },
};
