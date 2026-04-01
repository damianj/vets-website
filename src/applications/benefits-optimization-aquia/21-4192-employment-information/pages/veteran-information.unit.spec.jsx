/**
 * @module tests/pages/veteran-information.unit.spec
 * @description Unit tests for Veteran Information page validation logic.
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';

import { veteranInformationUiSchema } from './veteran-information';
import { createDateStringFromToday } from '../utils/date-test-helpers';

describe('Veteran Information Page', () => {
  const getDateValidation = () =>
    veteranInformationUiSchema.veteranInformation.dateOfBirth[
      'ui:validations'
    ][1];

  describe('validate name lengths', () => {
    let errorMessages = [];

    const errors = {
      addError: message => {
        errorMessages.push(message || '');
      },
    };

    beforeEach(() => {
      errorMessages = [];
    });

    it('should show a validation error if first name is longer than 12 characters', () => {
      const formData = {
        veteranInformation: {
          veteranFullName: { first: 'ThisIsAVeryLongFirstName', last: 'Doe' },
        },
      };

      // expect a validation error for the first name field
      const firstNameValidation =
        veteranInformationUiSchema.veteranInformation.veteranFullName.first[
          'ui:validations'
        ][1];
      firstNameValidation(errors, null, formData);

      expect(errorMessages[0]).to.exist;
      expect(errorMessages[0]).to.equal(
        'Please enter a name under 12 characters. If your name is longer, enter the first 12 characters only.',
      );
    });
  });

  describe('date of birth business validations', () => {
    let errorMessages = [];
    const errors = {
      addError: message => {
        errorMessages.push(message || '');
      },
    };

    beforeEach(() => {
      errorMessages = [];
    });

    it('should show validation error when DOB is less than 14 years before today', () => {
      const validation = getDateValidation();
      const tooRecentDob = createDateStringFromToday(-13);

      validation(errors, tooRecentDob);

      expect(errorMessages).to.have.lengthOf(1);
      expect(errorMessages[0]).to.equal(
        'Veteran date of birth must be at least 14 years before today',
      );
    });

    it('should show validation error when DOB is more than 120 years before today', () => {
      const validation = getDateValidation();
      const tooOldDob = createDateStringFromToday(-121);

      validation(errors, tooOldDob);

      expect(errorMessages).to.have.lengthOf(1);
      expect(errorMessages[0]).to.equal(
        "Veteran date of birth can't be more than 120 years before today",
      );
    });

    it('should not show validation error for DOB within allowed 14 to 120 year range', () => {
      const validation = getDateValidation();
      const validDob = createDateStringFromToday(-35);

      validation(errors, validDob);

      expect(errorMessages).to.have.lengthOf(0);
    });
  });
});
