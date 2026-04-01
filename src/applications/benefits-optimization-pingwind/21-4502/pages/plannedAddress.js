import get from 'platform/utilities/data/get';
import {
  addressUI,
  addressSchema,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  veteranFields,
  POSTAL_CODE_ERROR_MESSAGES,
  FORM_21_4502,
} from '../definitions/constants';

const { ADDRESS: A, PLANNED_ADDRESS: PA } = FORM_21_4502;

const plannedAddressUISchema = addressUI({
  labels: {
    militaryCheckbox: A.MILITARY_CHECKBOX,
    street: A.STREET,
    street2: PA.STREET2,
    city: A.CITY,
    postalCode: A.POSTAL_CODE,
  },
  omit: ['street3'],
  required: true,
});

plannedAddressUISchema.street = {
  ...plannedAddressUISchema.street,
  'ui:errorMessages': {
    ...plannedAddressUISchema.street?.['ui:errorMessages'],
    required: PA.ERROR_STREET_REQUIRED,
  },
};

plannedAddressUISchema.state = {
  ...plannedAddressUISchema.state,
  'ui:title': A.STATE,
};

// Customize postal code error messages for 21-4502
const originalPostalReplaceSchema =
  plannedAddressUISchema.postalCode?.['ui:options']?.replaceSchema;
if (originalPostalReplaceSchema) {
  plannedAddressUISchema.postalCode['ui:options'].replaceSchema = (
    formData,
    schema,
    uiSchema,
    index,
    path,
  ) => {
    const result = originalPostalReplaceSchema(
      formData,
      schema,
      uiSchema,
      index,
      path,
    );
    const addressPath = path?.length ? path.slice(0, -1) : [];
    const addressData = get(addressPath, formData) ?? {};
    const { country } = addressData;
    let messages = POSTAL_CODE_ERROR_MESSAGES.OTHER;
    if (country === 'USA') messages = POSTAL_CODE_ERROR_MESSAGES.USA;
    else if (['CAN', 'MEX'].includes(country))
      messages = POSTAL_CODE_ERROR_MESSAGES[country];
    else if (!country) messages = POSTAL_CODE_ERROR_MESSAGES.NONE;
    // eslint-disable-next-line no-param-reassign -- replaceSchema mutates uiSchema per platform pattern
    uiSchema['ui:errorMessages'] = messages;
    return result;
  };
}

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(PA.TITLE),
    [veteranFields.parentObject]: {
      [veteranFields.plannedAddress]: {
        ...plannedAddressUISchema,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.plannedAddress]: addressSchema({
            omit: ['street3'],
            required: true,
          }),
        },
      },
    },
  },
};
