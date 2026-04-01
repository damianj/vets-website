import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import sinon from 'sinon';
import { renderHook, act } from '@testing-library/react-hooks';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as workflow from '../../../cave/workflow';
import { useCaveProcessingManager } from '../../../cave/useCaveProcessingManager';

// FEATURE_FLAG_NAMES.survivorsBenefitsIdp resolves to the snake_case wire value
// eslint-disable-next-line camelcase
const FLAG_KEY = 'survivors_benefits_idp';

// ---------------------------------------------------------------------------
// Store helpers
// ---------------------------------------------------------------------------
const makeStore = (files = [], caveEnabled = true) =>
  createStore(
    (
      state = {
        form: { data: { files } },
        featureToggles: { [FLAG_KEY]: caveEnabled },
      },
      action,
    ) => {
      if (action.type === 'SET_DATA') {
        return { ...state, form: { data: action.data } };
      }
      return state;
    },
  );

const StoreWrapper = ({ store, children }) => (
  <Provider store={store}>{children}</Provider>
);
StoreWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  store: PropTypes.object.isRequired,
};

const wrapper = store => props => <StoreWrapper store={store} {...props} />;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useCaveProcessingManager', () => {
  let sandbox;
  let processStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    processStub = sandbox.stub(workflow, 'processDocumentWithAutoResolve');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('starts processing for a file with idpUploadStatus:processing and idpDocumentId on mount', async () => {
    const resolvedArtifacts = { dd214: [], deathCertificates: [] };
    processStub.resolves(resolvedArtifacts);

    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-1',
      idpTrackingKey: 'key-1',
    };
    const store = makeStore([file]);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    expect(processStub.calledOnce).to.be.true;
    expect(processStub.firstCall.args[0]).to.deep.equal({ id: 'doc-1' });
  });

  it('starts processing for a file with idpUploadStatus:pending and idpDocumentId', async () => {
    processStub.resolves({ dd214: [], deathCertificates: [] });

    const file = {
      idpUploadStatus: 'pending',
      idpDocumentId: 'doc-2',
      idpTrackingKey: 'key-2',
    };
    const store = makeStore([file]);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    expect(processStub.calledOnce).to.be.true;
  });

  it('does NOT start processing when idpDocumentId is missing', async () => {
    const file = {
      idpUploadStatus: 'pending',
      idpDocumentId: null,
      idpTrackingKey: 'key-3',
    };
    const store = makeStore([file]);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    expect(processStub.called).to.be.false;
  });

  it('does NOT start processing when survivorsBenefitsIdp feature flag is off', async () => {
    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-gated',
      idpTrackingKey: 'key-gated',
    };
    // caveEnabled = false
    const store = makeStore([file], false);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    expect(processStub.called).to.be.false;
  });

  it('writes idpUploadStatus:success and idpArtifacts to Redux on success', async () => {
    const resolvedArtifacts = {
      dd214: [{ veteranName: { first: 'John' } }],
      deathCertificates: [],
    };
    processStub.resolves(resolvedArtifacts);

    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-3',
      idpTrackingKey: 'key-4',
    };
    const store = makeStore([file]);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    const updatedFile = store
      .getState()
      .form.data.files.find(f => f.idpTrackingKey === 'key-4');
    expect(updatedFile.idpUploadStatus).to.equal('success');
    expect(updatedFile.idpArtifacts).to.deep.equal(resolvedArtifacts);
  });

  it('writes idpUploadStatus:error and idpUploadError to Redux on failure', async () => {
    processStub.rejects(new Error('polling timeout'));

    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-4',
      idpTrackingKey: 'key-5',
    };
    const store = makeStore([file]);

    await act(async () => {
      renderHook(() => useCaveProcessingManager(), {
        wrapper: wrapper(store),
      });
    });

    const updatedFile = store
      .getState()
      .form.data.files.find(f => f.idpTrackingKey === 'key-5');
    expect(updatedFile.idpUploadStatus).to.equal('error');
    expect(updatedFile.idpUploadError).to.equal('polling timeout');
  });

  it('does not double-start when formData.files re-renders with the same in-flight file', async () => {
    let resolvePromise;
    processStub.returns(
      new Promise(resolve => {
        resolvePromise = resolve;
      }),
    );

    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-5',
      idpTrackingKey: 'key-6',
    };
    const store = makeStore([file]);

    const { rerender } = renderHook(() => useCaveProcessingManager(), {
      wrapper: wrapper(store),
    });

    // Trigger a re-render while the first promise is still in-flight
    act(() => {
      rerender();
    });

    expect(processStub.callCount).to.equal(1);

    // Resolve to avoid unhandled rejection
    await act(async () => {
      resolvePromise({ dd214: [], deathCertificates: [] });
    });
  });

  it('clears the in-flight entry after success so a new file with the same key can be processed', async () => {
    processStub
      .onFirstCall()
      .resolves({ dd214: [], deathCertificates: [] })
      .onSecondCall()
      .resolves({ dd214: [], deathCertificates: [] });

    const file = {
      idpUploadStatus: 'processing',
      idpDocumentId: 'doc-6',
      idpTrackingKey: 'key-7',
    };
    const store = makeStore([file]);

    const { rerender } = renderHook(() => useCaveProcessingManager(), {
      wrapper: wrapper(store),
    });

    // Wait for the first call to complete
    await act(async () => {});

    // Simulate a re-upload with the same tracking key but a new document id
    act(() => {
      store.dispatch({
        type: 'SET_DATA',
        data: {
          files: [
            {
              ...file,
              idpUploadStatus: 'processing',
              idpDocumentId: 'doc-6b',
            },
          ],
        },
      });
      rerender();
    });

    await act(async () => {});

    expect(processStub.callCount).to.equal(2);
  });
});
