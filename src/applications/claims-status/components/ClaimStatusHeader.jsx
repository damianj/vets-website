import React from 'react';
import PropTypes from 'prop-types';

import { Toggler } from '~/platform/utilities/feature-toggles';
import { buildDateFormatter, isClaimOpen } from '../utils/helpers';
import * as TrackedItem from '../utils/trackedItemContent';

export default function ClaimStatusHeader({ claim }) {
  const { closeDate, status, trackedItems, claimPhaseDates } = claim.attributes;
  const getTrackedItemDates = () => {
    return trackedItems
      ? trackedItems.map(item => TrackedItem.getTrackedItemDateFromStatus(item))
      : [];
  };
  const getLastUpdatedDate = () => {
    const phaseChangeDate = claimPhaseDates
      ? claimPhaseDates.phaseChangeDate
      : null;
    const dates = [...getTrackedItemDates(), phaseChangeDate];
    const lastUpdatedDate = dates.reduce((a, b) => (a > b ? a : b));

    return `Last updated: ${buildDateFormatter()(lastUpdatedDate)}`;
  };
  const isOpen = isClaimOpen(status, closeDate);

  return (
    <div className="claim-status-header-container">
      <h2 className="tab-header vads-u-margin-y--0">Claim status</h2>
      <p className="vads-u-margin-top--1 vads-u-margin-bottom--3 va-introtext">
        <Toggler
          toggleName={Toggler.TOGGLE_NAMES.cstAlertImprovementsEvidenceRequests}
        >
          <Toggler.Enabled>
            Review the latest status of your claim.
          </Toggler.Enabled>
          <Toggler.Disabled>
            Here’s the latest information on your claim.
          </Toggler.Disabled>
        </Toggler>
      </p>
      {isOpen && (
        <div className="vads-u-margin-bottom--4">
          <span className="usa-label">In Progress</span>
          <p className="vads-u-margin-top--1 vads-u-margin-bottom--0">
            {getLastUpdatedDate()}
          </p>
        </div>
      )}
    </div>
  );
}

ClaimStatusHeader.propTypes = {
  claim: PropTypes.object,
};
