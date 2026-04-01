import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import {
  DefinitionTester,
  getFormDOM,
} from 'platform/testing/unit/schemaform-utils';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import incomeSources from '../../../../config/chapters/06-financial-information/incomeAndAssets/incomeSources';

describe('Income sources page', () => {
  const { schema, uiSchema } = incomeSources;
  it('renders the income sources page', async () => {
    const form = render(
      <DefinitionTester schema={schema} uiSchema={uiSchema} data={{}} />,
    );

    const formDOM = getFormDOM(form);
    const vaRadios = $$('va-radio', formDOM);
    const vaRadioOptions = $$('va-radio-option', formDOM);
    const vaAdditionalInfos = $$('va-additional-info', formDOM);
    const vaIncomeSourcesRadio = $(
      'va-radio[label*="Do you or your dependents have more than 4 sources of income?"]',
      formDOM,
    );
    const vaOtherIncomeRadio = $(
      'va-radio[label*="Other than Social Security, did you or your dependents receive any income last year that you no longer receive?"]',
      formDOM,
    );
    const vaAlerts = $$('va-alert-expandable', formDOM);

    expect(form.getByRole('heading')).to.have.text('Income sources');

    expect(vaRadios.length).to.equal(2);
    expect(vaIncomeSourcesRadio.getAttribute('required')).to.equal('true');
    expect(vaOtherIncomeRadio.getAttribute('required')).to.equal('true');
    expect(vaRadioOptions.length).to.equal(4);
    expect(vaRadioOptions[0].getAttribute('label')).to.equal('Yes');
    expect(vaRadioOptions[1].getAttribute('label')).to.equal('No');
    expect(vaRadioOptions[2].getAttribute('label')).to.equal('Yes');
    expect(vaRadioOptions[3].getAttribute('label')).to.equal('No');

    expect(vaAdditionalInfos.length).to.equal(0);
    expect(vaAlerts.length).to.equal(0);
    vaIncomeSourcesRadio.__events.vaValueChange({
      detail: { value: 'Y' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(1);
    vaOtherIncomeRadio.__events.vaValueChange({
      detail: { value: 'Y' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(2);
  });

  describe('incomeAssetStatementFormAlert hideIf (is2025Enabled = true)', () => {
    const { hideIf } = uiSchema.incomeAssetStatementFormAlert['ui:options'];

    it('hides alert when moreThanFourIncomeSources is ONE_TO_FOUR_SOURCES', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'ONE_TO_FOUR_SOURCES',
        }),
      ).to.be.true;
    });

    it('shows alert when moreThanFourIncomeSources is MORE_THAN_FIVE_SOURCES', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'MORE_THAN_FIVE_SOURCES',
        }),
      ).to.be.false;
    });

    it('hides alert when moreThanFourIncomeSources is NO_INCOME', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'NO_INCOME',
        }),
      ).to.be.true;
    });

    it('hides alert when moreThanFourIncomeSources is unset', () => {
      expect(hideIf({ survivorsBenefitsForm2025VersionEnabled: true })).to.be
        .true;
    });
  });

  describe('incomeAssetStatementFormAlert hideIf (is2025Enabled = false)', () => {
    const { hideIf } = uiSchema.incomeAssetStatementFormAlert['ui:options'];

    it('shows alert when moreThanFourIncomeSources is Y', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: false,
          moreThanFourIncomeSources: 'Y',
        }),
      ).to.be.false;
    });

    it('hides alert when moreThanFourIncomeSources is N', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: false,
          moreThanFourIncomeSources: 'N',
        }),
      ).to.be.true;
    });

    it('shows alert when moreThanFourIncomeSources is true', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: false,
          moreThanFourIncomeSources: true,
        }),
      ).to.be.false;
    });

    it('hides alert when moreThanFourIncomeSources is unset', () => {
      expect(hideIf({})).to.be.true;
    });
  });

  describe('incomeAssetStatementFormAlertOtherIncome hideIf', () => {
    const { hideIf } = uiSchema.incomeAssetStatementFormAlertOtherIncome[
      'ui:options'
    ];

    it('shows alert when otherIncome is Y', () => {
      expect(hideIf({ otherIncome: 'Y' })).to.be.false;
    });

    it('hides alert when otherIncome is N', () => {
      expect(hideIf({ otherIncome: 'N' })).to.be.true;
    });

    it('hides alert when otherIncome is unset', () => {
      expect(hideIf({})).to.be.true;
    });
  });
});

