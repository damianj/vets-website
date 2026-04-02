import React from 'react';
import { expect } from 'chai';
import { render, fireEvent, waitFor } from '@testing-library/react';
import sinon from 'sinon-v20';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../config/form';
import {
  facilityTypeChoices,
  facilityTypeList,
  facilityTypeReviewField as ReviewField,
} from '../../content/facilityTypes';

describe('Supplemental Claims option for facility type page', () => {
  const { schema, uiSchema } = formConfig.chapters.evidence.pages.facilityTypes;
  let onSubmit;

  beforeEach(() => {
    onSubmit = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  const renderContainer = (data = {}, formData = {}) => {
    return render(
      <DefinitionTester
        definitions={{}}
        schema={schema}
        uiSchema={uiSchema}
        data={data}
        formData={formData}
        onSubmit={onSubmit}
      />,
    );
  };

  describe('initial render', () => {
    it('should render with correct structure and attributes', () => {
      const { container } = renderContainer();

      const group = $('va-checkbox-group', container);
      expect(group).to.exist;
      expect(group.getAttribute('required')).to.eq('true');
      expect(group.getAttribute('label-header-level')).to.eq('3');
    });

    it('should render all 6 facility type unchecked checkboxes', () => {
      const { container } = renderContainer();
      const checkboxes = $$('va-checkbox', container);
      const checkedBoxes = $$('va-checkbox[checked]', container);

      expect(checkboxes.length).to.eq(6);
      expect(checkedBoxes.length).to.eq(0);
      expect($('va-checkbox-group[error]', container)).to.not.exist;
    });
  });

  describe('validation', () => {
    it('should show error when submitting without selecting any options', async () => {
      const { container } = renderContainer();

      fireEvent.click($('button[type="submit"]', container));

      await waitFor(() => {
        expect($('va-checkbox-group[error]', container)).to.exist;
        expect(onSubmit.called).to.be.false;
      });
    });
  });

  describe('checkbox selection and submission', () => {
    it('should submit when vamc checkbox is checked', async () => {
      const { container } = renderContainer({ facilityTypes: { vamc: true } });

      fireEvent.click($('button[type="submit"]', container));

      await waitFor(() => {
        expect($('va-checkbox-group[error]', container)).to.not.exist;
        expect(onSubmit.called).to.be.true;
      });
    });

    it('should submit when multiple checkboxes are checked', async () => {
      const { container } = renderContainer({
        facilityTypes: { vamc: true, ccp: true, nonVa: true },
      });

      fireEvent.click($('button[type="submit"]', container));

      await waitFor(() => {
        expect($('va-checkbox-group[error]', container)).to.not.exist;
        expect(onSubmit.called).to.be.true;
      });
    });

    it('should submit when the "other" input is filled', async () => {
      const { container } = renderContainer({
        facilityTypes: { other: 'test' },
      });

      fireEvent.click($('button[type="submit"]', container));

      await waitFor(() => {
        expect($('va-checkbox-group[error]', container)).to.not.exist;
        expect(onSubmit.called).to.be.true;
      });
    });

    it('should persist selected checkboxes in form data', () => {
      const { container } = renderContainer({
        facilityTypes: { vamc: true, ccp: true },
      });

      const checkedBoxes = $$('va-checkbox[checked]', container);

      expect(checkedBoxes.length).to.eq(2);
    });
  });
});

describe('facilityTypeList', () => {
  const renderList = data => render(<>{facilityTypeList(data)}</>);

  it('should render a single choice as a list item', () => {
    const { container } = renderList({ vamc: true });
    const items = $$('li', container);

    expect(items.length).to.equal(1);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vamc);
  });

  it('should render multiple choices as list items', () => {
    const { container } = renderList({
      vetCenter: true,
      cboc: true,
      mtf: true,
    });
    const items = $$('li', container);

    expect(items.length).to.equal(3);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vetCenter.title);
    expect(items[1].textContent).to.equal(facilityTypeChoices.cboc);
    expect(items[2].textContent).to.equal(facilityTypeChoices.mtf);
  });

  it('should handle an unknown choice gracefully', () => {
    const { container } = renderList({
      vamc: true,
      other: 'testing',
      other2: true,
    });
    const items = $$('li', container);

    expect(items.length).to.equal(3);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vamc);
    expect(items[1].textContent).to.equal('testing');
    expect(items[2].textContent).to.equal('Unknown facility type choice');
  });

  it('should render no list items for empty or invalid values', () => {
    expect($$('li', renderList({}).container).length).to.equal(0);
    expect($$('li', renderList(null).container).length).to.equal(0);
    expect($$('li', renderList(undefined).container).length).to.equal(0);
  });

  it('should include custom other text when provided', () => {
    const { container } = renderList({
      vamc: true,
      other: 'Custom facility name',
    });
    const items = $$('li', container);

    expect(items.length).to.equal(2);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vamc);
    expect(items[1].textContent).to.equal('Custom facility name');
  });

  it('should add bottom margin class to all items except the last', () => {
    const { container } = renderList({ vamc: true, ccp: true, mtf: true });
    const items = $$('li', container);

    expect(items[0].className).to.include('vads-u-margin-bottom--1p5');
    expect(items[1].className).to.include('vads-u-margin-bottom--1p5');
    expect(items[2].className).to.not.include('vads-u-margin-bottom--1p5');
  });
});

describe('facilityTypeReviewField', () => {
  it('should render a single choice in the review field', () => {
    const { container } = render(<ReviewField formData={{ vamc: true }} />);
    const items = $$('li', container);

    expect(items.length).to.equal(1);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vamc);
  });

  it('should render multiple choices in the review field', () => {
    const { container } = render(
      <ReviewField formData={{ vetCenter: true, cboc: true, mtf: true }} />,
    );
    const items = $$('li', container);

    expect(items.length).to.equal(3);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vetCenter.title);
    expect(items[1].textContent).to.equal(facilityTypeChoices.cboc);
    expect(items[2].textContent).to.equal(facilityTypeChoices.mtf);
  });

  it('should handle unknown choice in the review field', () => {
    const { container } = render(
      <ReviewField formData={{ vamc: true, other: 'testing', other2: true }} />,
    );
    const items = $$('li', container);

    expect(items.length).to.equal(3);
    expect(items[0].textContent).to.equal(facilityTypeChoices.vamc);
    expect(items[1].textContent).to.equal('testing');
    expect(items[2].textContent).to.equal('Unknown facility type choice');
  });

  it('should handle empty data gracefully in the review field', () => {
    const { container } = render(<ReviewField formData={{}} />);

    expect($('dd', container)).to.exist;
    expect($$('li', container).length).to.equal(0);
  });

  it('should display custom other text in the review field', () => {
    const { container } = render(
      <ReviewField formData={{ other: 'My custom facility' }} />,
    );
    const items = $$('li', container);

    expect(items.length).to.equal(1);
    expect(items[0].textContent).to.equal('My custom facility');
  });
});
