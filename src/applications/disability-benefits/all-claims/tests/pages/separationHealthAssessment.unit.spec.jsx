import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { DefinitionTester } from '@department-of-veterans-affairs/platform-testing/schemaform-utils';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';

import formConfig from '../../config/form';
import { schema, uiSchema } from '../../pages/separationHealthAssessment';

const getPageObject = testFixture => {
  return {
    getSeparationHealthAssessmentPageTitle: () =>
      testFixture.getByText('Your Separation Health Assessment'),
    getSeparationHealthAssessmentAlertWarningTitle: () =>
      testFixture.getByText('Submit your Separation Health Assessment'),
    getSeparationHealthAssessmentAlertWarningDescription: () =>
      testFixture.getByText(
        'You must submit a Separation Health Assessment (self-assessment, also called “Part A”).',
      ),
    triggerYesSelection: () => {
      $('va-radio', testFixture.container).__events.vaValueChange({
        detail: { value: 'Y' },
      });
    },
    triggerNoSelection: () => {
      $('va-radio', testFixture.container).__events.vaValueChange({
        detail: { value: 'N' },
      });
    },
  };
};

describe('separationHealthAssessmentUpload page', () => {
  it('should render', () => {
    const testFixture = render(
      <DefinitionTester
        definitions={formConfig}
        schema={schema}
        uiSchema={uiSchema}
        data={{}}
        formData={{}}
      />,
    );
    const page = getPageObject(testFixture);
    expect(page.getSeparationHealthAssessmentPageTitle()).to.exist;
    expect(page.getSeparationHealthAssessmentAlertWarningTitle()).to.exist;
    expect(page.getSeparationHealthAssessmentAlertWarningDescription()).to
      .exist;

    // Regardless of interaction, the page should still show the warning by design
    page.triggerYesSelection();
    expect(page.getSeparationHealthAssessmentAlertWarningTitle()).to.exist;
    expect(page.getSeparationHealthAssessmentAlertWarningDescription()).to
      .exist;

    page.triggerNoSelection();
    expect(page.getSeparationHealthAssessmentAlertWarningTitle()).to.exist;
    expect(page.getSeparationHealthAssessmentAlertWarningDescription()).to
      .exist;
  });
});
