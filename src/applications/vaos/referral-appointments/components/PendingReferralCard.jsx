import React from 'react';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { titleCase } from '../../utils/formatters';
import ListItem from '../../components/ListItem';
import AppointmentRow from '../../components/AppointmentRow';
import AppointmentColumn from '../../components/AppointmentColumn';
import FindCommunityCareOfficeLink from './FindCCFacilityLink';

const PendingReferralCard = ({ referral, index }) => {
  const first = index === 0;
  const providerSelectLink = referral.onlineSchedule
    ? `schedule-referral/provider-selection?id=${
        referral.uuid
      }&referrer=referrals-requests`
    : null;
  const detailLink = referral.onlineSchedule
    ? `schedule-referral?id=${referral.uuid}&referrer=referrals-requests`
    : null;

  const parsedDate = parseISO(referral.expirationDate);
  const expiration = format(parsedDate, 'MMMM d, yyyy');
  const categoryOfCare = titleCase(referral.categoryOfCare);

  return (
    <ListItem borderTop={first} borderBottom status="pending">
      <AppointmentRow className="vads-u-padding-y--1 mobile:vads-u-flex-direction--row">
        <AppointmentColumn className="vads-u-padding-y--1" size="1">
          <va-link
            href={detailLink}
            text={`${categoryOfCare} referral`}
            data-dd-privacy="mask"
            class="vads-u-font-weight--bold"
          />
          <div className="vaos-appts__display--table vads-u-padding-left--0 vads-u-padding-y--1">
            <span
              id={`ref-desc-${index}`}
              className="vaos-appts__display--table-cell vads-u-display--flex vads-u-align-items--center"
            >
              {`Expiration date: ${expiration}.`}
            </span>
          </div>
          {referral.onlineSchedule ? (
            <div className="vaos-hide-for-print vads-u-padding-left--0">
              <va-link-action
                type="secondary"
                href={providerSelectLink}
                aria-labelledby={`ref-title-${index} ref-desc-${index}`}
                text="Schedule an appointment"
                data-testid="schedule-appointment-link"
              />
            </div>
          ) : (
            <div
              className="vads-u-padding-left--0 vads-u-padding-y--1"
              data-testid="cannot-schedule-online-message"
            >
              <va-additional-info trigger="Why you can’t schedule online?">
                <p>
                  Online scheduling isn’t available for this referral. Call your
                  facility’s community care office to schedule an appointment.
                </p>
                <FindCommunityCareOfficeLink />
              </va-additional-info>
            </div>
          )}
        </AppointmentColumn>
      </AppointmentRow>
    </ListItem>
  );
};

PendingReferralCard.propTypes = {
  index: PropTypes.number.isRequired,
  referral: PropTypes.object.isRequired,
};

export default PendingReferralCard;
