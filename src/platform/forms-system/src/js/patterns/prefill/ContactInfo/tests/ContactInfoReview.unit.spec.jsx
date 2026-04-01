import React from 'react';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';
import sinon from 'sinon';
import vapProfile from '@@vap-svc/tests/fixtures/mockVapProfile.json';
import { ADDRESS_TYPES } from 'platform/forms/address/helpers';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import { getContent } from 'platform/forms-system/src/js/utilities/data/profile';
import clone from 'platform/forms-system/src/js/utilities/data/clone';
import ContactInfoReview from '../ContactInfoReview';

const getData = ({
  home = true,
  mobile = true,
  email = true,
  address = true,
  editPage = () => {},
  requiredKeys = ['homePhone|mobilePhone', 'email', 'mailingAddress'],
} = {}) => ({
  data: {
    veteran: {
      // cloning vapProfile data because within the unit tests we target and
      // change some data values
      email: email ? vapProfile.email.emailAddress : null,
      mobilePhone: mobile ? clone(vapProfile.mobilePhone) : null,
      homePhone: home ? clone(vapProfile.homePhone) : null,
      mailingAddress: address ? clone(vapProfile.mailingAddress) : null,
    },
  },
  editPage,

  keys: {
    wrapper: 'veteran',
    homePhone: 'homePhone',
    mobilePhone: 'mobilePhone',
    email: 'email',
    address: 'mailingAddress',
  },
  requiredKeys,
  content: getContent(),
  contactInfoPageKey: 'confirmContactInfo',
});

describe('<ContactInfoReview>', () => {
  const content = getContent();
  it('should render all review page contact data', () => {
    const data = getData();
    const { container } = render(<ContactInfoReview {...data} />);

    expect($('va-button.edit-page', container)).to.exist;
    expect($('h3', container).textContent).to.eq(content.title);
    expect(
      $$('dd.dd-privacy-hidden[data-dd-action-name]', container).length,
    ).to.eq(9);
    expect($(`[name="${data.contactInfoPageKey}ScrollElement"]`, container)).to
      .exist;

    const els = $$('dt', container);
    expect(els.length).to.eq(9);
    expect(els.map(el => el.textContent)).to.deep.equal([
      'Country',
      'Street address',
      'Street address line 2',
      'City',
      'State',
      'Zip code',
      'Email address',
      'Home phone number',
      'Mobile phone number',
    ]);
  });
  it('should render all contact data, except home phone on review page', () => {
    const data = getData({ home: false });
    const { container } = render(<ContactInfoReview {...data} />);

    expect($('h3', container).textContent).to.eq(content.title);
    // homePhone, mobilePhone, email, country, street address, address line 2,
    // city, state, zip
    expect($$('dt', container).length).to.eq(9);
    expect(container.innerHTML).to.contain('Not provided');
  });
  it('should render international address', () => {
    const data = getData({ address: false });
    data.data.veteran.mailingAddress = {
      addressLine1: 'Great Russell Street',
      addressType: ADDRESS_TYPES.international,
      city: 'London',
      countryName: 'United Kingdom',
      countryCodeIso3: 'GBR',
      internationalPostalCode: 'WC1B 3DG',
    };
    const { container } = render(<ContactInfoReview {...data} />);
    // 3 missing errors: country, street address, city
    const els = $$('dt', container);
    expect(els.length).to.eq(7);
    expect(els.map(el => el.textContent)).to.deep.equal([
      'Country',
      'Street address',
      'City',
      'Postal code',
      'Email address',
      'Home phone number',
      'Mobile phone number',
    ]);
  });

  it('should call editPage callback', () => {
    const editPageSpy = sinon.spy();
    const data = getData({ editPage: editPageSpy });
    const { container } = render(<ContactInfoReview {...data} />);

    fireEvent.click($('va-button.edit-page', container));

    expect(editPageSpy.called).to.be.true;
  });

  // Missing data
  it('should show "Not provided" for missing phone & email', () => {
    const data = getData({
      home: false,
      mobile: false,
      email: false,
    });
    const { container } = render(<ContactInfoReview {...data} />);
    const dds = $$('dd.dd-privacy-hidden', container);
    const notProvidedCount = dds.filter(el => el.textContent === 'Not provided')
      .length;
    expect(notProvidedCount).to.eq(3);
  });

  it('should show "Not provided" for missing U.S. address fields', () => {
    const data = getData({ address: false });
    const { container } = render(<ContactInfoReview {...data} />);
    const dds = $$('dd.dd-privacy-hidden', container);
    const notProvidedCount = dds.filter(el => el.textContent === 'Not provided')
      .length;
    // missing: email, country, street address, city, state, zip
    expect(notProvidedCount).to.eq(6);
  });

  it('should show "Not provided" for missing international address fields', () => {
    const data = getData({ address: false });
    data.data.veteran.mailingAddress = {
      addressType: ADDRESS_TYPES.international,
    };
    const { container } = render(<ContactInfoReview {...data} />);
    const dds = $$('dd.dd-privacy-hidden', container);
    const notProvidedCount = dds.filter(el => el.textContent === 'Not provided')
      .length;
    // missing: email, country, street address, city
    expect(notProvidedCount).to.eq(4);
  });

  it('should show "Not provided" for invalid phone & zip code', () => {
    const data = getData();
    data.data.veteran.mailingAddress.zipCode = '123';
    data.data.veteran.homePhone.areaCode = '3';
    data.data.veteran.mobilePhone.areaCode = '3';
    const { container } = render(<ContactInfoReview {...data} />);
    const dds = $$('dd.dd-privacy-hidden', container);
    const notProvidedCount = dds.filter(el => el.textContent === 'Not provided')
      .length;
    // invalid: phone x2, email & zip
    expect(notProvidedCount).to.eq(4);
  });

  it('should show "Not provided" for invalid phone & no zip error for non-U.S. address', () => {
    const data = getData();
    data.data.veteran.mailingAddress.zipCode = '123';
    data.data.veteran.mailingAddress.addressType = ADDRESS_TYPES.international;
    data.data.veteran.homePhone.areaCode = '3';
    data.data.veteran.mobilePhone.areaCode = '3';
    const { container } = render(<ContactInfoReview {...data} />);
    const dds = $$('dd.dd-privacy-hidden', container);
    const notProvidedCount = dds.filter(el => el.textContent === 'Not provided')
      .length;
    // invalid: phone x2 & email
    expect(notProvidedCount).to.eq(3);
  });
});
