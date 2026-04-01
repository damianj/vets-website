import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { waitFor } from '@testing-library/react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import DocumentUpload from '../../../../components/complex-claims/pages/DocumentUpload';
import { getAcceptedFileTypes } from '../../../../util/complex-claims-helper';

describe('DocumentUpload component', () => {
  const defaultProps = {
    currentDocument: null,
    handleDocumentChange: () => {},
    error: '',
    onVaFileInputError: () => {},
  };

  const getState = ({ heicConversionEnabled = false } = {}) => ({
    featureToggles: {
      loading: false,
      // eslint-disable-next-line camelcase
      travel_pay_enable_heic_conversion: heicConversionEnabled,
    },
  });

  const renderComponent = (props = {}, stateOptions = {}) => {
    return renderWithStoreAndRouter(
      <DocumentUpload {...defaultProps} {...props} />,
      {
        initialState: getState(stateOptions),
      },
    );
  };

  it('renders component correctly', () => {
    const { container } = renderComponent();

    expect(container.querySelector('va-file-input')).to.exist;
    expect(container.querySelector('va-additional-info')).to.exist;
  });

  it('calls handleDocumentChange when a file is selected', async () => {
    const handleDocumentChange = sinon.spy();
    const { container } = renderComponent({ handleDocumentChange });

    const fileInput = container.querySelector('va-file-input');

    const testFile = new File(['dummy content'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    // Fire the vaChange event as va-file-input would emit
    const event = new CustomEvent('vaChange', {
      detail: { files: [testFile] },
      bubbles: true,
      composed: true,
    });
    fileInput.dispatchEvent(event);

    await waitFor(() => {
      expect(handleDocumentChange.calledOnce).to.be.true;

      // Verify the file passed
      const eventArg = handleDocumentChange.firstCall.args[0];
      expect(eventArg.detail.files[0]).to.equal(testFile);
    });
  });

  it('accepts only allowed file types when heic conversion is disabled', () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('va-file-input');
    const acceptAttr = fileInput.getAttribute('accept').split(',');

    const expected = getAcceptedFileTypes(false);
    expect(acceptAttr).to.deep.equal(expected);
  });

  it('includes .heic and .heif when heic conversion is enabled', () => {
    const { container } = renderComponent({}, { heicConversionEnabled: true });

    const fileInput = container.querySelector('va-file-input');
    const acceptAttr = fileInput.getAttribute('accept').split(',');

    const expected = getAcceptedFileTypes(true);
    expect(acceptAttr).to.deep.equal(expected);
  });

  it('does not include .heic and .heif when heic conversion is disabled', () => {
    const { container } = renderComponent({}, { heicConversionEnabled: false });

    const fileInput = container.querySelector('va-file-input');
    const acceptAttr = fileInput.getAttribute('accept').split(',');

    expect(acceptAttr).to.not.include('.heic');
    expect(acceptAttr).to.not.include('.heif');
  });

  it('enforces max and min file size', () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('va-file-input');
    expect(Number(fileInput.getAttribute('max-file-size'))).to.equal(5200000);
    expect(Number(fileInput.getAttribute('min-file-size'))).to.equal(0);
  });

  it('displays error when provided', () => {
    const errorMessage = 'File is too large';
    const { container } = renderComponent({ error: errorMessage });

    const fileInput = container.querySelector('va-file-input');
    expect(fileInput.getAttribute('error')).to.equal(errorMessage);
  });

  it('does not display error when error prop is empty', () => {
    const { container } = renderComponent({ error: '' });

    const fileInput = container.querySelector('va-file-input');
    expect(fileInput.getAttribute('error')).to.be.oneOf([null, '']);
  });

  describe('Hint text behavior', () => {
    it('shows no hint text when the hint prop is not provided', () => {
      const { container } = renderComponent();

      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('hint')).to.equal('');
    });

    it('displays custom hint text when the hint prop is provided', () => {
      const customHint = 'Only PDF files are accepted';
      const { container } = renderComponent({ hint: customHint });

      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('hint')).to.equal(customHint);
    });
  });

  describe('Label customization', () => {
    it('displays default label when label prop is not provided', () => {
      const { container } = renderComponent();

      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('label')).to.equal(
        'Upload your proof of the expense',
      );
    });

    it('displays custom label when label prop is provided', () => {
      const customLabel = 'Upload your proof of attendance';
      const { container } = renderComponent({ label: customLabel });

      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('label')).to.equal(customLabel);
    });
  });
});
