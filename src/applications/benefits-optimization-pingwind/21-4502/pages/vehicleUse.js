import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  titleUI,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  applicationInfoFields,
  DRIVER_OR_PASSENGER,
  FORM_21_4502,
} from '../definitions/constants';

const { VEHICLE_USE: VU } = FORM_21_4502;

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(VU.TITLE, VU.DESCRIPTION),
    'ui:order': [applicationInfoFields.parentObject, 'view:passengerInfoAlert'],
    [applicationInfoFields.parentObject]: {
      [applicationInfoFields.driverOrPassenger]: radioUI({
        title: VU.QUESTION,
        labels: DRIVER_OR_PASSENGER,
        required: () => true,
        hint: VU.HINT,
        errorMessages: {
          required: VU.ERROR,
        },
      }),
    },
    'view:passengerInfoAlert': {
      'ui:field': 'ViewField',
      'ui:options': {
        hideIf: formData =>
          formData?.applicationInfo?.driverOrPassenger !== 'passenger',
      },
      'ui:description': (
        <VaAlert status="info" class="vads-u-margin-top--3" uswds visible>
          <p className="vads-u-margin--0">{VU.PASSENGER_ALERT}</p>
        </VaAlert>
      ),
    },
  },
  schema: {
    type: 'object',
    properties: {
      [applicationInfoFields.parentObject]: {
        type: 'object',
        properties: {
          [applicationInfoFields.driverOrPassenger]: radioSchema(
            Object.keys(DRIVER_OR_PASSENGER),
          ),
        },
        required: [applicationInfoFields.driverOrPassenger],
      },
      'view:passengerInfoAlert': { type: 'object', properties: {} },
    },
  },
};
