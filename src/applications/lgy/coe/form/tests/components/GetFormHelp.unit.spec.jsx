import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { $$, $ } from 'platform/forms-system/src/js/utilities/ui';
import { TOGGLE_NAMES } from 'platform/utilities/feature-toggles/useFeatureToggle';
import { GetFormHelp } from '../../components/GetFormHelp';
import { TOGGLE_KEY } from '../../constants';

const toggleSnakeKey = TOGGLE_NAMES[TOGGLE_KEY]; // 'coe_form_rebuild_cveteam'
const mockStore = state => createStore(() => state);
const getStore = ({ loading = false, toggleEnabled = false } = {}) =>
  mockStore({
    featureToggles: {
      loading,
      [toggleSnakeKey]: toggleEnabled,
    },
  });
const renderWithStore = store =>
  render(
    <Provider store={store}>
      <GetFormHelp />
    </Provider>,
  );

describe('<GetFormHelp>', () => {
  it('renders', () => {
    const { container } = renderWithStore(getStore({ toggleEnabled: false }));
    expect($('.help-talk', container)).to.exist;
    expect($$('va-telephone', container).length).to.equal(2);
  });

  it('renders legacy content while feature flags are loading', () => {
    const { container } = renderWithStore(
      getStore({ loading: true, toggleEnabled: true }),
    );
    expect($('.help-talk', container)).to.exist;
    expect($$('va-telephone', container).length).to.equal(2);
  });

  it('renders GetHelpContent when toggle is enabled', () => {
    const { container } = renderWithStore(getStore({ toggleEnabled: true }));
    expect($('.help-talk', container)).to.not.exist;
    expect($$('va-telephone', container).length).to.equal(3);
    expect($$('va-link', container).length).to.equal(2);
  });
});
