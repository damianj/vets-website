import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import PreviousStatements from '../../components/PreviousStatements';
import HTMLStatementLink from '../../components/HTMLStatementLink';

const vhaStatement = (id, invoiceDate) => ({ id, invoiceDate });

const legacyStatement = (id, date) => ({
  id,
  pSStatementDateOutput: date,
});

const mountWithRouter = component =>
  mount(<MemoryRouter>{component}</MemoryRouter>);

describe('PreviousStatements', () => {
  describe('when showVHAPaymentHistory is true', () => {
    it('should render when recentStatements exist', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements
          previousStatements={[
            vhaStatement('1', '2024-01-01'),
            vhaStatement('2', '2024-02-01'),
            vhaStatement('3', '2024-03-01'),
          ]}
          isVHA
        />,
      );

      expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(
        1,
      );
      expect(wrapper.find(HTMLStatementLink)).to.have.lengthOf(3);
      wrapper.unmount();
    });

    it('should return null when recentStatements is empty', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements previousStatements={[]} isVHA />,
      );

      expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(
        0,
      );
      wrapper.unmount();
    });

    it('should not sort statements (render in original order)', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements
          previousStatements={[
            vhaStatement('1', '2024-01-01'),
            vhaStatement('3', '2024-03-01'),
            vhaStatement('2', '2024-02-01'),
            vhaStatement('4', '2024-04-01'),
          ]}
          isVHA
        />,
      );

      const links = wrapper.find(HTMLStatementLink);
      expect(links).to.have.lengthOf(4);
      expect(links.at(0).prop('statementDate')).to.equal('2024-01-01');
      expect(links.at(1).prop('statementDate')).to.equal('2024-03-01');
      expect(links.at(2).prop('statementDate')).to.equal('2024-02-01');
      expect(links.at(3).prop('statementDate')).to.equal('2024-04-01');
      wrapper.unmount();
    });

    it('should render correct heading and description text', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements
          previousStatements={[vhaStatement('1', '2024-01-01')]}
          isVHA
        />,
      );

      expect(wrapper.find('h2').text()).to.equal('Previous statements');
      expect(wrapper.find('p').text()).to.include(
        'Review your charges and download your mailed statements from the past 6 months',
      );
      wrapper.unmount();
    });
  });

  describe('when showVHAPaymentHistory is false', () => {
    it('should render when previous statements exist', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements
          previousStatements={[
            legacyStatement('1', '01/01/2024'),
            legacyStatement('3', '03/01/2024'),
          ]}
        />,
      );

      expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(
        1,
      );
      expect(wrapper.find(HTMLStatementLink)).to.have.lengthOf(2);
      wrapper.unmount();
    });

    it('should return null when previousStatements is empty', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements previousStatements={[]} />,
      );

      expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(
        0,
      );
      wrapper.unmount();
    });

    it('should render statements in the order provided', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements
          previousStatements={[
            legacyStatement('2', '03/01/2024'),
            legacyStatement('3', '02/01/2024'),
          ]}
        />,
      );

      const links = wrapper.find(HTMLStatementLink);
      expect(links).to.have.lengthOf(2);
      expect(links.at(0).prop('statementDate')).to.equal('03/01/2024');
      expect(links.at(1).prop('statementDate')).to.equal('02/01/2024');
      wrapper.unmount();
    });
  });

  it('should return null when previousStatements is undefined', () => {
    const wrapper = mountWithRouter(
      <PreviousStatements previousStatements={undefined} />,
    );

    expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(0);
    wrapper.unmount();
  });

  describe('edge cases', () => {
    it('should handle null previousStatements gracefully', () => {
      const wrapper = mountWithRouter(
        <PreviousStatements previousStatements={null} />,
      );

      expect(wrapper.find('[data-testid="view-statements"]')).to.have.lengthOf(
        0,
      );
      wrapper.unmount();
    });
  });
});
