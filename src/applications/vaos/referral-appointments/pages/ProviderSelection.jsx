import React from 'react';
import ReferralLayout from '../components/ReferralLayout';
import ProviderSelectionCard from '../components/ProviderSelectionCard';
import { mockProviderDetails } from '../utils/mocks';

export default function ProviderSelection() {
  const providers = Array(5).fill(mockProviderDetails);
  const moreProviders = 5;
  const facilityDetails = {
    name: 'Portland VA Medical Center',
    phone: '###-###-####',
    tty: '###',
  };
  return (
    <ReferralLayout
      hasEyebrow
      heading="Which provider or clinic do you want to schedule with?"
    >
      <div>
        <p>
          You can schedule into VA or CC care within 25 miles of your home
          address.
        </p>
        <ul className="usa-unstyled-list vaos-appts__list">
          {providers.map((provider, index) => (
            <ProviderSelectionCard
              key={index}
              provider={provider}
              index={index}
            />
          ))}
        </ul>
        {moreProviders > 0 && (
          <va-button
            class="vads-u-margin-top--4"
            data-testid="show-more-providers-button"
            secondary
            text={`Show ${moreProviders} more providers`}
          />
        )}
        <div className="vads-u-margin-top--4">
          <h5 className="vads-u-margin--0 vads-u-margin-bottom--1">
            Need a different time?
          </h5>
          <p className="vads-u-margin--0">
            Contact your facility, or find a new facility.
          </p>
          <p className="vads-u-margin--0">{facilityDetails.name}</p>
          <p className="vads-u-margin--0">
            Main Phone: {facilityDetails.phone}
          </p>
          <p className="vads-u-margin--0">(TTY: {facilityDetails.tty})</p>
          <p className="vads-u-margin-top--4 vads-u-margin-bottom--0">
            Or find a different VA location.
          </p>
          <va-link
            href="/find-locations"
            text="Facility locator"
            className="vads-u-display--block"
          />
        </div>
      </div>
    </ReferralLayout>
  );
}
