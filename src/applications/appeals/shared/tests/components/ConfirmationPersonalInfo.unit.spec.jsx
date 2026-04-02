import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import { $ } from '@department-of-veterans-affairs/platform-forms-system/ui';
import ConfirmationPersonalInfo from '../../components/ConfirmationPersonalInfo';
import { APP_NAME as SC_NAME } from '../../../995/constants';
import { dob, userFullName, veteran } from '../data/veteran';

describe('ConfirmationPersonalInfo', () => {
  it('should render the proper content for HLR & NOD when appropriate', () => {
    const { container } = render(
      <ConfirmationPersonalInfo
        dob={dob}
        homeless
        userFullName={userFullName}
        veteran={veteran()}
      />,
    );

    expect($('[data-dd-action-name="date of birth"]', container)).to.exist;
    expect($('[data-dd-action-name="email address"]', container)).to.exist;
  });

  describe('housing risk question', () => {
    it('should render "Yes" for HLR & NOD when appropriate', () => {
      const { container } = render(
        <ConfirmationPersonalInfo
          dob={dob}
          homeless
          userFullName={userFullName}
          veteran={veteran()}
        />,
      );

      const dd = $('[data-dd-action-name="homeless"]', container);
      expect(dd.textContent).to.equal('Yes');
    });

    it('should render "No" for HLR & NOD when appropriate', () => {
      const { container } = render(
        <ConfirmationPersonalInfo
          dob={dob}
          homeless={false}
          userFullName={userFullName}
          veteran={veteran()}
        />,
      );

      const dd = $('[data-dd-action-name="homeless"]', container);
      expect(dd.textContent).to.equal('No');
    });

    it('should render "Not answered" for HLR & NOD when appropriate', () => {
      const { container } = render(
        <ConfirmationPersonalInfo
          dob={dob}
          userFullName={userFullName}
          veteran={veteran()}
        />,
      );

      const dd = $('[data-dd-action-name="homeless"]', container);
      expect(dd.textContent).to.equal('Not answered');
    });

    it('should not render the housing risk question when appName is Supplemental Claim', () => {
      const { container } = render(
        <ConfirmationPersonalInfo
          appName={SC_NAME}
          dob={dob}
          homeless
          userFullName={userFullName}
          veteran={veteran()}
        />,
      );

      const dd = $('[data-dd-action-name="homeless"]', container);
      expect(dd).to.not.exist;
      expect($('[data-dd-action-name="date of birth"]', container)).to.exist;
      expect($('[data-dd-action-name="email address"]', container)).to.exist;
    });
  });

  it('should render without any data', () => {
    const { container } = render(<ConfirmationPersonalInfo />);

    expect($('h3', container).textContent).to.equal('Personal information');
    expect($('dl', container)).to.exist;
    expect($('[data-dd-action-name="date of birth"]', container)).to.exist;
    expect($('[data-dd-action-name="homeless"]', container)).to.exist;
    expect($('[data-dd-action-name="email address"]', container)).to.exist;
  });
});
