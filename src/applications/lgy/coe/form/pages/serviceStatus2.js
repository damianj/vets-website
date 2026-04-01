import React from 'react';
import {
  titleUI,
  radioUI,
  radioSchema,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { serviceStatuses } from '../constants';

const emptyObjectSchema = {
  type: 'object',
  properties: {},
};

const ServiceStatusNote = () => (
  <p>
    <strong>Note:</strong> We’ll ask you later in this form to upload documents
    confirming your service.
  </p>
);

export default {
  uiSchema: {
    ...titleUI('Your service status'),
    identity: radioUI({
      title: 'Which of these describes you?',
      labels: {
        [serviceStatuses.VETERAN]:
          "I'm a Veteran, or previously activated member of the National Guard or Reserves",
        [serviceStatuses.ADSM]: "I'm currently an active-duty service member",
        [serviceStatuses.NADNA]:
          "I'm a current member of the National Guard or Reserves and have never been activated",
        [serviceStatuses.DNANA]:
          "I'm a discharged member of the National Guard and was never activated",
        [serviceStatuses.DRNA]:
          "I'm a discharged member of the Reserves and was never activated",
      },
    }),
    'view:serviceStatusNote': descriptionUI(<ServiceStatusNote />),
  },
  schema: {
    type: 'object',
    properties: {
      identity: radioSchema([
        serviceStatuses.VETERAN,
        serviceStatuses.ADSM,
        serviceStatuses.NADNA,
        serviceStatuses.DNANA,
        serviceStatuses.DRNA,
      ]),
      'view:serviceStatusNote': emptyObjectSchema,
    },
    required: ['identity'],
  },
};
