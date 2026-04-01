import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  VaAlert,
  VaModal,
  VaRadio,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import FormNavButtons from 'platform/forms-system/src/js/components/FormNavButtons';
import _ from 'platform/utilities/data';
import { scrollToFirstError } from 'platform/utilities/scroll';
import { DBQ_URL } from '../constants';
import { checkValidations } from '../utils/submit';
import { getBddShaUploads } from '../utils';
import { renderFileList } from '../content/evidenceRequest';

const selectionField = 'view:hasSeparationHealthAssessment';
const missingSelectionErrorMessage = 'You must provide a response';

export const SeparationHealthAssessment = ({
  data,
  setFormData,
  onReviewPage,
  contentBeforeButtons,
  contentAfterButtons,
  goBack,
  goForward,
  updatePage,
}) => {
  const hasSeparationHealthAssessment = _.get(selectionField, data, null);
  const [hasError, setHasError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const hasEvidenceToRemove = () => getBddShaUploads(data).length > 0;

  const missingSelection = (error, _fieldData, formData) => {
    const value = formData?.[selectionField];
    if (value !== true && value !== false) {
      error.addError?.(missingSelectionErrorMessage);
    }
  };

  const checkErrors = (formData = data) => {
    const error = checkValidations(
      [missingSelection],
      data?.[selectionField],
      formData,
    );

    const result = error?.[0] || null;
    setHasError(result);

    return result;
  };

  const handlers = {
    onChangeAndRemove: () => {
      const updatedFormData = { ...data };
      delete updatedFormData.separationHealthAssessmentUploads;
      setFormData(updatedFormData);
      setModalVisible(false);
      setAlertVisible(true);
    },
    onCancelChange: () => {
      const updatedFormData = {
        ...data,
        [selectionField]: true,
      };
      setFormData(updatedFormData);
      setModalVisible(false);
    },
    onSelection: event => {
      const { value } = event?.detail || {};
      const booleanValue = value === true || value === 'true';
      const formData = {
        ...data,
        [selectionField]: booleanValue,
      };
      setFormData(formData);
      checkErrors(formData);
    },
    onSubmit: event => {
      event.preventDefault();
      if (checkErrors()) {
        scrollToFirstError();
      } else if (
        hasSeparationHealthAssessment === false &&
        hasEvidenceToRemove()
      ) {
        setModalVisible(true);
      } else {
        setAlertVisible(false);
        goForward({ formData: data });
      }
    },
    onUpdatePage: event => {
      event.preventDefault();
      if (checkErrors()) {
        scrollToFirstError();
      } else if (
        hasSeparationHealthAssessment === false &&
        hasEvidenceToRemove()
      ) {
        setModalVisible(true);
      } else {
        setAlertVisible(false);
        updatePage(event);
      }
    },
  };

  return (
    <>
      <h3>Your Separation Health Assessment</h3>
      <VaAlert status="warning" uswds visible>
        <h3 slot="headline">Submit your Separation Health Assessment</h3>
        <p>
          You must submit a Separation Health Assessment (self-assessment, also
          called "Part A"). It will help us process your claim faster.
        </p>
        <p>
          This will also ensure your submission isn’t excluded from the Benefits
          Delivery at Discharge (BDD) program.
        </p>
        <p>
          <a href={DBQ_URL} target="_blank" rel="noreferrer">
            Download your Separation Health Assessment (opens in new tab)
          </a>
          .
        </p>
      </VaAlert>
      <VaModal
        clickToClose
        modalTitle="Your uploaded Separation Health Assessment will be deleted"
        onCloseEvent={handlers.onCancelChange}
        onPrimaryButtonClick={handlers.onChangeAndRemove}
        onSecondaryButtonClick={handlers.onCancelChange}
        visible={modalVisible}
        status="warning"
        primaryButtonText="Yes, delete"
        secondaryButtonText="Go back"
      >
        {getBddShaUploads(data).length > 0 && (
          <>
            <p>
              If you choose to submit your Separation Health Assessment later,
              we’ll delete these files you uploaded:
            </p>
            {renderFileList(getBddShaUploads(data), true)}
          </>
        )}
      </VaModal>
      <div className="vads-u-margin-top--2 vads-u-margin-bottom--1">
        <VaAlert
          closeBtnAriaLabel="Close notification"
          closeable
          onCloseEvent={() => setAlertVisible(false)}
          fullWidth="false"
          slim
          status="success"
          visible={alertVisible}
          uswds
          tabIndex="-1"
        >
          <p className="vads-u-margin-y--0">
            We’ve deleted the Separation Health Assessment you uploaded
            supporting your claim.
          </p>
        </VaAlert>
      </div>
      <form onSubmit={handlers.onSubmit}>
        <VaRadio
          label="Do you want to upload your Separation Health Assessment Part A?"
          required
          uswds="true"
          class="rjsf-web-component-field hydrated"
          aria-invalid={hasError ? 'true' : 'false'}
          onVaValueChange={handlers.onSelection}
          error={hasError}
        >
          <va-radio-option
            label="Yes"
            name="separation-health-assessment"
            checked={hasSeparationHealthAssessment === true}
            value="true"
          />
          <va-radio-option
            label="No"
            name="separation-health-assessment"
            checked={hasSeparationHealthAssessment === false}
            value="false"
          />
        </VaRadio>

        {onReviewPage ? (
          /**
           * Does not use web component for design consistency on all pages.
           * @see https://github.com/department-of-veterans-affairs/vets-website/pull/35911
           */
          // eslint-disable-next-line @department-of-veterans-affairs/prefer-button-component
          <button
            className="usa-button-primary"
            type="button"
            onClick={event => handlers.onUpdatePage(event)}
          >
            Update page
          </button>
        ) : (
          <>
            {contentBeforeButtons}
            <FormNavButtons
              goBack={goBack}
              goForward={handlers.onSubmit}
              submitToContinue
            />
            {contentAfterButtons}
          </>
        )}
      </form>
    </>
  );
};

SeparationHealthAssessment.propTypes = {
  contentAfterButtons: PropTypes.element,
  contentBeforeButtons: PropTypes.element,
  data: PropTypes.object,
  goBack: PropTypes.func,
  goForward: PropTypes.func,
  setFormData: PropTypes.func,
  updatePage: PropTypes.func,
  onReviewPage: PropTypes.bool,
};
