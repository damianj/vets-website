import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { fireEvent } from '@testing-library/dom';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import prescriptionsListItem from '../../fixtures/prescriptionsListItem.json';
import MedicationsListCard from '../../../components/MedicationsList/MedicationsListCard';
import reducers from '../../../reducers';
import {
  medicationsUrls,
  NON_VA_MEDICATION_MESSAGE,
} from '../../../util/constants';

describe('Medication card component', () => {
  const FLAG_COMBINATIONS = [
    {
      cernerPilot: false,
      v2StatusMapping: false,
      useV2: false,
      desc: 'both flags disabled',
    },
    {
      cernerPilot: true,
      v2StatusMapping: false,
      useV2: false,
      desc: 'only cernerPilot enabled',
    },
    {
      cernerPilot: false,
      v2StatusMapping: true,
      useV2: false,
      desc: 'only v2StatusMapping enabled',
    },
    {
      cernerPilot: true,
      v2StatusMapping: true,
      useV2: true,
      desc: 'both flags enabled',
    },
  ];

  const V2_STATUSES = [
    { status: 'Active', desc: 'Active' },
    { status: 'In progress', desc: 'In progress' },
    { status: 'Inactive', desc: 'Inactive' },
    { status: 'Transferred', desc: 'Transferred' },
    { status: 'Shipped', desc: 'Shipped' },
    { status: 'Status not available', desc: 'Status not available' },
  ];

  const V1_STATUSES = [
    'Active: Parked',
    'Active: Refill in Process',
    'Active: Submitted',
    'Active: On Hold',
    'Expired',
    'Discontinued',
    'Transferred',
  ];

  const setup = (rx = prescriptionsListItem, initialState = {}) => {
    return renderWithStoreAndRouterV6(<MedicationsListCard rx={rx} />, {
      initialState,
      reducers,
    });
  };

  const setupWithFlags = (
    rx = prescriptionsListItem,
    isCernerPilot = false,
    isV2StatusMapping = false,
  ) => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: isCernerPilot,
        [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: isV2StatusMapping,
      },
    };
    return renderWithStoreAndRouterV6(<MedicationsListCard rx={rx} />, {
      initialState,
      reducers,
    });
  };

  // Shared test data

  it('renders without errors, even when no prescription name is given ', () => {
    const screen = setup({
      ...prescriptionsListItem,
      prescriptionName: '',
      dispStatus: 'Active: Non-VA',
    });
    const medicationName = screen.getByTestId(
      'medications-history-details-link',
    );
    fireEvent.click(medicationName);
    expect(screen);
  });

  it('shows status', () => {
    const screen = setup();
    expect(screen.getByText(prescriptionsListItem.dispStatus)).to.exist;
  });

  it('does not show Unknown when status is unknown', () => {
    const rxWithUnknownStatus = {
      ...prescriptionsListItem,
      dispStatus: 'Unknown',
    };
    const screen = setup(rxWithUnknownStatus);
    expect(screen.queryByText(rxWithUnknownStatus.dispStatus)).to.not.exist;
  });

  it('able to click on medication name', () => {
    const screen = setup({
      ...prescriptionsListItem,
      dispStatus: 'Active: Non-VA',
    });
    const medicationName = screen.getByText(
      prescriptionsListItem.prescriptionName,
    );
    fireEvent.click(medicationName);
    expect(screen);
  });

  it('shows shipped on information when available', () => {
    const screen = setup({
      ...prescriptionsListItem,
      trackingList: [
        {
          completeDateTime: 'Sun, 16 Jun 2024 04:39:11 EDT',
        },
      ],
    });
    const shippedOn = screen.getByText('Shipped on June 16, 2024');
    expect(shippedOn);
  });

  it('shows number of refills when it is refillable and has at least 1 refill remaining', () => {
    const rx = {
      ...prescriptionsListItem,
      isRefillable: true,
      dispStatus: 'Active',
      refillRemaining: 3,
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-refill-remaining')).to.have.text(
      'Refills remaining: 3',
    );
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    const managementImprovementsState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
      },
    };

    const activeNoRefillsRx = {
      ...prescriptionsListItem,
      dispStatus: 'Active',
      isRefillable: false,
      refillRemaining: 0,
    };

    const shippedRx = {
      ...prescriptionsListItem,
      dispStatus: 'Active: Shipped',
      isRefillable: false,
      isTrackable: true,
      trackingList: [
        {
          completeDateTime: new Date().toISOString(),
          carrier: 'USPS',
          trackingNumber: '12345678901234',
        },
      ],
    };

    describe('active refillable prescription', () => {
      it('shows "Refills left", hides rx number, status label, and in-progress alert', () => {
        const rx = {
          ...prescriptionsListItem,
          isRefillable: true,
          dispStatus: 'Active',
          refillRemaining: 3,
          prescriptionNumber: '12345',
        };
        const { getByTestId, queryByTestId } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('rx-refill-remaining')).to.have.text(
          'Refills left: 3',
        );
        expect(queryByTestId('rx-number')).to.be.null;
        expect(queryByTestId('rxStatus')).to.be.null;
        expect(queryByTestId('fill-in-progress-alert')).to.be.null;
      });
    });

    describe('fill in progress', () => {
      it('shows alert, link, and "Fill in progress" for "Active: Refill in Process"', () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Refill in Process',
          isRefillable: false,
          rxRfRecords: [],
        };
        const { getByTestId, getByText } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('fill-in-progress-alert')).to.exist;
        expect(getByText(/Fill in progress\./)).to.exist;
        const link = getByText('Go to in-progress medications');
        expect(link).to.have.attribute(
          'href',
          medicationsUrls.MEDICATIONS_IN_PROGRESS,
        );
      });

      it('shows alert, link, and "Fill in progress" for "Active: Submitted"', () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Submitted',
          isRefillable: false,
          rxRfRecords: [],
        };
        const { getByTestId, getByText } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('fill-in-progress-alert')).to.exist;
        expect(getByText(/Fill in progress\./)).to.exist;
        const link = getByText('Go to in-progress medications');
        expect(link).to.have.attribute(
          'href',
          medicationsUrls.MEDICATIONS_IN_PROGRESS,
        );
      });

      it('shows "Refills left" when not refillable and hides ExtraDetails', () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Refill in Process',
          isRefillable: false,
          refillRemaining: 3,
        };
        const { getByTestId, container } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('rx-refill-remaining')).to.have.text(
          'Refills left: 3',
        );
        expect(container.querySelector('.shipping-info')).to.be.null;
      });

      it('shows "Not filled yet" and "Refills left" for initial fill in progress', () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Refill in Process',
          isRefillable: false,
          rxRfRecords: [],
          refillRemaining: 3,
        };
        const { getByTestId, getByText } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByText(/Fill in progress\./)).to.exist;
        expect(getByTestId('active-not-filled-rx')).to.have.text(
          'Not filled yet',
        );
        expect(getByTestId('rx-refill-remaining')).to.have.text(
          'Refills left: 3',
        );
      });

      it('shows "Refill in progress" with last filled date when previously dispensed', () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Refill in Process',
          isRefillable: false,
          sortedDispensedDate: '2026-01-05T05:00:00.000Z',
          refillRemaining: 3,
        };
        const { getByTestId, getByText } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('fill-in-progress-alert')).to.exist;
        expect(getByText(/Refill in progress\./)).to.exist;
        expect(getByTestId('rx-last-filled-date')).to.exist;
      });
    });

    describe('recently shipped', () => {
      it('shows shipped alert with tracking link, hides legacy shipped-on and ExtraDetails', () => {
        const { getByTestId, queryByTestId, getByText, container } = setup(
          shippedRx,
          managementImprovementsState,
        );
        expect(getByTestId('shipped-alert')).to.exist;
        const link = getByText('Get tracking info');
        expect(link).to.have.attribute(
          'href',
          `https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=12345678901234`,
        );
        expect(queryByTestId('rx-card-details--shipped-on')).to.be.null;
        expect(container.querySelector('.shipping-info')).to.be.null;
        expect(getByText(/Refill has shipped/)).to.exist;
      });

      it('shows shipped alert with detail page link for unknown carrier', () => {
        const rx = {
          ...shippedRx,
          trackingList: [
            {
              completeDateTime: new Date().toISOString(),
              carrier: 'OTHER',
              trackingNumber: null,
            },
          ],
        };
        const { getByTestId, getByText } = setup(
          rx,
          managementImprovementsState,
        );
        expect(getByTestId('shipped-alert')).to.exist;
        const link = getByText('Get tracking info');
        expect(link.getAttribute('href')).to.include(
          `/prescription/${prescriptionsListItem.prescriptionId}`,
        );
      });

      it('shows "Refills left" for recently shipped prescription', () => {
        const rx = { ...shippedRx, refillRemaining: 3 };
        const { getByTestId } = setup(rx, managementImprovementsState);
        expect(getByTestId('rx-refill-remaining')).to.have.text(
          'Refills left: 3',
        );
      });

      it('does not show shipped alert when isTrackable is false', () => {
        const rx = { ...shippedRx, isRefillable: true, isTrackable: false };
        const { queryByTestId } = setup(rx, managementImprovementsState);
        expect(queryByTestId('shipped-alert')).to.be.null;
      });

      it('shows "Fill has shipped" for initial fill with no rxRfRecords', () => {
        const rx = { ...shippedRx, rxRfRecords: [] };
        const { getByText } = setup(rx, managementImprovementsState);
        expect(getByText(/Fill has shipped/)).to.exist;
      });
    });

    describe('Non-VA medication card', () => {
      const nonVaRx = {
        ...prescriptionsListItem,
        prescriptionSource: 'NV',
        dispStatus: 'Active: Non-VA',
        orderedDate: '2024-06-16T20:00:00Z',
      };

      it('shows Non-VA label, message, and link without status, date, or rx number', () => {
        const screen = setup(nonVaRx, managementImprovementsState);
        expect(screen.getByTestId('non-va-medication-label')).to.have.text(
          'Non-VA medication',
        );
        expect(screen.getByTestId('non-VA-prescription')).to.have.text(
          NON_VA_MEDICATION_MESSAGE,
        );
        expect(screen.getByTestId('medications-history-details-link')).to.exist;
        expect(screen.queryByTestId('rx-last-filled-info')).to.not.exist;
        expect(screen.queryByTestId('rxStatus')).to.not.exist;
        expect(screen.queryByTestId('rx-number')).to.not.exist;
      });
    });

    describe('Discontinued prescription card', () => {
      const discontinuedRx = {
        ...prescriptionsListItem,
        dispStatus: 'Discontinued',
        isRefillable: false,
        refillRemaining: 0,
        sortedDispensedDate: '2026-01-05T05:00:00.000Z',
      };

      it('shows last filled date, updated message, no refills, and ExtraDetails', () => {
        const { getByTestId, queryByTestId, container } = setup(
          discontinuedRx,
          managementImprovementsState,
        );
        expect(getByTestId('rxStatus')).to.exist;
        expect(getByTestId('rxStatus').textContent).to.equal('Discontinued');
        expect(getByTestId('rx-last-filled-date')).to.exist;
        expect(getByTestId('discontinued').textContent).to.include(
          'send a message to your care team',
        );
        expect(queryByTestId('rx-refill-remaining')).to.be.null;
        expect(container.querySelector('.shipping-info')).to.exist;
        expect(container.querySelector('va-card[background]')).to.exist;
      });

      it('hides prescription number', () => {
        const rx = { ...discontinuedRx, prescriptionNumber: '12345' };
        const { queryByTestId } = setup(rx, managementImprovementsState);
        expect(queryByTestId('rx-number')).to.be.null;
      });
    });

    it('hides ExtraDetails for refill-in-progress prescriptions', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Active: Refill in Process',
        isRefillable: false,
      };
      const { container } = setup(rx, managementImprovementsState);
      expect(container.querySelector('.shipping-info')).to.be.null;
    });
    describe('On Hold prescription card', () => {
      const onHoldRx = {
        ...prescriptionsListItem,
        dispStatus: 'Active: On Hold',
        isRefillable: false,
        refillRemaining: 1,
        sortedDispensedDate: '2026-01-05T05:00:00.000Z',
      };

      it('hides last filled info, status label, and rx number', () => {
        const rx = { ...onHoldRx, prescriptionNumber: '12345' };
        const { queryByTestId } = setup(rx, managementImprovementsState);
        expect(queryByTestId('rx-last-filled-date')).to.be.null;
        expect(queryByTestId('rxStatus')).to.be.null;
        expect(queryByTestId('rx-number')).to.be.null;
      });

      it('shows updated on-hold message text', () => {
        const { getByTestId } = setup(onHoldRx, managementImprovementsState);
        expect(getByTestId('active-onHold').textContent).to.include(
          'You can’t refill this prescription online right now.',
        );
        expect(getByTestId('active-onHold').textContent).to.include(
          'If you need a refill, call your VA pharmacy',
        );
      });
    });
    describe('Transferred prescription card', () => {
      const transferredRx = {
        ...prescriptionsListItem,
        dispStatus: 'Transferred',
        isRefillable: false,
        refillRemaining: 0,
      };

      it('shows previous record message', () => {
        const { getByTestId } = setup(
          transferredRx,
          managementImprovementsState,
        );
        expect(getByTestId('transferred-content')).to.exist;
        expect(getByTestId('transferred-content').textContent).to.include(
          'This is a previous record of your medication',
        );
      });

      it('hides status label, prescription number, refills, and last filled date', () => {
        const rx = {
          ...transferredRx,
          prescriptionNumber: '12345',
        };
        const { queryByTestId } = setup(rx, managementImprovementsState);
        expect(queryByTestId('rxStatus')).to.be.null;
        expect(queryByTestId('rx-number')).to.be.null;
        expect(queryByTestId('rx-refill-remaining')).to.be.null;
        expect(queryByTestId('rx-last-filled-date')).to.be.null;
      });

      it('shows medication name link', () => {
        const { getByTestId } = setup(
          transferredRx,
          managementImprovementsState,
        );
        expect(getByTestId('medications-history-details-link')).to.exist;
      });

      it('renders with gray background card', () => {
        const { container } = setup(transferredRx, managementImprovementsState);
        expect(container.querySelector('va-card[background]')).to.exist;
      });
    });

    it('does not show fill-in-progress alert for Active status', () => {
      const rx = {
        ...prescriptionsListItem,
        isRefillable: true,
        dispStatus: 'Active',
      };
      const { queryByTestId } = setup(rx, managementImprovementsState);
      expect(queryByTestId('fill-in-progress-alert')).to.be.null;
    });

    it('shows shipped alert with tracking number as href for unknown carrier', () => {
      const rx = {
        ...shippedRx,
        trackingList: [
          {
            completeDateTime: new Date().toISOString(),
            carrier: 'OTHER',
            trackingNumber: 'ABC123',
          },
        ],
      };
      const { getByTestId, getByText } = setup(rx, managementImprovementsState);
      expect(getByTestId('shipped-alert')).to.exist;
      const link = getByText('Get tracking info');
      expect(link).to.have.attribute('href', 'ABC123');
    });

    it('shows no-refills-left alert, renew link, "Refills left: 0", and hides ExtraDetails for Active with 0 refills', () => {
      const { getByTestId, container } = setup(
        activeNoRefillsRx,
        managementImprovementsState,
      );
      expect(getByTestId('no-refills-left-alert')).to.exist;
      expect(getByTestId('no-refills-left-alert').textContent).to.include(
        'You have no refills left. If you need more, request a renewal.',
      );
      const link = getByTestId('learn-to-renew-prescriptions-link');
      expect(link).to.exist;
      expect(link).to.have.attribute(
        'href',
        medicationsUrls.RENEW_PRESCRIPTIONS_URL,
      );
      expect(link.textContent).to.equal('Learn how to renew prescriptions');
      expect(getByTestId('rx-refill-remaining')).to.have.text(
        'Refills left: 0',
      );
      expect(container.querySelector('.shipping-info')).to.be.null;
    });

    it('does not show no-refills-left alert when refills remain', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Active',
        isRefillable: true,
        refillRemaining: 3,
      };
      const { queryByTestId } = setup(rx, managementImprovementsState);
      expect(queryByTestId('no-refills-left-alert')).to.be.null;
    });

    it('does not show no-refills-left alert for non-Active status with 0 refills', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Expired',
        isRefillable: false,
        refillRemaining: 0,
      };
      const { queryByTestId } = setup(rx, managementImprovementsState);
      expect(queryByTestId('no-refills-left-alert')).to.be.null;
    });

    it('does not show no-refills-left alert for Expired status with 0 refills when isRenewable is false', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Expired',
        isRefillable: false,
        isRenewable: false,
        refillRemaining: 0,
      };
      const { queryByTestId } = setup(rx, managementImprovementsState);
      expect(queryByTestId('no-refills-left-alert')).to.be.null;
    });

    describe('Expired prescription (no renewal flow)', () => {
      const expiredRx = {
        ...prescriptionsListItem,
        dispStatus: 'Expired',
        isRefillable: false,
        refillRemaining: 0,
        expirationDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      it('shows expired status and too-old message for non-renewable prescription', () => {
        const { getByTestId, queryByTestId, container } = setup(
          expiredRx,
          managementImprovementsState,
        );
        expect(getByTestId('expired-status')).to.have.text('Expired');
        expect(
          getByTestId('expired-no-renewal-content').textContent,
        ).to.include(
          'This prescription is too old to refill. If you need more, request a renewal.',
        );
        expect(queryByTestId('rx-refill-remaining')).to.be.null;
        expect(queryByTestId('no-refills-left-alert')).to.be.null;
        expect(container.querySelector('.shipping-info')).to.be.null;
      });

      it('shows expired card for renewable prescription when renewal flag is OFF (falls through to S13)', () => {
        const renewableExpiredRx = {
          ...expiredRx,
          isRenewable: true,
        };
        const { getByTestId, queryByTestId } = setup(
          renewableExpiredRx,
          managementImprovementsState,
        );
        expect(getByTestId('expired-status')).to.have.text('Expired');
        expect(getByTestId('expired-no-renewal-content')).to.exist;
        expect(queryByTestId('no-refills-left-alert')).to.be.null;
        expect(queryByTestId('rx-refill-remaining')).to.be.null;
      });

      it('shows last filled date for expired non-renewable prescription', () => {
        const rxWithDate = {
          ...expiredRx,
          sortedDispensedDate: '2026-01-05T05:00:00.000Z',
        };
        const { getByTestId } = setup(rxWithDate, managementImprovementsState);
        expect(getByTestId('rx-last-filled-date')).to.exist;
        expect(getByTestId('expired-status')).to.exist;
      });

      it('does not show expired card when expiration date is in the future', () => {
        const rxFutureExpiry = {
          ...expiredRx,
          expirationDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
        const { queryByTestId } = setup(
          rxFutureExpiry,
          managementImprovementsState,
        );
        expect(queryByTestId('expired-no-renewal-content')).to.be.null;
      });

      it('does not show expired card when expiration date is missing', () => {
        const rxNoExpiry = {
          ...expiredRx,
          expirationDate: null,
        };
        const { queryByTestId } = setup(
          rxNoExpiry,
          managementImprovementsState,
        );
        expect(queryByTestId('expired-no-renewal-content')).to.be.null;
      });

      it('shows expired card even when renewal flag is ON (non-renewable expired)', () => {
        const { getByTestId } = setup(expiredRx, {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
            [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
          },
        });
        expect(getByTestId('expired-status')).to.have.text('Expired');
        expect(getByTestId('expired-no-renewal-content')).to.exist;
      });
    });

    describe('Expired ≤120 days, renewable', () => {
      const expiredRenewableRx = {
        ...prescriptionsListItem,
        dispStatus: 'Expired',
        isRefillable: false,
        isRenewable: true,
        refillRemaining: 0,
      };

      it('shows no-refills-left alert, "Refills left: 0", and hides ExtraDetails for Expired renewable prescription', () => {
        const { getByTestId, container } = setup(expiredRenewableRx, {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
            [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
          },
        });
        expect(getByTestId('no-refills-left-alert')).to.exist;
        expect(getByTestId('no-refills-left-alert').textContent).to.include(
          'You have no refills left. If you need more, request a renewal.',
        );
        expect(getByTestId('rx-refill-remaining')).to.have.text(
          'Refills left: 0',
        );
        expect(container.querySelector('.shipping-info')).to.be.null;
      });

      it('shows "Learn how to renew" fallback for non-Oracle Health Expired renewable prescription', () => {
        const rx = {
          ...expiredRenewableRx,
          stationNumber: '001',
          sourceEhr: 'VA',
        };
        const { getByTestId, queryByTestId } = setup(rx, {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
            [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
            [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: true,
          },
        });
        expect(getByTestId('no-refills-left-alert')).to.exist;
        expect(getByTestId('learn-to-renew-prescriptions-link')).to.exist;
        expect(queryByTestId('send-renewal-request-message-link')).to.be.null;
      });

      it('shows "Send a renewal request message" for Oracle Health Expired renewable prescription without duplicate expired text', () => {
        const rx = {
          ...expiredRenewableRx,
          stationNumber: '668',
          sourceEhr: 'OH',
          expirationDate: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };
        const { getByTestId, queryByTestId } = setup(rx, {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
            [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
            [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: true,
          },
        });
        expect(getByTestId('no-refills-left-alert')).to.exist;
        expect(getByTestId('send-renewal-request-message-link')).to.exist;
        expect(queryByTestId('learn-to-renew-prescriptions-link')).to.be.null;
        expect(queryByTestId('expired-less-than-120-days')).to.be.null;
      });
    });

    it('shows "Send a renewal request message" for Oracle Health Active with 0 refills', () => {
      const rx = {
        ...activeNoRefillsRx,
        isRenewable: true,
        stationNumber: '668',
        sourceEhr: 'OH',
      };
      const { getByTestId, queryByTestId } = setup(rx, {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
          [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: true,
        },
      });
      expect(getByTestId('no-refills-left-alert')).to.exist;
      expect(getByTestId('send-renewal-request-message-link')).to.exist;
      expect(queryByTestId('learn-to-renew-prescriptions-link')).to.be.null;
    });

    it('shows "Learn how to renew" fallback for non-Oracle Health Active with 0 refills', () => {
      const rx = {
        ...activeNoRefillsRx,
        isRenewable: true,
        stationNumber: '001',
        sourceEhr: 'VA',
      };
      const { getByTestId, queryByTestId } = setup(rx, {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
          [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: true,
        },
      });
      expect(getByTestId('no-refills-left-alert')).to.exist;
      expect(getByTestId('learn-to-renew-prescriptions-link')).to.exist;
      expect(queryByTestId('send-renewal-request-message-link')).to.be.null;
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    it('does not show fill-in-progress alert and shows original layout', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Active: Refill in Process',
        isRefillable: false,
        prescriptionNumber: '12345',
      };
      const { queryByTestId, getByTestId } = setup(rx);
      expect(queryByTestId('fill-in-progress-alert')).to.be.null;
      expect(getByTestId('rx-number')).to.exist;
      expect(getByTestId('rxStatus')).to.exist;
    });

    it('falls back to legacy Non-VA card layout', () => {
      const nonVaRx = {
        ...prescriptionsListItem,
        prescriptionSource: 'NV',
        dispStatus: 'Active: Non-VA',
        orderedDate: '2024-06-16T20:00:00Z',
      };
      const screen = setup(nonVaRx);
      expect(screen.queryByTestId('non-va-medication-label')).to.not.exist;
      expect(screen.getByTestId('rxStatus')).to.have.text('Active: Non-VA');
      expect(screen.getByTestId('rx-last-filled-info')).to.exist;
    });

    it('shows legacy discontinued message without grey background', () => {
      const rx = {
        ...prescriptionsListItem,
        dispStatus: 'Discontinued',
        isRefillable: false,
      };
      const { getByTestId, container } = setup(rx);
      expect(getByTestId('discontinued')).to.exist;
      expect(getByTestId('discontinued').textContent).to.include(
        'Contact your VA provider',
      );
      expect(container.querySelector('va-card[background]')).to.be.null;
    });
  });

  it('Does not show number of refills when it is not refillable', () => {
    const rx = {
      ...prescriptionsListItem,
      dispStatus: 'Active',
      refillRemaining: 3,
    };
    const { queryByTestId } = setup(rx);
    expect(queryByTestId('rx-refill-remaining')).to.be.null;
  });

  it('Does show number of refills when it has 0 refill remaining', () => {
    const rx = {
      ...prescriptionsListItem,
      isRefillable: true,
      dispStatus: 'Active',
      refillRemaining: 0,
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-refill-remaining')).to.have.text(
      'Refills remaining: 0',
    );
  });

  it('displays "Not available" when prescription number is missing', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionNumber: null,
      dispStatus: 'Active: Non-VA',
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-number')).to.have.text(
      'Prescription number: Not available',
    );
  });

  it('shows pending med text inside card body when the rx prescription source is PD and dispStatus is NewOrder', () => {
    const screen = setup({
      ...prescriptionsListItem,
      prescriptionSource: 'PD',
      dispStatus: 'NewOrder',
    });
    expect(
      screen.getByText(
        'This is a new prescription from your provider. Your VA pharmacy is reviewing it now. Details may change.',
      ),
    );
  });

  it('shows pending renewal text inside card body when the rx prescription source is PD and the disp status is Renew', () => {
    const screen = setup({
      ...prescriptionsListItem,
      prescriptionSource: 'PD',
      dispStatus: 'Renew',
    });
    expect(
      screen.getByText(
        'This is a renewal you requested. Your VA pharmacy is reviewing it now. Details may change.',
      ),
    );
  });

  it('renders a Non-VA Prescription with an orderedDate', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionSource: 'NV',
      dispStatus: 'Active: Non-VA',
      orderedDate: '2024-06-16T20:00:00Z',
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-last-filled-info')).to.have.text(
      'Documented on June 16, 2024',
    );
    expect(getByTestId('rxStatus')).to.have.text('Active: Non-VA');
    expect(getByTestId('non-VA-prescription')).to.have.text(
      NON_VA_MEDICATION_MESSAGE,
    );
  });

  it('renders a Non-VA Prescription without an orderedDate', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionSource: 'NV',
      dispStatus: 'Active: Non-VA',
      orderedDate: '',
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-last-filled-info')).to.have.text(
      'Documented on: Date not available',
    );
    expect(getByTestId('rxStatus')).to.have.text('Active: Non-VA');
    expect(getByTestId('non-VA-prescription')).to.have.text(
      NON_VA_MEDICATION_MESSAGE,
    );
  });

  it('renders a Non-VA Prescription when dispStatus is null', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionSource: 'NV',
      dispStatus: null,
      orderedDate: '',
    };
    const { getByTestId } = setup(rx);
    expect(getByTestId('rx-last-filled-info')).to.have.text(
      'Documented on: Date not available',
    );
    expect(getByTestId('rxStatus')).to.have.text('Active: Non-VA');
    expect(getByTestId('non-VA-prescription')).to.have.text(
      NON_VA_MEDICATION_MESSAGE,
    );
  });

  describe('CernerPilot and V2StatusMapping flag requirement validation', () => {
    FLAG_COMBINATIONS.forEach(
      ({ cernerPilot, v2StatusMapping, useV2, desc }) => {
        it(`${useV2 ? 'V2' : 'V1'} behavior when ${desc}`, () => {
          // Pass appropriate status based on flag combination
          // When both flags enabled, API returns V2 status; otherwise V1
          const dispStatus = useV2 ? 'Inactive' : 'Expired';
          const rx = { ...prescriptionsListItem, dispStatus };
          const screen = setupWithFlags(rx, cernerPilot, v2StatusMapping);
          expect(screen.getByText(dispStatus)).to.exist;
        });
      },
    );
  });

  it('renders link text from orderableItem when prescriptionName is null', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionName: null, // null check
      orderableItem: 'Amoxicillin 500mg Capsules', // fallback text
    };
    const screen = setup(rx);
    const link = screen.getByTestId('medications-history-details-link');
    expect(link).to.exist;
    expect(link.textContent).to.include('Amoxicillin 500mg Capsules');
  });

  it('renders link with medication name when available', () => {
    const rx = {
      ...prescriptionsListItem,
      prescriptionName: 'Atorvastatin',
      orderableItem: 'Fallback should not be used',
    };
    const screen = setup(rx);
    const link = screen.getByTestId('medications-history-details-link');
    expect(link).to.exist;
    expect(link.textContent).to.include('Atorvastatin');
  });

  it('does not render Unknown status text', () => {
    const rxWithUnknownStatus = {
      ...prescriptionsListItem,
      dispStatus: 'Unknown',
    };
    const screen = setup(rxWithUnknownStatus);
    expect(screen.queryByText(rxWithUnknownStatus.dispStatus)).to.not.exist;
  });

  it('does not render aria-describedby attribute on the link', () => {
    const screen = setup();
    const link = screen.getByTestId('medications-history-details-link');
    expect(link.getAttribute('aria-describedby')).to.be.null;
  });
  describe('Status display edge cases', () => {
    const edgeCases = [
      { dispStatus: null, desc: 'null dispStatus' },
      { dispStatus: undefined, desc: 'undefined dispStatus' },
      { dispStatus: '', desc: 'empty string dispStatus' },
    ];

    edgeCases.forEach(({ dispStatus, desc }) => {
      FLAG_COMBINATIONS.forEach(
        ({ cernerPilot, v2StatusMapping, desc: flagDesc }) => {
          it(`handles ${desc} when ${flagDesc}`, () => {
            const rx = { ...prescriptionsListItem, dispStatus };
            const screen = setupWithFlags(rx, cernerPilot, v2StatusMapping);
            expect(screen).to.exist;
          });
        },
      );
    });
  });
  describe('Non-VA status preservation', () => {
    FLAG_COMBINATIONS.forEach(({ cernerPilot, v2StatusMapping, desc }) => {
      it(`preserves Active: Non-VA status when ${desc}`, () => {
        const rx = {
          ...prescriptionsListItem,
          dispStatus: 'Active: Non-VA',
          prescriptionSource: 'NV',
        };
        const screen = setupWithFlags(rx, cernerPilot, v2StatusMapping);
        expect(screen.getByText('Active: Non-VA')).to.exist;
      });
    });
  });

  describe('Pending medication status handling', () => {
    // V1 pending statuses only apply when V2 mapping is NOT enabled
    const v1FlagCombinations = FLAG_COMBINATIONS.filter(({ useV2 }) => !useV2);

    const pendingStatuses = [
      {
        dispStatus: 'NewOrder',
        expectedText: /new prescription from your provider/,
      },
      { dispStatus: 'Renew', expectedText: /renewal you requested/ },
    ];

    pendingStatuses.forEach(({ dispStatus, expectedText }) => {
      v1FlagCombinations.forEach(({ cernerPilot, v2StatusMapping, desc }) => {
        it(`shows pending ${dispStatus} text when ${desc}`, () => {
          const rx = {
            ...prescriptionsListItem,
            prescriptionSource: 'PD',
            dispStatus,
          };
          const screen = setupWithFlags(rx, cernerPilot, v2StatusMapping);
          expect(screen.getByText(expectedText)).to.exist;
        });
      });
    });
  });

  describe('V2 pending medication status handling (when both flags are enabled)', () => {
    it('shows pending new order text when V2 enabled with refillStatus neworder', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
        refillStatus: 'neworder',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.getByText(/new prescription from your provider/)).to.exist;
    });

    it('shows pending renewal text when V2 enabled with refillStatus renew', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
        refillStatus: 'renew',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.getByText(/renewal you requested/)).to.exist;
    });

    it('handles case-insensitive refillStatus values', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
        refillStatus: 'NewOrder',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.getByText(/new prescription from your provider/)).to.exist;
    });

    it('does not show pending text when prescriptionSource is not PD with V2 In progress status', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'VA',
        dispStatus: 'In progress',
        refillStatus: 'neworder',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.queryByTestId('pending-renewal-rx')).to.not.exist;
    });

    it('does not show pending text when dispStatus is not In progress with V2 enabled', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'Active',
        refillStatus: 'neworder',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.queryByTestId('pending-renewal-rx')).to.not.exist;
    });

    it('does not show pending text when refillStatus is missing with V2 enabled', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
      };
      const screen = setupWithFlags(rx, true, true);
      expect(screen.queryByTestId('pending-renewal-rx')).to.not.exist;
    });

    it('does not show V2 pending text when only cernerPilot flag is enabled', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
        refillStatus: 'neworder',
      };
      const screen = setupWithFlags(rx, true, false);
      // V2 status mapping requires both flags; with only cernerPilot, 'In progress' is not recognized
      expect(screen.queryByTestId('pending-renewal-rx')).to.not.exist;
    });

    it('does not show V2 pending text when only v2StatusMapping flag is enabled', () => {
      const rx = {
        ...prescriptionsListItem,
        prescriptionSource: 'PD',
        dispStatus: 'In progress',
        refillStatus: 'neworder',
      };
      const screen = setupWithFlags(rx, false, true);
      // V2 status mapping requires both flags
      expect(screen.queryByTestId('pending-renewal-rx')).to.not.exist;
    });
  });

  describe('V2 status display when API returns V2 statuses (both flags enabled)', () => {
    V2_STATUSES.forEach(({ status, desc }) => {
      it(`displays ${desc} correctly when returned by API`, () => {
        const rx = { ...prescriptionsListItem, dispStatus: status };
        const screen = setupWithFlags(rx, true, true);
        expect(screen.getByText(status)).to.exist;
      });
    });
  });

  describe('V1 status display when flags disabled', () => {
    V1_STATUSES.forEach(status => {
      it(`displays ${status} correctly when returned by API`, () => {
        const rx = { ...prescriptionsListItem, dispStatus: status };
        const screen = setupWithFlags(rx, false, false);
        expect(screen.getByText(status)).to.exist;
      });
    });
  });
});

