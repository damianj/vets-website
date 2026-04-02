import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { schema, uiSchema } from '../../pages/separationHealthAssessmentUpload';

describe('separationHealthAssessmentUpload page', () => {
  const uploadField = uiSchema.separationHealthAssessmentUploads;
  const uploadOptions = uploadField['ui:options'];

  describe('schema', () => {
    it('requires at least one SHA upload', () => {
      expect(schema.required).to.include('separationHealthAssessmentUploads');
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
    it('renders the Separation Health Assessment header', () => {
      const { getByRole } = render(<div>{uiSchema['ui:title']}</div>);

      const heading = getByRole('heading', {
        level: 3,
        name: 'Upload your Separation Health Assessment',
      });
      expect(heading).to.exist;
    });

    it('restricts accepted SHA file types', () => {
      expect(uploadOptions.accept).to.equal('.pdf,.jpg,.jpeg,.png');
    });

    it('shows SHA-specific upload hint text', () => {
      expect(uploadOptions.hint).to.include(
        'You can upload .pdf, .jpg, .jpeg, or .png files.',
      );
      expect(uploadOptions.hint).to.include('50 MB');
      expect(uploadOptions.hint).to.include('99 MB');
    });
  });

  describe('parseResponse', () => {
    it('maps upload response to a fixed SHA attachment id', () => {
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
        file,
      });
    });

    it('keeps SHA attachment id even when response data is missing', () => {
      const { parseResponse } = uploadOptions;

      const result = parseResponse(undefined, undefined);

      expect(result.attachmentId).to.equal('L702');
      expect(result.confirmationCode).to.be.undefined;
      expect(result.name).to.be.undefined;
      expect(result.file).to.be.undefined;
    });
  });
});
