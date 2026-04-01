import React from 'react';
import {
  arrayBuilderItemSubsequentPageTitleUI,
  descriptionUI,
  radioUI,
  radioSchema,
} from 'platform/forms-system/src/js/web-component-patterns';
import {
  VaAccordion,
  VaAccordionItem,
  VaLink,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { entitlementRestorationOptions } from '../constants';
import { PropertyAddress } from '../components/PropertyAddress';

const emptyObjectSchema = {
  type: 'object',
  properties: {},
};

const EntitlementRestorationOptions = () => (
  <div className="vads-u-margin-top--5">
    <VaAccordion openSingle>
      <VaAccordionItem header="Understanding your VA home loan entitlement restoration options">
        <p className="vads-u-margin-top--0">
          Your VA home loan entitlement amount determines how much you can
          borrow without a down payment.
          <div>
            <VaLink
              external
              href="https://www.va.gov/housing-assistance/home-loans/loan-limits/"
              text="View VA loan entitlement and loan limits"
            />
          </div>
        </p>

        <p className="vads-u-margin-top--0">
          Here’s what you should know about entitlement restoration options:
        </p>

        <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
          Cash-out refinance programs
        </p>
        <p className="vads-u-margin-top--0">
          You can request an entitlement restoration to refinance your home and
          cash out part of your equity. Entitlement restoration will only apply
          to the home that you bought with your VA home loan entitlement.{' '}
          <div>
            <VaLink
              external
              href="https://www.va.gov/housing-assistance/home-loans/loan-types/cash-out-loan/"
              text="Learn more about a Cash-out refinance loan"
            />
          </div>
        </p>

        <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
          Refinance to change my interest rate
        </p>
        <p className="vads-u-margin-top--0">
          You can refinance your current VA home loan to get a lower interest
          rate with the Interest Rate Reduction Refinancing Loan (IRRRL)
          program. You can also use this program to switch from an adjustable
          rate to a fixed rate. Your entitlement will be re-used with this
          program.
          <div>
            <VaLink
              external
              href="https://www.va.gov/housing-assistance/home-loans/loan-types/interest-rate-reduction-loan/"
              text="Learn more about an IRRRL"
            />
          </div>
        </p>

        <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
          Regular restoration of entitlement
        </p>
        <p className="vads-u-margin-top--0">
          Regular restorations of entitlement require a prior VA loan to be paid
          in full and the property to be no longer owned by the Veteran. There
          is no limit to the number of regular restorations a Veteran can
          receive.
        </p>

        <p className="vads-u-margin-bottom--0 vads-u-font-weight--bold">
          One-time restoration
        </p>
        <p className="vads-u-margin-top--0">
          You can receive a one-time restoration if you’ve repaid the VA loan in
          full, but plan to keep the home. You can only do a one-time
          restoration once in your lifetime.
        </p>
      </VaAccordionItem>
    </VaAccordion>
  </div>
);

export default {
  uiSchema: {
    ...arrayBuilderItemSubsequentPageTitleUI(
      () => 'Property with VA home loan: Entitlement restoration',
      ({ formData }) => (
        <div>
          <p>
            If certain conditions are met, you may be able to restore your VA
            home loan entitlement to use it again on another VA backed loan.
          </p>
          <PropertyAddress formData={formData} />
        </div>
      ),
    ),
    entitlementRestoration: radioUI({
      title:
        'Do you want to make this property’s VA benefit available to use on a different home or in a different way?',
      labels: {
        [entitlementRestorationOptions.ENTITLEMENT_INQUIRY_ONLY]:
          'No, I’m just checking my entitlement',
        [entitlementRestorationOptions.CASH_OUT_REFINANCE]:
          'Yes, I want to refinance and take cash out',
        [entitlementRestorationOptions.INTEREST_RATE_REDUCTION_REFINANCE]:
          'Yes, I want to refinance to change my interest rate',
        [entitlementRestorationOptions.REGULAR_RESTORATION]:
          'Yes, I want a regular restoration of entitlement',
        [entitlementRestorationOptions.ONE_TIME_RESTORATION]:
          'Yes, I want a one-time restoration',
      },
    }),
    'view:entitlementRestorationOptions': descriptionUI(
      <EntitlementRestorationOptions />,
    ),
  },
  schema: {
    type: 'object',
    properties: {
      entitlementRestoration: radioSchema([
        entitlementRestorationOptions.ENTITLEMENT_INQUIRY_ONLY,
        entitlementRestorationOptions.CASH_OUT_REFINANCE,
        entitlementRestorationOptions.INTEREST_RATE_REDUCTION_REFINANCE,
        entitlementRestorationOptions.REGULAR_RESTORATION,
        entitlementRestorationOptions.ONE_TIME_RESTORATION,
      ]),
      'view:entitlementRestorationOptions': emptyObjectSchema,
    },
    required: ['entitlementRestoration'],
  },
};
