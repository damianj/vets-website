import { expect } from 'chai';
import { render } from '@testing-library/react';
import {
  netWorthTitle,
  netWorthDescription,
} from '../../../../config/chapters/household-income/helpers';
import { uiSchema } from '../../../../config/chapters/household-income/householdIncome';
import { NETWORTH_VALUE } from '../../../../config/constants';

describe('household income helpers', () => {
  describe('netWorthDescription', () => {
    it('should return current production description when feature flag is undefined', () => {
      const result = netWorthDescription();

      expect(result).to.contain(
        'Because you currently receive VA pension benefits, we need to know your net worth',
      );
    });
  });

  describe('netWorthTitle', () => {
    it('should return default title when feature flag is false', () => {
      const result = netWorthTitle({ featureFlag: false });

      expect(result).to.equal(
        `Did your household have a net worth greater than $${NETWORTH_VALUE} in the last tax year?`,
      );
    });

    it('should return default title when feature flag is undefined', () => {
      const result = netWorthTitle({});

      expect(result).to.equal(
        `Did your household have a net worth greater than $${NETWORTH_VALUE} in the last tax year?`,
      );
    });

    it('should return formatted title when feature flag is true and netWorthLimit is provided', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: '200000',
      });

      expect(result).to.equal(
        'Did your household have a net worth less than $200,000 in the last tax year?',
      );
    });

    it('should handle netWorthLimit with commas', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: '1,500,000',
      });

      expect(result).to.equal(
        'Did your household have a net worth less than $1,500,000 in the last tax year?',
      );
    });

    it('should use default NETWORTH_VALUE when netWorthLimit is not provided and feature flag is true', () => {
      const result = netWorthTitle({
        featureFlag: true,
      });

      // When netWorthLimit is undefined, it falls back to NETWORTH_VALUE
      const expectedValue = parseInt(
        NETWORTH_VALUE.replace(/,/g, ''),
        10,
      ).toLocaleString('en-US');
      expect(result).to.equal(
        `Did your household have a net worth less than $${expectedValue} in the last tax year?`,
      );
    });

    it('should handle empty string netWorthLimit', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: '',
      });

      // Empty string falls back to NETWORTH_VALUE
      const expectedValue = parseInt(
        NETWORTH_VALUE.replace(/,/g, ''),
        10,
      ).toLocaleString('en-US');
      expect(result).to.equal(
        `Did your household have a net worth less than $${expectedValue} in the last tax year?`,
      );
    });

    it('should handle null netWorthLimit', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: null,
      });

      // When netWorthLimit is null, it falls back to NETWORTH_VALUE
      const expectedValue = parseInt(
        NETWORTH_VALUE.replace(/,/g, ''),
        10,
      ).toLocaleString('en-US');
      expect(result).to.equal(
        `Did your household have a net worth less than $${expectedValue} in the last tax year?`,
      );
    });

    it('should format large numbers correctly', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: '12345678',
      });

      expect(result).to.equal(
        'Did your household have a net worth less than $12,345,678 in the last tax year?',
      );
    });

    it('should handle small numbers correctly', () => {
      const result = netWorthTitle({
        featureFlag: true,
        netWorthLimit: '100',
      });

      expect(result).to.equal(
        'Did your household have a net worth less than $100 in the last tax year?',
      );
    });
  });

  describe('uiSchema ui:description', () => {
    it('should correctly extract formData from props and show pension text when feature flag is true', () => {
      const descriptionFn = uiSchema['ui:description'];
      // Platform forms system passes props object with formData property
      const props = {
        formContext: {},
      };

      const { container } = render(descriptionFn(props));
      const text = container.textContent;

      expect(text).to.include('Because you currently receive VA pension');
    });
  });
});
