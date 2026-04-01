import React from 'react';
import { expect } from 'chai';
import { renderWithStoreAndRouter } from 'platform/testing/unit/react-testing-library-helpers';
import {
  $,
  $$,
} from '@department-of-veterans-affairs/platform-forms-system/ui';
import { TOGGLE_NAMES } from 'platform/utilities/feature-toggles';
import ProgramApprovalInformation from '../../../../components/MainContent/Update/ProgramApprovalInformation';

describe('ProgramApprovalInformation', () => {
  it('Should render form 10275 link when toggle ON', () => {
    const { container } = renderWithStoreAndRouter(
      <ProgramApprovalInformation />,
      {
        initialState: {
          featureToggles: {
            [TOGGLE_NAMES.form10275Release]: true,
          },
        },
      },
    );

    const valink = $('va-link[data-testid="form-10275-link"]', container);
    expect(valink.getAttribute('text')).to.contain(
      'Commit to the Principles of Excellence for educational institutions',
    );
    const links = $$('va-link', container);
    expect(links.length).to.eq(12);
  });

  it('Should not render form 10275 link when toggle OFF', () => {
    const { container } = renderWithStoreAndRouter(
      <ProgramApprovalInformation />,
      {
        initialState: {
          featureToggles: {
            [TOGGLE_NAMES.form10275Release]: false,
          },
        },
      },
    );

    const links = $$('va-link', container);
    const linkTexts = links.map(link => link.getAttribute('text'));

    expect(links.length).to.eq(11);
    expect(linkTexts).to.deep.equal([
      'GI Bill® Comparison Tool',
      'Licensing & certification tests and test preparatory courses',
      'National Exams',
      'Program approvals',
      'Foreign program approvals',
      'VET TEC 2.0 Approvals',
      'Federal on-the-job training/apprenticeship approvals',
      'VALOR ACT Approvals',
      'Yellow Ribbon Program',
      'Principles of Excellence',
      'State Approving Agency contact information',
    ]);
  });
});
