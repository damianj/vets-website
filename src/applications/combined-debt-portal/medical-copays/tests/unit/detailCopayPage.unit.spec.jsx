import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { combineReducers, createStore } from 'redux';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import DetailCopayPage from '../../containers/DetailCopayPage';

describe('DetailCopayPage', () => {
  const registerMockElement = name => {
    class MockWebComponent extends HTMLElement {}
    if (!window.customElements.get(name)) {
      window.customElements.define(name, MockWebComponent);
    }
  };

  before(() => {
    registerMockElement('va-breadcrumbs');
    registerMockElement('va-loading-indicator');
  });

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

  const mockMatch = { params: { id: '123' } };

  it('uses attributes.facility for TITLE when VHA payment history flag is true', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: {
          name: 'James A. Haley',
        },
        invoiceDate: '2024-01-15',
        accountNumber: 'ACC123',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
      },
      station: {
        facilityName: 'James A. Haley',
      },
    };

    const mockState = {
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: [mockStatement],
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include('Copay bill for James A. Haley');
  });

  it('uses station.facilityName for TITLE when VHA payment history flag is false', () => {
    const mockStatement = {
      id: '123',
      station: {
        facilityName: 'Tampa VA Medical Center',
      },
      pSStatementDateOutput: '01/15/2024',
      accountNumber: 'ACC123',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: {
        profile: {
          userFullName: { first: 'John', last: 'Doe' },
        },
      },
      combinedPortal: {
        mcp: {
          selectedStatement: mockStatement,
          statements: [mockStatement],
        },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include(
      'Copay bill for Tampa VA Medical Center',
    );
  });

  it('renders VHA unspaced account number split into 5 parts', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: { name: 'James A. Haley' },
        invoiceDate: '2024-01-15',
        accountNumber: '5160000000024571JONES',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
      },
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: { selectedStatement: mockStatement, statements: [mockStatement] },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include('516 0000 0000 24571 JONES');
  });

  it('renders CDW spaced account number correctly', () => {
    const mockStatement = {
      id: '123',
      station: { facilityName: 'Tampa VA Medical Center' },
      pSStatementDateOutput: '01/15/2024',
      accountNumber: '516 0000 0000 24571 JONES',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: { selectedStatement: mockStatement, statements: [mockStatement] },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.textContent).to.include('516 0000 0000 24571 JONES');
  });

  it('passes recentStatements to PreviousStatements when VHA flag is true', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: { name: 'James A. Haley' },
        invoiceDate: '2024-01-15',
        accountNumber: 'ACC123',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
        recentStatements: [
          { id: '1', invoiceDate: '2023-10-01' },
          { id: '2', invoiceDate: '2023-11-01' },
        ],
      },
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: { selectedStatement: mockStatement, statements: [mockStatement] },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    // Both recent statements should appear as links
    expect(container.querySelector('[data-testid="view-statements"]')).to.exist;
  });

  it('does not render PreviousStatements when recentStatements is empty', () => {
    const mockStatement = {
      id: '123',
      attributes: {
        facility: { name: 'James A. Haley' },
        invoiceDate: '2024-01-15',
        accountNumber: 'ACC123',
        lineItems: [],
        principalBalance: 100,
        paymentDueDate: '2024-02-15',
        principalPaid: 25,
        recentStatements: [],
      },
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: { selectedStatement: mockStatement, statements: [mockStatement] },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: true,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.querySelector('[data-testid="view-statements"]')).to.not
      .exist;
  });

  it('filters legacy previous statements to same facility and excludes current', () => {
    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: {
          selectedStatement: null,
          statements: [
            {
              id: '123',
              station: { facilityName: 'Tampa VA' },
              pSFacilityNum: 'FAC1',
              pSStatementDateOutput: '01/15/2024',
              accountNumber: 'ACC123',
              details: [],
              pHNewBalance: 100,
              pHTotCharges: 25,
            },
            {
              id: '456',
              station: { facilityName: 'Tampa VA' },
              pSFacilityNum: 'FAC1',
              pSStatementDateOutput: '02/15/2024',
              accountNumber: 'ACC123',
              details: [],
              pHNewBalance: 50,
              pHTotCharges: 10,
            },
            {
              id: '789',
              station: { facilityName: 'Other VA' },
              pSFacilityNum: 'FAC2',
              pSStatementDateOutput: '03/15/2024',
              accountNumber: 'ACC456',
              details: [],
              pHNewBalance: 75,
              pHTotCharges: 15,
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
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    // Should show previous statements section with only the same-facility statement
    expect(container.querySelector('[data-testid="view-statements"]')).to.exist;
    // Statement from other facility should not appear
    expect(
      container.querySelector(
        '[data-testid="balance-details-789-statement-view"]',
      ),
    ).to.not.exist;
    // Current statement (123) should not appear in previous list
    expect(
      container.querySelector(
        '[data-testid="balance-details-123-statement-view"]',
      ),
    ).to.not.exist;
    // Same-facility non-current statement should appear
    expect(
      container.querySelector(
        '[data-testid="balance-details-456-statement-view"]',
      ),
    ).to.exist;
  });

  it('sorts legacy previous statements by date descending', () => {
    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: {
          selectedStatement: null,
          statements: [
            {
              id: '123',
              station: { facilityName: 'Tampa VA' },
              pSFacilityNum: 'FAC1',
              pSStatementDateOutput: '01/15/2024',
              accountNumber: 'ACC123',
              details: [],
              pHNewBalance: 100,
              pHTotCharges: 25,
            },
            {
              id: '456',
              station: { facilityName: 'Tampa VA' },
              pSFacilityNum: 'FAC1',
              pSStatementDateOutput: '03/15/2024',
              accountNumber: 'ACC123',
              details: [],
              pHNewBalance: 50,
              pHTotCharges: 10,
            },
            {
              id: '789',
              station: { facilityName: 'Tampa VA' },
              pSFacilityNum: 'FAC1',
              pSStatementDateOutput: '02/15/2024',
              accountNumber: 'ACC123',
              details: [],
              pHNewBalance: 75,
              pHTotCharges: 15,
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
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    const links = container.querySelectorAll(
      '[data-testid^="balance-details-"]',
    );
    // Most recent first: 456 (03/15), then 789 (02/15)
    expect(links[0].getAttribute('data-testid')).to.include('456');
    expect(links[1].getAttribute('data-testid')).to.include('789');
  });

  it('does not render PreviousStatements when no other statements exist for facility', () => {
    const mockStatement = {
      id: '123',
      station: { facilityName: 'Tampa VA Medical Center' },
      pSFacilityNum: 'FAC1',
      pSStatementDateOutput: '01/15/2024',
      accountNumber: 'ACC123',
      details: [],
      pHNewBalance: 100,
      pHTotCharges: 25,
    };

    const mockState = {
      user: { profile: { userFullName: { first: 'John', last: 'Doe' } } },
      combinedPortal: {
        mcp: { selectedStatement: null, statements: [mockStatement] },
      },
      featureToggles: {
        [FEATURE_FLAG_NAMES.showVHAPaymentHistory]: false,
        loading: false,
      },
    };

    const { container } = renderWithStore(
      <DetailCopayPage match={mockMatch} />,
      mockState,
    );

    expect(container.querySelector('[data-testid="view-statements"]')).to.not
      .exist;
  });
});
