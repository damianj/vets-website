import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationPdfMessages from './ConfirmationPdfMessages';

export const ConfirmationSummary = ({ name, downloadUrl }) => (
  <div className="screen-only">
    {downloadUrl && (
      <va-summary-box class="vads-u-margin-top--2">
        <h3 slot="headline" className="vads-u-margin-top--0">
          {`Save a PDF copy of your ${name} request`}
        </h3>
        <p>
          {`If you’d like to save a PDF copy of your completed ${name} request for your records, you can download it now.`}
        </p>
        <p>
          <ConfirmationPdfMessages
            pdfApi={downloadUrl}
            successLinkText={`Download a copy of your completed ${name} request (PDF)`}
          />
        </p>
        <p>
          <strong>Note:</strong>
          {` This PDF is for your records only. You’ve already submitted your completed ${name} request. We ask that you don’t send us another copy.`}
        </p>
      </va-summary-box>
    )}

    <h2 className="vads-u-margin-y--3">Print a copy of your {name}</h2>
    <p className="vads-u-margin-y--0">
      If you’d like to keep a copy of the information on this page, you can
      print it now.
    </p>
    <va-button
      class="print-this-page-button vads-u-margin-y--3"
      onClick={window.print}
      text={`Print this page for your records `}
    />
  </div>
);

ConfirmationSummary.propTypes = {
  downloadUrl: PropTypes.string,
  name: PropTypes.string,
};

export const ConfirmationReturnLink = () => (
  <div className="screen-only vads-u-margin-top--4">
    <va-link-action
      disable-analytics
      href="/"
      text="Go back to VA.gov homepage"
      type="primary"
    />
  </div>
);
