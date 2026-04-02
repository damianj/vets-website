import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { Alerts } from '../../util/constants';

const OHSyncStatusAlert = () => {
  const ohSyncStatus = useSelector(state => state.sm?.ohSyncStatus);
  const { data } = ohSyncStatus || {};
  const [dismissed, setDismissed] = useState(false);

  // Don't show alert if there's no data
  if (!data) {
    return null;
  }

  // Show alert only when sync is not yet complete
  if (data.syncComplete !== false) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <VaAlert
      status="warning"
      closeable
      closeBtnAriaLabel="Close sync status notification"
      onCloseEvent={() => setDismissed(true)}
      data-testid="oh-sync-status-alert"
      className="vads-u-margin-bottom--2"
      data-dd-action-name="OH Sync Status Alert"
    >
      <h2 slot="headline">{Alerts.OHSyncStatus.HEADLINE}</h2>
      <p className="vads-u-margin-bottom--0">{Alerts.OHSyncStatus.BODY}</p>
    </VaAlert>
  );
};

export default OHSyncStatusAlert;
