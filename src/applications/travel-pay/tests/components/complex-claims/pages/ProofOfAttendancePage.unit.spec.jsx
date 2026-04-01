import React from 'react';
import { expect } from 'chai';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom-v5-compat';
import * as api from '@department-of-veterans-affairs/platform-utilities/api';
import sinon from 'sinon';
import { commonReducer } from 'platform/startup/store';

import ProofOfAttendancePage from '../../../../components/complex-claims/pages/ProofOfAttendancePage';
import reducer from '../../../../redux/reducer';

const apptId = 'cc-appt-001';
const claimId = 'test-claim-123';

// Captures the current location for navigation assertions
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const ChooseExpensePage = () => (
  <div data-testid="choose-expense-page">Choose Expense</div>
);

const IntroPage = () => <div data-testid="intro-page">Intro</div>;

const ReviewPage = () => <div data-testid="review-page">Review</div>;

// Mocks FileReader.readAsDataURL for environments without full File API
const mockFileReader = () => {
  const originalFileReader = global.FileReader;
  const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
  const mockDataUrl = `data:application/pdf;base64,${mockBase64}`;

  global.FileReader = function MockFileReader() {
    this.readAsDataURL = function readAsDataURL() {
      this.result = mockDataUrl;
      setTimeout(() => this.onload(), 0);
    };
  };

  return () => {
    global.FileReader = originalFileReader;
  };
};

// State for add mode: no existing POA document
const getInitialState = ({ isCCAppt = true, isUploading = false } = {}) => ({
  travelPay: {
    appointment: {
      data: { id: apptId, kind: isCCAppt ? 'cc' : 'clinic', isCC: isCCAppt },
      error: null,
      isLoading: false,
    },
    complexClaim: {
      claim: {
        data: null,
        fetch: { isLoading: false, error: null },
        creation: { isLoading: false, error: null },
        submission: { id: '', isSubmitting: false, error: null, data: null },
      },
      expenses: {
        creation: { isLoading: false, error: null },
        update: { id: '', isLoading: false, error: null },
        delete: { id: '', isLoading: false, error: null },
        fetch: { id: '', isLoading: false, error: null },
        data: [],
        hasUnsavedChanges: false,
      },
      documentDelete: { id: '', isLoading: false, error: null },
      expenseBackDestination: null,
      proofOfAttendance: {
        isLoading: isUploading,
        error: null,
      },
    },
  },
});

// State for edit mode: an existing POA document is already in the claim
const getEditModeState = () => ({
  travelPay: {
    appointment: {
      data: { id: apptId, kind: 'cc', isCC: true },
      error: null,
      isLoading: false,
    },
    complexClaim: {
      claim: {
        data: {
          claimId,
          claimStatus: 'InProgress',
          claimSource: 'VaGov',
          documents: [
            {
              documentId: 'existing-poa-doc-001',
              filename: 'proof-of-attendance.pdf',
              mimetype: 'application/pdf',
            },
          ],
        },
        fetch: { isLoading: false, error: null },
        creation: { isLoading: false, error: null },
        submission: { id: '', isSubmitting: false, error: null, data: null },
      },
      expenses: {
        creation: { isLoading: false, error: null },
        update: { id: '', isLoading: false, error: null },
        delete: { id: '', isLoading: false, error: null },
        fetch: { id: '', isLoading: false, error: null },
        data: [],
        hasUnsavedChanges: false,
      },
      documentDelete: { id: '', isLoading: false, error: null },
      expenseBackDestination: null,
      proofOfAttendance: {
        isLoading: false,
        error: null,
      },
    },
  },
});

/**
 * Creates a Redux store with feature toggle values set via action dispatch,
 * which reliably triggers the FeatureToggleReducer (vs. preloaded state).
 */