const TRANSITION_PHASES = {
  current: 'p4',
  p0: 'February 10, 2026',
  p1: 'February 12, 2026',
  p2: 'March 12, 2026',
  p3: 'April 5, 2026',
  p4: 'April 8, 2026',
  p5: 'April 11, 2026',
  p6: 'April 13, 2026',
  p7: 'April 18, 2026',
};

describe('Oracle Health Transition - MedicationsListCard', () => {
  // Test data fixtures
  const MICHIGAN_FACILITY_515 = '515';
  const NON_TRANSITIONING_FACILITY = '442';

  const mockMichiganMigration = {
    migrationDate: '2026-04-11',
    facilities: [
      {
        facilityId: MICHIGAN_FACILITY_515,
        facilityName: 'Battle Creek VA Medical Center',
      },
    ],
    phases: TRANSITION_PHASES,
  };

  // Helper to create prescription with station number
  const createRxWithStation = (stationNumber, overrides = {}) => ({
    ...prescriptionsListItem,
    stationNumber,
    isRefillable: true,
    refillRemaining: 3,
    ...overrides,
  });

  const createMigrationWithPhase = phase => ({
    ...mockMichiganMigration,
    phases: { ...TRANSITION_PHASES, current: phase },
  });

  // Renewable Active prescription at a transitioning facility.
  // isRefillable is false because a medication cannot be both refillable and renewable.
  const createRenewableRxAtTransitioning = (overrides = {}) =>
    createRxWithStation(MICHIGAN_FACILITY_515, {
      dispStatus: 'Active',
      refillRemaining: 0,
      isRefillable: false,
      isRenewable: true,
      prescriptionSource: 'VA',
      stationNumber: MICHIGAN_FACILITY_515,
      ...overrides,
    });

  // Helper to setup component with migration data
  const setupWithMigration = (
    rx,
    featureFlagEnabled = true,
    migrations = [mockMichiganMigration],
  ) => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsOracleHealthCutover]: featureFlagEnabled,
      },
      user: {
        profile: {
          vaProfile: {
            ohMigrationInfo: {
              migrationSchedules: migrations,
            },
          },
        },
      },
    };
    return renderWithStoreAndRouterV6(<MedicationsListCard rx={rx} />, {
      initialState,
      reducers,
    });
  };

  // Assertion helpers — refill in-card alert (OracleHealthInCardAlert)
  const expectRefillAlertToExist = screen => {
    expect(screen.getByTestId('oracle-health-in-card-alert')).to.exist;
  };

  const expectRefillAlertNotToExist = screen => {
    expect(screen.queryByTestId('oracle-health-in-card-alert')).to.not.exist;
  };

  // Assertion helpers — renewal in-card alert (OracleHealthRenewalInCardAlert)
  const expectRenewalAlertToExist = screen => {
    expect(screen.getByTestId('oracle-health-renewal-in-card-alert')).to.exist;
  };

  const expectRenewalAlertNotToExist = screen => {
    expect(screen.queryByTestId('oracle-health-renewal-in-card-alert')).to.not
      .exist;
  };

  describe('common transition behavior', () => {
    describe('does not show transition alerts when feature flag is disabled', () => {
      it('does not show refill alert for refillable rx', () => {
        const migration = createMigrationWithPhase('p4');
        const refillableRx = createRxWithStation(MICHIGAN_FACILITY_515);
        const screen = setupWithMigration(refillableRx, false, [migration]);
        expectRefillAlertNotToExist(screen);
      });

      it('does not show renewal alert for renewable rx', () => {
        const migration = createMigrationWithPhase('p4');
        const renewableRx = createRenewableRxAtTransitioning();
        const screen = setupWithMigration(renewableRx, false, [migration]);
        expectRenewalAlertNotToExist(screen);
      });
    });

    describe('does not show transition alerts when feature flag is enabled BUT no matching facility', () => {
      it('does not show transition alerts for non-transitioning facility', () => {
        const rx = createRxWithStation(NON_TRANSITIONING_FACILITY);
        const screen = setupWithMigration(rx, true);
        expectRefillAlertNotToExist(screen);
        expectRenewalAlertNotToExist(screen);
      });
    });
  });

  describe('refill alert (OracleHealthInCardAlert) during phases p4-p5', () => {
    it('shows refill alert and hides refill button for refillable rx at transitioning facility', () => {
      const rx = createRxWithStation(MICHIGAN_FACILITY_515);
      const screen = setupWithMigration(rx, true);
      expectRefillAlertToExist(screen);
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('does not show refill alert for non-refillable (renewable) rx at transitioning facility', () => {
      const rx = createRenewableRxAtTransitioning();
      const screen = setupWithMigration(rx, true);
      expectRefillAlertNotToExist(screen);
    });

    it('does not show refill alert during non-blocking phase (p1)', () => {
      const migration = createMigrationWithPhase('p1');
      const rx = createRxWithStation(MICHIGAN_FACILITY_515);
      const screen = setupWithMigration(rx, true, [migration]);
      expectRefillAlertNotToExist(screen);
    });
  });

  // shouldBlockRenewals uses phases p3-p5 (superset of refill-blocking p4-p5).
  // OracleHealthRenewalInCardAlert renders inside ExtraDetails when
  // isRenewalBlocked and rx.isRenewable are both true.
  describe('renewal alert (OracleHealthRenewalInCardAlert) during phases p3-p5', () => {
    it('shows renewal alert during p3 for renewable rx at transitioning facility', () => {
      const migration = createMigrationWithPhase('p3');
      const rx = createRenewableRxAtTransitioning();
      const screen = setupWithMigration(rx, true, [migration]);
      expectRenewalAlertToExist(screen);
    });

    it('shows renewal alert during p4 for renewable rx at transitioning facility', () => {
      const migration = createMigrationWithPhase('p4');
      const rx = createRenewableRxAtTransitioning();
      const screen = setupWithMigration(rx, true, [migration]);
      expectRenewalAlertToExist(screen);
    });

    it('does not show renewal alert during p2 (non-blocking boundary)', () => {
      const migration = createMigrationWithPhase('p2');
      const rx = createRenewableRxAtTransitioning();
      const screen = setupWithMigration(rx, true, [migration]);
      expectRenewalAlertNotToExist(screen);
    });

    it('shows renewal alert for Expired renewable rx at transitioning facility', () => {
      const migration = createMigrationWithPhase('p3');
      const rx = createRenewableRxAtTransitioning({ dispStatus: 'Expired' });
      const screen = setupWithMigration(rx, true, [migration]);
      expectRenewalAlertToExist(screen);
    });

    it('does not show renewal alert when isRenewable is false', () => {
      const migration = createMigrationWithPhase('p4');
      const rx = createRenewableRxAtTransitioning({ isRenewable: false });
      const screen = setupWithMigration(rx, true, [migration]);
      expectRenewalAlertNotToExist(screen);
    });
  });
});
