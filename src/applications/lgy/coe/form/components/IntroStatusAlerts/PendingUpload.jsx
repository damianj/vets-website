import React from 'react';
import PropTypes from 'prop-types';
import { formatDateLong } from 'platform/utilities/date';

export const PendingUpload = ({ referenceNumber, requestDate }) => (
  <va-alert status="warning" class="vads-u-margin-bottom--4">
    <h2 slot="headline">We need more information</h2>
    <p className="vads-u-margin-bottom--0">
      You requested a COE on {requestDate && formatDateLong(requestDate)}.
    </p>
    <p className="vads-u-margin-top--0">Reference Number: {referenceNumber}</p>
    <p>
      You’ll need to upload documents before we can make a decision on your COE.
    </p>
    <va-link-action
      href="/housing-assistance/home-loans/check-coe-status/"
      text="Upload documents"
      type="secondary"
    />
  </va-alert>
);

PendingUpload.propTypes = {
  referenceNumber: PropTypes.string.isRequired,
  requestDate: PropTypes.number.isRequired,
};
