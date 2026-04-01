import {
  checkboxSchema,
  emailToSendNotificationsSchema,
  emailToSendNotificationsUI,
  internationalPhoneSchema,
  internationalPhoneUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import VaCheckboxField from 'platform/forms-system/src/js/web-component-fields/VaCheckboxField';
import { validateTelephoneInput } from 'platform/forms-system/src/js/validation';
import { veteranFields, FORM_21_4502 } from '../definitions/constants';

const { CONTACT_INFO: C } = FORM_21_4502;

// Optional phone: validate format only when user has entered something
const optionalPhoneValidations = [
  (errors, value) => {
    if (!value?.contact || String(value.contact).trim() === '') {
      return;
    }
    validateTelephoneInput(errors, value);
  },
];

const primaryPhoneValidations = [
  (errors, value) => {
    if (!value?.contact || String(value.contact).trim() === '') {
      errors.addError(C.ERROR_PHONE_REQUIRED);
      return;
    }

    validateTelephoneInput(errors, {
      ...value,
      error: C.ERROR_PHONE_REQUIRED,
      required: true,
      touched: true,
    });
  },
];

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    [veteranFields.parentObject]: {
      ...titleUI(C.TITLE, C.PAGE_DESCRIPTION),
      [veteranFields.homePhone]: {
        ...internationalPhoneUI({
          title: C.PRIMARY_PHONE,
          hint: '',
        }),
        'ui:required': () => true,
        'ui:errorMessages': {
          required: C.ERROR_PHONE_REQUIRED,
        },
        'ui:validations': primaryPhoneValidations,
      },
      [veteranFields.alternatePhone]: {
        ...internationalPhoneUI({
          title: C.ALTERNATE_PHONE,
          hint: '',
          hideEmptyValueInReview: true,
        }),
        'ui:validations': optionalPhoneValidations,
      },
      [veteranFields.email]: {
        ...emailToSendNotificationsUI({
          title: C.EMAIL,
          hint: C.EMAIL_HINT,
          errorMessages: {
            required: C.ERROR_EMAIL,
            format: C.ERROR_EMAIL,
          },
        }),
        'ui:required': () => true,
      },
      [veteranFields.agreeToElectronicCorrespondence]: {
        'ui:title': C.AGREE_ELECTRONIC,
        'ui:webComponentField': VaCheckboxField,
        'ui:options': {
          hideEmptyValueInReview: true,
          validateRequired: false,
        },
        'ui:validations': [
          (errors, value, formData) => {
            if (
              value === true &&
              (!formData?.veteran?.email ||
                String(formData.veteran.email).trim() === '')
            ) {
              errors.addError(C.ERROR_AGREE_EMAIL);
            }
          },
        ],
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [veteranFields.parentObject]: {
        type: 'object',
        properties: {
          [veteranFields.homePhone]: internationalPhoneSchema({
            required: true,
          }),
          [veteranFields.alternatePhone]: internationalPhoneSchema(),
          [veteranFields.email]: emailToSendNotificationsSchema,
          [veteranFields.agreeToElectronicCorrespondence]: checkboxSchema,
        },
        required: [veteranFields.homePhone, veteranFields.email],
      },
    },
  },
};
