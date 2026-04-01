import React from 'react';
import { useSelector } from 'react-redux';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { RequiredLoginView } from 'platform/user/authorization/components/RequiredLoginView';
import { selectPatientFacilities } from 'platform/user/cerner-dsot/selectors';
import backendServices from 'platform/user/profile/constants/backendServices';
import {
  selectUser,
  isLOA3,
  isLoggedIn,
  isProfileLoading,
} from 'platform/user/selectors';
import FullWidthLayout from './FullWidthLayout';

import { useDatadogRum } from '../utils/useDatadogRum';

export default function EnrolledRoute({ component: RouteComponent, ...rest }) {
  const user = useSelector(selectUser);
  const sites = useSelector(selectPatientFacilities);
  const isUserLOA3 = useSelector(isLOA3);
  const userLoggedIn = useSelector(isLoggedIn);
  const profileLoading = useSelector(isProfileLoading);
  const hasRegisteredSystems = sites?.length > 0;
  const isToggleLoading = useSelector(state => state.featureToggles.loading);
  useDatadogRum();

  // Wait for feature flag & user profile to load before rendering.
  // profileLoading can be undefined initially, so we check for explicit false
  if (isToggleLoading || profileLoading !== false) {
    return (
      <FullWidthLayout>
        <va-loading-indicator
          set-focus
          message="Checking your information..."
        />
      </FullWidthLayout>
    );
  }

  // Determine if the user should be redirected to the `/my-health` page.
  // 1. Only redirect if the user is logged in AND (not LOA3 or not registered with any facilities).
  // 2. This prevents redirecting before authentication has completed.
  const shouldRedirectToMyHealtheVet =
    userLoggedIn && (!isUserLOA3 || !hasRegisteredSystems);

  if (shouldRedirectToMyHealtheVet) {
    window.location.replace(`${window.location.origin}/my-health`);
    return null;
  }

  return (
    <RequiredLoginView
      serviceRequired={[
        backendServices.USER_PROFILE,
        backendServices.FACILITIES,
      ]}
      user={user}
      verify={!environment.isLocalhost()}
    >
      <Route {...rest}>{hasRegisteredSystems && <RouteComponent />}</Route>
    </RequiredLoginView>
  );
}
EnrolledRoute.propTypes = {
  component: PropTypes.func,
};
