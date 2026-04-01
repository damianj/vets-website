import { expect } from 'chai';
import vehicleUse from '../../../pages/vehicleUse';
import {
  applicationInfoFields,
  DRIVER_OR_PASSENGER,
} from '../../../definitions/constants';

describe('21-4502 vehicleUse page', () => {
  const { schema, uiSchema } = vehicleUse;
  const appSchema = schema.properties[applicationInfoFields.parentObject];

  it('requires driverOrPassenger', () => {
    expect(appSchema.required).to.include(
      applicationInfoFields.driverOrPassenger,
    );
  });

  it('driverOrPassenger allows expected enum values', () => {
    const driverOrPassengerEnum =
      appSchema.properties[applicationInfoFields.driverOrPassenger]?.enum || [];
    expect(driverOrPassengerEnum).to.include.members(
      Object.keys(DRIVER_OR_PASSENGER),
    );
  });

  it('passenger info alert uses hideIf when driver selected', () => {
    const passengerAlertHideIf =
      uiSchema['view:passengerInfoAlert']['ui:options']?.hideIf;
    expect(
      passengerAlertHideIf({
        applicationInfo: { driverOrPassenger: 'driver' },
      }),
    ).to.equal(true);
    expect(
      passengerAlertHideIf({
        applicationInfo: { driverOrPassenger: 'passenger' },
      }),
    ).to.equal(false);
  });
});
