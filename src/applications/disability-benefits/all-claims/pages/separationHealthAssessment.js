import React from 'react';
import {
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import { SeparationHealthAssessmentWarningAlert } from '../content/separationHealthAssessmentWarningAlert';

export const uiSchema = {
  'view:separationHealthAssessmentAlertWarning': {
    'ui:title': () => (
      <h3 className="vads-u-margin--0">Your Separation Health Assessment</h3>
    ),
    'ui:description': SeparationHealthAssessmentWarningAlert,
  },
  'view:hasSeparationHealthAssessment': yesNoUI(
    'Do you want to upload your Separation Health Assessment with this claim submission?',
  ),
};

export const schema = {
  required: ['view:hasSeparationHealthAssessment'],
  type: 'object',
  properties: {
    'view:separationHealthAssessmentAlertWarning': {
      type: 'object',
      properties: {},
    },
    'view:hasSeparationHealthAssessment': yesNoSchema,
  },
};
