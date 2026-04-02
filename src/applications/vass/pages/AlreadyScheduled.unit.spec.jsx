import React from 'react';
import { expect } from 'chai';
import { format } from 'date-fns';
import { fireEvent, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom-v5-compat';
import { renderWithStoreAndRouterV6 } from '~/platform/testing/unit/react-testing-library-helpers';
import { $ } from 'platform/forms-system/src/js/utilities/ui';

import AlreadyScheduled from './AlreadyScheduled';
import { getDefaultRenderOptions, LocationDisplay } from '../utils/test-utils';
import { URLS } from '../utils/constants';
import {
  createAppointmentData,
  createVassApiStateWithAppointment,
} from '../utils/appointments';

const appointmentId = '123';

const renderComponent = (appointmentData = {}) => {
  const data = createAppointmentData({
    appointmentId,
    ...appointmentData,
  });
  const vassApiState = createVassApiStateWithAppointment(appointmentId, data);

  return renderWithStoreAndRouterV6(
    <>
      <Routes>
        <Route
          path={`${URLS.ALREADY_SCHEDULED}/:appointmentId`}
          element={<AlreadyScheduled />}
        />
        <Route
          path={`${URLS.CANCEL_APPOINTMENT}/:appointmentId`}
          element={<div data-testid="cancel-page">Cancel</div>}
        />
      </Routes>
      <LocationDisplay />
    </>,
    {
      ...getDefaultRenderOptions({}, { vassApi: vassApiState }),
      initialEntries: [`${URLS.ALREADY_SCHEDULED}/${appointmentId}`],
    },
  );
};

describe('VASS Component: AlreadyScheduled', () => {
  it('should render all content', () => {
    const appointmentData = createAppointmentData({
      appointmentId,
      startUtc: '2025-05-01T16:00:00.000Z',
    });
    const appointmentDate = new Date(appointmentData.startUtc);
    const expectedDate = format(appointmentDate, 'MM/dd/yyyy');
    const expectedTime = format(appointmentDate, 'hh:mm a');

    const vassApiState = createVassApiStateWithAppointment(
      appointmentId,
      appointmentData,
    );

    const { getByTestId } = renderWithStoreAndRouterV6(
      <Routes>
        <Route
          path={`${URLS.ALREADY_SCHEDULED}/:appointmentId`}
          element={<AlreadyScheduled />}
        />
      </Routes>,
      {
        ...getDefaultRenderOptions({}, { vassApi: vassApiState }),
        initialEntries: [`${URLS.ALREADY_SCHEDULED}/${appointmentId}`],
      },
    );
    expect(getByTestId('already-scheduled-page')).to.exist;
    expect(getByTestId('already-scheduled-phone-number')).to.exist;
    const dateTimeElement = getByTestId('already-scheduled-date-time');
    expect(dateTimeElement.textContent).to.include(expectedDate);
    expect(dateTimeElement.textContent).to.include(expectedTime);
    expect(getByTestId('already-scheduled-reschedule-message')).to.exist;
    expect(getByTestId('already-scheduled-cancel-button')).to.exist;
  });

  it('should navigate to cancel appointment page when cancel button is clicked', async () => {
    const { container, getByTestId } = renderComponent({
      startUtc: '2025-05-01T16:00:00.000Z',
    });

    const cancelButton = $(
      'va-link-action[data-testid="already-scheduled-cancel-button"]',
      container,
    );
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(getByTestId('location-display').textContent).to.equal(
        `${URLS.CANCEL_APPOINTMENT}/${appointmentId}`,
      );
    });
  });

  it('should render empty date and time when startUtc is not available', () => {
    const { getByTestId } = renderComponent({ startUtc: null });

    const dateTimeElement = getByTestId('already-scheduled-date-time');
    expect(dateTimeElement.textContent).to.not.match(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateTimeElement.textContent).to.not.match(/\d{2}:\d{2}\s[AP]M/i);
  });
});
