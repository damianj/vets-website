import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { downloadCh31PdfLetter } from '../actions/ch31-case-status-details';

const ApplicationDiscontinuedAlert = ({ discontinuedReason, resCaseId }) => {
  const dispatch = useDispatch();
  const { loading: isDownloading, error: downloadError } = useSelector(
    state => state?.ch31PdfLetterDownload || {},
  );

  const handleDownload = event => {
    event.preventDefault();

    if (isDownloading) return;

    dispatch(downloadCh31PdfLetter(resCaseId));
  };

  const downloadErrorMessage = downloadError
    ? "We can't download your letter right now. Please try again later."
    : null;

  return (
    <div className="vads-u-margin-y--3">
      <va-alert
        close-btn-aria-label="Close notification"
        status="error"
        visible
      >
        <h2 slot="headline">We discontinued your VR&E benefits</h2>
        <p>We discontinued your VR&E benefits for these reasons:</p>
        <p>{discontinuedReason || 'No reason provided.'}</p>
        {downloadErrorMessage ? (
          <p aria-live="assertive" role="alert">
            <strong>Note:</strong> {downloadErrorMessage}
          </p>
        ) : (
          <>
            <p>
              You can download the decision letter for information about our
              decision and next steps.
            </p>
            <p>If you need more information, contact your counselor.</p>
            {isDownloading ? (
              <va-loading-indicator
                label="Loading"
                message="Downloading your letter..."
                set-focus
              />
            ) : (
              <va-link
                download
                filetype="PDF"
                href="#"
                text="Download the VR-58 CH31 Adverse Action Decision Letter"
                onClick={handleDownload}
              />
            )}
          </>
        )}
      </va-alert>
    </div>
  );
};

ApplicationDiscontinuedAlert.propTypes = {
  discontinuedReason: PropTypes.string,
  resCaseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ApplicationDiscontinuedAlert;
