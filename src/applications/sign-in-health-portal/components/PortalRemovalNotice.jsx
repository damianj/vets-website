import React, { useEffect } from 'react';
import appendQuery from 'append-query';
import { Toggler, useFeatureToggle } from 'platform/utilities/feature-toggles';
import { AUTHN_SETTINGS } from '@department-of-veterans-affairs/platform-user/exports';

export default function PortalRemovalNotice() {
  const { useToggleLoadingValue } = useFeatureToggle();
  const featureTogglesLoading = useToggleLoadingValue();
  useEffect(() => {
    const newUrl = appendQuery(window.location.href, {
      operation: 'myva_portal_interstitial',
    });
    window.history.replaceState({}, '', newUrl);
  }, []);

  const returnUrl =
    sessionStorage.getItem(AUTHN_SETTINGS.RETURN_URL) || '/my-va';
  return (
    <section className="container row login vads-u-padding--3">
      <div className="columns small-12 vads-u-margin-y--2">
        {featureTogglesLoading ? (
          <va-loading-indicator
            label="Loading"
            message="Loading your application..."
          />
        ) : (
          <Toggler
            toggleName={Toggler.TOGGLE_NAMES.portalNoticeInterstitialSunset}
          >
            <h1>Manage your health care for all VA facilities on VA.gov</h1>
            <p>
              <Toggler.Disabled>
                We’ve brought all your VA health care data together so you can
                manage your care in one place.
              </Toggler.Disabled>
              <Toggler.Enabled>
                We’ll retire the <strong>My VA Health portal</strong> on{' '}
                <strong>May 29, 2026</strong>. But don’t worry—we’ve brought all
                your VA health care data together so you can manage your care in
                one place.
              </Toggler.Enabled>
            </p>
            <p>
              You can now manage your care for all facilities through{' '}
              <Toggler.Disabled>My HealtheVet on VA.gov</Toggler.Disabled>
              <Toggler.Enabled>
                <strong>My HealtheVet on VA.gov</strong>:
              </Toggler.Enabled>
            </p>
            <ul>
              <li>Refill your VA prescriptions and manage your medications</li>
              <li>Schedule and manage some VA health appointments</li>
              <li>Send secure messages to your VA health care team</li>
              <li>
                Review your medical records, including lab and test results
              </li>
              <li>Order some medical supplies</li>
              <li>File travel reimbursement claims</li>
            </ul>
            <va-link-action
              text="Go to My HealtheVet on VA.gov"
              label="Go to My HealtheVet on VA.gov"
              type="primary"
              href="/my-health"
            />
            <Toggler.Disabled>
              <h2>Still want to use My VA Health for now?</h2>
              <p>
                You can still access your health information through the My VA
                Health portal if you’d like.
              </p>
              <va-link-action
                text="Go to My VA Health"
                label="Go to My VA Health"
                type="secondary"
                href={returnUrl}
              />
            </Toggler.Disabled>
            <Toggler.Enabled>
              <va-additional-info
                trigger="Still want to use My VA Health for now?"
                class="vads-u-margin-top--4"
              >
                <div>
                  <p>
                    You no longer need to use <strong>My VA Health</strong>. But
                    you can access it if you’d like until{' '}
                    <strong>May 29, 2026</strong>.<br />
                    <va-link href={returnUrl} text="Go to My VA Health" />
                  </p>
                </div>
              </va-additional-info>
            </Toggler.Enabled>
          </Toggler>
        )}
      </div>
    </section>
  );
}
