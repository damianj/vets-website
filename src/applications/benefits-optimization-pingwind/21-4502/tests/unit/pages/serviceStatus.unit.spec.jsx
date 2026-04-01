import { expect } from 'chai';
import serviceStatus from '../../../pages/serviceStatus';
import { applicationInfoFields } from '../../../definitions/constants';

describe('21-4502 serviceStatus page', () => {
  const { schema } = serviceStatus;
  const appSchema = schema.properties[applicationInfoFields.parentObject];

  it('requires activeDutyStatus (Veteran or Service member)', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.activeDutyStatus,
    );
  });
});
