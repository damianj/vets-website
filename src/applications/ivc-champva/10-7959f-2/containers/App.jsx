import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import environment from 'platform/utilities/environment';
import { DowntimeNotification } from 'platform/monitoring/DowntimeNotification';
import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import { useBrowserMonitoring } from 'platform/monitoring/Datadog';
import formConfig from '../config/form';

const EXCLUDED_DOMAINS = [
  'resource.digital.voice.va.gov',
  'browser-intake-ddog-gov.com',
  'google-analytics.com',
  'eauth.va.gov',
  'api.va.gov',
];

const BROWSER_MONITORING_PROPS = {
  toggleName: 'form107959f2BrowserMonitoringEnabled',
  applicationId: '66f9f75c-afb7-4ebe-82c7-db75c5bb9e29',
  clientToken: 'pub84d00359746e2012044f5b265f458045',
  service: 'ivc-fmp-10-7959f-2',
  version: '1.0.0',
  env: environment.vspEnvironment(),
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackFrustrations: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  beforeSend: ({ action, type, resource }) => {
    // eslint-disable-next-line no-param-reassign
    if (action?.type === 'click') action.target.name = 'Form item';
    return !(
      type === 'resource' &&
      EXCLUDED_DOMAINS.some(domain => resource.url.includes(domain))
    );
  },
};

const App = ({ location, children }) => {
  const isAppLoading = useSelector(state =>
    Boolean(state.featureToggles?.loading || state.user?.profile?.loading),
  );

  useBrowserMonitoring(BROWSER_MONITORING_PROPS);

  return isAppLoading ? (
    <va-loading-indicator
      message="Loading application..."
      class="vads-u-margin-y--4"
      set-focus
    />
  ) : (
    <RoutedSavableApp formConfig={formConfig} currentLocation={location}>
      <DowntimeNotification
        appTitle={formConfig.subTitle}
        dependencies={formConfig.downtime.dependencies}
      >
        {children}
      </DowntimeNotification>
    </RoutedSavableApp>
  );
};

App.propTypes = {
  children: PropTypes.node,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    href: PropTypes.string,
  }),
};

export default App;
