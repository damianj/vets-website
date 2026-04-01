import React from 'react';
import {
  yesNoUI,
  yesNoSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

export const uiSchema = {
  'ui:title': <h3 className="vads-u-margin-y--0">Training pay</h3>,
  hasTrainingPay: yesNoUI({
    title: 'Do you expect to receive active or inactive duty training pay?',
  }),
};

export const schema = {
  type: 'object',
  required: ['hasTrainingPay'],
  properties: {
    hasTrainingPay: yesNoSchema,
  },
};
