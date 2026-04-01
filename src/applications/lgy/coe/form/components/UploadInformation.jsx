import React from 'react';
import PropTypes from 'prop-types';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { serviceStatuses } from '../constants';

const UploadInformation = props => {
  const { hadPriorLoans, formData } = props;

  const showStatementOfService = [
    serviceStatuses.VETERAN,
    serviceStatuses.ADSM,
    serviceStatuses.NADNA,
  ].includes(formData?.identity);
  if (!showStatementOfService && !props.hadPriorLoans) {
    return null;
  }

  return (
    <div className="vads-u-margin-top--4">
      <va-accordion data-testid="document-upload-accordion" open-single>
        {showStatementOfService && (
          <va-accordion-item>
            <h3 slot="headline">Statement of service</h3>
            <p>
              The information included in your Statement of Service will be
              different based on your service type.
              <div>
                <VaLink
                  external
                  href="https://www.va.gov/housing-assistance/home-loans/how-to-request-coe/"
                  text="Review requirements for your service type"
                />
              </div>
            </p>
          </va-accordion-item>
        )}
        {hadPriorLoans && (
          <va-accordion-item>
            <h3 slot="headline">
              Type of evidence to show a VA loan was paid in full
            </h3>
            <p>
              Evidence you paid a VA home loan in full can include any of these
              types of documents:
            </p>
            <ul>
              <li>A paid-in-full statement from the former lender</li>
              <li>
                A "Satisfaction of mortgage" statement from the lender and/or
                county recorders office in the county where the home is located
              </li>
              <li>
                A copy of the HUD-1 or Closing Disclosure settlement statement
                completed in connection with a sale of the home or refinance of
                the prior loan
              </li>
            </ul>
            <p>
              <span className="vads-u-font-weight--bold">Note:</span> Many
              counties post public documents like the "Satisfaction of mortgage"
              statement online.
            </p>
          </va-accordion-item>
        )}
      </va-accordion>
    </div>
  );
};

UploadInformation.propTypes = {
  formData: PropTypes.object,
  hadPriorLoans: PropTypes.bool,
};

export default UploadInformation;
