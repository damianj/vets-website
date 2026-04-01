/**
 * Implements the Check eligibility pattern: https://design.va.gov/patterns/help-users-to/check-eligibility
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  VaAlert,
  VaCard,
  VaLink,
  VaRadio,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';

import { FORM_21_4502 } from '../definitions/constants';

const E = FORM_21_4502.ELIGIBILITY;

const VA_REACHED_OUT = {
  yes: 'yes',
  no: 'no',
};

const APPLYING_FOR = {
  automobile: 'automobile',
  adaptiveEquipment: 'adaptiveEquipment',
};

const RequirementItem = ({ met, text }) => {
  const icon = met ? 'check' : 'close';
  const iconClasses = classNames('vads-u-margin-right--1', {
    'vads-u-color--green': met,
    'vads-u-color--gray-medium': !met,
  });
  return (
    <li className="vads-u-position--relative vads-u-margin-bottom--1">
      <span className={iconClasses}>
        <va-icon icon={icon} size={3} />
      </span>
      <span className="vads-u-visibility--screen-reader">
        {met ? E.REQUIREMENT_MET : E.REQUIREMENT_NOT_MET}
      </span>
      {text}
    </li>
  );
};

RequirementItem.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.node.isRequired,
};

export const EligibilityFormPage = ({
  goBack,
  goForward,
  fullData,
  contentBeforeButtons,
  contentAfterButtons,
  NavButtons,
  DefaultNavButtons: _DefaultNavButtons,
  formOptions,
}) => {
  const [vaReachedOut, setVaReachedOut] = useState(null);
  const [applyingFor, setApplyingFor] = useState(null);

  const handleContinue = () => {
    goForward({ formData: fullData || {} });
  };

  const showAutomobileContent = applyingFor === APPLYING_FOR.automobile;
  const showAdaptiveEquipmentContent =
    applyingFor === APPLYING_FOR.adaptiveEquipment;
  const showNotEligibleContent = vaReachedOut === VA_REACHED_OUT.no;
  const showBenefitQuestion = vaReachedOut === VA_REACHED_OUT.yes;
  const showEligibilitySummary =
    showNotEligibleContent ||
    showAutomobileContent ||
    showAdaptiveEquipmentContent;
  // Not eligible for THIS form: first answer No, OR second answer Adaptive equipment
  const showNotEligibleAlert =
    showNotEligibleContent || showAdaptiveEquipmentContent;

  return (
    <div className="eligibility-form-page">
      <h1 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
        {E.TITLE}
      </h1>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">{E.INTRO}</p>
      <p className="vads-u-margin-top--4 vads-u-margin-bottom--3">
        {E.ANSWER_QUESTIONS}
      </p>

      <div className="eligibility-questions-block vads-u-margin-bottom--4">
        <VaRadio
          label={E.QUESTION_VA_REACHED_OUT}
          hint={E.HINT_VA_REACHED_OUT}
          name="va-reached-out"
          onVaValueChange={e => {
            setVaReachedOut(e.detail?.value || null);
          }}
          uswds
          class="vads-u-margin-bottom--3"
        >
          <va-radio-option
            label={E.OPTION_YES}
            value={VA_REACHED_OUT.yes}
            checked={vaReachedOut === VA_REACHED_OUT.yes}
          />
          <va-radio-option
            label={E.OPTION_NO}
            value={VA_REACHED_OUT.no}
            checked={vaReachedOut === VA_REACHED_OUT.no}
          />
        </VaRadio>

        {showBenefitQuestion && (
          <VaRadio
            label={E.QUESTION_APPLYING_FOR}
            name="applying-for"
            onVaValueChange={e => {
              setApplyingFor(e.detail?.value || null);
            }}
            uswds
            class="vads-u-margin-bottom--3"
          >
            <va-radio-option
              label={E.OPTION_AUTOMOBILE}
              value={APPLYING_FOR.automobile}
              checked={applyingFor === APPLYING_FOR.automobile}
            />
            <va-radio-option
              label={E.OPTION_ADAPTIVE_EQUIPMENT}
              value={APPLYING_FOR.adaptiveEquipment}
              checked={applyingFor === APPLYING_FOR.adaptiveEquipment}
            />
          </VaRadio>
        )}

        {showEligibilitySummary && (
          <VaCard
            background
            className="vads-u-margin-top--3 vads-u-margin-bottom--4"
          >
            <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
              {E.SUMMARY_TITLE}
            </h2>
            <p className="vads-u-margin-bottom--2 vads-u-font-weight--bold">
              {E.YOUR_RESPONSES}
            </p>
            <ul className="vads-u-padding-left--0 vads-u-margin-left--3 vads-u-margin-top--0 vads-u-margin-bottom--0 vads-u-list-style--none">
              <RequirementItem
                met={vaReachedOut === VA_REACHED_OUT.yes}
                text="VA has reached out to you about this benefit"
              />
              {showBenefitQuestion && (
                <RequirementItem
                  met={applyingFor === APPLYING_FOR.automobile}
                  text={E.REQUIREMENT_AUTOMOBILE}
                />
              )}
            </ul>

            {showNotEligibleAlert && (
              <VaAlert
                status="warning"
                uswds
                visible
                className="vads-u-margin-top--3 vads-u-margin-bottom--0"
              >
                <h3
                  slot="headline"
                  className="vads-u-font-weight--bold vads-u-margin-top--0"
                >
                  {E.NOT_ELIGIBLE_HEADLINE}
                </h3>
                {showNotEligibleContent ? (
                  <>
                    <p className="vads-u-margin-bottom--2">
                      {E.NOT_ELIGIBLE_DISABILITY}
                    </p>
                    <VaLink
                      href={E.DISABILITY_CLAIM_URL}
                      text={E.LINK_DISABILITY_CLAIM}
                      external
                    />
                  </>
                ) : (
                  <>
                    <p className="vads-u-margin-bottom--2">
                      {E.NOT_ELIGIBLE_ADAPTIVE}
                    </p>
                    <VaLink
                      href={E.FORM_10_1394_URL}
                      text={E.LINK_FORM_10_1394}
                      external
                    />
                  </>
                )}
                <p className="vads-u-margin-top--3 vads-u-margin-bottom--0">
                  {E.EXIT_OPTIONS}
                </p>
                <div className="vads-u-margin-top--3">
                  <va-link-action
                    href={E.VA_HOME_URL}
                    text={E.EXIT_APPLICATION}
                    type="secondary"
                  />
                </div>
              </VaAlert>
            )}

            {showAutomobileContent && (
              <p className="vads-u-margin-top--3 vads-u-margin-bottom--0">
                {E.ELIGIBLE_AUTOMOBILE_BEFORE}
                <strong>VA Form 21-4502</strong>
                {E.ELIGIBLE_AUTOMOBILE_AFTER}
              </p>
            )}
          </VaCard>
        )}
      </div>

      <div className="vads-u-margin-bottom--4">
        <h2 className="vads-u-margin-top--0 vads-u-margin-bottom--2">
          {E.ALREADY_KNOW_TITLE}
        </h2>
        <p className="vads-u-margin-top--0 vads-u-margin-bottom--2">
          {E.ALREADY_KNOW_DESCRIPTION}
        </p>
      </div>

      {contentBeforeButtons}
      {NavButtons ? (
        <NavButtons
          goBack={goBack}
          goForward={handleContinue}
          submitToContinue={false}
          useWebComponents={formOptions?.useWebComponentForNavigation}
        />
      ) : (
        <div className="row form-progress-buttons schemaform-buttons vads-u-margin-y--2">
          <div className="small-12 medium-6 columns">
            <va-button
              text={E.CONTINUE}
              onClick={handleContinue}
              uswds
              data-testid="eligibility-continue-button"
            />
          </div>
        </div>
      )}
      {contentAfterButtons}
    </div>
  );
};

EligibilityFormPage.propTypes = {
  goForward: PropTypes.func.isRequired,
  DefaultNavButtons: PropTypes.func,
  NavButtons: PropTypes.func,
  contentAfterButtons: PropTypes.node,
  contentBeforeButtons: PropTypes.node,
  formOptions: PropTypes.object,
  fullData: PropTypes.object,
  goBack: PropTypes.func,
};

export default EligibilityFormPage;
