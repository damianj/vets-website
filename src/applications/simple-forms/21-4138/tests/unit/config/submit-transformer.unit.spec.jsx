import { expect } from 'chai';
import sinon from 'sinon';
import formConfig from '../../../config/form';
import transformForSubmit from '../../../config/submit-transformer';
import sharedTransformForSubmit from '../../../../shared/config/submit-transformer';
import fixtureUser from '../../e2e/fixtures/data/user.json';

describe('transformForSubmit', () => {
  let sharedTransformStub;

  beforeEach(() => {
    sharedTransformStub = sinon.stub(sharedTransformForSubmit, 'default');
  });

  afterEach(() => {
    sharedTransformStub.restore();
  });

  context('when middle name is present', () => {
    const inputData = {
      data: {
        ...fixtureUser.data,
        fullName: {
          first: 'AbcdefghijklZZZ',
          middle: 'AZZZ',
          last: 'AbcdefghijklmnopqrZZZ',
        },
      },
    };
    const expectedData = {
      ...fixtureUser.data,
      formNumber: '21-4138',
      fullName: {
        first: 'Abcdefghijkl',
        middle: 'A',
        last: 'Abcdefghijklmnopqr',
      },
    };

    it('truncates full name fields correctly', () => {
      const transformedResult = JSON.parse(
        transformForSubmit(formConfig, inputData),
      );
      expect(transformedResult).to.deep.equal(expectedData);
    });
  });

  context('when middle name is missing', () => {
    const inputData = {
      data: {
        ...fixtureUser.data,
        fullName: {
          first: 'AbcdefghijklZZZ',
          last: 'AbcdefghijklmnopqrZZZ',
        },
      },
    };
    const expectedData = {
      ...fixtureUser.data,
      formNumber: '21-4138',
      fullName: {
        first: 'Abcdefghijkl',
        last: 'Abcdefghijklmnopqr',
      },
    };

    it('truncates full name fields correctly', () => {
      const transformedResult = JSON.parse(
        transformForSubmit(formConfig, inputData),
      );
      expect(transformedResult).to.deep.equal(expectedData);
    });
  });

  it('does not modify full name when within limits', () => {
    const inputData = {
      data: {
        ...fixtureUser.data,
        fullName: {
          first: 'John',
          middle: 'D',
          last: 'Doe',
        },
      },
    };
    const expectedData = {
      ...fixtureUser.data,
      formNumber: '21-4138',
      fullName: {
        first: 'John',
        middle: 'D',
        last: 'Doe',
      },
    };
    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, inputData),
    );
    expect(transformedResult).to.deep.equal(expectedData);
  });

  it('handles missing fullName gracefully', () => {
    const inputData = {
      data: {
        ...fixtureUser.data,
        fullName: {},
      },
    };
    const expectedData = {
      ...fixtureUser.data,
      formNumber: '21-4138',
      fullName: {},
    };
    const transformedResult = JSON.parse(
      transformForSubmit(formConfig, inputData),
    );
    expect(transformedResult).to.deep.equal(expectedData);
  });

  context(
    'when idNumber is stripped by inactive page filtering (prefill flow)',
    () => {
      it('restores idNumber from raw form data when SSN is prefilled', () => {
        const idNumber = { ssn: '123456789' };
        const inputData = {
          data: {
            ...fixtureUser.data,
            idNumber,
          },
        };
        // Simulate filterInactivePageData removing idNumber because the
        // identification page was skipped (depends returned false)
        sharedTransformStub.returns(
          JSON.stringify({
            ...fixtureUser.data,
            formNumber: '21-4138',
          }),
        );
        const transformedResult = JSON.parse(
          transformForSubmit(formConfig, inputData),
        );
        expect(transformedResult.idNumber).to.deep.equal(idNumber);
      });

      it('passes through idNumber unchanged when identification page was active', () => {
        const idNumber = { ssn: '321540987' };
        const inputData = {
          data: {
            ...fixtureUser.data,
            idNumber,
          },
        };
        // Simulate identification page being active — idNumber is NOT stripped
        sharedTransformStub.returns(
          JSON.stringify({
            ...fixtureUser.data,
            idNumber,
            formNumber: '21-4138',
          }),
        );
        const transformedResult = JSON.parse(
          transformForSubmit(formConfig, inputData),
        );
        expect(transformedResult.idNumber).to.deep.equal(idNumber);
      });
    },
  );
});
