import { expect } from 'chai';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import React from 'react';
import { render } from '@testing-library/react';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import Balances from '../../components/Balances';
import { showVHAPaymentHistory } from '../../../combined/utils/helpers';

const renderWithStore = (component, initialState) => {
  const store = createStore(
    combineReducers({
      combinedPortal: (state = initialState.combinedPortal || {}) => state,
      user: (state = initialState.user || {}) => state,
      featureToggles: (
        state = initialState.featureToggles || { loading: false },
      ) => state,
    }),
  );
  return render(
    <Provider store={store}>
      <Router>{component}</Router>
    </Provider>,
  );
};

describe('Balances', () => {
  it('showVHAPaymentHistory is true - renders with new data structure', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          statements: {
            data: [
              {
                id: '4-1abZUKu7xIvIw6',
                type: 'medicalCopays',
                attributes: {
                  url: null,
                  facility: 'TEST VAMC',
                  facilityId: '4-O3d8XK44ejMS',
                  city: 'LYONS',
                  externalId: '4-1abZUKu7xIvIw6',
                  latestBillingRef: '4-6c9ZE23XQm5VawK',
                  currentBalance: 10,
                  previousBalance: 65.71,
                  previousUnpaidBalance: 0,
                  lastUpdatedAt: '2025-08-29T00:00:00Z',
                },
              },
            ],
            meta: {
              total: 10,
              page: 1,
              perPage: 3,
              copaySummary: {
                totalCurrentBalance: 10.0,
                copayBillCount: 1,
                lastUpdatedOn: '2025-08-29T00:00:00Z',
              },
            },
            links: {
              self:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              first:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              next:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=2',
              last:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=4',
            },
          },
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements.data}
        paginationText="TRUE SET"
        showVHAPaymentHistory
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify BalanceCard is rendered with correct data
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-4-1abZUKu7xIvIw6"]',
    );
    expect(balanceCard).to.exist;

    // Verify amount is displayed correctly from copaySummary
    const cardAmount = container.querySelector(
      '[data-testid="amount-4-1abZUKu7xIvIw6"]',
    );
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$10.00');

    // Verify date is displayed from copaySummary.lastUpdatedOn
    const cardDate = container.querySelector(
      '[data-testid="due-date-4-1abZUKu7xIvIw6"]',
    );
    expect(cardDate).to.exist;
    expect(cardDate.textContent).to.include('August 29, 2025');

    // Verify detail link is present
    const detailLink = container.querySelector(
      '[data-testid="detail-link-4-1abZUKu7xIvIw6"]',
    );
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is present
    const resolveLink = container.querySelector(
      '[data-testid="resolve-link-4-1abZUKu7xIvIw6"]',
    );
    expect(resolveLink).to.exist;
    expect(resolveLink.text).to.include('Resolve this bill');

    // Verify helper function returns true
    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.true;
  });

  it('showVHAPaymentHistory is true - renders ZeroBalanceCopayCard when currentBalance is 0', () => {
    const statementId = '4-zeroBalance001';
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          statements: {
            data: [
              {
                id: statementId,
                type: 'medicalCopays',
                attributes: {
                  url: null,
                  facility: 'ZERO BALANCE VAMC',
                  facilityId: '4-O3d8XK44ejZB',
                  city: 'RICHMOND',
                  externalId: statementId,
                  latestBillingRef: '4-6c9ZE23XQm5Zero',
                  currentBalance: 0,
                  previousBalance: 50.0,
                  previousUnpaidBalance: 0,
                  lastUpdatedAt: '2025-08-29T00:00:00Z',
                },
              },
            ],
            meta: {
              total: 1,
              page: 1,
              perPage: 3,
              copaySummary: {
                totalCurrentBalance: 0,
                copayBillCount: 1,
                lastUpdatedOn: '2025-08-29T00:00:00Z',
              },
            },
            links: {},
          },
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements.data}
        paginationText="TRUE SET"
        showVHAPaymentHistory
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify ZeroBalanceCopayCard is rendered instead of BalanceCard
    const balanceCard = container.querySelector(
      `[data-testid="balance-card-${statementId}"]`,
    );
    expect(balanceCard).to.exist;

    // Verify the zero balance amount is displayed
    const cardAmount = container.querySelector(
      `[data-testid="amount-${statementId}"]`,
    );
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$0.00');

    // Verify facility and city are displayed
    const facilityCity = container.querySelector(
      `[data-testid="facility-city-${statementId}"]`,
    );
    expect(facilityCity).to.exist;
    expect(facilityCity.textContent).to.include('ZERO BALANCE VAMC');
    expect(facilityCity.textContent).to.include('RICHMOND');

    // Verify detail link is still present on ZeroBalanceCopayCard
    const detailLink = container.querySelector(
      `[data-testid="detail-link-${statementId}"]`,
    );
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is NOT present (zero balance cards don't have resolve)
    const resolveLink = container.querySelector(
      `[data-testid="resolve-link-${statementId}"]`,
    );
    expect(resolveLink).to.not.exist;

    // Verify helper function returns true
    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.true;
  });

  // TODO: to be removed once toggle is fully enabled
  it('showVHAPaymentHistory is false - renders with legacy data structure', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          statements: [
            {
              id: '1',
              pSStatementDateOutput: '2025-01-05',
              pHAmtDue: 150.25,
              station: {
                facilityName: 'Test VAMC',
                city: 'Test City',
              },
            },
          ],
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements}
        paginationText="FALSE SET"
        showVHAPaymentHistory={false}
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify BalanceCard is rendered with correct data
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-1"]',
    );
    expect(balanceCard).to.exist;

    // Verify amount is calculated from array
    const cardAmount = container.querySelector('[data-testid="amount-1"]');
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$150.25');

    // Verify date is from latest bill
    const cardDate = container.querySelector('[data-testid="due-date-1"]');
    expect(cardDate).to.exist;
    expect(cardDate.textContent).to.include('January 5, 2025');

    // Verify detail link is present
    const detailLink = container.querySelector('[data-testid="detail-link-1"]');
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is present
    const resolveLink = container.querySelector(
      '[data-testid="resolve-link-1"]',
    );
    expect(resolveLink).to.exist;
    expect(resolveLink.text).to.include('Resolve this bill');

    // Verify helper function returns false
    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.false;
  });

  // TODO: to be removed once toggle is fully enabled
  it('showVHAPaymentHistory is false - renders ZeroBalanceCopayCard when pHAmtDue is 0', () => {
    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          statements: [
            {
              id: '2',
              pSStatementDateOutput: '2025-03-10',
              pHAmtDue: 0,
              station: {
                facilityName: 'Zero Balance VAMC',
                city: 'Test City',
              },
            },
          ],
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={mockState.combinedPortal.mcp.statements}
        paginationText="FALSE SET"
        showVHAPaymentHistory={false}
      />,
      mockState,
    );

    // Verify component renders
    expect(container).to.exist;

    // Verify ZeroBalanceCopayCard is rendered instead of BalanceCard
    const balanceCard = container.querySelector(
      '[data-testid="balance-card-2"]',
    );
    expect(balanceCard).to.exist;

    // Verify the zero balance amount is displayed
    const cardAmount = container.querySelector('[data-testid="amount-2"]');
    expect(cardAmount).to.exist;
    expect(cardAmount.textContent).to.include('$0.00');

    // Verify facility and city are displayed
    const facilityCity = container.querySelector(
      '[data-testid="facility-city-2"]',
    );
    expect(facilityCity).to.exist;
    expect(facilityCity.textContent).to.include('Zero Balance VAMC');
    expect(facilityCity.textContent).to.include('Test City');

    // Verify detail link is still present on ZeroBalanceCopayCard
    const detailLink = container.querySelector('[data-testid="detail-link-2"]');
    expect(detailLink).to.exist;
    expect(detailLink.text).to.include('Review details');

    // Verify resolve link is NOT present (zero balance cards don't have resolve)
    const resolveLink = container.querySelector(
      '[data-testid="resolve-link-2"]',
    );
    expect(resolveLink).to.not.exist;

    // Verify helper function returns false
    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.false;
  });

  it('showVHAPaymentHistory is true - renders mixed balances from v1 endpoint data', () => {
    const v1Statements = [
      {
        id: '4-1abZUKu7xIvIw6',
        type: 'medicalCopays',
        attributes: {
          url: null,
          facility: 'TEST VAMC',
          facilityId: '4-O3d8XK44ejMS',
          city: 'LYONS',
          externalId: '4-1abZUKu7xIvIw6',
          latestBillingRef: '4-6c9ZE23XQm5VawK',
          currentBalance: 0.0,
          previousBalance: 65.71,
          previousUnpaidBalance: 0.0,
          lastUpdatedAt: '2025-08-29T00:00:00Z',
        },
      },
      {
        id: '4-1abZUKu7xIv1t4',
        type: 'medicalCopays',
        attributes: {
          url: null,
          facility: 'TEST VAMC',
          facilityId: '4-5pFm5AKcS3F',
          city: 'LYONS',
          externalId: '4-1abZUKu7xIv1t4',
          latestBillingRef: '4-6c9ZE23XQjkA9CC',
          currentBalance: 85.67,
          previousBalance: 76.19,
          previousUnpaidBalance: 85.67,
          lastUpdatedAt: '2025-08-29T00:00:00Z',
        },
      },
      {
        id: '4-1abZUKu7xIukq2',
        type: 'medicalCopays',
        attributes: {
          url: null,
          facility: 'TEST VAMC',
          facilityId: '4-O3d8XK3dOgmC',
          city: 'LYONS',
          externalId: '4-1abZUKu7xIukq2',
          latestBillingRef: '4-6c9ZE23XQm4MeK0',
          currentBalance: 60.790000000000006,
          previousBalance: 49.63,
          previousUnpaidBalance: 60.790000000000006,
          lastUpdatedAt: '2025-08-29T00:00:00Z',
        },
      },
      {
        id: 'f4385298-08a6-42f8-a86f-50e97033fb85',
        type: 'medicalCopays',
        attributes: {
          url: null,
          facility:
            'Ralph H. Johnson Department of Veterans Affairs Medical Center',
          facilityId: '4-534',
          city: 'Charleston',
          externalId: 'f4385298-08a6-42f8-a86f-50e97033fb85',
          latestBillingRef: '618-K00K9ZK',
          currentBalance: 15.0,
          previousBalance: 15.0,
          previousUnpaidBalance: 15.0,
          lastUpdatedAt: '2023-11-05T00:00:00Z',
        },
      },
    ];

    const mockState = {
      user: {},
      combinedPortal: {
        debtLetters: {
          isProfileUpdating: false,
          isPending: false,
          isPendingVBMS: false,
          isError: false,
          isVBMSError: false,
          debts: [],
          selectedDebt: {},
          debtLinks: [],
          errors: [],
          hasDependentDebts: false,
        },
        mcp: {
          pending: false,
          error: null,
          statements: {
            data: v1Statements,
            meta: {
              total: 10,
              page: 1,
              perPage: 3,
              copaySummary: {
                totalCurrentBalance: 146.46,
                copayBillCount: 3,
                lastUpdatedOn: '2025-08-29T00:00:00Z',
              },
            },
            links: {
              self:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              first:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=1',
              next:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=2',
              last:
                'http://127.0.0.1:3000/services/health-care-costs-coverage/v0/r4/Invoice?_count=3&patient=10000003&page=4',
            },
          },
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <Balances
        statements={v1Statements}
        paginationText="TRUE SET"
        showVHAPaymentHistory
      />,
      mockState,
    );

    expect(container).to.exist;

    // --- First entry: currentBalance === 0 → ZeroBalanceCopayCard ---
    const zeroCard = container.querySelector(
      '[data-testid="balance-card-4-1abZUKu7xIvIw6"]',
    );
    expect(zeroCard).to.exist;

    const zeroAmount = container.querySelector(
      '[data-testid="amount-4-1abZUKu7xIvIw6"]',
    );
    expect(zeroAmount).to.exist;
    expect(zeroAmount.textContent).to.include('$0.00');

    // ZeroBalanceCopayCard shows detail link but no resolve link
    const zeroDetailLink = container.querySelector(
      '[data-testid="detail-link-4-1abZUKu7xIvIw6"]',
    );
    expect(zeroDetailLink).to.exist;
    expect(zeroDetailLink.text).to.include('Review details');

    const zeroResolveLink = container.querySelector(
      '[data-testid="resolve-link-4-1abZUKu7xIvIw6"]',
    );
    expect(zeroResolveLink).to.not.exist;

    // --- Second entry: currentBalance === 85.67 → BalanceCard ---
    const balanceCard85 = container.querySelector(
      '[data-testid="balance-card-4-1abZUKu7xIv1t4"]',
    );
    expect(balanceCard85).to.exist;

    const amount85 = container.querySelector(
      '[data-testid="amount-4-1abZUKu7xIv1t4"]',
    );
    expect(amount85).to.exist;
    expect(amount85.textContent).to.include('$85.67');

    const date85 = container.querySelector(
      '[data-testid="due-date-4-1abZUKu7xIv1t4"]',
    );
    expect(date85).to.exist;
    expect(date85.textContent).to.include('August 29, 2025');

    const resolveLink85 = container.querySelector(
      '[data-testid="resolve-link-4-1abZUKu7xIv1t4"]',
    );
    expect(resolveLink85).to.exist;
    expect(resolveLink85.text).to.include('Resolve this bill');

    // --- Third entry: currentBalance === 60.79 (float precision) → BalanceCard ---
    const balanceCard60 = container.querySelector(
      '[data-testid="balance-card-4-1abZUKu7xIukq2"]',
    );
    expect(balanceCard60).to.exist;

    const amount60 = container.querySelector(
      '[data-testid="amount-4-1abZUKu7xIukq2"]',
    );
    expect(amount60).to.exist;
    // currency() should round to 2 decimal places
    expect(amount60.textContent).to.include('$60.79');

    // --- Fourth entry: different facility name and older date → BalanceCard ---
    const balanceCardRalph = container.querySelector(
      '[data-testid="balance-card-f4385298-08a6-42f8-a86f-50e97033fb85"]',
    );
    expect(balanceCardRalph).to.exist;

    const amountRalph = container.querySelector(
      '[data-testid="amount-f4385298-08a6-42f8-a86f-50e97033fb85"]',
    );
    expect(amountRalph).to.exist;
    expect(amountRalph.textContent).to.include('$15.00');

    const dateRalph = container.querySelector(
      '[data-testid="due-date-f4385298-08a6-42f8-a86f-50e97033fb85"]',
    );
    expect(dateRalph).to.exist;
    expect(dateRalph.textContent).to.include('November 5, 2023');

    // --- Total rendered card count ---
    // 1 ZeroBalanceCopayCard + 3 BalanceCards = 4
    const allCards = container.querySelectorAll(
      '[data-testid^="balance-card-"]',
    );
    expect(allCards).to.have.length(4);

    // Verify helper function returns true
    const result = showVHAPaymentHistory(mockState);
    expect(result).to.be.true;
  });
});
