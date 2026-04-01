import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { createPersonalInfoConfirmationField } from '../PersonalInfoConfirmationField';
import { defaultConfig } from '../PersonalInformationReview';

const mockProfile = {
  dob: '1985-01-01',
  userFullName: {
    first: 'John',
    middle: 'A',
    last: 'Veteran',
  },
};

const makeStore = (profile = mockProfile) =>
  createStore(() => ({ user: { profile } }));

const renderField = (Component, formData, profile = mockProfile) =>
  render(
    <Provider store={makeStore(profile)}>
      <Component formData={formData} />
    </Provider>,
  );

describe('createPersonalInfoConfirmationField', () => {
  describe('name', () => {
    it('renders first, middle, and last name from Redux profile', () => {
      const Field = createPersonalInfoConfirmationField();
      const { container } = renderField(Field, {});
      expect(container.textContent).to.include('John A Veteran');
    });

    it('renders name without middle when middle is absent', () => {
      const profile = {
        ...mockProfile,
        userFullName: { first: 'John', middle: null, last: 'Veteran' },
      };
      const Field = createPersonalInfoConfirmationField();
      const { container } = renderField(Field, {}, profile);
      expect(container.textContent).to.include('John');
      expect(container.textContent).to.include('Veteran');
    });

    it('omits name entry when config.name.show is false', () => {
      const Field = createPersonalInfoConfirmationField({
        config: { ...defaultConfig, name: { show: false } },
      });
      const { queryByText } = renderField(Field, {});
      expect(queryByText('Name')).to.be.null;
    });
  });

  describe('date of birth', () => {
    it('renders formatted date of birth from Redux profile', () => {
      const Field = createPersonalInfoConfirmationField();
      const { getByText } = renderField(Field, {});
      expect(getByText('January 1, 1985')).to.exist;
    });

    it('omits date of birth when profile.dob is absent', () => {
      const profile = { ...mockProfile, dob: null };
      const Field = createPersonalInfoConfirmationField();
      const { queryByText } = renderField(Field, {}, profile);
      expect(queryByText('Date of birth')).to.be.null;
    });

    it('omits date of birth entry when config.dateOfBirth.show is false', () => {
      const Field = createPersonalInfoConfirmationField({
        config: { ...defaultConfig, dateOfBirth: { show: false } },
      });
      const { queryByText } = renderField(Field, {});
      expect(queryByText('Date of birth')).to.be.null;
    });
  });

  describe('SSN', () => {
    it('renders SSN label when SSN is present', () => {
      const Field = createPersonalInfoConfirmationField({
        dataAdapter: { ssnPath: 'ssn' },
      });
      const { getByText } = renderField(Field, { ssn: '321540987' });
      expect(getByText('Last 4 digits of Social Security number')).to.exist;
    });

    it('masks SSN showing only last 4 digits via SSNWidget', () => {
      const Field = createPersonalInfoConfirmationField({
        dataAdapter: { ssnPath: 'ssn' },
      });
      const { container } = renderField(Field, { ssn: '321540987' });
      expect(container.textContent).to.include('0987');
      expect(container.textContent).to.not.include('32154');
    });

    it('omits SSN entry when SSN is absent', () => {
      const Field = createPersonalInfoConfirmationField();
      const { queryByText } = renderField(Field, {});
      expect(queryByText('Last 4 digits of Social Security number')).to.be.null;
    });

    it('omits SSN entry when config.ssn.show is false', () => {
      const Field = createPersonalInfoConfirmationField({
        config: { ...defaultConfig, ssn: { show: false } },
        dataAdapter: { ssnPath: 'ssn' },
      });
      const { queryByText } = renderField(Field, { ssn: '321540987' });
      expect(queryByText('Last 4 digits of Social Security number')).to.be.null;
    });

    it('uses dataAdapter to find SSN at a custom path', () => {
      const Field = createPersonalInfoConfirmationField({
        dataAdapter: { ssnPath: 'idNumber.ssn' },
      });
      const { getByText } = renderField(Field, {
        idNumber: { ssn: '321540987' },
      });
      expect(getByText('Last 4 digits of Social Security number')).to.exist;
    });
  });

  describe('VA file number', () => {
    it('renders VA file number label when configured and present', () => {
      const Field = createPersonalInfoConfirmationField({
        config: { ...defaultConfig, vaFileNumber: { show: true } },
        dataAdapter: { vaFileNumberPath: 'vaFileNumber' },
      });
      const { getByText } = renderField(Field, { vaFileNumber: '1234' });
      expect(getByText('Last 4 digits of VA file number')).to.exist;
    });

    it('omits VA file number when config.vaFileNumber.show is false', () => {
      const Field = createPersonalInfoConfirmationField({
        config: { ...defaultConfig, vaFileNumber: { show: false } },
      });
      const { queryByText } = renderField(Field, { vaFileNumber: '1234' });
      expect(queryByText('Last 4 digits of VA file number')).to.be.null;
    });
  });
});
