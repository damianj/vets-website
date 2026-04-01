import React from 'react';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import {
  checkboxRequiredSchema,
  checkboxUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { FORM_21_4502 } from '../definitions/constants';

const { CERTIFICATION: C } = FORM_21_4502;

/** @type {PageSchema} */
export default {
  uiSchema: {
    'ui:options': { preserveHiddenData: true },
    ...titleUI(C.TITLE, C.PAGE_DESCRIPTION),
    'ui:order': [
      'certifyLicensing',
      'certifyNoPriorGrant',
      'view:penaltyAlert',
    ],
    'view:penaltyAlert': {
      'ui:field': 'ViewField',
      'ui:description': (
        <VaAlert status="warning" uswds visible>
          <h2 slot="headline" className="vads-u-font-weight--bold">
            {C.PENALTY_HEADING}
          </h2>
          <p className="vads-u-margin--0">{C.PENALTY_TEXT}</p>
        </VaAlert>
      ),
    },
    certifyLicensing: checkboxUI({
      title: C.CERTIFY_LICENSING_TITLE,
      description: (
        <>
          <p className="vads-u-font-weight--bold vads-u-margin-top--0 vads-u-margin-bottom--2">
            {C.CERTIFY_LICENSING_HEADING}
          </p>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {C.CERTIFY_LICENSING_DESCRIPTION}
          </p>
        </>
      ),
      required: () => true,
      classNames:
        'vads-u-background-color--gray-lightest vads-u-padding--4 vads-u-margin-bottom--4',
      errorMessages: {
        enum: C.ERROR_LICENSING,
        required: C.ERROR_LICENSING,
      },
    }),
    certifyNoPriorGrant: checkboxUI({
      title: C.CERTIFY_NO_PRIOR_TITLE,
      description: (
        <>
          <p className="vads-u-font-weight--bold vads-u-margin-top--0 vads-u-margin-bottom--2">
            {C.CERTIFY_NO_PRIOR_HEADING}
          </p>
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
            {C.CERTIFY_NO_PRIOR_DESCRIPTION}
          </p>
        </>
      ),
      required: () => true,
      classNames:
        'vads-u-background-color--gray-lightest vads-u-padding--4 vads-u-margin-bottom--4',
      errorMessages: {
        enum: C.ERROR_NO_PRIOR,
        required: C.ERROR_NO_PRIOR,
      },
    }),
  },
  schema: {
    type: 'object',
    properties: {
      certifyLicensing: checkboxRequiredSchema,
      certifyNoPriorGrant: checkboxRequiredSchema,
      'view:penaltyAlert': { type: 'object', properties: {} },
    },
    required: ['certifyLicensing', 'certifyNoPriorGrant'],
  },
};
