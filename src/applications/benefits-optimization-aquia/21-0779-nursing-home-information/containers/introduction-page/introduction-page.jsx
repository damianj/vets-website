import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { VaLinkAction } from '@department-of-veterans-affairs/component-library/dist/react-bindings';

import FormTitle from 'platform/forms-system/src/js/components/FormTitle';
import SaveInProgressIntro from 'platform/forms/save-in-progress/SaveInProgressIntro';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import { focusElement, scrollToTop } from 'platform/utilities/ui';

import {
  SUBTITLE,
  TITLE,
} from '@bio-aquia/21-0779-nursing-home-information/constants';

const OMB_RES_BURDEN = 10;
const OMB_NUMBER = '2900-0652';
const OMB_EXP_DATE = '09/30/2026';

export const IntroductionPage = ({ route, router }) => {
  const { formConfig, pageList } = route;
  const { useToggleValue, TOGGLE_NAMES } = useFeatureToggle();
  const authRequired = useToggleValue(TOGGLE_NAMES.aquiaBioAuthRequired);

  useEffect(() => {
    scrollToTop();
    focusElement('h1');
  }, []);

  return (
    <article className="schemaform-intro">
      <FormTitle title={TITLE} subTitle={SUBTITLE} />

      <p className="vads-u-font-size--lg vads-u-font-family--serif vads-u-font-weight--normal vads-u-line-height--4">
        Use this form if you’re a nursing home official to verify a Veteran or
        someone connected to a Veteran is a patient in a qualifying extended
        care facility.
      </p>

      <h2 className="vads-u-margin-top--3">
        What to know before you fill out this form
      </h2>
      <p>
        Only a nursing home official from a qualified extended care facility can
        fill out this form. As a responsible official of the nursing home,
        you’ll certify that the facility provides nursing care for the claimant
        who has a mental or physical disability.
      </p>

      <h3>What is a qualified extended care facility?</h3>
      <p>
        For the purposes of meeting the Aid and Attendance criteria, a nursing
        home is defined as:
      </p>
      <ul>
        <li>
          any extended care facility that is licensed by a state to provide
          skilled or intermediate-level nursing care
        </li>
        <li>
          a nursing home care unit in a State Veterans Home that is approved for
          payment, or
        </li>
        <li>a VA nursing home care unit.</li>
      </ul>
      <va-link
        href="/pension/aid-attendance-housebound/"
        text="Learn more about how the VA defines a nursing home."
      />

      <p className="vads-u-margin-top--2">
        You’ll need to provide the following information about the patient:
      </p>
      <ul>
        <li>Social Security number or VA file number</li>
        <li>Date of birth</li>
        <li>Level of care at the facility</li>
        <li>Medicaid status</li>
        <li>Monthly out of pocket cost</li>
      </ul>
      <p>
        In some cases, the patient may be the spouse or parent of a Veteran. In
        that case, you’ll also need to identify the Veteran they’re connected
        to.
      </p>

      {authRequired ? (
        /* IAL1 only — no identity verification (LOA3) required.
           Any logged-in user can start the form regardless of verification status. */
        <SaveInProgressIntro
          headingLevel={2}
          prefillEnabled={formConfig.prefillEnabled}
          verifiedPrefillAlert={<></>}
          messages={formConfig.savedFormMessages}
          pageList={pageList}
          startText="Start the nursing home information to support a claim request"
          hideUnauthedStartLink
          devOnly={{
            forceShowFormControls: true,
          }}
        />
      ) : (
        <VaLinkAction
          href="/nursing-official-information"
          data-testid="start-nursing-home-info-link"
          onClick={e => {
            e.preventDefault();
            router.push('/nursing-official-information');
          }}
          text="Start the nursing home information to support a claim request"
        />
      )}

      <div className="vads-u-margin-top--4">
        <va-omb-info
          res-burden={OMB_RES_BURDEN}
          omb-number={OMB_NUMBER}
          exp-date={OMB_EXP_DATE}
        />
      </div>
    </article>
  );
};

IntroductionPage.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.shape({
      prefillEnabled: PropTypes.bool.isRequired,
      savedFormMessages: PropTypes.object.isRequired,
    }).isRequired,
    pageList: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  router: PropTypes.shape({
    push: PropTypes.func,
  }),
};
