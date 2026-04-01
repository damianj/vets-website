import {
  titleUI,
  checkboxGroupUI,
  checkboxGroupSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  QUALIFYING_DISABILITIES,
  FORM_21_4502,
} from '../definitions/constants';

const { QUALIFYING_DISABILITIES: QD } = FORM_21_4502;

/** @type {PageSchema} */
export const qualifyingDisabilitiesPage = {
  uiSchema: {
    ...titleUI(QD.TITLE),
    qualifyingDisabilities: {
      ...checkboxGroupUI({
        title: QD.QUESTION,
        labels: QUALIFYING_DISABILITIES,
        required: () => true,
        errorMessages: {
          atLeastOne: QD.ERROR,
        },
      }),
    },
  },
  schema: {
    type: 'object',
    required: ['qualifyingDisabilities'],
    properties: {
      qualifyingDisabilities: checkboxGroupSchema(
        Object.keys(QUALIFYING_DISABILITIES),
      ),
    },
  },
};
