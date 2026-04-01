import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import VeteranStatusCard from '../../../components/veteran-status-card/VeteranStatusCard';

const testData = {
  edipi: '6198661986',
  formattedFullName: 'First Last',
  latestService: 'United States Army • 2009-2013',
  totalDisabilityRating: 70,
};

const renderWithTestData = (data, useSharedService = false) => {
  return render(
    <VeteranStatusCard
      edipi={data.edipi}
      formattedFullName={data.formattedFullName}
      latestService={data.latestService}
      totalDisabilityRating={data.totalDisabilityRating}
      useSharedService={useSharedService}
    />,
  );
};

describe('VeteranStatusCard', () => {
  it('should render the heading', () => {
    const view = renderWithTestData(testData);
    expect(view.queryByText(/Veteran Status Card/)).to.exist;
  });
  it('should render the full name', () => {
    const view = renderWithTestData(testData);
    expect(view.queryByText(/Name/)).to.exist;
    expect(view.queryByText(/First Last/)).to.exist;
  });
  it('should render the latest service when cveVeteranStatusNewService feature flag is disabled', () => {
    // When the feature flag is disabled, the old VeteranStatus component passes latestService
    const view = renderWithTestData(testData);
    expect(view.queryByText(/Latest period of service/)).to.exist;
    expect(view.queryByText(/United States Army • 2009-2013/)).to.exist;
  });
  it('should not render the latest service when cveVeteranStatusNewService feature flag is enabled', () => {
    // When the new shared service feature flag is enabled, latestService is not passed
    const view = renderWithTestData({
      ...testData,
      latestService: null,
    });
    expect(view.queryByText(/Latest period of service/)).not.to.exist;
  });
  it('should render the DoD ID Number', () => {
    const view = renderWithTestData(testData);
    expect(view.queryByText(/DoD ID Number/)).to.exist;
    expect(view.queryByText(/6198661986/)).to.exist;
  });
  it('should render the VA disability rating when it exists', () => {
    const view = renderWithTestData(testData);
    expect(view.queryByText(/VA disability rating/)).to.exist;
    expect(view.queryByText(/70/)).to.exist;
  });
  it('should render the VA disability rating when it is zero', () => {
    const view = renderWithTestData({
      ...testData,
      totalDisabilityRating: 0,
    });
    expect(view.queryByText(/VA disability rating/)).to.exist;
    expect(view.queryByText(/^0%$/)).to.exist;
  });
  it('should not render the VA disability rating when it is null', () => {
    const view = renderWithTestData({
      ...testData,
      totalDisabilityRating: null,
    });
    expect(view.queryByText(/VA disability rating/)).not.to.exist;
    expect(view.queryByText(/^null%$/)).not.to.exist;
  });
  it('should render the description', () => {
    const view = renderWithTestData(testData);
    expect(
      view.queryByText(/This card doesn’t entitle you to any VA benefits./),
    ).to.exist;
  });
  it('should render the description', () => {
    const view = renderWithTestData(testData);
    expect(
      view.queryByText(/This card doesn’t entitle you to any VA benefits./),
    ).to.exist;
  });
  it('should render the seal with alt text when useSharedService is false', () => {
    const view = renderWithTestData(testData, false);
    expect(
      view.queryByAltText(/Seal of the U.S. Department of Veterans Affairs/),
    ).to.exist;
  });

  describe('useSharedService feature flag behavior', () => {
    it('should not have shared-service modifier class when useSharedService is false', () => {
      const { container } = renderWithTestData(testData, false);
      const card = container.querySelector('.veteran-status-card');
      expect(card).to.exist;
      expect(card.classList.contains('veteran-status-card--shared-service')).to
        .be.false;
    });

    it('should have shared-service modifier class when useSharedService is true', () => {
      const { container } = renderWithTestData(testData, true);
      const card = container.querySelector('.veteran-status-card');
      expect(card).to.exist;
      expect(card.classList.contains('veteran-status-card--shared-service')).to
        .be.true;
    });

    it('should make seal decorative (empty alt, aria-hidden) when useSharedService is true', () => {
      const { container } = renderWithTestData(testData, true);
      const sealImg = container.querySelector(
        'img[src="/img/design/seal/seal.png"]',
      );
      expect(sealImg).to.exist;
      expect(sealImg.getAttribute('alt')).to.equal('');
      expect(sealImg.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should have descriptive alt text on seal when useSharedService is false', () => {
      const { container } = renderWithTestData(testData, false);
      const sealImg = container.querySelector(
        'img[src="/img/design/seal/seal.png"]',
      );
      expect(sealImg).to.exist;
      expect(sealImg.getAttribute('alt')).to.equal(
        'Seal of the U.S. Department of Veterans Affairs',
      );
      expect(sealImg.getAttribute('aria-hidden')).to.be.null;
    });
  });
});
