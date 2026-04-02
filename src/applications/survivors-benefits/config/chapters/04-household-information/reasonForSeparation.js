import {
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  getSeparationReasonOptions,
  separationReasonOptions,
} from '../../../utils/labels';

const getSelectedSeparationReasonOptions = formData =>
  getSeparationReasonOptions(
    Boolean(formData?.survivorsBenefitsForm2025VersionEnabled),
  );

const separationDueToAssignedReasons = radioUI({
  title: 'What was the reason you lived separately?',
  labels: separationReasonOptions,
});

/** @type {PageSchema} */
export default {
  uiSchema: {
    ...titleUI('Reason for living apart'),
    separationDueToAssignedReasons: {
      ...separationDueToAssignedReasons,
      'ui:options': {
        ...separationDueToAssignedReasons['ui:options'],
        updateUiSchema: formData => ({
          'ui:options': {
            labels: getSelectedSeparationReasonOptions(formData),
          },
        }),
        updateSchema: formData =>
          radioSchema(
            Object.keys(getSelectedSeparationReasonOptions(formData)),
          ),
      },
    },
  },
  schema: {
    type: 'object',
    required: ['separationDueToAssignedReasons'],
    properties: {
      separationDueToAssignedReasons: radioSchema(
        Object.keys(separationReasonOptions),
      ),
    },
  },
};
