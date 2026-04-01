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
const PreDischargeClaimWhyAccordion = () => (
  <VaAccordion uswds openSingle className="vads-u-margin-top--2">
    <VaAccordionItem header="What a pre-discharge claim is and why we ask about it">
      <p className="vads-u-margin-top--0">
        A pre-discharge claim is a type of claim submitted by service members
        180 to 90 days before their discharge. The pre-discharge claim’s
        objective is to reduce or eliminate the gap in VA disability
        compensation benefits shortly after separation.
      </p>
      <p>
        As part of the VA home loan process, borrowers are usually required to
        pay the VA funding fee. You may not have to pay this fee if you are a
        Veteran with a pre-discharge claim.
      </p>
      <p>
        <a
          href="/housing-assistance/home-loans/funding-fee-and-closing-costs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about the VA funding fee
        </a>
      </p>
      <p className="vads-u-margin-bottom--0">
        <strong>Note:</strong> If you don’t obtain a proposed or memorandum
        rating before the loan closing and you are still in service, the funding
        fee exemption does not apply. And you won’t be entitled to a refund from
        VA.
      </p>
    </VaAccordionItem>
  </VaAccordion>
);
export default {
  uiSchema: {
    ...titleUI('Pre-discharge claim'),
    militaryHistory: {
      preDischargeClaim: yesNoUI({
        title:
          'Have you submitted a pre-discharge claim for service-connected disability with the VA?',
        errorMessages: { required: 'Select yes or no' },
      }),
    },
    'view:preDischargeClaimWhyAccordion': descriptionUI(
      <PreDischargeClaimWhyAccordion />,
    ),
  },
  schema: {
    type: 'object',
    properties: {
      militaryHistory: {
        type: 'object',
        properties: {
          preDischargeClaim: yesNoSchema,
        },
        required: ['preDischargeClaim'],
      },
      'view:preDischargeClaimWhyAccordion': emptyObjectSchema,
    },
  },
};
