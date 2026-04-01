/**
 * @module tests/pages/employment-termination.unit.spec
 * @description Unit tests for Employment Termination page date validation logic
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';
import { employmentTerminationUiSchema } from './employment-termination';

describe('Employment Termination Page', () => {
  const getValidation = () =>
    employmentTerminationUiSchema.employmentTermination['ui:validations'][0];

  const buildErrors = () => {
    const messages = [];
    const errors = {
      dateLastWorked: {
        addError: message => {
          messages.push(message || '');
        },
      },
    };

    return { errors, messages };
  };

  it('should add error when date last worked is before beginning date of employment', () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { dateLastWorked: '2020-01-01' },
      { employmentDates: { beginningDate: '2020-01-02' } },
    );

    expect(messages).to.deep.equal([
      "Date last worked can't be before beginning date of employment",
    ]);
  });

  it('should add error when date last worked is after ending date of employment', () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { dateLastWorked: '2020-01-03' },
      {
        employmentDates: {
          beginningDate: '2020-01-01',
          endingDate: '2020-01-02',
        },
      },
    );

    expect(messages).to.deep.equal([
      "Date last worked can't be after ending date of employment",
    ]);
  });

  it('should not add error when date last worked is within beginning and ending dates', () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { dateLastWorked: '2020-01-02' },
      {
        employmentDates: {
          beginningDate: '2020-01-01',
          endingDate: '2020-01-03',
        },
      },
    );

    expect(messages).to.have.lengthOf(0);
  });
});
