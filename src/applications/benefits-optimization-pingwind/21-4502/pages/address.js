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

const { ADDRESS: A } = FORM_21_4502;

const addressUISchema = addressUI({
  labels: {
    militaryCheckbox: A.MILITARY_CHECKBOX,
    street: A.STREET,
    street2: A.STREET2,
    city: A.CITY,
    postalCode: A.POSTAL_CODE,
  },
  omit: ['street3'],
  required: { state: () => true },
});

addressUISchema.street = {
  ...addressUISchema.street,
  'ui:errorMessages': {
    ...addressUISchema.street?.['ui:errorMessages'],
    required: A.ERROR_STREET_REQUIRED,
  },
};

// Override state label to "State" (platform uses "State, province, or region" for international)
addressUISchema.state = {
  ...addressUISchema.state,
  'ui:title': A.STATE,
};

// Customize postal code error messages for 21-4502
const originalPostalReplaceSchema =
  addressUISchema.postalCode?.['ui:options']?.replaceSchema;
if (originalPostalReplaceSchema) {
  addressUISchema.postalCode['ui:options'].replaceSchema = (
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
    ...titleUI(A.TITLE, A.PAGE_DESCRIPTION),
    [veteranFields.parentObject]: {
      [veteranFields.address]: addressUISchema,
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.address]: addressSchema({ omit: ['street3'] }),
        },
        required: [veteranFields.address],
      },
    },
  },
};
