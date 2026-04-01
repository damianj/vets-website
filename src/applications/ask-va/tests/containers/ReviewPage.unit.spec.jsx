import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import * as validation from '~/platform/forms-system/src/js/validation';

import * as FileUpload from '../../components/FileUpload';
import * as ReviewCollapsibleChapter from '../../components/ReviewCollapsibleChapter';
import * as ReviewSectionContent from '../../components/reviewPage/ReviewSectionContent';
import * as UpdatePageButton from '../../components/reviewPage/UpdatePageButton';
import ReviewPage from '../../containers/ReviewPage';
import * as StorageAdapterModule from '../../utils/StorageAdapter';
import { createMockStore } from '../common';
import { mockData } from '../fixtures/data/form-data-review';

import * as formUtils from '../../utils/reviewPageUtils';

describe('<ReviewPage /> container', () => {
  let sandbox;

  const stubReviewCollapsibleChapter = () => {
    const capturedProps = [];

    const stub = sandbox
      .stub(ReviewCollapsibleChapter, 'default')
      .callsFake(props => {
        capturedProps.push(props);
        return <div>Mock review collapsible chapter</div>;
      });

    return { stub, capturedProps };
  };

  const stubReviewSectionContent = () => {
    sandbox.stub(ReviewSectionContent, 'default').callsFake(() => {
      return <div>Mock review section content</div>;
    });
  };

  const stubFileUpload = () => {
    sandbox.stub(FileUpload, 'default').callsFake(() => {
      return <div>Mock file upload</div>;
    });
  };

  const stubStorageAdapter = () => {
    sandbox
      .stub(StorageAdapterModule.StorageAdapter.prototype, 'get')
      .resolves([]);
    sandbox
      .stub(StorageAdapterModule.StorageAdapter.prototype, 'set')
      .resolves([]);
    sandbox.stub(StorageAdapterModule, 'askVAAttachmentStorage').value({
      get: () => Promise.resolve([]),
      set: () => Promise.resolve(),
    });
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should render', async () => {
    stubReviewCollapsibleChapter();
    stubReviewSectionContent();
    stubFileUpload();
    stubStorageAdapter();

    const store = createMockStore({
      openChapters: ['chapter-1', 'chapter-2'],
      viewedPages: new Set(['page-3']),
      askVA: mockData.askVA,
      formData: mockData.data,
    });

    const setViewedPages = sinon.spy();
    const setEdiMode = sinon.spy();

    const { container } = render(
      <Provider store={store}>
        <ReviewPage setViewedPages={setViewedPages} setEdiMode={setEdiMode} />
      </Provider>,
    );

    await waitFor(() => {
      const heading = container.querySelector('h3');
      expect(heading).to.have.text('Review and submit');
    });
  });

  it('should display 503 error alert when submission fails with non-JSON response', async () => {
    stubReviewCollapsibleChapter();
    stubReviewSectionContent();
    stubFileUpload();
    stubStorageAdapter();

    sandbox
      .stub(formUtils, 'handleFormSubmission')
      .callsFake(async ({ onError }) => {
        const error = new Error(
          'Non-JSON error response (likely 503 from gateway)',
        );
        onError?.(error);
        throw error;
      });

    // Stub isValidForm to return valid result
    sandbox.stub(validation, 'isValidForm').returns({
      isValid: true,
      errors: [],
    });

    const store = createMockStore({
      openChapters: ['chapter-1', 'chapter-2'],
      viewedPages: new Set(['page-3']),
      askVA: mockData.askVA,
      formData: mockData.data,
    });

    const { container } = render(
      <Provider store={store}>
        <ReviewPage />
      </Provider>,
    );

    // Wait for the Submit button to appear
    const submitVaButton = await waitFor(() =>
      Array.from(container.querySelectorAll('va-button')).find(
        btn => btn.getAttribute('text') === 'Submit question',
      ),
    );

    // Ensure the Submit va-button exists before clicking
    expect(submitVaButton).to.exist;
    fireEvent.click(submitVaButton);

    // Wait for error alert to appear
    await waitFor(() => {
      const alert = container.querySelector(
        '[data-testid="review-alert"][status="error"]',
      );

      const heading = alert.querySelector('h3');
      expect(heading).to.exist;
      expect(heading).to.have.text('Ask VA isn’t working right now');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      stubReviewCollapsibleChapter();
      stubReviewSectionContent();
      stubFileUpload();
      stubStorageAdapter();
    });

    context('when form is invalid', () => {
      beforeEach(() => {
        // Stub isValidForm to return invalid result
        sandbox.stub(validation, 'isValidForm').returns({
          isValid: false,
          errors: [
            { name: 'required', property: 'test', message: 'Test error' },
          ],
        });
      });

      it('should display validation alert on submit', async () => {
        const store = createMockStore({
          openChapters: ['chapter-1', 'chapter-2'],
          viewedPages: new Set(['page-3']),
          askVA: mockData.askVA,
          formData: mockData.data,
        });

        const { container, getByTestId } = render(
          <Provider store={store}>
            <ReviewPage />
          </Provider>,
        );

        // Wait for the Submit button to appear
        const submitVaButton = await waitFor(() =>
          Array.from(container.querySelectorAll('va-button')).find(
            btn => btn.getAttribute('text') === 'Submit question',
          ),
        );

        expect(submitVaButton).to.exist;
        fireEvent.click(submitVaButton);

        // Wait for validation error alert to appear
        await waitFor(() => {
          const validationAlert = getByTestId('validation-alert');
          const heading = validationAlert.querySelector('h3');
          expect(heading).to.have.text(
            'Some of your answers are missing information or aren’t valid',
          );
        });
      });

      it('should not submit form', async () => {
        // Stub handleFormSubmission to track if it's called
        const handleFormSubmissionStub = sandbox.stub(
          formUtils,
          'handleFormSubmission',
        );

        const store = createMockStore({
          openChapters: ['chapter-1', 'chapter-2'],
          viewedPages: new Set(['page-3']),
          askVA: mockData.askVA,
          formData: mockData.data,
        });

        const { container, getByTestId } = render(
          <Provider store={store}>
            <ReviewPage />
          </Provider>,
        );

        // Wait for the Submit button to appear
        const submitVaButton = await waitFor(() =>
          Array.from(container.querySelectorAll('va-button')).find(
            btn => btn.getAttribute('text') === 'Submit question',
          ),
        );

        fireEvent.click(submitVaButton);

        // Wait a bit for any async operations
        await waitFor(() => {
          getByTestId('validation-alert');
        });

        // Verify handleFormSubmission was NOT called
        expect(handleFormSubmissionStub.called).to.be.false;
      });
    });

    context('when form is valid', () => {
      beforeEach(() => {
        // Stub isValidForm to return valid result
        sandbox.stub(validation, 'isValidForm').returns({
          isValid: true,
          errors: [],
        });
      });

      it('should proceed with submission', async () => {
        // Stub handleFormSubmission to track if it's called
        const handleFormSubmissionStub = sandbox
          .stub(formUtils, 'handleFormSubmission')
          .resolves();

        const store = createMockStore({
          openChapters: ['chapter-1', 'chapter-2'],
          viewedPages: new Set(['page-3']),
          askVA: mockData.askVA,
          formData: mockData.data,
        });

        const { container } = render(
          <Provider store={store}>
            <ReviewPage />
          </Provider>,
        );

        // Wait for the Submit button to appear
        const submitVaButton = await waitFor(() =>
          Array.from(container.querySelectorAll('va-button')).find(
            btn => btn.getAttribute('text') === 'Submit question',
          ),
        );

        fireEvent.click(submitVaButton);

        // Wait for handleFormSubmission to be called
        await waitFor(() => {
          expect(handleFormSubmissionStub.called).to.be.true;
        });
      });

      it('should not show validation alert', async () => {
        // Stub handleFormSubmission to prevent actual submission
        sandbox.stub(formUtils, 'handleFormSubmission').resolves();

        const store = createMockStore({
          openChapters: ['chapter-1', 'chapter-2'],
          viewedPages: new Set(['page-3']),
          askVA: mockData.askVA,
          formData: mockData.data,
        });

        const { container, queryByTestId } = render(
          <Provider store={store}>
            <ReviewPage />
          </Provider>,
        );

        // Wait for the Submit button to appear
        const submitVaButton = await waitFor(() =>
          Array.from(container.querySelectorAll('va-button')).find(
            btn => btn.getAttribute('text') === 'Submit question',
          ),
        );

        fireEvent.click(submitVaButton);

        await waitFor(() => {
          // Verify no validation alert is shown
          const validationAlert = queryByTestId('validation-alert');

          expect(validationAlert).to.not.exist;
        });
      });
    });
  });

  describe('scroll element naming', () => {
    it('should render scroll elements using chapter.name (not chapterTitles with special characters)', async () => {
      stubReviewCollapsibleChapter();
      stubReviewSectionContent();
      stubFileUpload();
      stubStorageAdapter();

      const store = createMockStore({
        askVA: mockData.askVA,
        formData: mockData.data,
      });

      const { container, getByText } = render(
        <Provider store={store}>
          <ReviewPage />
        </Provider>,
      );

      // Wait for the page to render
      await waitFor(() => {
        expect(getByText('Review and submit')).to.exist;
      });

      // Verify scroll elements use chapter.name format (no special characters)
      // Filter to only chapter scroll elements (not topScrollElement, etc.)
      const scrollElements = container.querySelectorAll(
        '[name^="chapter"][name$="ScrollElement"]',
      );
      expect(scrollElements.length).to.be.greaterThan(0);

      // Check that no scroll element name contains apostrophes or curly apostrophes
      scrollElements.forEach(element => {
        const name = element.getAttribute('name');
        expect(name).to.not.include("'"); // single quote
        expect(name).to.not.include('’'); // curly apostrophe
        // Verify the format is chapter{camelCaseName}ScrollElement
        expect(name).to.match(/^chapter[a-zA-Z]+ScrollElement$/);
      });

      // Check that the scroll element for the 'Your contact information' chapter exists with the correct name
      const scrollElement = container.querySelector(
        '[name="chapteryourContactInformationScrollElement"]',
      );
      expect(scrollElement).to.exist;
    });
  });

  describe('UpdatePageButton scroll behavior', () => {
    it('should pass scroll function that calls scrollToChapter with chapter.name (veteransPersonalInformation)', async () => {
      stubReviewCollapsibleChapter();
      stubFileUpload();
      stubStorageAdapter();

      const chapterKey = 'veteransPersonalInformation';
      const chapterTitle = "Veteran's personal information";

      // Spy on the scrollToChapter function to verify it's called with the correct chapter name
      const scrollToChapterStub = sandbox.stub(formUtils, 'scrollToChapter');

      // Variable to capture the editSection function for later use
      let capturedEditSection = null;
      let capturedKeys = null;

      // Stub ReviewSectionContent to capture the editSection function
      sandbox.stub(ReviewSectionContent, 'default').callsFake(props => {
        // Capture the editSection function for the target section
        if (props.title === chapterTitle) {
          capturedEditSection = props.editSection;
          capturedKeys = props.keys;
        }
        return (
          <div data-testid={`review-section-${props.title}`}>
            <span>Mock review section content for {props.title}</span>
          </div>
        );
      });

      // Capture the props passed to UpdatePageButton
      const capturedProps = [];
      sandbox.stub(UpdatePageButton, 'default').callsFake(props => {
        capturedProps.push(props);
        return (
          // eslint-disable-next-line @department-of-veterans-affairs/prefer-button-component
          <button type="button" data-testid={`update-btn-${props.title}`}>
            Update page
          </button>
        );
      });

      const store = createMockStore({
        openChapters: [chapterKey],
        viewedPages: new Set([
          'aboutTheVeteran_aboutmyselfrelationshipfamilymember',
        ]),
        formData: mockData.data,
        form: {
          data: mockData.data,
          pages: {
            // The page key used for veteransPersonalInformation chapter
            /* eslint-disable-next-line camelcase */
            aboutTheVeteran_aboutmyselfrelationshipfamilymember: {
              showPagePerItem: false,
              editMode: false,
            },
          },
          reviewPageView: {
            openChapters: [chapterKey],
            viewedPages: new Set([
              'aboutTheVeteran_aboutmyselfrelationshipfamilymember',
            ]),
          },
        },
      });

      render(
        <Provider store={store}>
          <ReviewPage />
        </Provider>,
      );

      // Verify that the section was rendered and we captured the editSection function
      await waitFor(() => {
        expect(capturedEditSection).to.exist;
      });

      // Manually trigger edit mode by calling the captured editSection
      // This simulates clicking the Edit button
      capturedEditSection(capturedKeys, chapterTitle);

      // Wait for the component to re-render in edit mode and show UpdatePageButton
      await waitFor(() => {
        expect(capturedProps.length).to.be.at.least(1);
      });

      // Verify the scroll element exists in the DOM with the correct name
      const scrollElement = document.querySelector(
        `[name="chapter${chapterKey}ScrollElement"]`,
      );
      expect(scrollElement).to.exist;

      // Call the scroll function passed to UpdatePageButton
      const veteransInfoProps = capturedProps.find(
        p => p.title === chapterTitle,
      );
      await veteransInfoProps.scroll();

      // Verify scrollToChapter was called with the correct chapter name
      expect(scrollToChapterStub.calledWith(chapterKey)).to.be.true;
    });
  });
});
