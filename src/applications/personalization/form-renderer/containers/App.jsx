import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Toggler } from 'platform/utilities/feature-toggles';
import { useFeatureToggle } from '~/platform/utilities/feature-toggles/useFeatureToggle';
import FormRenderer from 'platform/form-renderer/FormRenderer';
import { apiRequest } from '~/platform/utilities/api';
import backendServices from 'platform/user/profile/constants/backendServices';
import { RequiredLoginView } from 'platform/user/authorization/components/RequiredLoginView';
import { useSelector } from 'react-redux';
import { selectUser } from '@department-of-veterans-affairs/platform-user/selectors';

export default function App({ params }) {
  const { id } = params;
  const [response, setResponse] = useState(null);
  const [isGeneralError, setIsGeneralError] = useState(false);
  const [isUnauthorized, setUnauthorized] = useState(false);
  const user = useSelector(selectUser);

  const {
    TOGGLE_NAMES: { dependentsEnableFormViewerMFE: appToggleKey },
    useToggleLoadingValue,
  } = useFeatureToggle();
  const isAppToggleLoading = useToggleLoadingValue(appToggleKey);

  function getSubmission(submissionId) {
    return apiRequest(`/digital_forms_api/submissions/${submissionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(submission => setResponse(submission))
      .catch(error => {
        if (error.error === 'Forbidden') {
          setUnauthorized(true);
        } else {
          setIsGeneralError(true);
        }
      });
  }
  const generalErrorAlert = () => {
    return (
      <div className="error-state">
        <va-alert
          close-btn-aria-label="Close notification"
          status="error"
          visible
          closeable="false"
        >
          <h2 slot="headline">Something went wrong</h2>
          <>
            <p className="vads-u-margin-y--0">
              <div className="space-below">
                We’re sorry. There’s a problem with our system. Try again later.
              </div>
              <span>
                Check your email for information about your submission. If your
                submission was successful, you can bookmark this page and try
                again in 24 hours.
              </span>
            </p>
          </>
        </va-alert>
      </div>
    );
  };

  const unauthorizedAlert = () => {
    return (
      <div className="error-state">
        <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--1p5">
          We can’t match your records
        </h2>
        <p>
          We’re sorry. We can’t match this submitted form with your records.
          Check your link and try again. If you still can’t access your
          information, call us at <va-telephone contact="8006982411" /> (TTY:{' '}
          <va-telephone contact="711" />
          ). We’re here 24/7.
        </p>
      </div>
    );
  };

  useEffect(
    () => {
      getSubmission(id);
    },
    [id],
  );

  return (
    <div>
      {!user && <RedirectHandler />}
      <RequiredLoginView
        serviceRequired={backendServices.USER_PROFILE}
        user={user}
      >
        {!isAppToggleLoading && (
          <Toggler
            toggleName={Toggler.TOGGLE_NAMES.dependentsEnableFormViewerMFE}
          >
            <Toggler.Enabled>
              {isGeneralError && generalErrorAlert()}
              {isUnauthorized && unauthorizedAlert()}
              {response && (
                <div className="vads-u-margin-top--5 renderer">
                  <FormRenderer
                    config={response.template}
                    data={response.submission}
                  />
                </div>
              )}
            </Toggler.Enabled>
            <Toggler.Disabled>
              {/* If the feature flag is off, redirect user to /my-va */}
              <RedirectHandler />
            </Toggler.Disabled>
          </Toggler>
        )}
      </RequiredLoginView>
    </div>
  );
}

const RedirectHandler = () => {
  window.location.href = '/my-va';

  return (
    <div>
      <va-loading-indicator label="Loading" message="Redirecting..." />
    </div>
  );
};

App.propTypes = {
  children: PropTypes.node,
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
