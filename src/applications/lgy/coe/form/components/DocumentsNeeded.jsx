import React from 'react';
import PropTypes from 'prop-types';
import { serviceStatuses } from '../constants';

const DocumentsNeeded = props => {
  const { hadPriorLoans, formData } = props;

  const requiredDocumentMessages = {
    [serviceStatuses.VETERAN]: (
      <>
        {hadPriorLoans ? (
          <>
            <p>
              You may upload any of the recommended listed documents to support
              your COE application:
            </p>
            <ul>
              <li>
                A copy of your discharge or separation papers (DD214) showing
                character of service
              </li>
              <li>Evidence a VA loan was paid in full, if applicable</li>
            </ul>
          </>
        ) : (
          <p>
            You may upload a copy of your discharge or separation papers (DD214)
            showing character of service
          </p>
        )}
      </>
    ),
    [serviceStatuses.ADSM]: (
      <>
        {formData?.militaryHistory?.purpleHeartRecipient || hadPriorLoans ? (
          <>
            <p>
              You may upload any of the recommended listed documents to support
              your COE application:
            </p>
            <ul>
              <li>Statement of Service</li>
              {formData?.militaryHistory?.purpleHeartRecipient && (
                <li>A copy of your Purple Heart certificate</li>
              )}
              {hadPriorLoans && (
                <li>Evidence a VA loan was paid in full, if applicable</li>
              )}
            </ul>
          </>
        ) : (
          <p>You may upload a Statement of Service</p>
        )}
      </>
    ),
    [serviceStatuses.NADNA]: (
      <>
        <p>
          You may upload any of the recommended listed documents to support your
          COE application:
        </p>
        <ul>
          <li>Statement of Service</li>
          <li>
            Creditable number of years served or Retirement Points Statement or
            equivalent
          </li>
          {hadPriorLoans && (
            <li>Evidence a VA loan was paid in full, if applicable</li>
          )}
        </ul>
      </>
    ),
    [serviceStatuses.DNANA]: (
      <>
        <p>
          You may upload any of the recommended listed documents to support your
          COE application:
        </p>
        <ul>
          <li>
            Separation and Report of Service (NGB Form 22) for each period of
            National Guard service
          </li>
          <li>Retirement Points Accounting (NGB Form 23)</li>
          <li>
            Proof of character of service such as a DD214 with accompanying
            DD214-1, or Department of Defense Discharge Certificate
          </li>
          {hadPriorLoans && (
            <li>Evidence a VA loan was paid in full, if applicable</li>
          )}
        </ul>
      </>
    ),
    [serviceStatuses.DRNA]: (
      <>
        <p>
          You may upload any of the recommended listed documents to support your
          COE application:
        </p>
        <ul>
          <li>Retirement Point Accounting</li>
          <li>
            Proof of character of service such as a DD214 with accompanying
            DD214-1, or Department of Defense Discharge Certificate
          </li>
          {hadPriorLoans && (
            <li>Evidence a VA loan was paid in full, if applicable</li>
          )}
        </ul>
      </>
    ),
  };

  return requiredDocumentMessages[formData.identity];
};

DocumentsNeeded.propTypes = {
  formData: PropTypes.object,
  hadPriorLoans: PropTypes.bool,
};

export default DocumentsNeeded;
