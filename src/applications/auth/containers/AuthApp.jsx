import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import appendQuery from 'append-query';

import environment from 'platform/utilities/environment';
import recordEvent from 'platform/monitoring/record-event';
import { toggleLoginModal } from 'platform/site-wide/user-nav/actions';
import {
  AUTH_EVENTS,
  AUTHN_SETTINGS,
  FORCE_NEEDED,
  EXTERNAL_APPS,
  EXTERNAL_REDIRECTS,
} from 'platform/user/authentication/constants';
import { AUTH_LEVEL, getAuthError } from 'platform/user/authentication/errors';
import { setupProfileSession } from 'platform/user/profile/utilities';
import { apiRequest } from 'platform/utilities/api';

import { generateReturnURL } from 'platform/user/authentication/utilities';
import { OAUTH_EVENTS } from 'platform/utilities/oauth/constants';
import RenderErrorUI from '../components/RenderErrorContainer';
import AuthMetrics from './AuthMetrics';
import {
  checkReturnUrl,
  emailNeedsConfirmation,
  generateSentryAuthError,
  handleTokenRequest,
  checkPortalRequirements,
} from '../helpers';

const REDIRECT_IGNORE_PATTERN = new RegExp(['/auth/login/callback'].join('|'));

function AuthApp({ location }) {
  const [
    { auth, errorCode, returnUrl, loginType, state, requestId },
    setAuthState,
  ] = useState({
    auth: location?.query?.auth,
    errorCode: location?.query?.code || '',
    loginType: location?.query?.type || 'Login type not found',
    requestId:
      location?.query?.request_id || 'No corresponding Request ID was found',
    returnUrl: sessionStorage.getItem(AUTHN_SETTINGS.RETURN_URL) ?? '',
    state: location?.query?.state || '',
  });
  const [hasError, setHasError] = useState(auth === 'fail');

  const dispatch = useDispatch();
  const isFeatureToggleLoading = useSelector(
    store => store?.featureToggles?.loading,
  );
  const isEmailInterstitialEnabled = useSelector(
    store => store?.featureToggles?.confirmContactEmailInterstitialEnabled,
  );
  const isPortalNoticeInterstitialEnabled = useSelector(
    store => store?.featureToggles?.portalNoticeInterstitialEnabled,
  );

  // Remove after testing
  // const isSignInDisableUserInteractionEnabled = useSelector(
  //   store => store?.featureToggles?.signInDisableUserInteraction,
  // );

  const handleAuthError = (error, codeOverride) => {
    const { errorCode: detailedErrorCode } = getAuthError(
      codeOverride || errorCode,
    );
    generateSentryAuthError({
      error,
      loginType,
      authErrorCode: errorCode,
      requestId,
    });

    recordEvent({ event: AUTH_EVENTS.ERROR_USER_FETCH });

    setAuthState(prevProps => ({
      ...prevProps,
      errorCode: detailedErrorCode,
    }));
    setHasError(true);
  };

  const redirect = () => {
    // remove from session storage
    sessionStorage.removeItem(AUTHN_SETTINGS.RETURN_URL);

    // redirect to my-va if necessary
    const updatedUrl = generateReturnURL(returnUrl);

    // check if usip client
    const postAuthUrl = checkReturnUrl(updatedUrl)
      ? updatedUrl
      : appendQuery(updatedUrl, 'postLogin=true');

    const redirectUrl =
      (!returnUrl.match(REDIRECT_IGNORE_PATTERN) && postAuthUrl) || '/';

    window.location.replace(redirectUrl);
  };

  const generateOAuthError = ({
    oauthErrorCode,
    event = OAUTH_EVENTS.ERROR_DEFAULT,
  }) => {
    recordEvent({ event });
    const { errorCode: detailedErrorCode } = getAuthError(oauthErrorCode);
    setAuthState(prevProps => ({
      ...prevProps,
      errorCode: detailedErrorCode,
      auth: AUTH_LEVEL.FAIL,
    }));
    setHasError(true);
  };

  async function handleProvisioning() {
    try {
      const termsResponse = await apiRequest(
        `/terms_of_use_agreements/update_provisioning`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );
      if (!termsResponse?.provisioned) {
        handleAuthError(null, '111');
        return false;
      }
      return true;
    } catch (err) {
      const message = err?.error;
      if (message === 'Agreement not accepted') {
        window.location = `${
          environment.BASE_URL
        }/terms-of-use/myvahealth/?ssoeTarget=${returnUrl}`;
      } else if (message === 'Account not Provisioned') {
        handleAuthError(null, '111');
      } else {
        handleAuthError(err, '110');
      }
      return false;
    }
  }

  const handleAuthForceNeeded = () => {
    recordEvent({
      event: AUTH_EVENTS.ERROR_FORCE_NEEDED,
      eventCallback: redirect,
      eventTimeout: 2000,
    });
  };

  const handleAuthSuccess = async ({
    response = {},
    skipToRedirect = false,
    isMyVAHealth = false,
  } = {}) => {
    sessionStorage.setItem('shouldRedirectExpiredSession', true);
    const authMetrics = new AuthMetrics(
      loginType,
      response,
      requestId,
      errorCode,
    );
    const provisioned = isMyVAHealth && (await handleProvisioning());
    const { userAttributes, userProfile } = authMetrics;
    authMetrics.run();
    const { needsPortalNotice, needsMyHealth } = checkPortalRequirements({
      isPortalNoticeInterstitialEnabled,
      userAttributes,
      provisioned,
    });
    const needsEmailConfirmation = emailNeedsConfirmation({
      isEmailInterstitialEnabled,
      loginType,
      userAttributes,
    });
    const interstitialRedirects = [
      { condition: needsPortalNotice, url: '/sign-in-health-portal/' },
      { condition: needsMyHealth, url: '/my-health' },
      {
        condition: needsEmailConfirmation,
        url: '/sign-in-confirm-contact-email',
      },
    ];
    const interstitial = interstitialRedirects.find(r => r.condition);
    const needsProfileSetup =
      !skipToRedirect && (!isMyVAHealth || interstitial);
    if (needsProfileSetup) {
      setupProfileSession(userProfile);
      if (interstitial) {
        window.location.replace(interstitial.url);
        return;
      }
    }
    redirect();
  };

  // Fetch the user to get the login policy and validate the session.
  const validateSession = async () => {
    if (errorCode && state) {
      await handleTokenRequest({
        code: errorCode,
        state,
        csp: loginType,
        generateOAuthError,
      });
    }

    const isMyVAHealth = returnUrl.includes(
      EXTERNAL_REDIRECTS[EXTERNAL_APPS.MY_VA_HEALTH],
    );
    const skipToRedirect =
      !hasError &&
      checkReturnUrl(returnUrl) &&
      (!isPortalNoticeInterstitialEnabled || !isMyVAHealth);

    if (auth === FORCE_NEEDED) {
      handleAuthForceNeeded();
    } else if (skipToRedirect) {
      await handleAuthSuccess({ skipToRedirect });
    } else {
      try {
        const response = await apiRequest('/user');
        await handleAuthSuccess({
          response,
          skipToRedirect: false,
          isMyVAHealth,
        });
      } catch (error) {
        handleAuthError(error);
      }
    }
  };

  useEffect(
    () => {
      if (!isFeatureToggleLoading) {
        if (hasError) {
          handleAuthError();
        } else {
          validateSession();
        }
      }
    },
    [isFeatureToggleLoading],
  );

  useEffect(
    () => {
      if (hasError || environment.isProduction()) return undefined;

      // Prevent user interaction while waiting for authentication
      document.body.style.pointerEvents = 'none';
      document.body.style.cursor = 'not-allowed';

      const blockKeydown = e => e.preventDefault();
      document.addEventListener('keydown', blockKeydown, true);

      // Inform SR users that navigation is temporarily unavailable
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('class', 'sr-only');
      liveRegion.textContent =
        'Loading your account. Some options will be available shortly.';
      document.body.appendChild(liveRegion);

      return () => {
        document.body.style.pointerEvents = '';
        document.body.style.cursor = '';
        document.removeEventListener('keydown', blockKeydown, true);
        document.body.removeChild(liveRegion);
      };
    },
    [hasError],
  );

  const openLoginModal = () => {
    dispatch(toggleLoginModal(true));
  };
  const renderErrorProps = {
    code: getAuthError(errorCode).errorCode,
    auth,
    requestId,
    recordEvent,
    openLoginModal,
  };

  return (
    <div className="row vads-u-padding-y--5">
      {hasError ? (
        <RenderErrorUI {...renderErrorProps} />
      ) : (
        <va-loading-indicator
          message="Signing in to VA.gov..."
          data-testid="loading"
        />
      )}
    </div>
  );
}

AuthApp.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.shape({
      auth: PropTypes.string,
      code: PropTypes.string,
      // eslint-disable-next-line camelcase
      request_id: PropTypes.string,
      state: PropTypes.string,
      type: PropTypes.string,
    }),
  }),
};

export default AuthApp;
