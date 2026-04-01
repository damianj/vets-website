import React from 'react';
import { expect } from 'chai';
import { renderInReduxProvider } from 'platform/testing/unit/react-testing-library-helpers';
import PortalRemovalNotice from '../components/PortalRemovalNotice';

describe('PortalRemovalNotice Component', () => {
  describe('H1 Heading', () => {
    it('should render the h1 heading', () => {
      const { queryByText } = renderInReduxProvider(<PortalRemovalNotice />, {
        initialState: {
          featureToggles: { portalNoticeInterstitialSunset: true },
        },
      });
      expect(
        queryByText(/Manage your health care for all VA facilities on VA.gov/i),
      ).to.exist;
    });
  });

  describe('Action Links', () => {
    it('should render primary va-link-action with correct attributes', () => {
      const { container } = renderInReduxProvider(<PortalRemovalNotice />, {
        initialState: {
          featureToggles: { portalNoticeInterstitialSunset: true },
        },
      });
      const primaryLink = container.querySelector(
        'va-link-action[type="primary"]',
      );
      expect(primaryLink).to.exist;
      expect(primaryLink.getAttribute('text')).to.equal(
        'Go to My HealtheVet on VA.gov',
      );
      expect(primaryLink.getAttribute('label')).to.equal(
        'Go to My HealtheVet on VA.gov',
      );
      expect(primaryLink.getAttribute('type')).to.equal('primary');
      expect(primaryLink.getAttribute('href')).to.exist;
      expect(primaryLink.getAttribute('href')).to.equal('/my-health');
    });

    it('should render secondary va-link-action with correct attributes', () => {
      const { container } = renderInReduxProvider(<PortalRemovalNotice />, {
        initialState: {
          featureToggles: { portalNoticeInterstitialSunset: true },
        },
      });
      const secondaryLink = container.querySelector(
        'va-link-action[type="secondary"]',
      );
      expect(secondaryLink).to.exist;
      expect(secondaryLink.getAttribute('text')).to.equal('Go to My VA Health');
      expect(secondaryLink.getAttribute('label')).to.equal(
        'Go to My VA Health',
      );
      expect(secondaryLink.getAttribute('type')).to.equal('secondary');
      expect(secondaryLink.getAttribute('href')).to.exist;
      expect(secondaryLink.getAttribute('href')).to.equal('/my-va');
    });
  });
});
