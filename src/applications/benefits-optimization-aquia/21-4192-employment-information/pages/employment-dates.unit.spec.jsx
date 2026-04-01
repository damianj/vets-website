/**
 * @module tests/pages/employment-dates.unit.spec
 * @description Unit tests for Employment Dates page validation logic
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';
import { employmentDatesUiSchema } from './employment-dates';
import { createDateStringFromToday } from '../utils/date-test-helpers';

describe('Employment Dates Page', () => {
  const getValidation = () =>
    employmentDatesUiSchema.employmentDates['ui:validations'][0];

  const buildErrors = () => {
    const messages = {
      beginningDate: [],
      endingDate: [],
    };

    const errors = {
      beginningDate: {
        addError: message => {
          messages.beginningDate.push(message || '');
        },
      },
      endingDate: {
        addError: message => {
          messages.endingDate.push(message || '');
        },
      },
    };

    return { errors, messages };
  };

  it("should add error when beginning date is before Veteran's date of birth", () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { beginningDate: '1980-01-01' },
      { veteranInformation: { dateOfBirth: '1981-01-01' } },
    );

    expect(messages.beginningDate).to.deep.equal([
      "Beginning date can't be before the Veteran's date of birth",
    ]);
  });

  it("should add error when beginning date is before Veteran's 14th birthday", () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { beginningDate: '1993-12-31' },
      { veteranInformation: { dateOfBirth: '1980-01-01' } },
    );

    expect(messages.beginningDate).to.deep.equal([
      "Beginning date can't be before the Veteran's 14th birthday",
    ]);
  });

  it("should add error when ending date is before Veteran's date of birth", () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { endingDate: '1980-01-01' },
      { veteranInformation: { dateOfBirth: '1981-01-01' } },
    );

    expect(messages.endingDate).to.deep.equal([
      "Ending date can't be before the Veteran's date of birth",
    ]);
  });

  it("should add error when ending date is before Veteran's 14th birthday", () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      { endingDate: '1993-12-31' },
      { veteranInformation: { dateOfBirth: '1980-01-01' } },
    );

    expect(messages.endingDate).to.deep.equal([
      "Ending date can't be before the Veteran's 14th birthday",
    ]);
  });

  it('should keep existing ending date before beginning date validation', () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();

    validation(
      errors,
      {
        beginningDate: '2020-01-15',
        endingDate: '2020-01-01',
      },
      { veteranInformation: { dateOfBirth: '1980-01-01' } },
    );

    expect(messages.endingDate).to.deep.equal([
      'Ending date must be on or after the beginning date',
    ]);
  });

  it('should not add errors when dates are valid against DOB and date range checks', () => {
    const validation = getValidation();
    const { errors, messages } = buildErrors();
    const validDob = createDateStringFromToday(-35);

    validation(
      errors,
      {
        beginningDate: createDateStringFromToday(-10),
        endingDate: createDateStringFromToday(-1),
      },
      { veteranInformation: { dateOfBirth: validDob } },
    );

    expect(messages.beginningDate).to.have.lengthOf(0);
    expect(messages.endingDate).to.have.lengthOf(0);
  });
});
