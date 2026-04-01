/**
 * @module tests/pages/employment-last-payment.unit.spec
 * @description Unit tests for Employment Last Payment page conditional logic
 * VA Form 21-4192 - Request for Employment Information
 */

import { expect } from 'chai';

import {
  employmentLastPaymentUiSchema,
  employmentLastPaymentSchema,
} from './employment-last-payment';

describe('Employment Last Payment Page', () => {
  describe('date relationship validations', () => {
    const getValidation = () =>
      employmentLastPaymentUiSchema.employmentLastPayment['ui:validations'][0];

    const buildErrors = () => {
      const messages = {
        dateOfLastPayment: [],
        datePaid: [],
      };

      const errors = {
        dateOfLastPayment: {
          addError: message => {
            messages.dateOfLastPayment.push(message || '');
          },
        },
        datePaid: {
          addError: message => {
            messages.datePaid.push(message || '');
          },
        },
      };

      return { errors, messages };
    };

    it('should add error when date of last payment is before beginning date of employment', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        { dateOfLastPayment: '2020-01-01', lumpSumPayment: 'no' },
        { employmentDates: { beginningDate: '2020-01-02' } },
      );

      expect(messages.dateOfLastPayment).to.deep.equal([
        "Date of last payment can't be before beginning date of employment",
      ]);
      expect(messages.datePaid).to.have.lengthOf(0);
    });

    it('should add error when lump sum date is before beginning date of employment', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        {
          dateOfLastPayment: '2020-01-03',
          lumpSumPayment: 'yes',
          datePaid: '2020-01-01',
        },
        { employmentDates: { beginningDate: '2020-01-02' } },
      );

      expect(messages.dateOfLastPayment).to.have.lengthOf(0);
      expect(messages.datePaid).to.deep.equal([
        "Date of lump sum payment can't be before beginning date of employment",
      ]);
    });

    it('should not add errors when date relationships are valid', () => {
      const validation = getValidation();
      const { errors, messages } = buildErrors();

      validation(
        errors,
        {
          dateOfLastPayment: '2020-01-03',
          lumpSumPayment: 'yes',
          datePaid: '2020-01-04',
        },
        { employmentDates: { beginningDate: '2020-01-02' } },
      );

      expect(messages.dateOfLastPayment).to.have.lengthOf(0);
      expect(messages.datePaid).to.have.lengthOf(0);
    });
  });

  describe('updateSchema conditional required fields', () => {
    const { updateSchema } = employmentLastPaymentUiSchema['ui:options'];
    const baseSchema = employmentLastPaymentSchema;

    it('should require lump sum fields when lumpSumPayment is yes', () => {
      const formData = {
        employmentLastPayment: { lumpSumPayment: 'yes' },
      };

      const result = updateSchema(formData, baseSchema);
      const { required } = result.properties.employmentLastPayment;

      expect(required).to.include('grossAmountPaid');
      expect(required).to.include('datePaid');
    });

    it('should not require lump sum fields when lumpSumPayment is no', () => {
      const formData = {
        employmentLastPayment: { lumpSumPayment: 'no' },
      };

      const result = updateSchema(formData, baseSchema);
      const { required } = result.properties.employmentLastPayment;

      expect(required).to.not.include('grossAmountPaid');
      expect(required).to.not.include('datePaid');
    });

    it('should handle missing form data gracefully', () => {
      const result = updateSchema({}, baseSchema);
      const { required } = result.properties.employmentLastPayment;

      expect(required).to.not.include('grossAmountPaid');
      expect(required).to.not.include('datePaid');
    });
  });

  describe('expandUnderCondition logic', () => {
    it('should show lump sum fields only when yes is selected', () => {
      const {
        expandUnderCondition,
      } = employmentLastPaymentUiSchema.employmentLastPayment.grossAmountPaid[
        'ui:options'
      ];

      expect(expandUnderCondition('yes')).to.be.true;
      expect(expandUnderCondition('no')).to.be.false;
    });
  });
});
