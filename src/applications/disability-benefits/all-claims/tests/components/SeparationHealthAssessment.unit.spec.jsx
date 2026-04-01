import React from 'react';
import {
  $$,
  $,
} from '@department-of-veterans-affairs/platform-forms-system/ui';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SeparationHealthAssessment } from '../../components/SeparationHealthAssessment';

describe('SeparationHealthAssessment', () => {
  const page = ({
    data = {},
    goBack = () => {},
    goForward = () => {},
    setFormData = () => {},
    updatePage = () => {},
    onReviewPage = false,
  } = {}) => {
    return (
      <div>
        <SeparationHealthAssessment
          setFormData={setFormData}
          data={data}
          goBack={goBack}
          goForward={goForward}
          onReviewPage={onReviewPage}
          updatePage={updatePage}
        />
      </div>
    );
  };

  it('should render SHA question with two options', () => {
    const { container } = render(page());

    expect($$('va-radio-option').length).to.equal(2);

    const question = container.querySelector('va-radio');
    expect(question).to.have.attribute(
      'label',
      'Do you want to upload your Separation Health Assessment Part A?',
    );
    expect(container.querySelector('va-radio-option[label="Yes"]')).to.exist;
    expect(container.querySelector('va-radio-option[label="No"]')).to.exist;
  });

  it('should set form data when selecting Yes', async () => {
    const setFormData = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
    };
    const { container } = render(page({ data, setFormData }));

    const radio = container.querySelector('va-radio');
    fireEvent(
      radio,
      new CustomEvent('vaValueChange', {
        detail: { value: 'true' },
      }),
    );

    await waitFor(() => {
      expect(setFormData.called).to.be.true;
      const updatedData = setFormData.lastCall.args[0];
      expect(updatedData['view:hasSeparationHealthAssessment']).to.be.true;
    });
  });

  it('should show validation error when submitting without selecting an option', async () => {
    const goForward = sinon.spy();

    const { container } = render(page({ data: {}, goForward }));

    fireEvent.click($('button[type="submit"]', container));

    await waitFor(() => {
      const radio = container.querySelector('va-radio');
      expect(radio.error).to.equal('You must provide a response');
      expect(goForward.called).to.be.false;
    });
  });

  it('should call goForward when user selects Yes and continues', () => {
    const goForward = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': true,
    };
    const { container } = render(page({ data, goForward }));

    fireEvent.click($('button[type="submit"]', container));

    expect(goForward.calledOnce).to.be.true;
    expect(goForward.firstCall.args[0]).to.deep.equal({ formData: data });
  });

  it('should open modal when continuing with No selected and SHA uploads exist', async () => {
    const goForward = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
      separationHealthAssessmentUploads: [{ name: 'sha-a.pdf' }],
    };
    const { container } = render(page({ data, goForward }));

    fireEvent.click($('button[type="submit"]', container));

    await waitFor(() => {
      const modal = container.querySelector('va-modal');
      expect(modal).to.have.attribute('visible', 'true');
      expect(modal).to.have.attribute(
        'modal-title',
        'Your uploaded Separation Health Assessment will be deleted',
      );
      expect(modal.textContent).to.include('sha-a.pdf');
      expect(goForward.called).to.be.false;
    });
  });

  it('should delete SHA uploads and not continue when confirming modal', async () => {
    const setFormData = sinon.spy();
    const goForward = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
      separationHealthAssessmentUploads: [
        { name: 'sha-a.pdf' },
        { name: 'sha-b.pdf' },
      ],
    };

    const { container } = render(page({ data, setFormData, goForward }));

    fireEvent.click($('button[type="submit"]', container));

    await waitFor(() => {
      expect(container.querySelector('va-modal')).to.have.attribute(
        'visible',
        'true',
      );
    });

    fireEvent(
      container.querySelector('va-modal'),
      new CustomEvent('primaryButtonClick'),
    );

    await waitFor(() => {
      expect(setFormData.calledOnce).to.be.true;
      const updatedData = setFormData.firstCall.args[0];
      expect(updatedData).to.not.have.property(
        'separationHealthAssessmentUploads',
      );
      expect(goForward.called).to.be.false;
      expect(updatedData['view:hasSeparationHealthAssessment']).to.be.false;
    });
  });

  it('should show success alert after deleting SHA uploads', async () => {
    const setFormData = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
      separationHealthAssessmentUploads: [{ name: 'sha-a.pdf' }],
    };

    const { container } = render(page({ data, setFormData }));

    fireEvent.click($('button[type="submit"]', container));

    await waitFor(() => {
      expect(container.querySelector('va-modal')).to.have.attribute(
        'visible',
        'true',
      );
    });

    fireEvent(
      container.querySelector('va-modal'),
      new CustomEvent('primaryButtonClick'),
    );

    await waitFor(() => {
      const alert = container.querySelector('va-alert[status="success"]');
      expect(alert).to.have.attribute('visible', 'true');
      expect(alert.textContent).to.include(
        'We’ve deleted the Separation Health Assessment you uploaded supporting your claim.',
      );
    });
  });

  it('should reset selection to Yes when modal is canceled', async () => {
    const setFormData = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
      separationHealthAssessmentUploads: [{ name: 'sha-a.pdf' }],
    };

    const { container } = render(page({ data, setFormData }));

    fireEvent.click($('button[type="submit"]', container));

    await waitFor(() => {
      expect(container.querySelector('va-modal')).to.have.attribute(
        'visible',
        'true',
      );
    });

    fireEvent(
      container.querySelector('va-modal'),
      new CustomEvent('secondaryButtonClick'),
    );

    await waitFor(() => {
      expect(setFormData.called).to.be.true;
      const updatedData = setFormData.lastCall.args[0];
      expect(updatedData['view:hasSeparationHealthAssessment']).to.be.true;
    });
  });

  it('should open modal and not call updatePage on review page', async () => {
    const updatePage = sinon.spy();
    const data = {
      'view:hasSeparationHealthAssessment': false,
      separationHealthAssessmentUploads: [{ name: 'sha-a.pdf' }],
    };
    const { container } = render(
      page({ data, updatePage, onReviewPage: true }),
    );

    fireEvent.click(container.querySelector('button.usa-button-primary'));

    await waitFor(() => {
      expect(container.querySelector('va-modal')).to.have.attribute(
        'visible',
        'true',
      );
      expect(updatePage.called).to.be.false;
    });
  });
});