describe('Income sources 2025 page', () => {
  const { schema2025, uiSchema2025 } = incomeSources;

  it('renders the income sources page with 2025 radio options', () => {
    const form = render(
      <DefinitionTester
        schema={schema2025}
        uiSchema={uiSchema2025}
        data={{ survivorsBenefitsForm2025VersionEnabled: true }}
      />,
    );

    const formDOM = getFormDOM(form);
    const vaRadioOptions = $$('va-radio-option', formDOM);
    const vaIncomeSourcesRadio = $(
      'va-radio[label*="How many income sources does your family have?"]',
      formDOM,
    );
    const vaOtherIncomeRadio = $(
      'va-radio[label*="Other than Social Security"]',
      formDOM,
    );

    expect(form.getByRole('heading')).to.have.text('Income sources');
    expect(vaIncomeSourcesRadio).to.exist;
    expect(vaIncomeSourcesRadio.getAttribute('required')).to.equal('true');

    // 3 income source options + 2 yes/no options for otherIncome
    expect(vaRadioOptions.length).to.equal(5);
    expect(vaRadioOptions[0].getAttribute('label')).to.equal('No income');
    expect(vaRadioOptions[1].getAttribute('label')).to.equal(
      '1-4 sources of income',
    );
    expect(vaRadioOptions[2].getAttribute('label')).to.equal(
      '5+ sources of income',
    );

    // No alerts shown initially
    expect($$('va-alert-expandable', formDOM).length).to.equal(0);

    // Alert shows when MORE_THAN_FIVE_SOURCES is selected
    vaIncomeSourcesRadio.__events.vaValueChange({
      detail: { value: 'MORE_THAN_FIVE_SOURCES' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(1);

    // Alert hides when ONE_TO_FOUR_SOURCES is selected
    vaIncomeSourcesRadio.__events.vaValueChange({
      detail: { value: 'ONE_TO_FOUR_SOURCES' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(0);

    // Alert hides when NO_INCOME is selected
    vaIncomeSourcesRadio.__events.vaValueChange({
      detail: { value: 'NO_INCOME' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(0);

    // otherIncome alert shows when Y is selected
    vaOtherIncomeRadio.__events.vaValueChange({
      detail: { value: 'Y' },
    });
    expect($$('va-alert-expandable', formDOM).length).to.equal(1);
  });

  describe('incomeAssetStatementFormAlert hideIf (is2025Enabled = true)', () => {
    const { hideIf } = uiSchema2025.incomeAssetStatementFormAlert['ui:options'];

    it('hides alert when moreThanFourIncomeSources is NO_INCOME', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'NO_INCOME',
        }),
      ).to.be.true;
    });

    it('hides alert when moreThanFourIncomeSources is ONE_TO_FOUR_SOURCES', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'ONE_TO_FOUR_SOURCES',
        }),
      ).to.be.true;
    });

    it('shows alert when moreThanFourIncomeSources is MORE_THAN_FIVE_SOURCES', () => {
      expect(
        hideIf({
          survivorsBenefitsForm2025VersionEnabled: true,
          moreThanFourIncomeSources: 'MORE_THAN_FIVE_SOURCES',
        }),
      ).to.be.false;
    });

    it('hides alert when moreThanFourIncomeSources is unset', () => {
      expect(hideIf({ survivorsBenefitsForm2025VersionEnabled: true })).to.be
        .true;
    });
  });
});
