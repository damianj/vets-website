import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import { GetHelpContent } from '../../components/GetHelpContent';

describe('<GetHelpContent>', () => {
  let container;

  beforeEach(() => {
    ({ container } = render(<GetHelpContent />));
  });

  it('should render 3 va-telephone elements', () => {
    expect($$('va-telephone', container).length).to.equal(3);
  });

  it('should render the COE loan guaranty phone number', () => {
    const phones = $$('va-telephone', container);
    const contacts = Array.from(phones).map(el => el.getAttribute('contact'));
    expect(contacts).to.include('8778273702');
  });

  it('should render the VA main information line phone number', () => {
    const phones = $$('va-telephone', container);
    const contacts = Array.from(phones).map(el => el.getAttribute('contact'));
    expect(contacts).to.include('8006982411');
  });

  it('should render a TTY va-telephone element', () => {
    const ttyPhone = $$('va-telephone[tty]', container);
    expect(ttyPhone.length).to.equal(1);
  });

  it('should render 2 va-link elements', () => {
    expect($$('va-link', container).length).to.equal(2);
  });

  it('should render a link to get help from an accredited representative', () => {
    const link = $('va-link[text="Get help submitting a request"]', container);
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      '/get-help-from-accredited-representative/',
    );
  });

  it('should render a link to contact us online through Ask VA', () => {
    const link = $(
      'va-link[text="Contact us online through Ask VA"]',
      container,
    );
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal(
      '/contact-us/ask-va/introduction/',
    );
  });

  it('should render an hr divider', () => {
    expect($('hr', container)).to.exist;
  });
});
