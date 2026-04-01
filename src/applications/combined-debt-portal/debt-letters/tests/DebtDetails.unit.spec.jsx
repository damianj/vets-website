import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';
import { I18nextProvider } from 'react-i18next';
import i18nCombinedDebtPortal from '../../i18n';
import DebtDetails from '../containers/DebtDetails';

const buildStore = selectedDebt =>
  createStore(
    combineReducers({
      combinedPortal: (
        state = {
          debtLetters: { selectedDebt, debts: [] },
        },
      ) => state,
      featureToggles: (state = { loading: false }) => state,
    }),
  );

const baseDebt = {
  fileNumber: '796143510',
  payeeNumber: '00',
  personEntitled: 'VETERAN',
  deductionCode: '30',
  diaryCode: '100',
  benefitType: 'Comp & Pen',
  amountOverpaid: 0,
  amountWithheld: 0,
  originalAr: '1000',
  currentAr: '500',
  compositeDebtId: '30500',
};

const renderDebtDetails = debt => {
  const store = buildStore(debt);
  return render(
    <Provider store={store}>
      <I18nextProvider i18n={i18nCombinedDebtPortal}>
        <MemoryRouter initialEntries={['/debt-balances/30500']}>
          <DebtDetails />
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );
};

describe('DebtDetails - dateUpdated logic', () => {
  it('uses fiscalTransactionData transactionDate when present', () => {
    const debt = {
      ...baseDebt,
      fiscalTransactionData: [
        { transactionDate: '11/12/2020', transactionFiscalCode: '08P' },
        { transactionDate: '10/01/2019', transactionFiscalCode: '04P' },
      ],
      debtHistory: [{ date: '09/18/2012', letterCode: '100' }],
    };

    const { getByText } = renderDebtDetails(debt);

    // Should use the first fiscalTransactionData entry's date
    expect(getByText('November 12, 2020')).to.exist;
  });

  it('falls back to last debtHistory date when fiscalTransactionData is absent', () => {
    const debt = {
      ...baseDebt,
      // Use non-approved letter codes so dates don't also appear in HistoryTable
      debtHistory: [
        { date: '09/18/2012', letterCode: '212' },
        { date: '11/14/2012', letterCode: '510' },
      ],
    };

    const { getByText } = renderDebtDetails(debt);

    // Should use the last debtHistory entry's date
    expect(getByText('November 14, 2012')).to.exist;
  });

  it('falls back to last debtHistory date when fiscalTransactionData is empty', () => {
    const debt = {
      ...baseDebt,
      fiscalTransactionData: [],
      // Use non-approved letter code so date doesn't also appear in HistoryTable
      debtHistory: [{ date: '09/18/2012', letterCode: '212' }],
    };

    const { getByText } = renderDebtDetails(debt);

    expect(getByText('September 18, 2012')).to.exist;
  });

  it('does not render "Updated on" when both fiscalTransactionData and debtHistory are absent', () => {
    const debt = {
      ...baseDebt,
    };

    const { queryByText } = renderDebtDetails(debt);

    expect(queryByText('Updated on')).to.be.null;
  });

  it('fiscalTransactionData takes precedence over debtHistory when both are present', () => {
    const debt = {
      ...baseDebt,
      fiscalTransactionData: [
        { transactionDate: '03/15/2021', transactionFiscalCode: '04P' },
      ],
      // Use non-approved letter codes so dates don't also appear in HistoryTable
      debtHistory: [
        { date: '09/18/2012', letterCode: '212' },
        { date: '11/14/2012', letterCode: '510' },
      ],
    };

    const { getByText, queryByText } = renderDebtDetails(debt);

    // fiscalTransactionData date shown
    expect(getByText('March 15, 2021')).to.exist;
    // debtHistory date not shown as the "updated" date
    expect(queryByText('November 14, 2012')).to.be.null;
  });
});
