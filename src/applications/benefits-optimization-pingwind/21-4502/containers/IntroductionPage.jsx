import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { IntroductionPageView } from '../../shared/components/IntroductionPageView';
import { FORM_21_4502 } from '../definitions/constants';

const ombInfo = {
  resBurden: '15',
  ombNumber: '2900-0093',
  expDate: '08/31/2027',
};

const { INTRODUCTION: I } = FORM_21_4502;

const renderBoldTrailingConjunction = text => {
  const match = text.match(/^(.*?)(,?\s(?:or|and))$/);

  if (!match) {
    return text;
  }

  const [, baseText, conjunction] = match;

  return (
    <>
      {baseText}
      <strong>{conjunction}</strong>
    </>
  );
};

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const content = {
    formTitle: I.FORM_TITLE,
    formSubTitle: I.FORM_SUBTITLE,
    authStartFormText: I.AUTH_START_FORM_TEXT,
    saveInProgressText: I.SAVE_IN_PROGRESS_TEXT,
    displayNonVeteranMessaging: true,
    hideSipIntro: userLoggedIn && !userIdVerified,
  };
  const childContent = (
    <>
      <p className="vads-u-margin-top--3 vads-u-margin-bottom--3">{I.INTRO}</p>

      <va-process-list>
        <va-process-list-item header={I.STEP_ELIGIBILITY_TITLE} level={2}>
          <p>{I.STEP_ELIGIBILITY_INTRO}</p>
          <p>{I.STEP_ELIGIBILITY_CONDITION_INTRO}</p>
          <ul>
            {I.STEP_ELIGIBILITY_BULLETS.map(item => (
              <li key={item}>{renderBoldTrailingConjunction(item)}</li>
            ))}
          </ul>
          <va-additional-info trigger={I.STEP_ELIGIBILITY_VISION_TRIGGER}>
            <p>{I.STEP_ELIGIBILITY_VISION_INTRO}</p>
            <ul>
              {I.STEP_ELIGIBILITY_VISION_BODY.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </va-additional-info>
          <h3 className="vads-u-font-size--h4 vads-u-margin-bottom--1">
            {I.STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_TITLE}
          </h3>
          <p>{I.STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_INTRO}</p>
          <ul>
            {I.STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_BULLETS.map(item => (
              <li key={item}>{renderBoldTrailingConjunction(item)}</li>
            ))}
          </ul>
          <p>{I.STEP_ELIGIBILITY_ADDITIONAL_REQUIREMENTS_FOOTER}</p>
        </va-process-list-item>
        <va-process-list-item header={I.STEP_GATHER_TITLE} level={2}>
          <p>{I.STEP_GATHER_INTRO}</p>
          <ul>
            {I.STEP_GATHER_BULLETS.map(item => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </va-process-list-item>
        <va-process-list-item header={I.STEP_START_TITLE} level={2}>
          <p>{I.STEP_START_BODY}</p>
          <p>{I.STEP_START_FOLLOWUP}</p>
        </va-process-list-item>
      </va-process-list>
    </>
  );

  return (
    <IntroductionPageView
      route={route}
      content={content}
      ombInfo={ombInfo}
      childContent={childContent}
      devOnly={{
        forceShowFormControls: true,
      }}
    />
  );
};

IntroductionPage.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.shape({
      prefillEnabled: PropTypes.bool,
      savedFormMessages: PropTypes.shape({}),
    }),
    pageList: PropTypes.array,
  }),
  userIdVerified: PropTypes.bool,
  userLoggedIn: PropTypes.bool,
};

const mapStateToProps = state => ({
  userIdVerified: isLOA3(state),
  userLoggedIn: isLoggedIn(state),
});

export default connect(mapStateToProps)(IntroductionPage);