const createTestStore = (initialState, { ccFlagEnabled = true } = {}) => {
  const store = createStore(
    combineReducers({ ...commonReducer, ...reducer }),
    initialState,
    applyMiddleware(thunk),
  );

  // eslint-disable-next-line camelcase
  store.dispatch({
    type: 'FETCH_TOGGLE_VALUES_SUCCEEDED',
    // eslint-disable-next-line camelcase
    payload: { travel_pay_enable_community_care: ccFlagEnabled },
  });

  return store;
};

const renderPage = ({ isCCAppt = true, ccFlagEnabled = true } = {}) => {
  const initialState = getInitialState({ isCCAppt });
  const store = createTestStore(initialState, { ccFlagEnabled });

  return renderWithStoreAndRouter(
    <MemoryRouter
      initialEntries={[
        `/file-new-claim/${apptId}/${claimId}/proof-of-attendance`,
      ]}
    >
      <Routes>
        <Route
          path="/file-new-claim/:apptId/:claimId/proof-of-attendance"
          element={<ProofOfAttendancePage />}
        />
        <Route
          path="/file-new-claim/:apptId/:claimId/choose-expense"
          element={<ChooseExpensePage />}
        />
        <Route path="/file-new-claim/:apptId" element={<IntroPage />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
    { store, reducers: reducer },
  );
};

// Render helper for edit mode (existing POA document present in state)
const renderPageEditMode = () => {
  const store = createTestStore(getEditModeState());

  return renderWithStoreAndRouter(
    <MemoryRouter
      initialEntries={[
        `/file-new-claim/${apptId}/${claimId}/proof-of-attendance`,
      ]}
    >
      <Routes>
        <Route
          path="/file-new-claim/:apptId/:claimId/proof-of-attendance"
          element={<ProofOfAttendancePage />}
        />
        <Route
          path="/file-new-claim/:apptId/:claimId/review"
          element={<ReviewPage />}
        />
        <Route
          path="/file-new-claim/:apptId/:claimId/choose-expense"
          element={<ChooseExpensePage />}
        />
        <Route path="/file-new-claim/:apptId" element={<IntroPage />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
    { store, reducers: reducer },
  );
};

describe('Travel Pay – ProofOfAttendancePage', () => {
  describe('Access guards', () => {
    it('renders the page for a CC appointment when the feature flag is enabled', () => {
      const { getByTestId } = renderPage();
      expect(getByTestId('proof-of-attendance-page')).to.exist;
    });

    it('redirects to choose-expense when the feature flag is disabled', () => {
      const { getByTestId } = renderPage({ ccFlagEnabled: false });
      expect(getByTestId('choose-expense-page')).to.exist;
    });

    it('redirects to choose-expense when the appointment is not community care', () => {
      const { getByTestId } = renderPage({ isCCAppt: false });
      expect(getByTestId('choose-expense-page')).to.exist;
    });
  });

  describe('Page content', () => {
    it('renders the page heading', () => {
      const { container } = renderPage();
      expect(container.querySelector('h1').textContent).to.equal(
        'Proof of attendance',
      );
    });

    it('renders the file input', () => {
      const { container } = renderPage();
      expect(container.querySelector('va-file-input')).to.exist;
    });

    it('renders the file input with the correct label', () => {
      const { container } = renderPage();
      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('label')).to.equal(
        'Upload your proof of attendance',
      );
    });

    it('renders the Continue and Back buttons', () => {
      const { container } = renderPage();
      const buttons = container.querySelectorAll('va-button');
      const texts = Array.from(buttons).map(b => b.getAttribute('text'));
      expect(texts).to.include('Continue');
      expect(texts).to.include('Back');
    });

    it('does not render the upload error alert by default', () => {
      const { container } = renderPage();
      expect(container.querySelector('va-alert[status="error"]')).to.not.exist;
    });
  });

  describe('File validation', () => {
    it('sets a file error when Continue is clicked without selecting a file', async () => {
      const { container } = renderPage();

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
      });

      await waitFor(() => {
        const fileInput = container.querySelector('va-file-input');
        expect(fileInput.getAttribute('error')).to.not.be.null;
        expect(fileInput.getAttribute('error')).to.not.equal('');
      });
    });

    it('clears the file error after a file is selected', async () => {
      const { container } = renderPage();

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
      });

      const testFile = new File(['dummy content'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      await waitFor(() => {
        expect(fileInput.getAttribute('error')).to.be.null;
      });
    });
  });

  describe('File renaming', () => {
    let apiStub;
    let restoreFileReader;

    beforeEach(() => {
      restoreFileReader = mockFileReader();
      // Stub handles both POA upload and claim details fetch
      apiStub = sinon.stub(api, 'apiRequest').callsFake(url => {
        if (url.includes('/documents')) {
          return Promise.resolve({
            documentId: 'mock-doc-001',
            claimId,
            filename: 'Proof of attendance',
          });
        }
        // Claim details fetch
        return Promise.resolve({
          claimId,
          claimNumber: 'TC123456789',
          claimStatus: 'InProgress',
          documents: [
            {
              documentId: 'mock-doc-001',
              filename: 'proof-of-attendance.pdf',
              mimetype: 'application/pdf',
            },
          ],
        });
      });
    });

    afterEach(() => {
      restoreFileReader();
      apiStub.restore();
    });

    it('renames the file to proof-of-attendance with the original extension', async () => {
      const { container } = renderPage();

      const testFile = new File(['dummy content'], 'my-document.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(apiStub.called).to.be.true;
        const uploadCall = apiStub
          .getCalls()
          .find(call => call.args[0].includes('/documents'));
        expect(uploadCall).to.exist;
        const requestBody = JSON.parse(uploadCall.args[1].body);
        expect(requestBody.fileName).to.equal('proof-of-attendance.pdf');
      });
    });

    it('preserves the file extension when renaming (jpg)', async () => {
      const { container } = renderPage();

      const testFile = new File(['dummy content'], 'receipt.jpg', {
        type: 'image/jpeg',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(apiStub.called).to.be.true;
        const uploadCall = apiStub
          .getCalls()
          .find(call => call.args[0].includes('/documents'));
        expect(uploadCall).to.exist;
        const requestBody = JSON.parse(uploadCall.args[1].body);
        expect(requestBody.fileName).to.equal('proof-of-attendance.jpg');
      });
    });
  });

  describe('File upload – success', () => {
    let apiStub;
    let restoreFileReader;

    beforeEach(() => {
      restoreFileReader = mockFileReader();
      apiStub = sinon.stub(api, 'apiRequest').resolves({
        documentId: 'mock-doc-001',
        claimId,
        filename: 'Proof of attendance',
      });
    });

    afterEach(() => {
      restoreFileReader();
      apiStub.restore();
    });

    it('navigates to choose-expense after a successful upload', async () => {
      const { container, getByTestId } = renderPage();

      const testFile = new File(['dummy content'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          `/file-new-claim/${apptId}/${claimId}/choose-expense`,
        );
      });
    });

    it('does not display the error alert after a successful upload', async () => {
      const { container } = renderPage();

      const testFile = new File(['dummy content'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(container.querySelector('va-alert[status="error"]')).to.not
          .exist;
      });
    });
  });

  describe('File upload – failure', () => {
    let apiStub;
    let restoreFileReader;

    beforeEach(() => {
      restoreFileReader = mockFileReader();
      apiStub = sinon
        .stub(api, 'apiRequest')
        .rejects(new Error('Network error'));
    });

    afterEach(() => {
      restoreFileReader();
      apiStub.restore();
    });

    it('displays an error alert when the API call fails', async () => {
      const { container } = renderPage();

      const testFile = new File(['dummy content'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(container.querySelector('va-alert[status="error"]')).to.exist;
      });
    });

    it('remains on the proof-of-attendance page after a failed upload', async () => {
      const { container, getByTestId } = renderPage();

      const testFile = new File(['dummy content'], 'proof.pdf', {
        type: 'application/pdf',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [testFile] },
            bubbles: true,
          }),
        );
      });

      const continueButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Continue');

      await act(async () => {
        fireEvent.click(continueButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(getByTestId('proof-of-attendance-page')).to.exist;
      });
    });
  });

  describe('Back navigation', () => {
    it('navigates back to the intro page when Back is clicked', async () => {
      const { container, getByTestId } = renderPage();

      const backButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Back');

      await act(async () => {
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(getByTestId('intro-page')).to.exist;
      });
    });
  });

  describe('Edit mode (existing POA document)', () => {
    let apiStub;
    let restoreFileReader;

    beforeEach(() => {
      restoreFileReader = mockFileReader();
      // Stub differentiates by HTTP method so all mid-flow API calls are handled
      apiStub = sinon.stub(api, 'apiRequest').callsFake((url, options) => {
        const method = options?.method?.toUpperCase() || 'GET';

        if (method === 'DELETE') {
          return Promise.resolve({ id: 'existing-poa-doc-001' });
        }

        if (method === 'POST') {
          return Promise.resolve({
            documentId: 'new-poa-doc-002',
            claimId,
            filename: 'proof-of-attendance.png',
          });
        }

        // GET /claims/:id/documents/:docId → document download
        if (url.includes('/documents/')) {
          const content = new Uint8Array([1, 2, 3, 4]);
          return Promise.resolve({
            headers: {
              get: type => (type === 'Content-Type' ? 'application/pdf' : null),
            },
            arrayBuffer: () => Promise.resolve(content.buffer),
          });
        }

        // GET /complex_claims/:id → claim details refresh
        return Promise.resolve({
          claimId,
          claimStatus: 'InProgress',
          documents: [
            {
              documentId: 'new-poa-doc-002',
              filename: 'proof-of-attendance.png',
              mimetype: 'image/png',
            },
          ],
        });
      });
    });

    afterEach(() => {
      restoreFileReader();
      apiStub.restore();
    });

    it('renders "Save and continue" and "Cancel" buttons instead of "Continue" and "Back"', async () => {
      const { container } = renderPageEditMode();

      // Allow the mount-time document fetch to settle
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const buttonTexts = Array.from(
        container.querySelectorAll('va-button'),
      ).map(b => b.getAttribute('text'));
      expect(buttonTexts).to.include('Save and continue');
      expect(buttonTexts).to.include('Cancel');
      expect(buttonTexts).to.not.include('Continue');
      expect(buttonTexts).to.not.include('Back');
    });

    it('does not show a file validation error when Save and continue is clicked without a new file', async () => {
      const { container, getByTestId } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // No error should be present on the file input before clicking Save and continue
      const fileInput = container.querySelector('va-file-input');
      expect(fileInput.getAttribute('error')).to.be.oneOf([null, '']);

      const saveButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Save and continue');

      await act(async () => {
        fireEvent.click(saveButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Successful navigation to review confirms no validation error blocked the save
      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          `/file-new-claim/${apptId}/${claimId}/review`,
        );
      });
    });

    it('navigates to the review page when Save and continue is clicked without selecting a new file', async () => {
      const { container, getByTestId } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const saveButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Save and continue');

      await act(async () => {
        fireEvent.click(saveButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          `/file-new-claim/${apptId}/${claimId}/review`,
        );
      });

      // Only the initial document download should have fired – no delete or upload
      const deleteCalls = apiStub
        .getCalls()
        .filter(c => (c.args[1]?.method || '').toUpperCase() === 'DELETE');
      const postCalls = apiStub
        .getCalls()
        .filter(c => (c.args[1]?.method || '').toUpperCase() === 'POST');
      expect(deleteCalls).to.have.lengthOf(0);
      expect(postCalls).to.have.lengthOf(0);
    });

    it('navigates to the review page when Cancel is clicked', async () => {
      const { container, getByTestId } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const cancelButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Cancel');

      await act(async () => {
        fireEvent.click(cancelButton);
      });

      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          `/file-new-claim/${apptId}/${claimId}/review`,
        );
      });
    });

    it('deletes the old document and uploads the new file when Save and continue is clicked with a replacement', async () => {
      const { container, getByTestId } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const newFile = new File(['new content'], 'new-proof.png', {
        type: 'image/png',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [newFile] },
            bubbles: true,
          }),
        );
      });

      const saveButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Save and continue');

      await act(async () => {
        fireEvent.click(saveButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        // DELETE should have been called for the old document
        const deleteCalls = apiStub
          .getCalls()
          .filter(c => (c.args[1]?.method || '').toUpperCase() === 'DELETE');
        expect(deleteCalls).to.have.lengthOf(1);
        expect(deleteCalls[0].args[0]).to.include('existing-poa-doc-001');

        // POST should have been called to upload the new document
        const postCalls = apiStub
          .getCalls()
          .filter(c => (c.args[1]?.method || '').toUpperCase() === 'POST');
        expect(postCalls).to.have.lengthOf(1);
        const uploadBody = JSON.parse(postCalls[0].args[1].body);
        expect(uploadBody.fileName).to.equal('proof-of-attendance.png');

        // Should navigate to review
        expect(getByTestId('location-display').textContent).to.equal(
          `/file-new-claim/${apptId}/${claimId}/review`,
        );
      });
    });

    it('displays the upload error alert when file replacement fails', async () => {
      // Override the stub to make POST fail
      apiStub.restore();
      apiStub = sinon.stub(api, 'apiRequest').callsFake((url, options) => {
        const method = options?.method?.toUpperCase() || 'GET';

        if (method === 'DELETE') {
          return Promise.resolve({ id: 'existing-poa-doc-001' });
        }

        if (method === 'POST') {
          return Promise.reject(new Error('Network error'));
        }

        if (url.includes('/documents/')) {
          const content = new Uint8Array([1, 2, 3, 4]);
          return Promise.resolve({
            headers: {
              get: type => (type === 'Content-Type' ? 'application/pdf' : null),
            },
            arrayBuffer: () => Promise.resolve(content.buffer),
          });
        }

        return Promise.resolve({
          claimId,
          claimStatus: 'InProgress',
          documents: [],
        });
      });

      const { container } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      const newFile = new File(['new content'], 'new-proof.png', {
        type: 'image/png',
      });
      const fileInput = container.querySelector('va-file-input');

      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [newFile] },
            bubbles: true,
          }),
        );
      });

      const saveButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Save and continue');

      await act(async () => {
        fireEvent.click(saveButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(container.querySelector('va-alert[status="error"]')).to.exist;
      });
    });

    it('shows a file validation error and does not navigate when the user removes the existing file without selecting a replacement', async () => {
      const { container, getByTestId } = renderPageEditMode();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Simulate the user clearing the file in VaFileInput
      const fileInput = container.querySelector('va-file-input');
      await act(async () => {
        fileInput.dispatchEvent(
          new CustomEvent('vaChange', {
            detail: { files: [] },
            bubbles: true,
          }),
        );
      });

      const saveButton = Array.from(
        container.querySelectorAll('va-button'),
      ).find(btn => btn.getAttribute('text') === 'Save and continue');

      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Should show validation error and stay on the POA page
      await waitFor(() => {
        expect(fileInput.getAttribute('error')).to.equal(
          'Please upload your proof of attendance to continue.',
        );
        expect(getByTestId('proof-of-attendance-page')).to.exist;
      });

      // No delete or upload calls should have been made
      const deleteCalls = apiStub
        .getCalls()
        .filter(c => (c.args[1]?.method || '').toUpperCase() === 'DELETE');
      const postCalls = apiStub
        .getCalls()
        .filter(c => (c.args[1]?.method || '').toUpperCase() === 'POST');
      expect(deleteCalls).to.have.lengthOf(0);
      expect(postCalls).to.have.lengthOf(0);
    });
  });
});
