/**
 * @file V1 fallback for the Separation Health Assessment Upload page.
 *
 * Uses the legacy FileField upload component instead of `va-file-input-multiple`.
 * Shown when the evidence enhancement toggle is ON but the FileInputV3 toggle
 * is OFF. Once FileInputV3 is fully rolled out, this page can be removed.
 */

import React from 'react';

import { isUploadingBddSha } from '../utils';
import { ancillaryFormUploadUi, getAttachmentsSchema } from '../utils/schemas';
import { MAX_FILE_SIZE_MB, MAX_PDF_FILE_SIZE_MB } from '../constants';

const MAXIMUM_NUMBER_OF_FILES = 20;
const SHA_ATTACHMENT_ID = 'L702';

const fileUploadUi = ancillaryFormUploadUi(
  'Upload your Separation Health Assessment (self-assessment, also called “Part A”) to support your claim.',
  '',
  {
    attachmentId: SHA_ATTACHMENT_ID,
    addAnotherLabel: 'Add another file',
    buttonText: 'Upload file',
    isDisabled: true,
  },
);

export const uiSchema = {
  'view:separationHealthAssessmentUploadTitle': {
    'ui:title': (
      <h3 className="vads-u-margin-y--0 vads-u-color--base">
        Upload your Separation Health Assessment
      </h3>
    ),
  },
  separationHealthAssessmentUploads: {
    ...fileUploadUi,

    'ui:options': {
      ...fileUploadUi['ui:options'],
      fileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    // Utilizing custom JSX instead of FileUploadDescriptions component because file type and max file size +
    // requirements are specific to supporting future upload validation efforts and this V1 version of upload is a
    // temporary holdover.
    'ui:description': () => (
      <div>
        <p>
          You can upload your file in a .pdf, .jpg, .jpeg, or .png format.
          You’ll first need to scan a copy of your file onto your computer or
          mobile phone. You can then upload the file from there.
        </p>
        <p>Guidelines for uploading a file:</p>
        <ul>
          <li>File types you can upload: .pdf, .jpg, .jpeg, or .png</li>
          <li>Maximum number of files: {MAXIMUM_NUMBER_OF_FILES}</li>
          <li>{`Maximum non-PDF file size: ${MAX_FILE_SIZE_MB}MB`}</li>
          <li>{`Maximum PDF file size: ${MAX_PDF_FILE_SIZE_MB}MB`}</li>
        </ul>
        <p>
          A 1MB file equals about 500 pages of text. A photo is usually about
          6MB. Large files can take longer to upload with a slow internet
          connection.
        </p>
      </div>
    ),
    'ui:confirmationField': ({ formData }) => ({
      data: formData?.map(item => item.name || item.fileName),
      label: 'Uploaded file(s)',
    }),
    'ui:required': data => isUploadingBddSha(data),
  },
};

export const schema = {
  type: 'object',
  properties: {
    'view:separationHealthAssessmentUploadTitle': {
      type: 'object',
      properties: {},
    },
    separationHealthAssessmentUploads: {
      ...getAttachmentsSchema(SHA_ATTACHMENT_ID),
      minItems: 1,
      maxItems: MAXIMUM_NUMBER_OF_FILES,
    },
  },
};
