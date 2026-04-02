import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { VaButton } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { parseISO } from 'date-fns';
import { generateICS } from '../utils/calendar';
import { VASS_PHONE_NUMBER } from '../utils/constants';

/**
 * @typedef {import('../utils/appointments').Appointment} Appointment
 */

/**
 * Renders a button that allows users to download an ICS calendar file for the appointment.
 * @param {Object} props
 * @param {Appointment} props.appointment - The appointment data for calendar generation
 * @returns {JSX.Element}
 */
export default function AddToCalendarButton({ appointment }) {
  const startUtc = parseISO(appointment?.startUtc);
  const endUtc = parseISO(appointment?.endUtc);

  const ics = generateICS(
    'Solid Start Phone Call',
    `Your representative will call you from ${VASS_PHONE_NUMBER}.`,
    startUtc,
    endUtc,
  );

  const handleAddToCalendar = useCallback(
    () => {
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'appointment.ics';
      link.click();
      URL.revokeObjectURL(url);
    },
    [ics],
  );

  return (
    <VaButton
      text="Add to calendar"
      class="vass-hide-for-print"
      secondary
      onClick={handleAddToCalendar}
      data-testid="add-to-calendar-button"
    />
  );
}

AddToCalendarButton.propTypes = {
  appointment: PropTypes.object,
};
