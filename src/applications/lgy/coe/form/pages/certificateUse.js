import React from 'react';
import {
  descriptionUI,
  radioSchema,
  radioUI,
  titleUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  VaAccordion,
  VaAccordionItem,
  VaLink,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { certificateUseOptions } from '../constants';

const OptionsAccordion = () => (
  <VaAccordion className="vads-u-margin-top--2" openSingle>
    <VaAccordionItem header="Understanding how you can use your COE">
      <p className="vads-u-margin-top--0">
        There are several reasons why you may want to request a COE.
      </p>
      <p className="vads-u-margin-y--0 vads-u-font-weight--bold">
        To check your eligibility
      </p>
      <p className="vads-u-margin-top--0">
        You can request a COE to find out if you’re eligible for a VA home loan.
        You can also check how much entitlement you have.
      </p>

      <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
        To purchase a home
      </p>
      <p className="vads-u-margin-top--0">
        You can use your COE to get a VA home loan to buy a house, condo, or
        townhouse.
      </p>

      <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
        To obtain a Cash-out Refinance loan
      </p>
      <p className="vads-u-margin-top--0">
        You can use your COE to refinance your home and take cash out from the
        equity. You can also use your COE to refinance a non-VA loan into a VA
        loan.
        <div>
          <VaLink
            external
            href="https://www.va.gov/housing-assistance/home-loans/loan-types/cash-out-loan/"
            text="Learn more about the cash-out refinance program"
          />
        </div>
      </p>

      <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
        To obtain an Interest Rate Reduction Refinancing Loan (IRRRL)
      </p>
      <p className="vads-u-margin-top--0">
        You can use your COE to lower your interest rate or switch from an
        adjustable rate to a fixable rate with the IRRRL program. You can only
        use this program if your current loan is a VA-guaranteed home loan.
        <div>
          <VaLink
            external
            href="https://www.va.gov/housing-assistance/home-loans/loan-types/interest-rate-reduction-loan/"
            text="Learn more about the IRRRL program"
          />
        </div>
      </p>
    </VaAccordionItem>
  </VaAccordion>
);

const emptyObjectSchema = {
  type: 'object',
  properties: {},
};

export default {
  uiSchema: {
    ...titleUI('Certificate use'),
    loanHistory: {
      certificateUse: radioUI({
        title: 'What do you need your COE for?',
        labels: {
          [certificateUseOptions.ENTITLEMENT_INQUIRY_ONLY]:
            'To check my eligibility only',
          [certificateUseOptions.HOME_PURCHASE]: 'To purchase a home',
          [certificateUseOptions.CASH_OUT_REFINANCE]:
            'To refinance and take out cash',
          [certificateUseOptions.INTEREST_RATE_REDUCTION_REFINANCE]:
            'To refinance and change my interest rate',
        },
      }),
    },
    'view:optionsAccordion': descriptionUI(<OptionsAccordion />),
  },
  schema: {
    type: 'object',
    properties: {
      loanHistory: {
        type: 'object',
        properties: {
          certificateUse: radioSchema([
            certificateUseOptions.ENTITLEMENT_INQUIRY_ONLY,
            certificateUseOptions.HOME_PURCHASE,
            certificateUseOptions.CASH_OUT_REFINANCE,
            certificateUseOptions.INTEREST_RATE_REDUCTION_REFINANCE,
          ]),
        },
        required: ['certificateUse'],
      },
      'view:optionsAccordion': emptyObjectSchema,
    },
  },
};
