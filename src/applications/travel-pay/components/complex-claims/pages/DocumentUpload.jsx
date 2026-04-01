import React from 'react';
import PropTypes from 'prop-types';

import { VaFileInput } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useFeatureToggle } from 'platform/utilities/feature-toggles/useFeatureToggle';
import { getAcceptedFileTypes } from '../../../util/complex-claims-helper';

const DocumentUpload = ({
  currentDocument,
  error,
  handleDocumentChange,
  onVaFileInputError,
  label = 'Upload your proof of the expense',
  hint: hintProp,
}) => {
  const { useToggleValue, TOGGLE_NAMES } = useFeatureToggle();
  const heicConversionEnabled = useToggleValue(
    TOGGLE_NAMES.travelPayEnableHeicConversion,
  );

  const acceptedFileTypes = getAcceptedFileTypes(heicConversionEnabled);

  const hint = hintProp ?? '';

  return (
    <>
      <VaFileInput
        accept={acceptedFileTypes.join(',')}
        hint={hint}
        label={label}
        maxFileSize={5200000}
        minFileSize={0}
        name="travel-pay-claim-document-upload"
        onVaChange={handleDocumentChange}
        onVaFileInputError={onVaFileInputError}
        required
        error={error}
        value={currentDocument}
      />

      <va-additional-info trigger="How to upload paper copies">
        <p>
          If you only have a paper copy, scan or take a photo and upload the
          image.
        </p>
      </va-additional-info>
    </>
  );
};

DocumentUpload.propTypes = {
  currentDocument: PropTypes.object,
  error: PropTypes.string,
  handleDocumentChange: PropTypes.func,
  hint: PropTypes.string,
  label: PropTypes.string,
  onVaFileInputError: PropTypes.func,
};

export default DocumentUpload;
