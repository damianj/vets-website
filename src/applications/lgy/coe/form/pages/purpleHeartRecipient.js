import React from 'react';
import {
  titleUI,
  yesNoUI,
  yesNoSchema,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  VaAccordion,
  VaAccordionItem,
} from '@department-of-veterans-affairs/web-components/react-bindings';

const emptyObjectSchema = {
  type: 'object',
  properties: {},
};
const PurpleHeartWhyAccordion = () => (
  <VaAccordion uswds openSingle className="vads-u-margin-top--2">
    <VaAccordionItem header="Why we ask this question">
      <p className="vads-u-margin-y--0">
        As part of the VA home loan process, borrowers are usually required to
        pay the VA funding fee. However, you may not have to pay this fee if
        you’re a Purple Heart recipient who is currently serving on active duty.
      </p>
      <p className="vads-u-margin-top--0">
        <a
          href="/housing-assistance/home-loans/funding-fee-and-closing-costs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about the VA funding fee
        </a>
      </p>
      <p className="vads-u-margin-bottom--0">
        <strong>Note:</strong> We don’t consider activations under Title 32
        orders as active duty for the purpose of funding fee exemption.
      </p>
    </VaAccordionItem>
  </VaAccordion>
);
export default {
  uiSchema: {
    ...titleUI('Purple Heart'),
    militaryHistory: {
      purpleHeartRecipient: yesNoUI({
        title: 'Are you a Purple Heart recipient?',
        errorMessages: { required: 'Select yes or no' },
      }),
    },
    'view:purpleHeartWhyAccordion': descriptionUI(<PurpleHeartWhyAccordion />),
  },
  schema: {
    type: 'object',
    properties: {
      militaryHistory: {
        type: 'object',
        properties: {
          purpleHeartRecipient: yesNoSchema,
        },
        required: ['purpleHeartRecipient'],
      },
      'view:purpleHeartWhyAccordion': emptyObjectSchema,
    },
  },
};
