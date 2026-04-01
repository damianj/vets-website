import { NOT_SHARED } from '../../components/FormFields/AddressSelectionField';
import { formValue, not } from './form-config';
import { certifierRoleIs } from './signer';

export const isSponsor = certifierRoleIs('sponsor');
export const isNotSponsor = not(isSponsor);

export const sponsorIsDeceased = formData =>
  isNotSponsor(formData) && Boolean(formValue('sponsorIsDeceased')(formData));

export const sponsorIsNotDeceased = not(sponsorIsDeceased);

export const hasSponsorAddress = formData =>
  Boolean(formValue('sponsorAddress.street')(formData));

export const sponsorSharesAddressWith = expected => formData =>
  formValue('view:sharesAddressWith')(formData) === expected;

export const sponsorHasNoSharedAddressSelection = formData => {
  const sharedWith = formValue('view:sharesAddressWith')(formData);
  return !sharedWith || sharedWith === NOT_SHARED;
};
