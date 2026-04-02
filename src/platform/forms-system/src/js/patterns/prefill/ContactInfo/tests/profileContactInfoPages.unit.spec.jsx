import { expect } from 'chai';
import {
  blankSchema,
  profileAddressSchema,
} from 'platform/forms-system/src/js/utilities/data/profile';
import { profileContactInfoPages } from '../index';

describe('profileContactInfoPages', () => {
  describe('mailingAddress schema selection', () => {
    it('uses profileAddressSchema when mailingAddress is required (default)', () => {
      const pages = profileContactInfoPages();
      const { schema } = pages.confirmContactInfo;
      const addressSchema = schema.properties.veteran.properties.mailingAddress;

      expect(addressSchema).to.deep.equal(profileAddressSchema);
    });

    it('uses blankSchema when mailingAddress is not in contactInfoRequiredKeys', () => {
      const pages = profileContactInfoPages({
        contactInfoRequiredKeys: ['email'],
      });
      const { schema } = pages.confirmContactInfo;
      const addressSchema = schema.properties.veteran.properties.mailingAddress;

      expect(addressSchema).to.deep.equal(blankSchema);
    });

    it('does not block submission when mailingAddress is not required and is empty', () => {
      const pages = profileContactInfoPages({
        contactInfoRequiredKeys: ['email'],
      });
      const { schema } = pages.confirmContactInfo;
      const addressSchema = schema.properties.veteran.properties.mailingAddress;

      // An empty object (set by prefill transformer when profile has no address)
      // must satisfy the schema so the Review page allows submission
      const emptyAddress = {};

      // blankSchema accepts any object — no oneOf constraints to fail
      expect(addressSchema.type).to.equal('object');
      expect(addressSchema.oneOf).to.be.undefined;

      // The required array at the wrapper level should not include mailingAddress
      const { required } = schema.properties.veteran;
      expect(required).to.not.include('mailingAddress');

      // Confirm the empty address is a plain object (passes blankSchema type check)
      expect(typeof emptyAddress).to.equal('object');
    });

    it('keeps profileAddressSchema (with oneOf) when mailingAddress is required', () => {
      const pages = profileContactInfoPages({
        contactInfoRequiredKeys: ['mailingAddress', 'email'],
      });
      const { schema } = pages.confirmContactInfo;
      const addressSchema = schema.properties.veteran.properties.mailingAddress;

      // Strict schema enforced — oneOf must be present
      expect(addressSchema.oneOf)
        .to.be.an('array')
        .with.length(2);

      // Required at the wrapper level too
      const { required } = schema.properties.veteran;
      expect(required).to.include('mailingAddress');
    });

    it('uses a custom addressSchema when provided, regardless of required status', () => {
      const customSchema = {
        type: 'object',
        properties: { foo: { type: 'string' } },
      };
      const pages = profileContactInfoPages({
        contactInfoRequiredKeys: [],
        addressSchema: customSchema,
      });
      const { schema } = pages.confirmContactInfo;
      const addressSchema = schema.properties.veteran.properties.mailingAddress;

      expect(addressSchema).to.deep.equal(customSchema);
    });
  });
});
