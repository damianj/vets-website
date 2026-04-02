import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import {
  $,
  $$,
} from '@department-of-veterans-affairs/platform-forms-system/ui';
import { ConfirmationVeteranID } from '../../components/ConfirmationVeteranID';
import { dob, userFullName, veteran } from '../data/veteran';

describe('ConfirmationVeteranID', () => {
  it('should render name, VA file number, and date of birth', () => {
    const { container } = render(
      <ConfirmationVeteranID
        dob={dob}
        userFullName={userFullName}
        vaFileLastFour={veteran().vaFileLastFour}
      />,
    );

    const dts = $$('dt', container);
    expect(dts[0].textContent).to.equal('Name');
    expect(dts[1].textContent).to.equal('VA file number');
    expect(dts[2].textContent).to.equal('Date of birth');

    const name = $('[data-dd-action-name="Veteran full name"]', container);
    expect(name.textContent).to.equal('Mike Wazowski');

    const vafn = $('[data-dd-action-name="VA file number"]', container);
    expect(vafn.textContent).to.include('8765');

    const dobEl = $('[data-dd-action-name="date of birth"]', container);
    expect(dobEl.textContent).to.equal('October 28, 2001');
  });

  it('should not render VA file number when vaFileLastFour is not provided', () => {
    const { container } = render(
      <ConfirmationVeteranID dob={dob} userFullName={userFullName} />,
    );

    const dts = $$('dt', container);
    expect(dts.length).to.equal(2);
    expect(dts[0].textContent).to.equal('Name');
    expect(dts[1].textContent).to.equal('Date of birth');
    expect($('[data-dd-action-name="VA file number"]', container)).to.not.exist;
  });

  it('should render without any data', () => {
    const { container } = render(<ConfirmationVeteranID />);

    expect($$('dt', container).length).to.equal(2);
    expect($('[data-dd-action-name="date of birth"]', container)).to.exist;
    expect($('[data-dd-action-name="VA file number"]', container)).to.not.exist;
  });
});
