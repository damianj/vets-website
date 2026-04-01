import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { createContactInfoConfirmationField } from '../ContactInfoConfirmationField';

const defaultKeys = {
  wrapper: 'veteran',
  address: 'mailingAddress',
  mobilePhone: 'mobilePhone',
  homePhone: 'homePhone',
  email: 'email',
};

const baseFormData = {
  veteran: {
    mailingAddress: {
      addressLine1: '123 Main St',
      city: 'Providence',
      stateCode: 'RI',
      zipCode: '02903',
      countryCodeIso3: 'USA',
      addressType: 'DOMESTIC',
    },
    mobilePhone: { areaCode: '415', phoneNumber: '3452394' },
    homePhone: { areaCode: '555', phoneNumber: '5552852' },
    email: { emailAddress: 'email@domain.com' },
  },
};

describe('createContactInfoConfirmationField', () => {
  describe('mailing address', () => {
    it('renders mailing address label and formatted street', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const { getByText } = render(<Field formData={baseFormData} />);
      expect(getByText('Mailing address')).to.exist;
      expect(getByText('123 Main St')).to.exist;
      expect(getByText('Providence, RI 02903')).to.exist;
    });

    it('omits mailing address when keys.address is absent', () => {
      const keys = { ...defaultKeys, address: undefined };
      const Field = createContactInfoConfirmationField({ keys });
      const { queryByText } = render(<Field formData={baseFormData} />);
      expect(queryByText('Mailing address')).to.be.null;
    });

    it('omits mailing address when addressLine1 is absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const formData = {
        veteran: { ...baseFormData.veteran, mailingAddress: {} },
      };
      const { queryByText } = render(<Field formData={formData} />);
      expect(queryByText('Mailing address')).to.be.null;
    });
  });

  describe('phone', () => {
    it('renders mobile phone when present', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const { getByText } = render(<Field formData={baseFormData} />);
      expect(getByText('(415) 345-2394')).to.exist;
    });

    it('falls back to home phone when mobile is absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const formData = {
        veteran: { ...baseFormData.veteran, mobilePhone: {} },
      };
      const { getByText } = render(<Field formData={formData} />);
      expect(getByText('(555) 555-2852')).to.exist;
    });

    it('renders phone with extension', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const formData = {
        veteran: {
          ...baseFormData.veteran,
          mobilePhone: {
            areaCode: '415',
            phoneNumber: '3452394',
            extension: '99',
          },
        },
      };
      const { getByText } = render(<Field formData={formData} />);
      expect(getByText('(415) 345-2394 x99')).to.exist;
    });

    it('omits phone when both mobile and home are absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const formData = {
        veteran: {
          ...baseFormData.veteran,
          mobilePhone: {},
          homePhone: {},
        },
      };
      const { queryByText } = render(<Field formData={formData} />);
      expect(queryByText('Phone')).to.be.null;
    });

    it('prefers home phone when phonePreference is "home"', () => {
      const Field = createContactInfoConfirmationField({
        keys: defaultKeys,
        phonePreference: 'home',
      });
      const { getByText } = render(<Field formData={baseFormData} />);
      expect(getByText('(555) 555-2852')).to.exist;
    });

    it('falls back to mobile when phonePreference is "home" but home is absent', () => {
      const Field = createContactInfoConfirmationField({
        keys: defaultKeys,
        phonePreference: 'home',
      });
      const formData = {
        veteran: { ...baseFormData.veteran, homePhone: {} },
      };
      const { getByText } = render(<Field formData={formData} />);
      expect(getByText('(415) 345-2394')).to.exist;
    });

    it('omits phone when keys contain neither mobilePhone nor homePhone', () => {
      const keys = {
        wrapper: 'veteran',
        address: 'mailingAddress',
        email: 'email',
      };
      const Field = createContactInfoConfirmationField({ keys });
      const { queryByText } = render(<Field formData={baseFormData} />);
      expect(queryByText('Phone')).to.be.null;
    });
  });

  describe('email', () => {
    it('renders email address', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const { getByText } = render(<Field formData={baseFormData} />);
      expect(getByText('email@domain.com')).to.exist;
    });

    it('omits email when keys.email is absent', () => {
      const keys = { ...defaultKeys, email: undefined };
      const Field = createContactInfoConfirmationField({ keys });
      const { queryByText } = render(<Field formData={baseFormData} />);
      expect(queryByText('Email address')).to.be.null;
    });

    it('omits email when emailAddress is absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const formData = {
        veteran: { ...baseFormData.veteran, email: {} },
      };
      const { queryByText } = render(<Field formData={formData} />);
      expect(queryByText('Email address')).to.be.null;
    });
  });

  describe('empty data', () => {
    it('renders without crashing when veteran data is absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const { container } = render(<Field formData={{}} />);
      expect(container).to.exist;
    });

    it('renders without crashing when formData is absent', () => {
      const Field = createContactInfoConfirmationField({ keys: defaultKeys });
      const { container } = render(<Field />);
      expect(container).to.exist;
    });
  });
});
