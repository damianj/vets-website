import { expect } from 'chai';
import vehicleDetails from '../../../pages/vehicleDetails';
import {
  applicationInfoFields,
  CONVEYANCE_TYPES,
  FORM_21_4502,
} from '../../../definitions/constants';

describe('21-4502 vehicleDetails page', () => {
  const { schema, uiSchema } = vehicleDetails;
  const appSchema = schema.properties[applicationInfoFields.parentObject];
  const appUI = uiSchema[applicationInfoFields.parentObject];
  const { VEHICLE_DETAILS: VD } = FORM_21_4502;

  it('requires conveyanceType', () => {
    expect(appSchema.required).to.include(applicationInfoFields.conveyanceType);
  });

  it('conveyanceType allows expected enum values', () => {
    const conveyanceEnum =
      appSchema.properties[applicationInfoFields.conveyanceType]?.enum || [];
    expect(conveyanceEnum).to.include.members(Object.keys(CONVEYANCE_TYPES));
  });

  it('conveyanceTypeOther uses hideIf for non-other selection', () => {
    const conveyanceOtherHideIf =
      appUI[applicationInfoFields.conveyanceTypeOther]['ui:options']?.hideIf;
    expect(
      conveyanceOtherHideIf({ applicationInfo: { conveyanceType: 'other' } }),
    ).to.equal(false);
    expect(
      conveyanceOtherHideIf({ applicationInfo: { conveyanceType: 'van' } }),
    ).to.equal(true);
  });

  it('conveyanceType has custom required error message', () => {
    const errorMessages =
      appUI[applicationInfoFields.conveyanceType]['ui:errorMessages'];
    expect(errorMessages.required).to.equal(VD.ERROR_TYPE);
  });

  it('conveyanceTypeOther is required when other is selected and has custom error message', () => {
    const conveyanceOther = appUI[applicationInfoFields.conveyanceTypeOther];
    expect(
      conveyanceOther['ui:required']({
        applicationInfo: { conveyanceType: 'other' },
      }),
    ).to.equal(true);
    expect(
      conveyanceOther['ui:required']({
        applicationInfo: { conveyanceType: 'van' },
      }),
    ).to.equal(false);
    expect(conveyanceOther['ui:errorMessages'].required).to.equal(
      VD.ERROR_OTHER,
    );
  });
});
