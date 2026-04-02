import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { focusElement } from '~/platform/utilities/ui';
import FormTitle from '~/platform/forms-system/src/js/components/FormTitle';
import VerifyAlert from 'platform/user/authorization/components/VerifyAlert';
import SaveInProgressIntro from '~/platform/forms/save-in-progress/SaveInProgressIntro';
import { IntroStatusAlert } from '../components/IntroStatusAlert';

const ProcessList = () => {
  return (
    <va-process-list>
      <va-process-list-item header="Learn about eligibility">
        <p className="vads-u-margin-bottom--0">
          Eligibility is based on specific requirements. You can review them, or
          apply and we’ll determine eligibility from your application.
        </p>
        <va-link
          href="/housing-assistance/home-loans/eligibility/"
          text="Learn about eligibility for VA home loan programs"
        />
      </va-process-list-item>
      <va-process-list-item header="Gather your information">
        <p>Here’s what you’ll need to request a COE:</p>
        <ul>
          <li>
            Your personal information, including Social Security number, date of
            birth, mailing address, and contact information.
          </li>
          <li>
            If you have or had a VA-backed loan on any properties you still own,
            you’ll need to provide the property addresses and dates you received
            the loans.
          </li>
          <li>
            Based on your service, you may need to submit specific documents
            with your COE request.
            <div>
              <va-link
                href="/housing-assistance/home-loans/how-to-request-coe/"
                text="Review which documents you may need"
              />
            </div>
          </li>
        </ul>
      </va-process-list-item>
      <va-process-list-item header="Start your request">
        <p>
          We’ll take you through each step of the process. It should take about
          15 minutes.
        </p>
        <p>
          When you submit your COE request, you’ll get a confirmation message.
          You can print this message for your records.
        </p>
        <va-additional-info trigger="What happens after you submit your request">
          <p className="vads-u-margin-top--0 vads-u-margin-bottom--2p5">
            After submitting your request, you’ll get a confirmation message.
            It’ll include details about your next steps. We process requests in
            the order we receive them and may contact you if we have questions
            or need more information.
          </p>
        </va-additional-info>
      </va-process-list-item>
    </va-process-list>
  );
};

export const IntroductionPage2 = ({ route }) => {
  const userLoggedIn = useSelector(isLoggedIn);
  const userIdVerified = useSelector(isLOA3);
  const showVerifyIdentity = userLoggedIn && !userIdVerified;
  const certificateOfEligibility = useSelector(
    state => state.certificateOfEligibility,
  );
  const { coe } = certificateOfEligibility;
  const hasStatusAlert = coe?.status && coe.status !== 'INELIGIBLE';

  useEffect(() => {
    focusElement('va-breadcrumbs');
  }, []);

  const content = {
    formTitle: 'Request a VA home loan Certificate of Eligibility (COE)',
    formSubTitle: 'Request for a Certificate of Eligibility (VA Form 26-1880)',
    hideSipIntro: userLoggedIn && !userIdVerified,
    authStartFormText: hasStatusAlert
      ? 'Start a new Certificate of Eligibility request'
      : 'Request a Certificate of Eligibility',
  };

  const ombInfo = {
    resBurden: '15',
    ombNumber: '2900-0086',
    expDate: '10/31/2025',
  };

  const childContent = (
    <>
      <p className="vads-u-font-family--serif vads-u-font-size--lg vads-u-margin-bottom--4">
        Use the digital VA Form 26-1880 to apply for a VA home loan COE. Or,
        your lender can obtain a COE from the VA on your behalf.
      </p>
      {hasStatusAlert && (
        <IntroStatusAlert
          referenceNumber={coe.referenceNumber}
          requestDate={coe.applicationCreateDate}
          status={coe.status}
        />
      )}
      <h2 className="vads-u-margin-top--0">
        Follow these steps to request a new COE
      </h2>
      <ProcessList />
      {showVerifyIdentity && (
        <VerifyAlert headingLevel={3} dataTestId="coe-26-1880-identity-alert" />
      )}
    </>
  );

  const { formTitle, formSubTitle, hideSipIntro, authStartFormText } = content;
  const { formConfig, pageList } = route;
  const { prefillEnabled, savedFormMessages } = formConfig;
  const { resBurden, ombNumber, expDate } = ombInfo;

  return (
    <article className="schemaform-intro">
      <FormTitle title={formTitle} subTitle={formSubTitle} />
      {childContent}
      {!hideSipIntro && (
        <SaveInProgressIntro
          devOnly={{
            forceShowFormControls: true,
          }}
          formConfig={formConfig}
          headingLevel={2}
          hideUnauthedStartLink
          messages={savedFormMessages}
          prefillEnabled={prefillEnabled}
          pageList={pageList}
          startText={authStartFormText}
        />
      )}
      <p className="vads-u-margin-top--4" />
      <va-omb-info
        res-burden={resBurden}
        omb-number={ombNumber}
        exp-date={expDate}
      />
    </article>
  );
};

IntroductionPage2.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.shape({
      prefillEnabled: PropTypes.bool.isRequired,
      savedFormMessages: PropTypes.object.isRequired,
    }).isRequired,
    pageList: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
};

export default IntroductionPage2;
