import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { recordEvent } from '@department-of-veterans-affairs/platform-monitoring/exports';
import { GA_PREFIX } from 'applications/vaos/utils/constants';
import ReferralLayout from '../components/ReferralLayout';
import { routeToNextReferralPage } from '../flow';
import { setFormCurrentPage, setInitReferralFlow } from '../redux/actions';
import { selectCurrentPage } from '../redux/selectors';
import { getReferralSlotKey } from '../utils/referrals';
import { titleCase } from '../../utils/formatters';
import FindCommunityCareOfficeLink from '../components/FindCCFacilityLink';
import { getIsInPilotReferralStation } from '../utils/pilot';

export default function ScheduleReferral(props) {
  const { attributes: currentReferral } = props.currentReferral;
  const location = useLocation();
  const history = useHistory();
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();
  const selectedSlotKey = getReferralSlotKey(currentReferral.uuid);

  const stationIdValid = getIsInPilotReferralStation(currentReferral);
  useEffect(
    () => {
      dispatch(setFormCurrentPage('scheduleReferral'));
      dispatch(setInitReferralFlow());
      sessionStorage.removeItem(selectedSlotKey);
    },
    [location, dispatch, selectedSlotKey],
  );
  const categoryOfCare = titleCase(currentReferral.categoryOfCare);

  const handleClick = () => {
    return e => {
      e.preventDefault();
      recordEvent({
        event: `${GA_PREFIX}-review-upcoming-link`,
      });
      routeToNextReferralPage(history, currentPage, currentReferral.uuid);
    };
  };

  const canScheduleAppointment =
    currentReferral.onlineSchedule &&
    currentReferral.provider?.npi &&
    !currentReferral.hasAppointments &&
    stationIdValid;

  return (
    <ReferralLayout hasEyebrow heading={`Referral for ${categoryOfCare}`}>
      <div>
        {!canScheduleAppointment && (
          <va-alert
            status="warning"
            data-testid="referral-alert"
            class="vads-u-margin-bottom--2"
          >
            <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">
              Online scheduling isn’t available for this referral right now.
              Call your community care provider or your facility’s community
              care office to schedule an appointment.
            </p>
            <FindCommunityCareOfficeLink />
          </va-alert>
        )}

        <p data-testid="subtitle">
          We’ve approved your referral for community care. You can schedule your
          first appointment now.
        </p>
        {canScheduleAppointment && (
          <va-link-action
            className="vads-u-margin-top--1"
            href={`/my-health/appointments/schedule-referral?id=${
              currentReferral.uuid
            }`}
            text="Schedule your appointment"
            onClick={handleClick()}
            data-testid="schedule-appointment-button"
          />
        )}
        <h2>Details about your referral</h2>
        <p data-testid="referral-details">
          <strong>Expiration date: </strong>
          {`All appointments for this referral must be scheduled by
          ${format(new Date(currentReferral.expirationDate), 'MMMM d, yyyy')}`}
          <br />
          <strong>Referral number: </strong>
          <span data-dd-privacy="mask">{currentReferral.referralNumber}</span>
        </p>
        <h2>Common questions about referrals</h2>
        <va-accordion open-single>
          <va-accordion-item
            header="What if I have questions or need to make changes to my referral?"
            id="questions-changes"
          >
            <p>
              Contact your facility's community care office for any of these
              reasons:
            </p>
            <ul>
              <li>If you have questions about scheduling an appointment</li>
              <li>
                If you already scheduled your first appointment and want us to
                add it to your appointments list
              </li>
              <li>If you want to know how many appointments you have left</li>
              <li>If you need to make changes to your referral</li>
              <li>If a referral you need has expired</li>
            </ul>
            <FindCommunityCareOfficeLink />
          </va-accordion-item>
          <va-accordion-item
            header="How do I schedule my next appointment for this referral?"
            id="schedule-next-appointment"
          >
            <p>
              You can only schedule the first appointment for your referral
              online. To schedule your next appointments, contact your community
              care provider.
            </p>
          </va-accordion-item>
        </va-accordion>
      </div>
    </ReferralLayout>
  );
}

ScheduleReferral.propTypes = {
  currentReferral: PropTypes.object.isRequired,
};
