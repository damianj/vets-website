import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import {
  DefinitionTester,
  getFormDOM,
} from 'platform/testing/unit/schemaform-utils';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import marriageStatus from '../../../../config/chapters/04-household-information/marriageStatus';

describe('Marriage Status Page', () => {
  const { schema, uiSchema } = marriageStatus;

  it('renders the marriage status page with the correct heading', () => {
    const form = render(
      <DefinitionTester schema={schema} uiSchema={uiSchema} data={{}} />,
    );

    expect(form.getByRole('heading')).to.have.text('Marriage status');
  });

  it('renders a single required va-radio for livedContinuouslyWithVeteran', () => {
    const form = render(
      <DefinitionTester schema={schema} uiSchema={uiSchema} data={{}} />,
    );
    const formDOM = getFormDOM(form);
    const vaRadios = $$('va-radio', formDOM);

    expect(vaRadios.length).to.equal(1);

    const vaRadio = $(
      'va-radio[label="Did you live continuously with the Veteran from the date of marriage to the date of their death?"]',
      formDOM,
    );

    expect(vaRadio).to.exist;
    expect(vaRadio.getAttribute('required')).to.equal('true');
  });

  it('renders the va-additional-info component with the correct trigger text', () => {
    const form = render(
      <DefinitionTester schema={schema} uiSchema={uiSchema} data={{}} />,
    );
    const formDOM = getFormDOM(form);

    const additionalInfo = $(
      'va-additional-info[trigger="What we consider living continuously together"]',
      formDOM,
    );

    expect(additionalInfo).to.exist;
  });

  it('schema requires livedContinuouslyWithVeteran', () => {
    expect(schema.required).to.include('livedContinuouslyWithVeteran');
  });

  it('view:livingContinuouslyInfo has displayEmptyObjectOnReview set to true', () => {
    expect(
      uiSchema['view:livingContinuouslyInfo']['ui:options']
        .displayEmptyObjectOnReview,
    ).to.equal(true);
  });
});
