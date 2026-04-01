import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import { cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';
import reducer from '../../../reducers';
import InProductionEducationAlert from '../../../components/shared/InProductionEducationAlert';
import * as SmApi from '../../../api/SmApi';

describe('InProductionEducationAlert', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    cleanup();
  });

  const cernerDrupalData = {
    vamcEhrData: {
      data: {
        cernerFacilities: [{ vhaId: '528' }],
      },
    },
  };

  const nonCernerDrupalData = {
    vamcEhrData: {
      data: {
        cernerFacilities: [],
      },
    },
  };

  const visibleState = {
    sm: {
      tooltip: {
        tooltipVisible: true,
        tooltipId: 'mock-tooltip-id',
        error: undefined,
      },
    },
    user: {
      profile: {
        facilities: [{ facilityId: '528' }],
      },
    },
    drupalStaticData: cernerDrupalData,
  };

  const hiddenState = {
    sm: {
      tooltip: {
        tooltipVisible: false,
        tooltipId: undefined,
        error: undefined,
      },
    },
    user: {
      profile: {
        facilities: [{ facilityId: '528' }],
      },
    },
    drupalStaticData: cernerDrupalData,
  };

  const notCernerState = {
    sm: {
      tooltip: {
        tooltipVisible: true,
        tooltipId: 'mock-tooltip-id',
        error: undefined,
      },
    },
    user: {
      profile: {
        facilities: [{ facilityId: '528' }],
      },
    },
    drupalStaticData: nonCernerDrupalData,
  };

  const renderComponent = (state = visibleState) => {
    return renderWithStoreAndRouter(
      <InProductionEducationAlert
        tooltipName="sm_care_team_list_update_ipe"
        id="sm-care-team-list-update-ipe-container"
        data-testid="sm-care-team-list-update-ipe-container"
        className="vads-u-margin-top--3 vads-u-padding--2p5"
        aria-label="We updated your list of care teams"
        dismissButtonTestId="sm-care-team-list-update-ipe-stop-showing-hint"
        dismissAriaDescribedBy="sm-care-team-list-update-ipe-stop-showing-hint-info"
        dismissAriaDescription="This hint about care team name changes will not appear anymore"
      >
        <p>
          We updated your list of care teams. You may have different care teams
          in your list. And some of your care team names may have changed. To
          find a care team, you can still search by type of care or facility
          location.
        </p>
      </InProductionEducationAlert>,
      {
        initialState: state,
        reducers: reducer,
        path: '/',
      },
    );
  };

  it('renders the alert when tooltipVisible is true', async () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'incrementTooltipCounter').resolves({});

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });

    const aside = getByTestId('sm-care-team-list-update-ipe-container');
    expect(aside.tagName).to.equal('ASIDE');
    expect(aside).to.have.attribute(
      'aria-label',
      'We updated your list of care teams',
    );
    expect(aside.classList.contains('sm-ipe-alert')).to.be.true;
  });

  it('does not render the alert when tooltipVisible is false', () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);
    sandbox.stub(SmApi, 'createTooltip').resolves({
      id: 'new-id',
      tooltipName: 'sm_care_team_list_update_ipe',
      hidden: true,
      counter: 0,
    });

    const { queryByTestId } = renderComponent(hiddenState);
    expect(queryByTestId('sm-care-team-list-update-ipe-container')).to.be.null;
  });

  it('does not render the alert when facility is not a Cerner facility', () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'incrementTooltipCounter').resolves({});

    const { queryByTestId } = renderComponent(notCernerState);
    expect(queryByTestId('sm-care-team-list-update-ipe-container')).to.be.null;
  });

  it('hides the alert when "Stop showing this hint" button is clicked', async () => {
    const hideStub = sandbox.stub(SmApi, 'hideTooltip').resolves({});
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'incrementTooltipCounter').resolves({});

    const { getByTestId, queryByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });

    userEvent.click(
      getByTestId('sm-care-team-list-update-ipe-stop-showing-hint'),
    );

    await waitFor(() => {
      expect(hideStub.calledOnce).to.be.true;
    });

    await waitFor(() => {
      expect(queryByTestId('sm-care-team-list-update-ipe-container')).to.be
        .null;
    });
  });

  it('calls onDismiss callback when "Stop showing this hint" is clicked', async () => {
    sandbox.stub(SmApi, 'hideTooltip').resolves({});
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'incrementTooltipCounter').resolves({});
    const onDismissSpy = sandbox.spy();

    const { getByTestId } = renderWithStoreAndRouter(
      <InProductionEducationAlert
        tooltipName="sm_care_team_list_update_ipe"
        id="sm-care-team-list-update-ipe-container"
        data-testid="sm-care-team-list-update-ipe-container"
        className="vads-u-margin-top--3 vads-u-padding--2p5"
        aria-label="We updated your list of care teams"
        onDismiss={onDismissSpy}
        dismissButtonTestId="sm-care-team-list-update-ipe-stop-showing-hint"
        dismissAriaDescribedBy="sm-care-team-list-update-ipe-stop-showing-hint-info"
        dismissAriaDescription="This hint about care team name changes will not appear anymore"
      >
        <p>Test content</p>
      </InProductionEducationAlert>,
      {
        initialState: visibleState,
        reducers: reducer,
        path: '/',
      },
    );

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });

    userEvent.click(
      getByTestId('sm-care-team-list-update-ipe-stop-showing-hint'),
    );

    await waitFor(() => {
      expect(onDismissSpy.calledOnce).to.be.true;
    });
  });

  it('renders children content', async () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'incrementTooltipCounter').resolves({});

    const { getByTestId, getByText } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });

    expect(getByText(/We updated your list of care teams/)).to.exist;
  });

  it('auto-hides after reaching maxViews (3 views)', async () => {
    const hideStub = sandbox.stub(SmApi, 'hideTooltip').resolves({});
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 3,
      },
    ]);

    const { queryByTestId } = renderComponent();

    await waitFor(() => {
      expect(hideStub.calledOnce).to.be.true;
    });

    await waitFor(() => {
      expect(queryByTestId('sm-care-team-list-update-ipe-container')).to.be
        .null;
    });
  });

  it('still shows the alert and increments on the last allowed view (counter: 2)', async () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 2,
      },
    ]);
    const incrementStub = sandbox
      .stub(SmApi, 'incrementTooltipCounter')
      .resolves({});

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });

    await waitFor(() => {
      expect(incrementStub.calledOnce).to.be.true;
    });
  });

  it('auto-hides when counter exceeds maxViews', async () => {
    const hideStub = sandbox.stub(SmApi, 'hideTooltip').resolves({});
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: false,
        counter: 5,
      },
    ]);

    const { queryByTestId } = renderComponent();

    await waitFor(() => {
      expect(hideStub.calledOnce).to.be.true;
    });

    await waitFor(() => {
      expect(queryByTestId('sm-care-team-list-update-ipe-container')).to.be
        .null;
    });
  });

  it('creates a new tooltip and increments counter on first visit', async () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);
    const createStub = sandbox.stub(SmApi, 'createTooltip').resolves({
      id: 'new-tooltip-id',
      tooltipName: 'sm_care_team_list_update_ipe',
      hidden: false,
      counter: 0,
    });
    const incrementStub = sandbox
      .stub(SmApi, 'incrementTooltipCounter')
      .resolves({});

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(createStub.calledOnce).to.be.true;
    });

    await waitFor(() => {
      expect(incrementStub.calledOnce).to.be.true;
    });

    await waitFor(() => {
      expect(getByTestId('sm-care-team-list-update-ipe-container')).to.exist;
    });
  });

  it('does not increment counter when existing tooltip is already hidden', async () => {
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_list_update_ipe',
        hidden: true,
        counter: 1,
      },
    ]);
    const incrementStub = sandbox
      .stub(SmApi, 'incrementTooltipCounter')
      .resolves({});

    renderComponent();

    // Wait for the effect to settle, then verify increment was NOT called
    await waitFor(() => {
      expect(incrementStub.called).to.be.false;
    });
  });
});
