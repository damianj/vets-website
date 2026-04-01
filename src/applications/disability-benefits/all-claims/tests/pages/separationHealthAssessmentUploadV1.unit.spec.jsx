import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';

import { MAX_FILE_SIZE_MB, MAX_PDF_FILE_SIZE_MB } from '../../constants';
import * as allClaimsUtils from '../../utils';
import {
  schema,
  uiSchema,
} from '../../pages/separationHealthAssessmentUploadV1';

describe('separationHealthAssessmentUploadV1 page', () => {
  const uploadField = uiSchema.separationHealthAssessmentUploads;
  const uploadOptions = uploadField['ui:options'];

  describe('schema', () => {
    it('sets the SHA attachment id by default', () => {
      expect(
        schema.properties.separationHealthAssessmentUploads.items.properties
          .attachmentId.default,
      ).to.equal('L702');
    });

    it('enforces minItems: 1 to reject empty file arrays', () => {
      expect(
        schema.properties.separationHealthAssessmentUploads.minItems,
      ).to.equal(1);
    });

    it('limits SHA uploads to 20 files', () => {
      expect(
        schema.properties.separationHealthAssessmentUploads.maxItems,
      ).to.equal(20);
    });
  });

  describe('uiSchema', () => {
    it('restricts SHA file types to pdf and image formats', () => {
      expect(uploadOptions.fileTypes).to.deep.equal([
        'pdf',
        'jpg',
        'jpeg',
        'png',
      ]);
    });

    it('shows SHA-specific upload guidance text', () => {
      const { getByText } = render(
        <div>{uploadField['ui:description']()}</div>,
      );

      expect(
        getByText(
          /You can upload your file in a \.pdf, \.jpg, \.jpeg, or \.png format\./,
        ),
      ).to.exist;
      expect(getByText(`Maximum non-PDF file size: ${MAX_FILE_SIZE_MB}MB`)).to
        .exist;
      expect(getByText(`Maximum PDF file size: ${MAX_PDF_FILE_SIZE_MB}MB`)).to
        .exist;

      expect(getByText('Guidelines for uploading a file:')).to.exist;
      expect(
        getByText(
          'A 1MB file equals about 500 pages of text. A photo is usually about 6MB. Large files can take longer to upload with a slow internet connection.',
        ),
      ).to.exist;
    });

    it('maps upload names for confirmation with fileName fallback', () => {
      const result = uploadField['ui:confirmationField']({
        formData: [{ name: 'sha-part-a.pdf' }, { fileName: 'sha-part-b.jpg' }],
      });

      expect(result).to.deep.equal({
        data: ['sha-part-a.pdf', 'sha-part-b.jpg'],
        label: 'Uploaded file(s)',
      });
    });

    it('requires uploads only when SHA upload toggle is true', () => {
      const isRequired = uploadField['ui:required'];
      const firstFormData = { test: 'first' };
      const secondFormData = { test: 'second' };
      const thirdFormData = {};
      const isUploadingBddShaStub = sinon.stub(
        allClaimsUtils,
        'isUploadingBddSha',
      );

      isUploadingBddShaStub.onFirstCall().returns(true);
      isUploadingBddShaStub.onSecondCall().returns(false);
      isUploadingBddShaStub.onThirdCall().returns(false);

      // Ensure that ui:required delegates to isUploadingBddSha
      expect(isRequired(firstFormData)).to.be.true;
      expect(isRequired(secondFormData)).to.be.false;
      expect(isRequired(thirdFormData)).to.be.false;

      // Ensure that ui:required passes formData to isUploadingBddSha to ensure it follows the contract correctly
      expect(isUploadingBddShaStub.firstCall.args[0]).to.equal(firstFormData);
      expect(isUploadingBddShaStub.secondCall.args[0]).to.equal(secondFormData);
      expect(isUploadingBddShaStub.thirdCall.args[0]).to.equal(thirdFormData);

      isUploadingBddShaStub.restore();
    });
  });

  describe('parseResponse', () => {
    it('maps upload response to the fixed SHA attachment id', () => {
      const { parseResponse } = uploadOptions;
      const file = { name: 'sha-part-a.pdf' };
      const response = {
        data: {
          attributes: {
            guid: 'sha-guid-123',
          },
        },
      };

      const result = parseResponse(response, file);

      expect(result).to.deep.equal({
        name: 'sha-part-a.pdf',
        confirmationCode: 'sha-guid-123',
        attachmentId: 'L702',
      });
    });
  });
});
