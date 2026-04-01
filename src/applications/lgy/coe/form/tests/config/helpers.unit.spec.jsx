import { expect } from 'chai';
import sinon from 'sinon';
import * as helpers from 'platform/forms-system/src/js/helpers';
import { customCOEsubmit, getLoanIntent } from '../../config/helpers';
import { LOAN_INTENT, TOGGLE_KEY } from '../../constants';

const form = {
  data: {
    periodsOfService: [
      { dateRange: { from: '2010-10-10', to: '2012-12-12' } },
      { dateRange: { from: '2020-03-03', to: '2021-XX-XX' } },
    ],
    relevantPriorLoans: [
      {
        dateRange: { from: '1990-01-XX', to: '1992-XX-XX' },
        vaLoanNumber: '1-2-3456789012',
      },
    ],
  },
};

let sandbox;

beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

describe('customCOEsubmit', () => {
  it('should correctly format the form data', () => {
    const res = JSON.parse(customCOEsubmit({}, form));
    const formData = JSON.parse(res.lgyCoeClaim.form);

    // periodsOfService dates should be converted to ISO strings
    expect(formData.periodsOfService[0].dateRange.from).to.equal(
      '2010-10-10T00:00:00.000Z',
    );
    expect(formData.periodsOfService[0].dateRange.to).to.equal(
      '2012-12-12T00:00:00.000Z',
    );

    // When day and month values are missing from a service "to" date, they should default to 01
    expect(formData.periodsOfService[1].dateRange.to).to.equal(
      '2021-01-01T00:00:00.000Z',
    );

    // When day and month values are missing from a loan "to" date, they should default to 01
    expect(formData.relevantPriorLoans[0].dateRange.to).to.equal(
      '1992-01-01T00:00:00.000Z',
    );

    // vaLoanNumber with no value should be empty string
    expect(formData.relevantPriorLoans[0].vaLoanNumber).to.equal(
      '123456789012',
    );
  });

  it('sets version to 2 when the toggle view key is truthy', () => {
    const viewKey = `view:${TOGGLE_KEY}`;
    const formWithToggle = {
      data: {
        [viewKey]: true,
        periodsOfService: [],
        relevantPriorLoans: [],
      },
    };

    sandbox
      .stub(helpers, 'transformForSubmit')
      .callsFake((_, formattedForm) => formattedForm);

    const res = customCOEsubmit({}, formWithToggle);
    const outer = JSON.parse(res);
    const inner = outer.lgyCoeClaim.form;

    expect(inner.data.version).to.equal(2);
  });

  it('sets version to 1 when the toggle view key is falsy', () => {
    const viewKey = `view:${TOGGLE_KEY}`;
    const formWithToggle = {
      data: {
        [viewKey]: false,
        periodsOfService: [],
        relevantPriorLoans: [],
      },
    };

    sandbox
      .stub(helpers, 'transformForSubmit')
      .callsFake((_, formattedForm) => formattedForm);

    const res = customCOEsubmit({}, formWithToggle);
    const outer = JSON.parse(res);
    const inner = outer.lgyCoeClaim.form;

    expect(inner.data.version).to.equal(1);
  });
});

describe('getLoanIntent', () => {
  it('should return the loan intent object based on the value', () => {
    Object.keys(LOAN_INTENT).forEach(type => {
      const obj = getLoanIntent(LOAN_INTENT[type].value);
      expect(obj).to.deep.equal(LOAN_INTENT[type]);
    });
  });
});
