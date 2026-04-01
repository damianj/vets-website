import React from 'react';
import { uploadAdditionalInfo } from './uploadAdditionalInfo';

export const pmrTitle = 'Upload copies of private medical records';

const pmrBody = (
  <>
    <p>Upload copies of your private medical records to support your claim.</p>
  </>
);

export const pmrDescription = (
  <>
    {pmrBody}
    {uploadAdditionalInfo}
  </>
);

/**
 * Enhanced version of pmrDescription with custom required field indicator.
 * This version includes an explicit "Select a file to upload (*Required)" message
 * because the file upload field itself doesn't automatically display a required
 * indicator in its description area.
 */
export const pmrDescriptionV1 = (
  <>
    {pmrBody}
    {uploadAdditionalInfo}
    <p className="vads-u-font-weight--normal vads-u-margin-bottom--0">
      Select a file to upload
      <span className="schemaform-required-span vads-u-font-family--sans vads-u-font-size--base vads-u-font-weight--normal">
        (*Required)
      </span>
    </p>
  </>
);
