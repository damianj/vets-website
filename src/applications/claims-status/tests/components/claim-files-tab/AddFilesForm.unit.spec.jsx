/**
 * Note: Most functional testing is in E2E tests (10.va-file-input-multiple.cypress.spec.js)
 * due to va-file-input-multiple web component using shadow DOM.
 * These unit tests focus on basic component structure and static content.
 */

import React from 'react';
import { expect } from 'chai';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom-v5-compat';
import { render } from '@testing-library/react';
import {
  SUBMIT_TEXT,
  SEND_YOUR_DOCUMENTS_TEXT,
  ANCHOR_LINKS,
} from '../../../constants';

import AddFilesForm from '../../../components/claim-files-tab/AddFilesForm';

// Helper to render AddFilesForm with router and redux
const renderWithRouterAndRedux = (
  element,
  { initialState, initialEntries },
) => {
  const store = {
    getState: () => initialState,
    subscribe: () => {},
    dispatch: () => {},
  };

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/track-claims/your-claims/:id/*" element={element} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

// Default initial entries for router
const defaultInitialEntries = ['/track-claims/your-claims/123/files'];

// Updated props for va-file-input-multiple implementation
const fileFormProps = {
  onSubmit: () => {},
  onCancel: () => {},
  uploading: false,
  progress: 0,
};

describe('<AddFilesForm>', () => {
  it('should render component', () => {
    const initialState = {
      featureToggles: {
        loading: false,
      },
    };

    const { container } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} />,
      { initialState, initialEntries: defaultInitialEntries },
    );

    expect($('.add-files-form', container)).to.exist;
    expect($('va-file-input-multiple', container)).to.exist;

    const submitButton = $('va-button', container);
    expect(submitButton).to.exist;
    expect(submitButton.getAttribute('text')).to.equal(SUBMIT_TEXT);
  });

  it('should render upload modal when uploading', () => {
    const initialState = {
      featureToggles: { loading: false },
    };
    const { container } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} uploading />,
      { initialState, initialEntries: defaultInitialEntries },
    );
    expect($('va-modal', container)).to.exist;
  });

  it('should handle submit button click', () => {
    const initialState = {
      featureToggles: { loading: false },
    };
    const onSubmit = sinon.spy();
    const { container } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} onSubmit={onSubmit} />,
      { initialState, initialEntries: defaultInitialEntries },
    );

    const submitButton = $('va-button', container);
    submitButton.click();
    // Since no files are present, onSubmit should not be called
    expect(onSubmit.called).to.be.false;
  });

  it('should render updated file input section ui', () => {
    const initialState = {
      featureToggles: { loading: false },
    };
    const { getByText } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} />,
      { initialState, initialEntries: defaultInitialEntries },
    );
    getByText('Upload documents');
    getByText('If you have a document to upload, you can do that here.');
  });

  it('should not render heading section when it is rendered in file tab', () => {
    const initialState = {
      featureToggles: { loading: false },
    };
    const { queryByText } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} fileTab />,
      { initialState, initialEntries: defaultInitialEntries },
    );
    expect(queryByText('Upload documents')).to.be.null;
    expect(
      queryByText('If you have a document to upload, you can do that here.'),
    ).to.be.null;
  });

  it('should not render mail info additional info', () => {
    const initialState = {
      featureToggles: { loading: false },
    };
    const { container } = renderWithRouterAndRedux(
      <AddFilesForm {...fileFormProps} />,
      { initialState, initialEntries: defaultInitialEntries },
    );
    const additionalInfo = $('va-additional-info', container);
    expect(additionalInfo).to.be.null;
  });

  describe('va-link for other ways to send documents', () => {
    const initialState = {
      featureToggles: { loading: false },
    };

    it('should render va-link with anchor href when on files tab', () => {
      const { container } = renderWithRouterAndRedux(
        <AddFilesForm {...fileFormProps} fileTab />,
        {
          initialState,
          initialEntries: ['/track-claims/your-claims/123/files'],
        },
      );
      const additionalInfo = $('va-additional-info', container);
      expect(additionalInfo).to.be.null;
      const vaLink = $('va-link', container);
      expect(vaLink).to.exist;
      expect(vaLink.getAttribute('href')).to.equal(
        `#${ANCHOR_LINKS.otherWaysToSendDocuments}`,
      );
      expect(vaLink.getAttribute('text')).to.equal(SEND_YOUR_DOCUMENTS_TEXT);
    });

    it('should render va-link with full path when on evidence request page', () => {
      const claimId = '456';
      const { container } = renderWithRouterAndRedux(
        <AddFilesForm {...fileFormProps} />,
        {
          initialState,
          initialEntries: [
            `/track-claims/your-claims/${claimId}/needed-from-you/789`,
          ],
        },
      );
      const vaLink = $('va-link', container);
      expect(vaLink).to.exist;
      expect(vaLink.getAttribute('href')).to.equal(
        `/track-claims/your-claims/${claimId}/files#${
          ANCHOR_LINKS.otherWaysToSendDocuments
        }`,
      );
      expect(vaLink.getAttribute('text')).to.equal(SEND_YOUR_DOCUMENTS_TEXT);
    });
  });
});
