import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { datadogRum } from '@datadog/browser-rum';
import categories from '../../fixtures/categories-response.json';
import reducer from '../../../reducers';
import CategoryInput from '../../../components/ComposeForm/CategoryInput';
import { Paths, ErrorMessages } from '../../../util/constants';
import { Categories } from '../../../util/inputContants';
import { selectVaSelect } from '../../../util/testUtils';

describe('CategoryInput component', () => {
  let sandbox;
  const initialState = {
    sm: {},
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders without errors', () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    expect(screen);
  });

  it('should contain va select dropdown component', () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const categorySelect = screen.getByTestId('compose-message-categories');
    expect(categorySelect).not.to.be.empty;
  });

  it('should contain all category options', async () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const values = await screen
      .getAllByTestId('compose-category-dropdown-select')
      ?.map(el => el.value);
    expect(values).to.be.not.empty;
    expect(values).deep.equal(categories);
  });

  it('should have correct name attribute on select element', async () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const selectElement = screen.getByTestId('compose-message-categories');

    expect(selectElement).to.have.attribute(
      'name',
      'compose-message-categories',
    );
  });

  it('should have category selected when category prop is present', async () => {
    const selectedCategory = Categories.OTHER.value;
    const screen = await renderWithStoreAndRouter(
      <CategoryInput category={selectedCategory} categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const selectElement = screen.getByTestId('compose-message-categories');

    expect(selectElement).to.have.attribute('value', selectedCategory);
  });

  it('should display an error when error prop is present', async () => {
    const categoryError = ErrorMessages.ComposeForm.CATEGORY_REQUIRED;
    const screen = await renderWithStoreAndRouter(
      <CategoryInput categoryError={categoryError} categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const vaSelect = screen.getByTestId('compose-message-categories');
    expect(vaSelect).to.have.attribute('error', categoryError);
  });

  it('should call setCategory and track Datadog action when a selection is made', async () => {
    const setCategory = sandbox.spy();
    const setCategoryError = sandbox.spy();
    const setUnsavedNavigationError = sandbox.spy();
    const addActionSpy = sandbox.spy(datadogRum, 'addAction');

    const screen = renderWithStoreAndRouter(
      <CategoryInput
        categories={categories}
        setCategory={setCategory}
        setCategoryError={setCategoryError}
        setUnsavedNavigationError={setUnsavedNavigationError}
      />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );

    selectVaSelect(screen.container, 'COVID');

    expect(setCategory.calledWith('COVID')).to.be.true;
    expect(setCategoryError.calledWith(null)).to.be.true;
    expect(setUnsavedNavigationError.called).to.be.true;
    expect(addActionSpy.calledOnce).to.be.true;
    expect(
      addActionSpy.calledWith(`Category selected - ${Categories.COVID.label}`),
    ).to.be.true;
  });

  it('should not track Datadog action when an empty value is selected', () => {
    const setCategory = sandbox.spy();
    const setCategoryError = sandbox.spy();
    const setUnsavedNavigationError = sandbox.spy();
    const addActionSpy = sandbox.spy(datadogRum, 'addAction');

    const screen = renderWithStoreAndRouter(
      <CategoryInput
        categories={categories}
        setCategory={setCategory}
        setCategoryError={setCategoryError}
        setUnsavedNavigationError={setUnsavedNavigationError}
      />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );

    selectVaSelect(screen.container, '');

    expect(setCategory.calledWith('')).to.be.true;
    expect(setCategoryError.called).to.be.false;
    expect(addActionSpy.called).to.be.false;
  });

  it('should have data-dd-privacy mask on select and options', () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const selectElement = screen.getByTestId('compose-message-categories');
    expect(selectElement).to.have.attribute('data-dd-privacy', 'mask');

    const options = screen.getAllByTestId('compose-category-dropdown-select');
    options.forEach(option => {
      expect(option).to.have.attribute('data-dd-privacy', 'mask');
    });
  });

  it('should have data-dd-action-name on select and options', () => {
    const screen = renderWithStoreAndRouter(
      <CategoryInput categories={categories} />,
      {
        initialState,
        reducers: reducer,
        path: Paths.COMPOSE,
      },
    );
    const selectElement = screen.getByTestId('compose-message-categories');
    expect(selectElement).to.have.attribute(
      'data-dd-action-name',
      'Category Dropdown Select',
    );

    const options = screen.getAllByTestId('compose-category-dropdown-select');
    options.forEach(option => {
      expect(option).to.have.attribute('data-dd-action-name');
    });
  });
});
