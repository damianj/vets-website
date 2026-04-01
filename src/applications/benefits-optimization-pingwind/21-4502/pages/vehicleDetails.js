import {
  titleUI,
  radioUI,
  radioSchema,
  textUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  applicationInfoFields,
  CONVEYANCE_TYPES,
  FORM_21_4502,
} from '../definitions/constants';

const { VEHICLE_DETAILS: VD } = FORM_21_4502;

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(VD.TITLE, VD.PAGE_DESCRIPTION),
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.conveyanceType]: radioUI({
        title: VD.QUESTION_TYPE,
        labels: CONVEYANCE_TYPES,
        required: () => true,
        errorMessages: {
          required: VD.ERROR_TYPE,
        },
      }),
      [applicationInfoFields.conveyanceTypeOther]: {
        ...textUI({
          title: VD.OTHER_SPECIFY,
          required: formData =>
            formData?.applicationInfo?.conveyanceType === 'other',
          errorMessages: {
            required: VD.ERROR_OTHER,
          },
          hideIf: formData =>
            formData?.applicationInfo?.conveyanceType !== 'other',
          hideEmptyValueInReview: true,
        }),
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.conveyanceType]: radioSchema(
            Object.keys(CONVEYANCE_TYPES),
          ),
          [applicationInfoFields.conveyanceTypeOther]: {
            type: 'string',
            maxLength: 100,
          },
        },
        required: [applicationInfoFields.conveyanceType],
      },
    },
  },
};
