import React from 'react';
import { expect } from 'chai';
import { waitFor, fireEvent } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom-v5-compat';
import { renderWithStoreAndRouterV6 as renderWithStoreAndRouter } from 'platform/testing/unit/react-testing-library-helpers';

import Confirmation from './Confirmation';
import { getDefaultRenderOptions, LocationDisplay } from '../utils/test-utils';
import { URLS } from '../utils/constants';
import {
  createAppointmentData,
  createVassApiStateWithAppointment,
} from '../utils/appointments';

const appointmentId = '123';
const appointmentData = createAppointmentData({ appointmentId });

const getVassApiState = () =>
  createVassApiStateWithAppointment(appointmentId, appointmentData);

describe('VASS Component: Confirmation', () => {
  it('should render all content', () => {
    const { getByTestId } = renderWithStoreAndRouter(
      <Routes>
        <Route path="/confirmation/:appointmentId" element={<Confirmation />} />
      </Routes>,
      {
        ...getDefaultRenderOptions({}, { vassApi: getVassApiState() }),
        initialEntries: [`/confirmation/${appointmentId}`],
      },
    );

    expect(getByTestId('header')).to.exist;
    expect(getByTestId('confirmation-page')).to.exist;
    expect(getByTestId('confirmation-message')).to.exist;
    expect(getByTestId('appointment-card')).to.exist;
    expect(getByTestId('add-to-calendar-button')).to.exist;
  });

  describe('when the details url parameter is true', () => {
    it('should only display the appointment card', () => {
      const { getByTestId, queryByTestId } = renderWithStoreAndRouter(
        <Routes>
          <Route
            path="/confirmation/:appointmentId"
            element={<Confirmation />}
          />
        </Routes>,
        {
          ...getDefaultRenderOptions({}, { vassApi: getVassApiState() }),
          initialEntries: [`/confirmation/${appointmentId}?details=true`],
        },
      );
      expect(getByTestId('confirmation-page')).to.exist;
      expect(queryByTestId('confirmation-message')).to.not.exist;
      expect(getByTestId('appointment-card')).to.exist;
    });
  });

  describe('navigation', () => {
    it('should navigate to the cancel appointment page when cancel button is clicked', async () => {
      const { getByTestId } = renderWithStoreAndRouter(
        <>
          <Routes>
            <Route
              path="/confirmation/:appointmentId"
              element={<Confirmation />}
            />
            <Route
              path={`${URLS.CANCEL_APPOINTMENT}/:appointmentId`}
              element={<div>Cancel Appointment Page</div>}
            />
          </Routes>
          <LocationDisplay />
        </>,
        {
          ...getDefaultRenderOptions({}, { vassApi: getVassApiState() }),
          initialEntries: [`/confirmation/${appointmentId}`],
        },
      );

      fireEvent.click(getByTestId('cancel-button'));

      await waitFor(() => {
        expect(getByTestId('location-display').textContent).to.equal(
          `${URLS.CANCEL_APPOINTMENT}/${appointmentId}`,
        );
      });
    });
  });
});
