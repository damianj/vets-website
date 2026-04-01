import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, cleanup, act } from '@testing-library/react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { SET_DATA } from 'platform/forms-system/src/js/actions';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import { useAutoResolveArtifacts } from '../../../cave/utils/useAutoResolveArtifacts';

// ---------------------------------------------------------------------------
// Store helpers
// ---------------------------------------------------------------------------

// Real reducer so useSelector re-fires when formData changes.
const reducer = (state, action) => {
  if (action.type === SET_DATA) {
    return { ...state, form: { data: action.data } };
  }
  return state;
};

const makeStore = (formData = {}, caveEnabled = true) =>
  createStore(reducer, {
    form: { data: formData },
    featureToggles: { [FEATURE_FLAG_NAMES.survivorsBenefitsIdp]: caveEnabled },
  });

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fileWithNullSsn = {
  name: 'dd214.pdf',
  idpTrackingKey: 'key-1',
  idpArtifacts: {
    dd214: [{ veteranSsn: null }],
    deathCertificates: [],
  },
};

const formDataWithSsn = {
  veteranSocialSecurityNumber: { ssn: '123456789' },
  files: [fileWithNullSsn],
};

// ---------------------------------------------------------------------------
// Wrapper component
// ---------------------------------------------------------------------------

const HookWrapper = () => {
  useAutoResolveArtifacts();
  return null;
};

const renderHook = store =>
  act(() => {
    render(
      <Provider store={store}>
        <HookWrapper />
      </Provider>,
    );
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('cave/utils/useAutoResolveArtifacts', () => {
  afterEach(cleanup);

  it('does not dispatch when caveEnabled is false', () => {
    const store = makeStore(formDataWithSsn, false);
    const dispatchSpy = sinon.spy(store, 'dispatch');

    renderHook(store);

    expect(dispatchSpy.calledWith(sinon.match({ type: SET_DATA }))).to.be.false;
  });

  it('does not dispatch when no files have idpArtifacts', () => {
    const store = makeStore({
      veteranSocialSecurityNumber: { ssn: '123456789' },
      files: [{ name: 'dd214.pdf', idpTrackingKey: 'key-1' }],
    });
    const dispatchSpy = sinon.spy(store, 'dispatch');

    renderHook(store);

    expect(dispatchSpy.calledWith(sinon.match({ type: SET_DATA }))).to.be.false;
  });

  it('does not dispatch when all artifact fields already have valid values', () => {
    const store = makeStore({
      veteranSocialSecurityNumber: { ssn: '123456789' },
      files: [
        {
          ...fileWithNullSsn,
          idpArtifacts: {
            dd214: [{ veteranSsn: '987654321' }],
            deathCertificates: [],
          },
        },
      ],
    });
    const dispatchSpy = sinon.spy(store, 'dispatch');

    renderHook(store);

    expect(dispatchSpy.calledWith(sinon.match({ type: SET_DATA }))).to.be.false;
  });

  it('auto-resolves a null artifact SSN from the form value on mount', () => {
    const store = makeStore(formDataWithSsn);

    renderHook(store);

    const { files } = store.getState().form.data;
    expect(files[0].idpArtifacts.dd214[0].veteranSsn).to.equal('123456789');
  });

  it('auto-resolves when a form SSN is filled after mount', () => {
    // Start with no SSN in the form — artifact stays null
    const store = makeStore({
      veteranSocialSecurityNumber: { ssn: '' },
      files: [fileWithNullSsn],
    });

    renderHook(store);

    // Artifact should still be null — nothing to fill from
    expect(store.getState().form.data.files[0].idpArtifacts.dd214[0].veteranSsn)
      .to.be.null;

    // User fills in the SSN
    act(() => {
      store.dispatch({
        type: SET_DATA,
        data: {
          ...store.getState().form.data,
          veteranSocialSecurityNumber: { ssn: '123456789' },
        },
      });
    });

    expect(
      store.getState().form.data.files[0].idpArtifacts.dd214[0].veteranSsn,
    ).to.equal('123456789');
  });
});
