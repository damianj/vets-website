import { formValue } from './form-config';

export const certifierRoleIs = role => formData =>
  formValue('certifierRole')(formData) === role;

export const roleIsOther = certifierRoleIs('other');

export const hasCertifierAddress = formData =>
  Boolean(formValue('certifierAddress.street')(formData));
