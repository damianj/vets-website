import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../../components/ListItem';
import AppointmentRow from '../../components/AppointmentRow';
import AppointmentColumn from '../../components/AppointmentColumn';

export default function ProviderSelectionCard({ provider, index, referralId }) {
  const first = index === 0;

  if (!provider) {
    return null;
  }
  return (
    <ListItem borderTop={first} borderBottom>
      <AppointmentRow className="vads-u-padding-y--1 mobile:vads-u-flex-direction--row">
        <AppointmentColumn className="vads-u-padding-y--1" size="1">
          <div data-testid="provider-selection-card">
            <h2
              className="vads-u-font-size--h3 vads-u-margin--0"
              data-testid="provider-name"
            >
              {provider.name}
            </h2>
            <p
              className="vads-u-font-size--h3 vads-u-margin--0 vads-u-padding-bottom--1"
              data-testid="provider-type"
            >
              {provider.type}
            </p>
            <p className="vads-u-margin--0" data-testid="facility-name">
              {provider.facilityName}
            </p>
            <p
              className="vads-u-margin--0  vads-u-padding-bottom--1"
              data-testid="drive-time"
            >
              {provider.driveTime}
            </p>
            <p
              className="vads-u-margin--0 vads-u-font-weight--bold"
              data-testid="next-available-label"
            >
              Next available:
            </p>
            <p
              className="vads-u-margin--0 vads-u-padding-bottom--1"
              data-testid="next-available-date"
            >
              {provider.nextAvailableDate}
            </p>
            <va-link
              class="vads-u-margin-top--2"
              active
              href={`date-time?id=${referralId ||
                '123456'}&provider=${provider.uuid || '123456'}`}
              text="Review available appointments"
            />
          </div>
        </AppointmentColumn>
      </AppointmentRow>
    </ListItem>
  );
}

ProviderSelectionCard.propTypes = {
  index: PropTypes.number.isRequired,
  provider: PropTypes.object.isRequired,
  referralId: PropTypes.string.isRequired,
};
